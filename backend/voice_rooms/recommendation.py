"""
SeekhoWithRua — Panel Recommendation Engine
YouTube-style scoring system for voice panels.
6 signals combined into a single score per panel per user.
Called from GET /api/panels/ to return personalised ranked rows.
"""
import datetime
from django.db.models import Q
from .models import VoiceRoomProfile, UserPanelHistory, PanelCoOccurrence


# ─── SIGNAL WEIGHTS ──────────────────────────────────────────────────────────

WEIGHT_COURSE_MATCH    = 50   # studying data science → show data science panels
WEIGHT_INTEREST_MATCH  = 30   # spiritual user → show spiritual panels
WEIGHT_CO_OCCURRENCE   = 40   # others who joined X also joined Y (YouTube signal)
WEIGHT_QUALITY         = 15   # avg session duration — long = good panel
WEIGHT_TRENDING        = 10   # most joins in last 1 hour
WEIGHT_ALREADY_SEEN    = -100 # bury panels user already joined
WEIGHT_FRESHNESS       = -0.5 # per hour — keeps feed fresh


# ─── TOPIC → INTEREST MAPPING ────────────────────────────────────────────────
# Maps your existing VoicePanel.topic choices to VoiceRoomProfile.interests

TOPIC_TO_INTEREST = {
    'ai_tech':    'it_tech',
    'innovation': 'it_tech',
    'spiritual':  'spiritual',
    'skills':     'school_college',
    'general':    'general',
}

# Maps VoicePanel.topic to course tags
TOPIC_TO_COURSE = {
    'ai_tech':    ['ai-course', 'data-science-course', 'python-programming-course'],
    'innovation': ['full-stack-development', 'game-development'],
    'skills':     ['data-science-course', 'ai-course', 'full-stack-development',
                   'python-programming-course', 'web-development-course',
                   'game-development', 'iot-robotics', 'mobile-app-development'],
    'spiritual':  [],
    'general':    [],
}


# ─── CORE SCORING FUNCTION ───────────────────────────────────────────────────

def score_panel_for_user(panel_dict, user):
    """
    Returns a float score for one panel for one user.
    Higher score = show higher in feed.
    """
    score    = 0
    panel_id = str(panel_dict.get('id', ''))
    topic    = panel_dict.get('topic', '')

    # Load user's VCR profile
    try:
        profile = user.vcr_profile
    except Exception:
        profile = None

    # ── Signal 1: Course match (+50) ─────────────────────────────────────────
    if profile and profile.current_course:
        course_tags = TOPIC_TO_COURSE.get(topic, [])
        if profile.current_course in course_tags:
            score += WEIGHT_COURSE_MATCH

    # ── Signal 2: Interest match (+30) ───────────────────────────────────────
    if profile and profile.interests:
        mapped_interest = TOPIC_TO_INTEREST.get(topic, '')
        if mapped_interest and mapped_interest in profile.interests:
            score += WEIGHT_INTEREST_MATCH

    # ── Signal 3: Co-occurrence — YouTube signal (+up to 40) ─────────────────
    if user.is_authenticated:
        joined_ids = list(
            UserPanelHistory.objects.filter(
                user=user
            ).values_list('panel_id', flat=True)
        )

        if panel_id in joined_ids:
            # Already seen — bury it
            score += WEIGHT_ALREADY_SEEN
        elif joined_ids:
            # Find panels that co-occur with panels user has joined
            co = PanelCoOccurrence.objects.filter(
                Q(panel_a_id__in=joined_ids, panel_b_id=panel_id) |
                Q(panel_b_id__in=joined_ids, panel_a_id=panel_id)
            )
            co_total = sum(c.co_join_count for c in co)
            score += min(co_total * 2, WEIGHT_CO_OCCURRENCE)

    # ── Signal 4: Panel quality (+up to 15) ──────────────────────────────────
    # Based on member count — more members = more popular
    member_count = panel_dict.get('member_count', 0)
    quality      = min(member_count / 10.0, 1.0)
    score += quality * WEIGHT_QUALITY

    # ── Signal 5: Trending (+up to 10) ───────────────────────────────────────
    # Panels with more members get trending boost
    trending = min(member_count / 5.0, 1.0)
    score += trending * WEIGHT_TRENDING

    # ── Signal 6: Freshness decay (-0.5 per hour) ────────────────────────────
    created_at = panel_dict.get('created_at')
    if created_at:
        try:
            now       = datetime.datetime.now(datetime.timezone.utc)
            # Handle both datetime objects and strings
            if isinstance(created_at, str):
                created_at = datetime.datetime.fromisoformat(
                    created_at.replace('Z', '+00:00')
                )
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=datetime.timezone.utc)
            age_hours = (now - created_at).total_seconds() / 3600
            score += age_hours * WEIGHT_FRESHNESS
        except Exception:
            pass

    return round(score, 2)


# ─── MAIN RECOMMENDATION FUNCTION ────────────────────────────────────────────

def get_recommended_panels(panels_qs, user):
    """
    Takes a queryset of VoicePanel objects.
    Returns a dict with 3 labelled rows + full ranked list.

    Row 1 — because_your_course:  panels matching user's current course
    Row 2 — others_also_joined:   co-occurrence signal panels
    Row 3 — trending_now:         most active panels right now
    Row 4 — all_ranked:           everything sorted by score
    """

    # Build list of panel dicts with scores
    panels_list = []
    for panel in panels_qs.filter(is_active=True).select_related('host'):
        member_count = panel.members.count()
        panel_dict = {
            'id':           str(panel.id),
            'title':        panel.title,
            'topic':        panel.topic,
            'host':         panel.host.username,
            'host_id':      panel.host.id,
            'member_count': member_count,
            'max_members':  panel.max_members,
            'created_at':   panel.created_at,
        }
        panel_dict['_score'] = score_panel_for_user(panel_dict, user)
        panels_list.append(panel_dict)

    # Sort all panels by score descending
    panels_list.sort(key=lambda p: p['_score'], reverse=True)

    # Get user profile data for labels
    try:
        current_course = user.vcr_profile.current_course
        interests      = user.vcr_profile.interests
    except Exception:
        current_course = ''
        interests      = []

    # Get panels user has already joined
    joined_ids = set()
    if user.is_authenticated:
        joined_ids = set(
            UserPanelHistory.objects.filter(
                user=user
            ).values_list('panel_id', flat=True)
        )

    # ── Build 3 rows ─────────────────────────────────────────────────────────

    course_row   = []  # Because you study X
    co_occur_row = []  # Others who joined your panels also joined
    trending_row = []  # Trending right now

    for p in panels_list:
        pid   = p['id']
        topic = p['topic']

        # Row 1 — course match
        if current_course:
            course_tags = TOPIC_TO_COURSE.get(topic, [])
            if current_course in course_tags and len(course_row) < 6:
                course_row.append(p)
                continue

        # Row 2 — co-occurrence
        if pid not in joined_ids and joined_ids:
            co = PanelCoOccurrence.objects.filter(
                Q(panel_a_id__in=joined_ids, panel_b_id=pid) |
                Q(panel_b_id__in=joined_ids, panel_a_id=pid)
            ).exists()
            if co and len(co_occur_row) < 6:
                co_occur_row.append(p)
                continue

        # Row 3 — trending (member count > 0)
        if p['member_count'] > 0 and len(trending_row) < 6:
            trending_row.append(p)

    # ── Build labels ─────────────────────────────────────────────────────────

    if current_course:
        course_label = f'Because you study {current_course.replace("-", " ").title()}'
    elif interests:
        course_label = f'Based on your interests'
    else:
        course_label = 'Recommended for you'

    return {
        'because_your_course': course_row,
        'others_also_joined':  co_occur_row,
        'trending_now':        trending_row,
        'all_ranked':          panels_list,
        'labels': {
            'because_your_course': course_label,
            'others_also_joined':  'Others who joined your panels also joined',
            'trending_now':        'Trending right now',
        }
    }