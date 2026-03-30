/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  COSMOS VCR — Single File Voice + Chat Panel   [FIXED BUILD]
 *  Philosophy · Spirituality · AI · Innovation · Seekers
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ✅ ZERO npm dependencies. PeerJS loaded from CDN at runtime.
 *  ✅ 100% P2P audio via WebRTC. Signaling via PeerJS free cloud.
 *  ✅ Real Django backend auth wired in via your Render APIs.
 *  ✅ Works on localhost AND on Render/Vercel deployed builds.
 *
 *  ── BUGS FIXED (vs previous version) ────────────────────────────────────
 *  1. Profile response: reads profile.role correctly (was reading user_type flat)
 *  2. Login: sends `email` field (backend auth by email, not username)
 *  3. Register: sends `role` field (backend reads `role`, not `user_type`)
 *     Also sends `confirm_password` as backend requires it
 *  4. Create panel: sends `topic` field with valid choice (backend required)
 *  5. Create panel: saves peer_id back to backend via PATCH after peer opens
 *  6. Join panel: host_peer_id correctly read from join response
 *  7. _participantsRef accessed safely — ref initialized before any usage
 *  8. Register flow: uses email as login credential after auto-login
 *
 *  ── EXISTING ADDITIONS ───────────────────────────────────────────────────
 *  9.  Follow/Unfollow button in People tab
 *  10. Upvote button on speaker AvatarOrb
 *  11. Onboarding screen on first login
 *  12. Leaderboard sidebar tab (Overall + College)
 *  13. WebSocket real-time notifications (followed host goes live)
 *  14. YouTube-style 3-row panel recommendations
 *
 *  ── NEW ADDITIONS (this version) ─────────────────────────────────────────
 *  15. GROUP / DM chat tabs — private 1-on-1 messaging with any participant
 *  16. DM message handler — type:'dm' via existing DataChannel
 *  17. DM notification popup when new private message received
 *  18. Group audio for ALL — host calls every listener (WhatsApp-style)
 *      Everyone hears everyone who is unmuted
 *  19. Listener starts mic on join (receive-only until promoted)
 *
 *  ── HOW AUTH WORKS ──────────────────────────────────────────────────────
 *  1. On mount → GET /api/profile/ with stored token
 *  2. profile.role === 'trainer' → trainer UI; else learner UI
 *  3. Login → POST /api/login/ with email+password → token stored
 *  4. Register → POST /api/register/ with role field → auto-login
 *
 *  ── PANEL APIs USED ─────────────────────────────────────────────────────
 *  GET    /api/panels/                     → list all active panels
 *  POST   /api/panels/create/              → trainer creates panel
 *  POST   /api/panels/<id>/join/           → any user joins
 *  POST   /api/panels/<id>/leave/          → any user leaves
 *  GET    /api/panels/<id>/members/        → get members list
 *  POST   /api/panels/<id>/raise-hand/     → listener raises hand
 *  POST   /api/panels/<id>/lower-hand/     → listener lowers hand
 *  POST   /api/panels/<id>/mute-all/       → trainer mutes all
 *  POST   /api/panels/<id>/promote/<uid>/  → promote to speaker
 *  POST   /api/panels/<id>/kick/<uid>/     → kick a member
 *
 *  ── NEW VCR APIs USED ────────────────────────────────────────────────────
 *  POST   /api/vcr/follow/<id>/            → follow/unfollow user
 *  POST   /api/vcr/upvote/                 → upvote speaker
 *  GET    /api/vcr/leaderboard/            → overall + college rankings
 *  POST   /api/vcr/onboarding/             → save course/interests/college
 *  GET    /api/vcr/profile/               → check onboarded flag
 *  WS     ws/notifications/<user_id>/      → real-time follow notifications
 *
 *  ── ENV VARIABLE ─────────────────────────────────────────────────────────
 *  Set in frontend/.env:
 *    VITE_API_URL=https://api.seekhowithrua.com
 *  For local dev:
 *    VITE_API_URL=http://127.0.0.1:8000
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG — reads from Vite env, falls back to localhost for dev
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "https://django-react-ml-app.onrender.com";

const MAX_PANELS     = 10;
const MAX_PER_PANEL  = 10;  // hard ceiling per CTO report — re-evaluate at 20+
const MAX_COHOSTS    = 2;   // host + 2 cohosts = 3 on stage minimum
const MAX_SPEAKERS   = 7;   // host(1) + cohosts(2) + speakers(7) = 10 total

const PEERJS_CDN          = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
const PEERJS_CDN_FALLBACK = "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js";

// TURN credentials are fetched dynamically from backend per session
// Never hardcode TURN credentials — SSRF / C2 abuse risk (see CTO report §2.1)
// Falls back to public openrelay ONLY if backend endpoint unavailable
const PUBLIC_STUN_ONLY = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy:   "max-bundle",
  rtcpMuxPolicy:  "require",
};

async function buildPeerConfig() {
  try {
    const token = getToken();
    if (!token) throw new Error("no token");
    const res = await fetch(`${API_BASE}/api/turn-credentials/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error("turn endpoint not ready");
    const creds = await res.json();
    // Backend returns: { username, credential, uris: [...], ttl }
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
          urls:       creds.uris || [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turns:openrelay.metered.ca:443?transport=tcp",
          ],
          username:   creds.username   || "openrelayproject",
          credential: creds.credential || "openrelayproject",
        },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy:  "max-bundle",
      rtcpMuxPolicy: "require",
    };
  } catch {
    // Graceful fallback — public openrelay if backend TURN not yet deployed
    // TODO: replace with self-hosted coturn before scaling past 50 users
    console.warn("[TURN] backend not available, using public openrelay fallback");
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "turn:openrelay.metered.ca:80",  username: "openrelayproject", credential: "openrelayproject" },
        { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
        { urls: "turns:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy:  "max-bundle",
      rtcpMuxPolicy: "require",
    };
  }
}

const WS_BASE = API_BASE.replace(/^https/, "wss").replace(/^http/, "ws");

// ─────────────────────────────────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("cosmos_token") || "";
}

function setToken(t) {
  if (t) localStorage.setItem("cosmos_token", t);
  else localStorage.removeItem("cosmos_token");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useCosmosAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState("");

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    apiFetch("/api/profile/")
      .then(({ ok, data }) => {
        if (ok && data) {
          const role = data?.profile?.role || data?.role || data?.user_type || "learner";
          const u = {
            id:    data.id,
            name:  data.username || data.first_name || data.email,
            role:  role === "trainer" ? "trainer" : "learner",
            email: data.email,
          };
          setUser(u);
          localStorage.setItem("cosmos_user", JSON.stringify(data));
        } else {
          setToken(null);
          localStorage.removeItem("cosmos_user");
        }
        setLoading(false);
      })
      .catch(() => { setToken(null); setLoading(false); });
  }, []);

  async function login(emailOrUsername, password) {
    setAuthErr("");
    const { ok, data } = await apiFetch("/api/login/", {
      method: "POST",
      body: JSON.stringify({ email: emailOrUsername, password }),
    });
    if (!ok) {
      setAuthErr(data?.detail || data?.error || data?.non_field_errors?.[0] || "Login failed");
      return false;
    }
    const token = data.token || data.access || "";
    setToken(token);
    const prof = await apiFetch("/api/profile/");
    if (prof.ok && prof.data) {
      const role = prof.data?.profile?.role || prof.data?.role || prof.data?.user_type || "learner";
      setUser({
        id:    prof.data.id,
        name:  prof.data.username || prof.data.first_name || prof.data.email,
        role:  role === "trainer" ? "trainer" : "learner",
        email: prof.data.email,
      });
      localStorage.setItem("cosmos_user", JSON.stringify(prof.data));
      return true;
    }
    return false;
  }

  async function register(username, email, password, userType) {
    setAuthErr("");
    const { ok, data } = await apiFetch("/api/register/", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        confirm_password: password,
        first_name: username,
        last_name: "",
        role: userType,
      }),
    });
    if (!ok) {
      setAuthErr(
        data?.email?.[0] || data?.password?.[0] ||
        data?.detail || data?.error || "Registration failed"
      );
      return false;
    }
    return login(email, password);
  }

  async function logout() {
    await apiFetch("/api/logout/", { method: "POST" }).catch(() => {});
    setToken(null);
    localStorage.removeItem("cosmos_user");
    setUser(null);
  }

  return { user, loading, login, register, logout, authErr, setAuthErr };
}

// ─────────────────────────────────────────────────────────────────────────────
//  VCR NOTIFICATIONS HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useVCRNotifications(userId, push, onPanelCreated) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const url = `${WS_BASE}/ws/notifications/${userId}/`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
      ws._ping = ping;
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "notification" || msg.type === "panel_created") {
          const d = msg.data || msg;
          push(`🔴 ${d.message || d.panel_title}`, "cyan", 6000);
          if (onPanelCreated) onPanelCreated(d);
        }
        if (msg.type === "new_follower") {
          push(`👤 ${msg.data?.message || "Someone followed you!"}`, "gold", 4000);
        }
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      if (ws._ping) clearInterval(ws._ping);
    };

    return () => {
      if (ws._ping) clearInterval(ws._ping);
      ws.close();
    };
  }, [userId]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function loadPeerJS() {
  return new Promise((resolve, reject) => {
    if (window.Peer) return resolve(window.Peer);
    const tryLoad = (src, fallback) => {
      const s = document.createElement("script");
      s.src     = src;
      s.onload  = () => window.Peer ? resolve(window.Peer) : reject(new Error("PeerJS loaded but Peer undefined"));
      s.onerror = () => fallback
        ? tryLoad(fallback, null)   // try fallback CDN
        : reject(new Error("PeerJS CDN load failed on both primary and fallback"));
      document.head.appendChild(s);
    };
    tryLoad(PEERJS_CDN, PEERJS_CDN_FALLBACK);
  });
}

function genCode(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

function makePeerId(panelId, userId) {
  return `COSMOS_${String(panelId).replace(/-/g,"").substring(0,12)}_${String(userId)}`
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 60);
}

function getRoomFromURL() {
  return new URLSearchParams(window.location.search).get("room") || null;
}

function setRoomInURL(roomId) {
  const url = new URL(window.location);
  if (roomId) url.searchParams.set("room", roomId);
  else url.searchParams.delete("room");
  window.history.replaceState({}, "", url);
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

function useNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const counter               = useRef(0);
  const push = useCallback((msg, type = "default", duration = 3800) => {
    const id = ++counter.current;
    setNotifs(n => [...n, { id, msg, type }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), duration);
  }, []);
  return { notifs, push };
}

function NotifStack({ notifs }) {
  return (
    <div className="notif-stack">
      {notifs.map(n => (
        <div key={n.id} className={`notif ${n.type}`}>{n.msg}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CSS — COSMIC DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=Rajdhani:wght@300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void:      #020008;
    --deep:      #06001a;
    --nebula:    #0d0025;
    --purple:    #6600ff;
    --violet:    #9933ff;
    --aurora:    #bf00ff;
    --cyan:      #00f5ff;
    --gold:      #ffd700;
    --rose:      #ff2d78;
    --green:     #00ff88;
    --glass:     rgba(102,0,255,0.08);
    --glass2:    rgba(255,255,255,0.04);
    --border:    rgba(102,0,255,0.3);
    --border2:   rgba(0,245,255,0.2);
    --text:      #e8e0ff;
    --muted:     rgba(232,224,255,0.45);
    --glow:      0 0 20px rgba(102,0,255,0.6), 0 0 60px rgba(102,0,255,0.2);
    --glow-cyan: 0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.15);
    --glow-gold: 0 0 20px rgba(255,215,0,0.6), 0 0 50px rgba(255,215,0,0.2);
    --font-display: 'Orbitron', monospace;
    --font-body:    'Rajdhani', sans-serif;
  }

  body { background: var(--void); color: var(--text); font-family: var(--font-body); font-size: 16px; overflow-x: hidden; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--deep); }
  ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 2px; }

  #cosmos-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
  .cosmos-root   { position: relative; z-index: 1; min-height: 100vh; }

  /* ── Entry / Auth ── */
  .entry-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 24px; gap: 28px;
  }
  .entry-logo { text-align: center; animation: floatIn 1.2s ease forwards; }
  .entry-logo h1 {
    font-family: var(--font-display); font-size: clamp(2rem,6vw,4rem); font-weight: 900;
    background: linear-gradient(135deg, var(--violet), var(--cyan), var(--aurora));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 0 30px rgba(102,0,255,0.8)); letter-spacing: 0.15em;
  }
  .entry-logo p { color: var(--muted); letter-spacing: 0.3em; font-size: 0.72rem; text-transform: uppercase; margin-top: 8px; }

  .entry-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 24px;
    padding: 36px; width: 100%; max-width: 460px; backdrop-filter: blur(20px);
    box-shadow: var(--glow), inset 0 1px 0 rgba(255,255,255,0.05);
    animation: floatIn 1.4s ease forwards;
  }
  .entry-card h2 {
    font-family: var(--font-display); font-size: 0.9rem; font-weight: 600;
    color: var(--cyan); letter-spacing: 0.2em; margin-bottom: 24px; text-align: center;
  }

  .auth-tabs { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .auth-tab {
    flex: 1; padding: 11px; text-align: center; font-family: var(--font-display);
    font-size: 0.65rem; letter-spacing: 0.15em; color: var(--muted); cursor: pointer;
    background: none; border: none; transition: all 0.2s;
  }
  .auth-tab.active { background: rgba(102,0,255,0.25); color: var(--cyan); }

  .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .role-btn {
    padding: 14px; border-radius: 14px; border: 1px solid var(--border);
    background: var(--glass2); color: var(--text); cursor: pointer;
    font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.1em;
    transition: all 0.3s ease; text-align: center;
  }
  .role-btn .role-icon { font-size: 1.6rem; display: block; margin-bottom: 6px; }
  .role-btn:hover { border-color: var(--purple); background: rgba(102,0,255,0.2); box-shadow: var(--glow); }
  .role-btn.active { border-color: var(--cyan); background: rgba(0,245,255,0.08); box-shadow: var(--glow-cyan); }

  /* ── Inputs ── */
  .cosmos-input {
    width: 100%; padding: 13px 16px; background: rgba(0,0,0,0.45);
    border: 1px solid var(--border); border-radius: 11px; color: var(--text);
    font-family: var(--font-body); font-size: 0.95rem; outline: none;
    transition: border-color 0.3s, box-shadow 0.3s; margin-bottom: 12px;
  }
  .cosmos-input:focus { border-color: var(--purple); box-shadow: 0 0 0 2px rgba(102,0,255,0.2); }
  .cosmos-input::placeholder { color: var(--muted); }

  .err-msg { color: var(--rose); font-size: 0.8rem; margin-bottom: 10px; text-align: center; padding: 8px; background: rgba(255,45,120,0.08); border-radius: 8px; border: 1px solid rgba(255,45,120,0.2); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 11px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: var(--font-display); font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.25s ease;
    white-space: nowrap; position: relative; overflow: hidden;
  }
  .btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.1),transparent); opacity: 0; transition: opacity 0.25s; }
  .btn:hover::before { opacity: 1; }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none !important; }

  .btn-primary  { background: linear-gradient(135deg,var(--purple),var(--violet)); color:#fff; box-shadow: var(--glow); width: 100%; }
  .btn-primary:hover { box-shadow: 0 0 40px rgba(102,0,255,0.8); transform: translateY(-1px); }
  .btn-cyan     { background: linear-gradient(135deg,#004466,#006688); color: var(--cyan); border: 1px solid var(--border2); box-shadow: var(--glow-cyan); }
  .btn-gold     { background: linear-gradient(135deg,#332200,#553300); color: var(--gold); border: 1px solid rgba(255,215,0,0.3); }
  .btn-rose     { background: linear-gradient(135deg,#330011,#550022); color: var(--rose); border: 1px solid rgba(255,45,120,0.3); }
  .btn-green    { background: linear-gradient(135deg,#003322,#005533); color: var(--green); border: 1px solid rgba(0,255,136,0.3); }
  .btn-ghost    { background: var(--glass2); color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--purple); }
  .btn-sm       { padding: 7px 13px; font-size: 0.58rem; border-radius: 8px; }
  .btn-icon     { padding: 8px; border-radius: 9px; font-size: 0.95rem; min-width: 36px; }

  /* ── Loading spinner ── */
  .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--purple); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
  .loading-screen p { color: var(--muted); font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.2em; }

  /* ── Rooms list ── */
  .rooms-screen { min-height: 100vh; padding: 24px; max-width: 900px; margin: 0 auto; }
  .rooms-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
  .rooms-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 900; background: linear-gradient(135deg,var(--violet),var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  .room-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 22px; margin-bottom: 14px; display: flex; align-items: center;
    justify-content: space-between; gap: 16px; backdrop-filter: blur(10px);
    transition: all 0.3s ease; flex-wrap: wrap;
  }
  .room-card:hover { border-color: var(--cyan); box-shadow: var(--glow-cyan); transform: translateY(-2px); cursor: pointer; }
  .room-card-info h3 { font-family: var(--font-display); font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 5px; }
  .room-card-info p  { color: var(--muted); font-size: 0.82rem; }
  .room-card-meta    { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.65rem; font-family: var(--font-display); letter-spacing: 0.1em; font-weight: 600; }
  .badge-live    { background: rgba(255,45,120,0.2);  color: var(--rose);   border: 1px solid rgba(255,45,120,0.4); }
  .badge-users   { background: rgba(102,0,255,0.2);   color: var(--violet); border: 1px solid var(--border); }
  .badge-host    { background: rgba(255,215,0,0.15);  color: var(--gold);   border: 1px solid rgba(255,215,0,0.3); }
  .badge-speaker { background: rgba(0,245,255,0.1);   color: var(--cyan);   border: 1px solid var(--border2); }
  .badge-cohost  { background: rgba(191,0,255,0.15);  color: var(--aurora); border: 1px solid rgba(191,0,255,0.3); }

  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--rose); animation: pulse-rose 1.5s infinite; display: inline-block; }

  .empty-state { text-align: center; padding: 70px 24px; color: var(--muted); }
  .empty-state .empty-icon { font-size: 3.5rem; margin-bottom: 14px; }
  .empty-state h3 { font-family: var(--font-display); font-size: 0.9rem; margin-bottom: 8px; color: var(--text); }

  .row-label {
    font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.2em;
    color: var(--cyan); text-transform: uppercase; margin: 22px 0 10px;
    padding-bottom: 6px; border-bottom: 1px solid var(--border2);
  }

  /* ── Panel Screen ── */
  .panel-screen { display: grid; grid-template-columns: 1fr 330px; grid-template-rows: auto 1fr; height: 100vh; overflow: hidden; }
  @media(max-width: 768px) { .panel-screen { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; } }

  .panel-header {
    grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between;
    padding: 11px 18px; background: rgba(2,0,8,0.92); border-bottom: 1px solid var(--border);
    backdrop-filter: blur(20px); gap: 10px; flex-wrap: wrap; z-index: 10;
  }
  .panel-header-info h2 { font-family: var(--font-display); font-size: 0.85rem; font-weight: 600; color: var(--text); }
  .panel-header-info p  { color: var(--muted); font-size: 0.72rem; margin-top: 2px; }
  .panel-header-actions { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }

  .stage-area {
    overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 18px;
    background: radial-gradient(ellipse at 50% 0%, rgba(102,0,255,0.04) 0%, transparent 65%);
  }
  .stage-section-label { font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.28em; color: var(--muted); text-transform: uppercase; padding-bottom: 7px; border-bottom: 1px solid var(--border); }

  /* ── Avatar Orbs ── */
  .avatar-grid { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; padding: 10px 0; }
  .avatar-wrap { display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; }

  .avatar-orb { width: 82px; height: 82px; border-radius: 50%; position: relative; transition: transform 0.3s ease; }
  .avatar-orb:hover { transform: scale(1.06); }

  .avatar-inner {
    width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 1.4rem; font-weight: 900; position: relative; z-index: 2;
    background: radial-gradient(circle at 35% 35%,rgba(255,255,255,0.14),transparent 60%), linear-gradient(135deg,var(--deep),var(--nebula));
    border: 2px solid var(--border);
  }

  .avatar-orb.speaking .avatar-inner { border-color: var(--cyan); box-shadow: 0 0 22px rgba(0,245,255,0.65), 0 0 60px rgba(0,245,255,0.2); animation: speakPulse 0.9s ease-in-out infinite alternate; }
  .avatar-orb.speaking::before, .avatar-orb.speaking::after { content: ''; position: absolute; inset: -9px; border-radius: 50%; border: 2px solid rgba(0,245,255,0.3); animation: ringExpand 1.5s ease-out infinite; pointer-events: none; }
  .avatar-orb.speaking::after { inset: -20px; border-color: rgba(0,245,255,0.13); animation-delay: 0.55s; }

  .avatar-orb.role-host    .avatar-inner { border-color: var(--gold);   box-shadow: 0 0 18px rgba(255,215,0,0.4); }
  .avatar-orb.role-cohost  .avatar-inner { border-color: var(--aurora); box-shadow: 0 0 14px rgba(191,0,255,0.4); }
  .avatar-orb.role-speaker .avatar-inner { border-color: var(--violet); box-shadow: 0 0 12px rgba(102,0,255,0.35); }

  .avatar-name { font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.1em; color: var(--muted); max-width: 82px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .avatar-controls { display: flex; gap: 3px; opacity: 0; transition: opacity 0.2s; }
  .avatar-wrap:hover .avatar-controls { opacity: 1; }

  .hand-badge { position: absolute; top: -5px; right: -5px; background: var(--gold); border-radius: 50%; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; animation: handBounce 0.8s ease-in-out infinite alternate; z-index: 4; border: 2px solid var(--void); }

  /* ── Audience ── */
  .audience-grid { display: flex; flex-wrap: wrap; gap: 9px; padding: 6px 0; }
  .audience-chip { display: flex; align-items: center; gap: 7px; padding: 7px 13px; background: var(--glass2); border: 1px solid var(--border); border-radius: 40px; font-family: var(--font-body); font-size: 0.82rem; color: var(--muted); transition: all 0.2s; position: relative; }
  .audience-chip.hand-raised { border-color: var(--gold); color: var(--text); box-shadow: 0 0 11px rgba(255,215,0,0.28); }
  .audience-chip .chip-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,var(--deep),var(--nebula)); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: var(--violet); font-family: var(--font-display); }
  .audience-chip-controls { display: flex; gap: 3px; margin-left: 4px; }

  /* ── Controls Bar ── */
  .my-controls { position: sticky; bottom: 0; background: rgba(2,0,8,0.96); border-top: 1px solid var(--border); padding: 13px 18px; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; backdrop-filter: blur(20px); z-index: 5; }

  /* ── Sidebar ── */
  .sidebar { border-left: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; background: rgba(6,0,26,0.65); backdrop-filter: blur(10px); }
  .sidebar-tabs { display: flex; border-bottom: 1px solid var(--border); }
  .sidebar-tab { flex: 1; padding: 13px; text-align: center; font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none; }
  .sidebar-tab.active { color: var(--cyan); border-bottom-color: var(--cyan); }
  .sidebar-tab:hover { color: var(--text); }
  .sidebar-content { flex: 1; overflow-y: auto; }

  /* ── Chat ── */
  .chat-messages { padding: 14px; display: flex; flex-direction: column; gap: 11px; }
  .chat-msg { display: flex; flex-direction: column; gap: 3px; animation: msgSlide 0.3s ease forwards; }
  .chat-msg-header { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; }
  .chat-msg-name { font-family: var(--font-display); font-weight: 600; font-size: 0.62rem; letter-spacing: 0.08em; }
  .chat-msg-time { color: var(--muted); font-size: 0.62rem; }
  .chat-msg-text { background: var(--glass2); border: 1px solid var(--border); border-radius: 0 11px 11px 11px; padding: 9px 13px; font-size: 0.88rem; color: var(--text); line-height: 1.5; word-break: break-word; }
  .chat-msg.mine .chat-msg-text { background: rgba(102,0,255,0.14); border-color: var(--purple); border-radius: 11px 0 11px 11px; }
  .chat-msg.mine { align-items: flex-end; }

  .chat-input-area { padding: 11px; border-top: 1px solid var(--border); display: flex; gap: 7px; }
  .chat-input-area input { flex: 1; padding: 9px 13px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--font-body); font-size: 0.88rem; outline: none; transition: border-color 0.2s; }
  .chat-input-area input:focus { border-color: var(--purple); }
  .chat-input-area input::placeholder { color: var(--muted); }

  /* ← NEW: Chat subtabs (GROUP / DM) */
  .chat-subtabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
  .chat-subtab {
    flex: 1; padding: 9px; text-align: center; font-family: var(--font-display);
    font-size: 0.55rem; letter-spacing: 0.12em; color: var(--muted); cursor: pointer;
    background: none; border: none; border-bottom: 2px solid transparent; transition: all 0.2s;
  }
  .chat-subtab.active { color: var(--cyan); border-bottom-color: var(--cyan); }
  .chat-subtab:hover:not(.active) { color: var(--text); }

  /* ← NEW: DM list styles */
  .dm-list { padding: 11px; display: flex; flex-direction: column; gap: 6px; }
  .dm-person {
    display: flex; align-items: center; gap: 9px; padding: 9px 11px;
    background: var(--glass2); border: 1px solid var(--border); border-radius: 11px;
    cursor: pointer; transition: border-color 0.2s;
  }
  .dm-person:hover { border-color: var(--cyan); }
  .dm-person.active { border-color: var(--cyan); background: rgba(0,245,255,0.05); }
  .dm-unread {
    background: var(--cyan); color: #000; border-radius: 50%;
    width: 18px; height: 18px; font-size: 0.55rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); flex-shrink: 0;
  }
  .dm-back {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-size: 0.72rem; padding: 9px 14px; font-family: var(--font-body);
    border-bottom: 1px solid var(--border); width: 100%; text-align: left;
    transition: color 0.2s;
  }
  .dm-back:hover { color: var(--cyan); }

  /* ── Participants list (sidebar) ── */
  .participants-list { padding: 11px; display: flex; flex-direction: column; gap: 7px; }
  .participant-item { display: flex; align-items: center; gap: 9px; padding: 9px 11px; background: var(--glass2); border: 1px solid var(--border); border-radius: 11px; transition: border-color 0.2s; }
  .participant-item:hover { border-color: var(--purple); }
  .participant-item .p-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,var(--deep),var(--nebula)); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 0.68rem; font-weight: 700; color: var(--violet); flex-shrink: 0; }
  .participant-item .p-info { flex: 1; min-width: 0; }
  .participant-item .p-name { font-family: var(--font-display); font-size: 0.68rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .participant-item .p-actions { display: flex; gap: 3px; }

  /* ── Status pill ── */
  .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 20px; font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.1em; background: rgba(102,0,255,0.14); border: 1px solid var(--border); color: var(--muted); }
  .status-pill.connected { color: var(--cyan); border-color: var(--border2); }

  /* ── Share box ── */
  .share-box { background: var(--glass2); border: 1px solid var(--border2); border-radius: 11px; padding: 9px 13px; display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
  .share-box code { flex: 1; font-size: 0.65rem; color: var(--cyan); word-break: break-all; font-family: monospace; }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(2,0,8,0.87); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(8px); padding: 20px; }
  .modal { background: var(--nebula); border: 1px solid var(--border); border-radius: 22px; padding: 34px; width: 100%; max-width: 430px; box-shadow: var(--glow); animation: floatIn 0.35s ease; }
  .modal h2 { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; color: var(--cyan); letter-spacing: 0.18em; margin-bottom: 22px; text-align: center; }
  .modal-actions { display: flex; gap: 9px; margin-top: 18px; }
  .modal-actions .btn { flex: 1; }

  /* ── Notifications ── */
  .notif-stack { position: fixed; top: 76px; right: 18px; display: flex; flex-direction: column; gap: 7px; z-index: 300; pointer-events: none; }
  .notif { background: rgba(6,0,26,0.96); border: 1px solid var(--border); border-radius: 11px; padding: 11px 15px; font-size: 0.82rem; color: var(--text); backdrop-filter: blur(20px); animation: notifSlide 0.38s ease forwards; box-shadow: var(--glow); max-width: 270px; }
  .notif.gold { border-color: rgba(255,215,0,0.5); box-shadow: var(--glow-gold); }
  .notif.cyan { border-color: var(--border2); box-shadow: var(--glow-cyan); }
  .notif.err  { border-color: rgba(255,45,120,0.5); }

  .divider { height: 1px; background: linear-gradient(90deg,transparent,var(--border),transparent); margin: 8px 0; }

  /* ── Leaderboard styles ── */
  .leaderboard-wrap { padding: 11px; display: flex; flex-direction: column; gap: 6px; }
  .lb-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
  .lb-tab { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid var(--border); background: var(--glass2); color: var(--muted); font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.1em; cursor: pointer; text-align: center; transition: all 0.2s; }
  .lb-tab.active { background: rgba(102,0,255,0.2); color: var(--cyan); border-color: var(--border2); }
  .lb-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--glass2); border: 1px solid var(--border); border-radius: 10px; transition: border-color 0.2s; }
  .lb-row.me { border-color: rgba(0,245,255,0.4); background: rgba(0,245,255,0.04); }
  .lb-rank { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 0.58rem; font-weight: 700; flex-shrink: 0; }
  .lb-name { flex: 1; font-family: var(--font-display); font-size: 0.62rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lb-college { font-size: 0.55rem; color: var(--muted); }
  .lb-score { font-family: var(--font-display); font-size: 0.72rem; color: var(--violet); font-weight: 700; }

  /* ── Onboarding screen ── */
  .onboard-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; gap: 20px; }
  .onboard-card { background: var(--glass); border: 1px solid var(--border); border-radius: 24px; padding: 34px; width: 100%; max-width: 500px; backdrop-filter: blur(20px); box-shadow: var(--glow); animation: floatIn 0.4s ease; }
  .onboard-card h2 { font-family: var(--font-display); font-size: 0.85rem; color: var(--cyan); letter-spacing: 0.2em; margin-bottom: 8px; text-align: center; }
  .onboard-card p { color: var(--muted); font-size: 0.8rem; text-align: center; margin-bottom: 20px; }
  .interest-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .interest-chip { padding: 7px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--glass2); color: var(--muted); font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
  .interest-chip.selected { border-color: var(--cyan); color: var(--cyan); background: rgba(0,245,255,0.08); box-shadow: var(--glow-cyan); }

  /* ── Animations ── */
  @keyframes floatIn    { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:none; } }
  @keyframes speakPulse { from { box-shadow: 0 0 20px rgba(0,245,255,0.65), 0 0 60px rgba(0,245,255,0.2); } to { box-shadow: 0 0 42px rgba(0,245,255,0.95), 0 0 100px rgba(0,245,255,0.4); } }
  @keyframes ringExpand { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(1.65); opacity:0; } }
  @keyframes handBounce { from { transform:translateY(0) rotate(-10deg); } to { transform:translateY(-4px) rotate(10deg); } }
  @keyframes pulse-rose { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(0.78); } }
  @keyframes msgSlide   { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:none; } }
  @keyframes notifSlide { from { opacity:0; transform:translateX(38px); } to { opacity:1; transform:none; } }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  COSMOS CANVAS
// ─────────────────────────────────────────────────────────────────────────────

function CosmosCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const stars  = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      twinkleSpeed:  Math.random() * 0.018 + 0.004,
      twinkleOffset: Math.random() * Math.PI * 2,
      brightness:    Math.random(),
    }));
    const blobs = [
      { x:0.15, y:0.2,  r:0.35, c:"102,0,255",  a:0.038 },
      { x:0.8,  y:0.6,  r:0.3,  c:"0,245,255",  a:0.022 },
      { x:0.5,  y:0.87, r:0.4,  c:"191,0,255",  a:0.028 },
      { x:0.3,  y:0.7,  r:0.25, c:"255,45,120", a:0.018 },
    ];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x*W, b.y*H, 0, b.x*W, b.y*H, b.r*Math.max(W,H));
        g.addColorStop(0, `rgba(${b.c},${b.a})`); g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      stars.forEach(s => {
        s.twinkleOffset += s.twinkleSpeed;
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(232,224,255,${s.brightness*(0.4+0.6*Math.sin(s.twinkleOffset))})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="cosmos-canvas" ref={ref} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AVATAR ORB
// ─────────────────────────────────────────────────────────────────────────────

function AvatarOrb({ participant, isSpeaking, canControl, onMute, onKick, onPromote, onUpvote, myId, myRole }) {
  const isMe    = participant.id === myId;
  const initial = (participant.name || "?")[0].toUpperCase();
  const roleColors = { host:"#ffd700", cohost:"#bf00ff", speaker:"#9933ff", listener:"#6600ff" };
  return (
    <div className="avatar-wrap">
      <div className={`avatar-orb role-${participant.role} ${isSpeaking ? "speaking" : ""}`}>
        <div className="avatar-inner" style={{ color: roleColors[participant.role] || "#9933ff" }}>
          {initial}
        </div>
        {participant.handRaised && <div className="hand-badge">✋</div>}
      </div>
      <span className="avatar-name">{isMe ? `${participant.name} (you)` : participant.name}</span>
      {canControl && !isMe && (
        <div className="avatar-controls">
          {onMute   && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onMute(participant.id, participant.backendId)}>{participant.muted?"🔊":"🔇"}</button>}
          {onKick   && participant.role !== "host" && <button className="btn btn-rose btn-icon btn-sm" onClick={() => onKick(participant.id, participant.backendId)}>✕</button>}
          {onPromote && participant.role === "listener" && participant.handRaised && <button className="btn btn-gold btn-icon btn-sm" onClick={() => onPromote(participant.id, participant.backendId)}>⬆</button>}
        </div>
      )}
      {!isMe && participant.role === "speaker" && myRole === "listener" && onUpvote && (
        <button
          className="btn btn-gold btn-icon btn-sm"
          title="Upvote this speaker"
          style={{ marginTop: 3 }}
          onClick={() => onUpvote(participant.backendId)}
        >⭐</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ONBOARDING SCREEN
// ─────────────────────────────────────────────────────────────────────────────

function OnboardingScreen({ onComplete }) {
  const COURSES = [
    'data-science-course','ai-course','full-stack-development',
    'python-programming-course','web-development-course',
    'game-development','iot-robotics','mobile-app-development',
  ];
  const INTERESTS = [
    { key:'it_tech',          label:'💻 IT & Tech'        },
    { key:'spiritual',        label:'🧘 Spiritual'        },
    { key:'debate',           label:'🗣️ Debate'           },
    { key:'school_college',   label:'🎓 School/College'   },
    { key:'virtual_friends',  label:'👥 Virtual Friends'  },
    { key:'hiring',           label:'💼 Hiring'           },
  ];
  const [course,   setCourse]   = useState('');
  const [selected, setSelected] = useState([]);
  const [college,  setCollege]  = useState('');
  const [busy,     setBusy]     = useState(false);

  const toggle = (k) => setSelected(p => p.includes(k) ? p.filter(x=>x!==k) : [...p, k]);

  async function submit() {
    setBusy(true);
    await onComplete({ current_course: course, interests: selected, college, skill_tags: [] });
    setBusy(false);
  }

  return (
    <div className="cosmos-root">
      <CosmosCanvas />
      <div className="onboard-screen">
        <div className="onboard-card">
          <h2>PERSONALISE YOUR COSMOS</h2>
          <p>Takes 30 seconds. Panels will be recommended based on your answers.</p>
          <div className="stage-section-label" style={{ marginBottom: 8 }}>Which course are you studying?</div>
          <select className="cosmos-input" value={course} onChange={e => setCourse(e.target.value)} style={{ marginBottom: 16 }}>
            <option value="">Select your course (optional)</option>
            {COURSES.map(c => (
              <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
          <div className="stage-section-label" style={{ marginBottom: 8 }}>What are you interested in?</div>
          <div className="interest-grid">
            {INTERESTS.map(i => (
              <button key={i.key} className={`interest-chip ${selected.includes(i.key) ? 'selected' : ''}`} onClick={() => toggle(i.key)}>{i.label}</button>
            ))}
          </div>
          <input className="cosmos-input" placeholder="College / University (optional)" value={college} onChange={e => setCollege(e.target.value)} style={{ marginTop: 8 }} />
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={submit} disabled={busy}>
            {busy ? "..." : "◈ ENTER THE COSMOS"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEADERBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function VCRLeaderboard({ userId }) {
  const [tab,     setTab]     = useState("overall");
  const [data,    setData]    = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [loading, setLoading] = useState(true);

  const college = (() => {
    try { return JSON.parse(localStorage.getItem("cosmos_user") || "{}"); }
    catch { return {}; }
  })()?.profile?.college || "";

  useEffect(() => {
    setLoading(true);
    const url = tab === "college" && college
      ? `/api/vcr/leaderboard/?type=college&college=${encodeURIComponent(college)}`
      : `/api/vcr/leaderboard/?type=overall`;
    apiFetch(url)
      .then(({ ok, data }) => {
        if (ok && data) {
          setData(Array.isArray(data.leaderboard) ? data.leaderboard : []);
          setMyRank(data.my_rank || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  const rankColor = (r) => r===1?"#ffd700":r===2?"#9ca3af":r===3?"#cd7c2f":"rgba(255,255,255,0.1)";
  const rankText  = (r) => r===1?"#000":r===2?"#000":r===3?"#000":"rgba(255,255,255,0.5)";

  return (
    <div className="leaderboard-wrap">
      <div className="lb-tabs">
        <button className={`lb-tab ${tab==="overall"?"active":""}`} onClick={()=>setTab("overall")}>🌍 OVERALL</button>
        <button className={`lb-tab ${tab==="college"?"active":""}`} onClick={()=>setTab("college")}>🎓 COLLEGE</button>
      </div>
      {tab==="college" && !college && (
        <div style={{ color:"var(--muted)",fontSize:"0.72rem",padding:"12px 4px",textAlign:"center" }}>
          Set your college in onboarding to see college rankings.
        </div>
      )}
      {loading ? (
        <div style={{ textAlign:"center",padding:30 }}><div className="spinner" /></div>
      ) : (
        <>
          {data.map(row => (
            <div key={row.rank} className={`lb-row ${row.user_id===userId?"me":""}`}>
              <div className="lb-rank" style={{ background:rankColor(row.rank), color:rankText(row.rank) }}>{row.rank}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="lb-name">{row.username}{row.user_id===userId?" (you)":""}</div>
                {row.college && <div className="lb-college">{row.college}</div>}
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="lb-score">{row.score}</div>
                <div style={{ fontSize:"0.52rem",color:"var(--muted)",marginTop:2 }}>{row.followers}f · {row.upvotes}⭐</div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div style={{ color:"var(--muted)",fontSize:"0.78rem",textAlign:"center",padding:"30px 0" }}>
              No rankings yet. Join panels to earn your score.
            </div>
          )}
          {myRank && !data.find(r=>r.user_id===userId) && (
            <>
              <div className="divider" />
              <div className="lb-row me">
                <div className="lb-rank" style={{ background:"rgba(102,0,255,0.3)",color:"var(--violet)" }}>{myRank.rank}</div>
                <div style={{ flex:1 }}><div className="lb-name">You</div></div>
                <div className="lb-score">{myRank.score}</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function VCRoom() {
  useEffect(() => {
    if (document.getElementById("cosmos-styles")) return;
    const el = document.createElement("style");
    el.id = "cosmos-styles"; el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);

  const { user, loading, login, register, logout, authErr, setAuthErr } = useCosmosAuth();
  const { notifs, push } = useNotifications();

  const isAdmin = user?.email === "master@gmail.com";

  // ── Auth form state ──
  const [authMode,     setAuthMode]     = useState("login");
  const [authName,     setAuthName]     = useState("");
  const [authEmail,    setAuthEmail]    = useState("");
  const [authPass,     setAuthPass]     = useState("");
  const [authUserType, setAuthUserType] = useState("learner");
  const [authBusy,     setAuthBusy]     = useState(false);

  // ── Screens ──
  const [screen, setScreen] = useState("rooms");

  // ── Onboarding ──
  const [onboarded,         setOnboarded]         = useState(true);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // ── Follow state ──
  const [followedIds, setFollowedIds] = useState(new Set());

  // ← NEW: DM chat state — addition only, no changes to existing chat state
  const [dmMessages, setDmMessages] = useState({});   // { peerId: [{id,from,text,time,mine}] }
  const [activeDM,   setActiveDM]   = useState(null); // peerId of active DM thread
  const [dmInput,    setDmInput]    = useState('');
  const [chatTab,    setChatTab]    = useState('group'); // 'group' | 'dm'

  // ── Room list ──
  const [rooms,        setRooms]        = useState([]);
  const [recRows,      setRecRows]      = useState({ because_your_course:[], others_also_joined:[], trending_now:[], labels:{} });
  const [roomsLoading, setRoomsLoading] = useState(false);

  // ── Create modal ──
  const [showCreate,  setShowCreate]  = useState(false);
  const [panelTitle,  setPanelTitle]  = useState("");
  const [panelDesc,   setPanelDesc]   = useState("");
  const [createBusy,  setCreateBusy]  = useState(false);

  // ── Panel state ──
  const [panelInfo,    setPanelInfo]    = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [sidebarTab,   setSidebarTab]   = useState("chat");
  const [myRole,       setMyRole]       = useState("listener");
  const [muted,        setMuted]        = useState(false);
  const [handRaised,   setHandRaised]   = useState(false);
  const [connected,    setConnected]    = useState(false);
  const [speakingIds,  setSpeakingIds]  = useState(new Set());

  // ── PeerJS refs ──
  const myPeer       = useRef(null);
  const myStream     = useRef(null);
  const dataConns    = useRef({});
  const callConns    = useRef({});
  const panelRef     = useRef(null);
  const myRoleRef    = useRef("listener");
  const myUserRef    = useRef(null);
  const analyserRefs = useRef({});
  const micPendingRef = useRef(null); // race guard for startMicMuted

  const _participantsRef = useRef([]);
  useEffect(() => { _participantsRef.current = participants; }, [participants]);

  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Handle tab/window close — notify peers before disconnecting
  useEffect(() => {
    const handleUnload = () => {
      if (!myPeer.current) return;
      try {
        if (myRoleRef.current === "host") broadcast({ type: "room_ended" });
        else broadcast({ type: "peer_left", peerId: myPeer.current.id });
        // Synchronously stop all tracks so mic light turns off
        myStream.current?.getTracks().forEach(t => t.stop());
      } catch {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Handle mobile background — iOS Safari revokes mic, reconnect when returning
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && myPeer.current) {
        // Re-enable audio elements that may have been paused by browser
        document.querySelectorAll("audio[id^='audio_']").forEach(el => {
          if (el.paused) el.play().catch(() => {});
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── WebSocket notifications ──
  useVCRNotifications(user?.id, push, () => loadPanels());

  // ── Check onboarding ──
  useEffect(() => {
    if (!user || onboardingChecked) return;
    apiFetch("/api/vcr/profile/")
      .then(({ ok, data }) => {
        setOnboarded(ok && data ? data.onboarded === true : false);
        setOnboardingChecked(true);
      })
      .catch(() => { setOnboarded(true); setOnboardingChecked(true); });
  }, [user, onboardingChecked]);

  // ─── Load panels ─────────────────────────────────────────────────────────

  async function loadPanels() {
    if (!user) return;
    setRoomsLoading(true);
    try {
      const { ok, data } = await apiFetch("/api/panels/");
      if (ok && data) {
        if (Array.isArray(data)) {
          setRooms(data.map(p => ({
            id: p.id, title: p.title || p.name, desc: p.description || "",
            hostName: p.host || "", hostId: p.host_id || p.created_by_id,
            memberCount: p.member_count || 0, isActive: p.is_active !== false, peerId: p.peer_id || null,
          })));
          setRecRows({ because_your_course:[], others_also_joined:[], trending_now:[], all_ranked:[], labels:{} });
        } else {
          const mapPanel = p => ({
            id: p.id, title: p.title || p.name, desc: "",
            hostName: p.host || "", hostId: p.host_id,
            memberCount: p.member_count || 0, isActive: true, peerId: p.peer_id || null,
          });
          setRecRows({
            because_your_course: (data.because_your_course || []).map(mapPanel),
            others_also_joined:  (data.others_also_joined  || []).map(mapPanel),
            trending_now:        (data.trending_now        || []).map(mapPanel),
            all_ranked:          (data.all_ranked          || []).map(mapPanel),
            labels:              data.labels || {},
          });
          setRooms((data.all_ranked || []).map(mapPanel));
        }
      } else {
        setRooms([]);
      }
    } catch { setRooms([]); }
    finally  { setRoomsLoading(false); }
  }

  useEffect(() => { if (user) loadPanels(); }, [user]);
  useEffect(() => {
    const urlRoom = getRoomFromURL();
    if (urlRoom && user) joinPanelById(urlRoom);
  }, [user]);

  // ─── AUTH ────────────────────────────────────────────────────────────────

  async function handleAuth() {
    setAuthBusy(true);
    const ok = authMode === "login"
      ? await login(authEmail, authPass)
      : await register(authName, authEmail, authPass, authUserType);
    setAuthBusy(false);
    if (ok) push(`Welcome to the cosmos! 🌌`, "cyan");
  }

  async function handleOnboardingComplete(data) {
    const { ok } = await apiFetch("/api/vcr/onboarding/", { method: "POST", body: JSON.stringify(data) });
    setOnboarded(true);
    if (ok) push("Profile saved! Panels are now personalised for you ✨", "cyan");
  }

  async function handleFollow(targetUserId) {
    const { ok, data } = await apiFetch(`/api/vcr/follow/${targetUserId}/`, { method: "POST" });
    if (ok) {
      const newSet = new Set(followedIds);
      if (data.status === "followed") { newSet.add(targetUserId); push(`✅ Following ${data.username}`, "cyan"); }
      else                            { newSet.delete(targetUserId); push(`Unfollowed ${data.username}`, "default"); }
      setFollowedIds(newSet);
    }
  }

  async function handleUpvote(toUserId) {
    const { ok, data } = await apiFetch("/api/vcr/upvote/", {
      method: "POST",
      body: JSON.stringify({ to_user_id: toUserId, panel_id: panelRef.current?.id }),
    });
    if (ok && data.status === "upvoted") push(`⭐ Upvoted! Their score: ${data.new_score}`, "gold");
    else if (data?.status === "already_upvoted") push("You already upvoted this speaker", "default");
  }

  // ─── CREATE PANEL ────────────────────────────────────────────────────────

  async function handleCreatePanel() {
    if (!panelTitle.trim()) { push("Enter a panel title"); return; }
    setCreateBusy(true);

    let PeerJS;
    try { PeerJS = await loadPeerJS(); }
    catch { push("Could not load PeerJS from CDN.", "err"); setCreateBusy(false); return; }

    const { ok, data } = await apiFetch("/api/panels/create/", {
      method: "POST",
      body: JSON.stringify({ title: panelTitle.trim(), description: panelDesc.trim(), topic: "general", max_members: MAX_PER_PANEL }),
    });

    if (!ok) { push(data?.detail || data?.error || "Could not create panel", "err"); setCreateBusy(false); return; }

    // Build ICE config with dynamic TURN credentials
    const peerConfig = await buildPeerConfig();

    const panel   = data;
    const panelId = panel.id;
    const peerId  = makePeerId(panelId, user.id);
    const peer    = new PeerJS(peerId, { host: "0.peerjs.com", port: 443, secure: true, config: peerConfig });
    myPeer.current    = peer;
    myRoleRef.current = "host";
    myUserRef.current = { id: user.id, name: user.name };

    peer.on("open", async (myActualPeerId) => {
      panelRef.current = { ...panel, id: panelId, peerId: myActualPeerId };
      setPanelInfo({ ...panel, id: panelId, peerId: myActualPeerId, title: panelTitle.trim(), hostName: user.name });
      setParticipants([{
        id: String(user.id), backendId: user.id,
        name: user.name, role: "host", muted: false, handRaised: false, peerId: myActualPeerId,
      }]);
      setMyRole("host");
      setConnected(true);
      setScreen("panel");
      setShowCreate(false);
      setPanelTitle(""); setPanelDesc("");
      setRoomInURL(panelId);
      push("Panel live! Share the link.", "cyan");
      try { await apiFetch(`/api/panels/${panelId}/update-peer/`, { method: "POST", body: JSON.stringify({ peer_id: myActualPeerId }) }); } catch {}
      panelRef.current.peerId = myActualPeerId;
      await startMic();
    });

    peer.on("connection", conn => {
      conn.on("open", () => {
        setupDataConn(conn);
        setTimeout(() => sendToConn(conn, { type: "room_state", panel: panelRef.current, participants: getParticipantsSnapshot() }), 300);
      });
    });

    peer.on("call", call => {
      // Wait for mic if not ready yet — fixes null-stream audio bug
      const doAnswer = (stream) => {
        call.answer(stream || new MediaStream());
        callConns.current[call.peer] = call;
        call.on("stream", s => { attachAudio(call.peer, s); monitorSpeaking(call.peer, s); });
        call.on("error",  e => { console.warn("call err", e); delete callConns.current[call.peer]; });
        call.on("close",  () => { delete callConns.current[call.peer]; document.getElementById(`audio_${call.peer}`)?.remove(); });
      };
      if (myStream.current) doAnswer(myStream.current);
      else startMic().then(s => doAnswer(s));
    });

    peer.on("error", e => push(`Connection error: ${e.type}`, "err"));

    // Auto-reconnect signaling if network blinks (does NOT affect active audio calls)
    peer.on("disconnected", () => {
      setTimeout(() => {
        if (myPeer.current && !myPeer.current.destroyed) {
          myPeer.current.reconnect();
        }
      }, 2000);
    });

    setCreateBusy(false);
  }

  async function joinPanelById(panelId) {
    // Hard ceiling FIRST — before API call to prevent ghost backend joins
    if (_participantsRef.current.length >= MAX_PER_PANEL) {
      push(`Panel is full (max ${MAX_PER_PANEL} participants)`, "err"); return;
    }

    const { ok, data: joinData } = await apiFetch(`/api/panels/${panelId}/join/`, { method: "POST" });
    if (!ok) { push(joinData?.detail || joinData?.error || "Could not join panel", "err"); return; }

    const hostPeerId = joinData?.host_peer_id || joinData?.peer_id;
    if (!hostPeerId) { push("Host is not connected yet. Ask them to reshare the link.", "err"); return; }

    let PeerJS;
    try { PeerJS = await loadPeerJS(); }
    catch { push("Could not load PeerJS CDN", "err"); return; }

    // Build ICE config with dynamic TURN credentials
    const peerConfig = await buildPeerConfig();

    const myPeerId = makePeerId(genCode(6), user.id);
    const peer     = new PeerJS(myPeerId, { host: "0.peerjs.com", port: 443, secure: true, config: peerConfig });
    myPeer.current    = peer;
    myRoleRef.current = "listener";
    myUserRef.current = { id: user.id, name: user.name };

    peer.on("open", () => {
      const conn = peer.connect(hostPeerId, { reliable: true });
      conn.on("open", () => {
        setupDataConn(conn);
        sendToConn(conn, { type: "announce", from: { id: user.id, name: user.name }, backendId: user.id, peerId: myPeerId });
        setMyRole("listener");
        setConnected(true);
        setScreen("panel");
        setRoomInURL(panelId);
        push("Joined panel as listener 🎧");
        // Start mic in MUTED state — required so host can call us (WebRTC needs a stream)
        // but listener cannot speak until promoted. Mic track is disabled until speak_approved.
        startMicMuted().then(() => {}).catch(() => {});
      });
      conn.on("error", () => push("Could not reach host. Panel may have ended.", "err"));
    });

    // Accept incoming data connections from other peers (mesh via peer_list)
    peer.on("connection", conn => {
      conn.on("open", () => { setupDataConn(conn); });
      conn.on("error", () => {});
    });

    peer.on("call", call => {
      // Listener answers with their muted stream — receives audio from caller but sends nothing
      // Only host/cohost/speaker should send real audio
      const doAnswer = (stream) => {
        call.answer(stream || new MediaStream());
        callConns.current[call.peer] = call;
        call.on("stream", s => { attachAudio(call.peer, s); monitorSpeaking(call.peer, s); });
        call.on("error",  e => { console.warn("call err", e); delete callConns.current[call.peer]; });
        call.on("close",  () => { delete callConns.current[call.peer]; document.getElementById(`audio_${call.peer}`)?.remove(); });
      };
      // Use muted stream if listener, full stream if speaker/host/cohost
      if (myStream.current) {
        doAnswer(myStream.current);
      } else {
        // Get a muted stream for listeners, full stream for elevated roles
        const isElevated = myRoleRef.current === "host" || myRoleRef.current === "cohost" || myRoleRef.current === "speaker";
        if (isElevated) {
          startMic().then(s => doAnswer(s));
        } else {
          startMicMuted().then(s => doAnswer(s));
        }
      }
    });

    peer.on("error", e => {
      if (e.type === "peer-unavailable") push("Host not reachable. Room may have ended.", "err");
      else push(`PeerJS: ${e.type}`, "err");
    });

    // Auto-reconnect signaling if network blinks
    peer.on("disconnected", () => {
      setTimeout(() => {
        if (myPeer.current && !myPeer.current.destroyed) {
          myPeer.current.reconnect();
        }
      }, 2000);
    });
  }

  async function handleJoinRoom(room) { await joinPanelById(room.id); }

  // ─── DATA CONN ───────────────────────────────────────────────────────────

  function setupDataConn(conn) {
    dataConns.current[conn.peer] = conn;
    conn.on("data",  d  => handleMessage(d, conn.peer));
    conn.on("close", () => handlePeerLeft(conn.peer));
    conn.on("error", e  => console.error("DataConn err", e));
  }

  function sendToConn(conn, data) { if (conn?.open) conn.send(data); }

  function broadcast(data, excludePeer = null) {
    Object.entries(dataConns.current).forEach(([pid, conn]) => {
      if (pid !== excludePeer && conn.open) conn.send(data);
    });
  }

  function getParticipantsSnapshot() { return _participantsRef.current || []; }

  // ─── MESSAGE HANDLER ─────────────────────────────────────────────────────

  const handleMessage = useCallback((data, fromPeer) => {
    switch (data.type) {

      case "room_state":
        if (data.panel) { setPanelInfo(data.panel); panelRef.current = data.panel; }
        if (data.participants) setParticipants(data.participants);
        break;

      case "announce": {
        if (myRoleRef.current !== "host" && myRoleRef.current !== "cohost") break;
        setParticipants(prev => {
          if (prev.find(p => p.id === String(data.from.id))) return prev;
          const newP = {
            id: String(data.from.id), backendId: data.backendId || data.from.id,
            name: data.from.name, role: "listener",
            muted: false, handRaised: false, peerId: fromPeer,
          };
          const updated = [...prev, newP];
          setTimeout(() => broadcastUpdate(updated), 120);

          // Send new joiner the list of ALL existing peer IDs so they can connect directly
          // This enables true mesh data connections — everyone can chat directly
          const existingPeerIds = Object.keys(dataConns.current).filter(p => p !== fromPeer);
          const newConn = dataConns.current[fromPeer];
          if (newConn?.open && existingPeerIds.length > 0) {
            newConn.send({ type: "peer_list", peers: existingPeerIds });
          }

          // Host calls new listener for audio (host → listener)
          setTimeout(() => { if (myStream.current) callPeer(fromPeer); }, 500);

          // Tell all existing SPEAKERS/COHOSTS to also call new listener
          // This creates full mesh audio — new listener hears everyone, not just host
          setTimeout(() => {
            broadcast({ type: "call_new_peer", targetPeerId: fromPeer }, fromPeer);
          }, 700);

          return updated;
        });
        break;
      }

      // Host broadcasts this to all speakers/cohosts when someone new joins
      // Each speaker calls the new joiner — full mesh audio, everyone hears everyone
      case "call_new_peer": {
        const role = myRoleRef.current;
        if ((role === "speaker" || role === "cohost") && myStream.current && data.targetPeerId) {
          setTimeout(() => callPeer(data.targetPeerId), 200);
        }
        break;
      }

      case "participants_update":
        setParticipants(data.participants);
        break;

      // Host sends this to new joiners — lets them connect to all existing peers directly (mesh)
      case "peer_list": {
        if (!Array.isArray(data.peers)) break;
        data.peers.forEach(remotePeerId => {
          if (remotePeerId === myPeer.current?.id) return; // skip self
          if (dataConns.current[remotePeerId]) return;     // already connected
          // Connect data channel to this peer for chat relay
          const conn = myPeer.current?.connect(remotePeerId, { reliable: true });
          if (conn) {
            conn.on("open", () => { setupDataConn(conn); });
            conn.on("error", () => {});
          }
        });
        break;
      }

      case "chat": {
        const msgId = data.id || `${data.from?.id}_${data.time}_${data.text?.substring(0,10)}`;
        setMessages(m => {
          if (m.some(x => x.id === msgId)) return m; // deduplicate
          return [...m, {
            id: msgId,
            from: data.from, text: data.text, time: data.time,
            mine: data.from.id === myUserRef.current?.id,
          }];
        });
        break;
      }

      case "chat_relay": {
        // Forward the original id so receivers can deduplicate
        const relayMsg = { type: "chat", id: data.id, from: data.from, text: data.text, time: data.time };
        if (myRoleRef.current === "host" || myRoleRef.current === "cohost") {
          broadcast(relayMsg, fromPeer);
        }
        // Show it locally too — use same dedup logic
        const relayId = data.id || `${data.from?.id}_${data.time}_${data.text?.substring(0,10)}`;
        setMessages(m => {
          if (m.some(x => x.id === relayId)) return m;
          return [...m, { id: relayId, from: data.from, text: data.text, time: data.time, mine: false }];
        });
        break;
      }

      // ← NEW: Direct message handler — uses existing DataChannel, filtered by type
      case "dm": {
        setDmMessages(prev => ({
          ...prev,
          [fromPeer]: [...(prev[fromPeer] || []), {
            id:   Date.now() + Math.random(),
            from: data.from,
            text: data.text,
            time: data.time,
            mine: false,
          }],
        }));
        const sender = _participantsRef.current.find(p => p.peerId === fromPeer);
        push(`💬 DM from ${sender?.name || data.from.name}: ${data.text.substring(0,30)}${data.text.length>30?"...":""}`, "cyan", 5000);
        break;
      }

      case "raise_hand": {
        if (myRoleRef.current !== "host" && myRoleRef.current !== "cohost") break;
        setParticipants(prev => {
          const u = prev.map(p => p.peerId === fromPeer ? { ...p, handRaised: true } : p);
          setTimeout(() => broadcastUpdate(u), 60);
          return u;
        });
        push(`✋ ${data.from?.name || "Someone"} raised their hand`, "gold");
        break;
      }

      case "lower_hand":
        setParticipants(prev => {
          const u = prev.map(p => p.peerId === fromPeer ? { ...p, handRaised: false } : p);
          setTimeout(() => broadcastUpdate(u), 60);
          return u;
        });
        break;

      case "speak_approved": {
        // Security: only accept from host/cohost data connection — verify sender is in participants as host/cohost
        const senderIsController = _participantsRef.current.some(
          p => p.peerId === fromPeer && (p.role === "host" || p.role === "cohost")
        );
        if (!senderIsController) break;
        setMyRole("speaker"); myRoleRef.current = "speaker";
        setHandRaised(false);
        push("🎙️ You're on stage! Mic is live.", "cyan");
        unmuteMicForSpeaker();
        setTimeout(() => callAllPeers(), 300);
        setParticipants(prev =>
          prev.map(p => p.id === String(myUserRef.current?.id) ? { ...p, role: "speaker", handRaised: false } : p)
        );
        break;
      }

      case "assign_cohost": {
        const senderIsHost = _participantsRef.current.some(
          p => p.peerId === fromPeer && p.role === "host"
        );
        if (!senderIsHost) break;
        setMyRole("cohost"); myRoleRef.current = "cohost";
        push("⭐ You are now a Co-Host", "gold");
        unmuteMicForSpeaker();
        setTimeout(() => callAllPeers(), 300);
        break;
      }

      case "force_mute": {
        const senderIsCtrl = _participantsRef.current.some(
          p => p.peerId === fromPeer && (p.role === "host" || p.role === "cohost")
        );
        if (!senderIsCtrl) break;
        muteLocalStream(); setMuted(true);
        push("🔇 Muted by host", "default");
        break;
      }

      case "kick": {
        const senderCanKick = _participantsRef.current.some(
          p => p.peerId === fromPeer && (p.role === "host" || p.role === "cohost")
        );
        if (!senderCanKick) break;
        push("You were removed from the panel", "err");
        leavePanel();
        break;
      }

      case "room_ended": {
        const senderIsHostEnd = _participantsRef.current.some(
          p => p.peerId === fromPeer && p.role === "host"
        );
        if (!senderIsHostEnd) break;
        push("Host ended this panel", "default");
        cleanup(); setScreen("rooms");
        break;
      }

      default: break;
    }
  }, []);

  // ─── BROADCAST HELPERS ───────────────────────────────────────────────────

  function broadcastUpdate(pts) {
    broadcast({ type: "participants_update", participants: pts });
    setParticipants([...pts]);
  }

  function handlePeerLeft(peerId) {
    delete dataConns.current[peerId];
    callConns.current[peerId]?.close();
    delete callConns.current[peerId];
    document.getElementById(`audio_${peerId}`)?.remove();
    // Properly stop RAF loop and close AudioContext (CTO report §3.1)
    const state = analyserRefs.current[peerId];
    if (state) {
      state.active = false;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      try { state.ctx?.close(); } catch {}
      delete analyserRefs.current[peerId];
    }
    setSpeakingIds(prev => { const s = new Set(prev); s.delete(peerId); return s; });
    if (myRoleRef.current === "host" || myRoleRef.current === "cohost") {
      setParticipants(prev => {
        const u = prev.filter(p => p.peerId !== peerId);
        setTimeout(() => broadcastUpdate(u), 60);
        return u;
      });
    } else {
      setParticipants(prev => prev.filter(p => p.peerId !== peerId));
    }
  }

  // ─── AUDIO ───────────────────────────────────────────────────────────────

  // Atomic getUserMedia constraints — same for host and listener
  const GUM_CONSTRAINTS = {
    audio: {
      echoCancellation: true,  // prevents speaker feedback
      noiseSuppression: true,  // removes background noise
      autoGainControl:  true,  // normalises volume across mics
      sampleRate:       48000, // high quality
      channelCount:     1,     // mono — halves bandwidth for voice
      latency:          0.01,  // low-latency hint to browser
    },
    video: false,
  };

  async function startMic() {
    if (myStream.current) return myStream.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(GUM_CONSTRAINTS);
      myStream.current = stream;
      monitorSpeaking("__me__", stream);
      return stream;
    } catch {
      push("Mic access denied — check browser permissions", "err");
      return null;
    }
  }

  // For listeners — proper atomic mutex so concurrent calls produce exactly 1 stream
  // CTO report §2.3: non-atomic check-then-act pattern creates ghost streams
  async function startMicMuted() {
    // Fast path — stream already exists
    if (myStream.current) return myStream.current;
    // Atomic mutex: micPendingRef holds the in-flight promise
    // Any concurrent caller awaits the same promise — only 1 getUserMedia fires
    if (micPendingRef.current) return micPendingRef.current;

    micPendingRef.current = (async () => {
      // Double-check inside the lock in case stream was set between check and lock
      if (myStream.current) return myStream.current;
      try {
        const stream = await navigator.mediaDevices.getUserMedia(GUM_CONSTRAINTS);
        stream.getAudioTracks().forEach(t => { t.enabled = false; }); // muted until promoted
        myStream.current = stream;
        return stream;
      } catch {
        // Mic denied — empty stream lets listener still receive audio via WebRTC
        const silent = new MediaStream();
        myStream.current = silent;
        return silent;
      } finally {
        micPendingRef.current = null; // release lock
      }
    })();

    return micPendingRef.current;
  }

  // Unmute mic — called when listener is promoted to speaker or cohost
  function unmuteMicForSpeaker() {
    if (!myStream.current) {
      // Mic was denied — need to request full mic now
      startMic().then(() => {
        monitorSpeaking("__me__", myStream.current);
        setMuted(false);
      });
      return;
    }
    const tracks = myStream.current.getAudioTracks();
    if (tracks.length === 0) {
      // Silent empty stream (mic was denied) — need real mic now
      startMic().then(stream => {
        if (stream) { monitorSpeaking("__me__", stream); setMuted(false); }
      });
      return;
    }
    // Normal case: re-enable the muted track
    tracks.forEach(t => { t.enabled = true; });
    setMuted(false);
    // Now monitor speaking since they can talk
    monitorSpeaking("__me__", myStream.current);
  }

  function callPeer(peerId) {
    if (!myStream.current || !myPeer.current) return;
    // Close any stale/failed existing call first
    const existing = callConns.current[peerId];
    if (existing) {
      try { existing.close(); } catch {}
      delete callConns.current[peerId];
    }
    try {
      const call = myPeer.current.call(peerId, myStream.current);
      if (!call) return;
      callConns.current[peerId] = call;
      call.on("stream", s => { attachAudio(peerId, s); monitorSpeaking(peerId, s); });
      call.on("error",  e => { console.warn("callPeer err", peerId, e); delete callConns.current[peerId]; });
      call.on("close",  () => { delete callConns.current[peerId]; document.getElementById(`audio_${peerId}`)?.remove(); });
    } catch (e) { console.warn("callPeer threw", e); }
  }

  // Call all connected peers (for when a new speaker joins or reconnects)
  function callAllPeers() {
    Object.keys(dataConns.current).forEach(peerId => callPeer(peerId));
  }

  function attachAudio(peerId, stream) {
    let el = document.getElementById(`audio_${peerId}`);
    if (!el) {
      el = document.createElement("audio");
      el.id = `audio_${peerId}`; el.autoplay = true; el.playsInline = true;
      el.style.display = "none";
      document.body.appendChild(el);
    }
    el.srcObject = stream;
    // Handle browser autoplay policy — must resume after user gesture
    el.play().catch(() => {
      // Autoplay blocked — will play when user interacts with page
      const resume = () => { el.play().catch(()=>{}); document.removeEventListener("click", resume); };
      document.addEventListener("click", resume, { once: true });
    });
  }

  function monitorSpeaking(peerId, stream) {
    // Cancel + close any existing loop for this peer (CTO report §3.1)
    const existing = analyserRefs.current[peerId];
    if (existing) {
      existing.active = false;                        // stops RAF loop self-check
      if (existing.rafId) cancelAnimationFrame(existing.rafId); // explicit cancel
      try { existing.ctx?.close(); } catch {}
      delete analyserRefs.current[peerId];
    }
    try {
      const ctx     = new (window.AudioContext || window.webkitAudioContext)();
      const src     = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize = 512;
      src.connect(analyser);

      // State object — stored in ref so tick can check if it was replaced
      const state = { active: true, analyser, ctx, rafId: null };
      analyserRefs.current[peerId] = state;

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        // Double-check: stop if deactivated OR replaced by newer monitorSpeaking call
        if (!state.active || analyserRefs.current[peerId] !== state) return;
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setSpeakingIds(prev => { const s = new Set(prev); avg > 14 ? s.add(peerId) : s.delete(peerId); return s; });
        state.rafId = requestAnimationFrame(tick);
      };
      state.rafId = requestAnimationFrame(tick);
    } catch {}
  }

  function muteLocalStream() {
    myStream.current?.getAudioTracks().forEach(t => { t.enabled = false; });
  }

  // ─── CHAT ────────────────────────────────────────────────────────────────

  function sendChat() {
    if (!chatInput.trim()) return;
    const msgId = `${user.id}_${Date.now()}`;
    const msg = { type:"chat", id: msgId, from:{ id:user.id, name:user.name }, text:chatInput.trim(), time:timeStr() };
    // Send to all direct P2P connections
    broadcast(msg);
    // If not host/cohost, also relay through host so peers without direct connections see it
    if (myRoleRef.current !== "host" && myRoleRef.current !== "cohost") {
      const conns = Object.values(dataConns.current);
      if (conns.length > 0 && conns[0]?.open) conns[0].send({ ...msg, type: "chat_relay" });
    }
    setMessages(m => [...m, { ...msg, mine:true }]);
    setChatInput("");
  }

  // ← NEW: Send direct message — uses existing DataChannel with type:'dm'
  function sendDM(toPeerId) {
    if (!dmInput.trim() || !toPeerId) return;
    const msg = {
      type: 'dm',
      from: { id: user.id, name: user.name },
      text: dmInput.trim(),
      time: timeStr(),
    };
    const conn = dataConns.current[toPeerId];
    if (conn?.open) conn.send(msg);
    setDmMessages(prev => ({
      ...prev,
      [toPeerId]: [...(prev[toPeerId] || []), { ...msg, id: Date.now() + Math.random(), mine: true }],
    }));
    setDmInput('');
  }

  // ─── HOST ACTIONS ─────────────────────────────────────────────────────────

  async function approveHandRaise(participantId, backendId) {
    const target = participants.find(p => p.id === participantId);
    if (!target) return;
    if (participants.filter(p=>p.role==="speaker").length >= MAX_SPEAKERS) { push(`Max ${MAX_SPEAKERS} speakers on stage`); return; }
    await apiFetch(`/api/panels/${panelRef.current?.id}/promote/${backendId}/`, { method:"POST" }).catch(()=>{});
    const conn = dataConns.current[target.peerId];
    if (conn?.open) conn.send({ type:"speak_approved" });
    setParticipants(prev => {
      const u = prev.map(p => p.id===participantId ? {...p, role:"speaker", handRaised:false} : p);
      setTimeout(()=>broadcastUpdate(u), 60);
      return u;
    });
    push(`🎙️ ${target.name} is on stage`, "cyan");
  }

  async function assignCoHost(participantId, backendId) {
    const target = participants.find(p=>p.id===participantId);
    if (!target) return;
    if (participants.filter(p=>p.role==="cohost").length >= MAX_COHOSTS) { push(`Max ${MAX_COHOSTS} co-hosts`); return; }
    const conn = dataConns.current[target.peerId];
    if (conn?.open) conn.send({ type:"assign_cohost" });
    setParticipants(prev => {
      const u = prev.map(p => p.id===participantId ? {...p, role:"cohost"} : p);
      setTimeout(()=>broadcastUpdate(u), 60);
      return u;
    });
    push(`⭐ ${target.name} is now Co-Host`, "gold");
  }

  async function muteParticipant(participantId, backendId) {
    const target = participants.find(p=>p.id===participantId);
    if (!target) return;
    await apiFetch(`/api/panels/${panelRef.current?.id}/mute-all/`, { method:"POST" }).catch(()=>{});
    const conn = dataConns.current[target.peerId];
    if (conn?.open) conn.send({ type:"force_mute" });
    setParticipants(prev => {
      const u = prev.map(p => p.id===participantId ? {...p, muted:true} : p);
      setTimeout(()=>broadcastUpdate(u), 60);
      return u;
    });
  }

  async function kickParticipant(participantId, backendId) {
    const target = participants.find(p=>p.id===participantId);
    if (!target || target.role==="host") return;
    await apiFetch(`/api/panels/${panelRef.current?.id}/kick/${backendId}/`, { method:"POST" }).catch(()=>{});
    const conn = dataConns.current[target.peerId];
    if (conn?.open) conn.send({ type:"kick" });
    handlePeerLeft(target.peerId);
    push(`${target.name} removed`, "default");
  }

  // ─── MY CONTROLS ──────────────────────────────────────────────────────────

  function toggleMute() {
    // Only host, cohost, speaker can mute/unmute — listeners have no mic control
    if (myRoleRef.current === "listener") return;
    if (!myStream.current) return;
    const nowMuted = !muted;
    myStream.current.getAudioTracks().forEach(t => { t.enabled = !nowMuted; });
    setMuted(nowMuted);
    setParticipants(prev => {
      const u = prev.map(p => p.id===String(user.id) ? {...p, muted:nowMuted} : p);
      broadcast({ type:"participants_update", participants:u });
      return u;
    });
  }

  async function toggleHand() {
    const newVal = !handRaised;
    setHandRaised(newVal);
    const path = newVal ? `/api/panels/${panelRef.current?.id}/raise-hand/` : `/api/panels/${panelRef.current?.id}/lower-hand/`;
    await apiFetch(path, { method:"POST" }).catch(()=>{});
    broadcast({ type: newVal?"raise_hand":"lower_hand", from:{ id:user.id, name:user.name } });
    setParticipants(prev => prev.map(p => p.id===String(user.id) ? {...p, handRaised:newVal} : p));
  }

  // ─── END / LEAVE ──────────────────────────────────────────────────────────

  async function endPanel() {
    if (myRoleRef.current !== "host") return;
    broadcast({ type:"room_ended" });
    await apiFetch(`/api/panels/${panelRef.current?.id}/leave/`, { method:"POST" }).catch(()=>{});
    cleanup(); setScreen("rooms"); loadPanels();
    push("Panel ended", "default");
  }

  async function leavePanel() {
    await apiFetch(`/api/panels/${panelRef.current?.id}/leave/`, { method:"POST" }).catch(()=>{});
    cleanup(); setScreen("rooms"); setRoomInURL(null); loadPanels();
  }

  function cleanup() {
    // STEP 1: Stop all media stream tracks FIRST (turns off mic light)
    if (myStream.current) {
      myStream.current.getTracks().forEach(t => { try { t.stop(); } catch {} });
      myStream.current = null;
    }

    // STEP 2: Stop all audio elements and remove them
    document.querySelectorAll("audio[id^='audio_']").forEach(el => {
      try { el.pause(); el.srcObject = null; } catch {}
      el.remove();
    });

    // STEP 3: Close all call connections
    Object.values(callConns.current).forEach(c => { try { c.close?.(); } catch {} });
    callConns.current = {};

    // STEP 4: Close all data connections
    Object.values(dataConns.current).forEach(c => { try { c.close?.(); } catch {} });
    dataConns.current = {};

    // STEP 5: Close all analyser contexts
    Object.values(analyserRefs.current).forEach(({ ctx, rafId }) => {
      try {
        if (rafId) cancelAnimationFrame(rafId);
        ctx?.close?.();
      } catch {}
    });
    analyserRefs.current = {};

    // STEP 6: Destroy peer LAST (after all connections closed)
    try { myPeer.current?.destroy(); } catch {}
    myPeer.current = null;

    // STEP 7: Reset refs and state
    micPendingRef.current = null;
    setPanelInfo(null); setParticipants([]); setMessages([]);
    setMyRole("listener"); setConnected(false); setMuted(false);
    setHandRaised(false); setSpeakingIds(new Set()); setRoomInURL(null);
    setDmMessages({}); setActiveDM(null); setDmInput(''); setChatTab('group');
  }

  // ─── DERIVED ──────────────────────────────────────────────────────────────

  const stageParticipants    = useMemo(()=>participants.filter(p=>["host","cohost","speaker"].includes(p.role)),[participants]);
  const audienceParticipants = useMemo(()=>participants.filter(p=>p.role==="listener"),[participants]);
  const isController         = myRole==="host"||myRole==="cohost";
  const shareUrl             = panelInfo ? `${window.location.origin}${window.location.pathname}?room=${panelInfo.id}` : "";

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: LOADING
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="cosmos-root">
      <CosmosCanvas />
      <div className="loading-screen">
        <div className="spinner" />
        <p>ENTERING THE COSMOS...</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: AUTH
  // ─────────────────────────────────────────────────────────────────────────

  if (!user) return (
    <div className="cosmos-root">
      <CosmosCanvas />
      <NotifStack notifs={notifs} />
      <div className="entry-screen">
        <div className="entry-logo">
          <h1>COSMOS</h1>
          <p>Philosophy · Spirituality · AI · Innovation · Seekers</p>
        </div>
        <div className="entry-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${authMode==="login"?"active":""}`} onClick={()=>{ setAuthMode("login"); setAuthErr(""); }}>SIGN IN</button>
            <button className={`auth-tab ${authMode==="register"?"active":""}`} onClick={()=>{ setAuthMode("register"); setAuthErr(""); }}>REGISTER</button>
          </div>
          {authErr && <div className="err-msg">{authErr}</div>}
          <input
            className="cosmos-input"
            placeholder={authMode === "login" ? "Email" : "Display Name"}
            type={authMode === "login" ? "email" : "text"}
            value={authMode === "login" ? authEmail : authName}
            onChange={e => authMode === "login" ? setAuthEmail(e.target.value) : setAuthName(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !authBusy && handleAuth()}
            autoFocus
          />
          {authMode==="register" && (
            <>
              <input className="cosmos-input" placeholder="Email" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} />
              <div style={{ marginBottom:14 }}>
                <div className="stage-section-label" style={{ marginBottom:10 }}>I am a —</div>
                <div className="role-selector">
                  <button className={`role-btn ${authUserType==="trainer"?"active":""}`} onClick={()=>setAuthUserType("trainer")}>
                    <span className="role-icon">🔭</span>TRAINER
                  </button>
                  <button className={`role-btn ${authUserType==="learner"?"active":""}`} onClick={()=>setAuthUserType("learner")}>
                    <span className="role-icon">🌱</span>SEEKER
                  </button>
                </div>
              </div>
            </>
          )}
          <input className="cosmos-input" placeholder="Password" type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} onKeyDown={e=>e.key==="Enter" && !authBusy && handleAuth()} />
          <button className="btn btn-primary" onClick={handleAuth} disabled={authBusy}>
            {authBusy ? "..." : authMode==="login" ? "◈ ENTER THE VOID" : "◈ CREATE ACCOUNT"}
          </button>
        </div>
        <p style={{ color:"var(--muted)", fontSize:"0.7rem", textAlign:"center" }}>
          Only trainers can host panels · Seekers join and explore
        </p>
      </div>
    </div>
  );

  // RENDER: ONBOARDING
  if (user && onboardingChecked && !onboarded) return (
    <OnboardingScreen onComplete={handleOnboardingComplete} />
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: ROOMS LIST
  // ─────────────────────────────────────────────────────────────────────────

  if (screen === "rooms") return (
    <div className="cosmos-root">
      <CosmosCanvas />
      <NotifStack notifs={notifs} />

      {showCreate && (
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>CREATE PANEL</h2>
            <input className="cosmos-input" placeholder="Panel title (e.g. The Nature of Consciousness)" value={panelTitle} onChange={e=>setPanelTitle(e.target.value)} autoFocus />
            <input className="cosmos-input" placeholder="Short description (optional)" value={panelDesc} onChange={e=>setPanelDesc(e.target.value)} />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={handleCreatePanel} disabled={createBusy}>
                {createBusy ? "Launching..." : "◈ Launch Panel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rooms-screen">
        <div className="rooms-header">
          <div>
            <div className="rooms-title">LIVE PANELS</div>
            <div style={{ color:"var(--muted)", fontSize:"0.78rem", marginTop:4 }}>
              Welcome, {user.name} ·
              <span style={{ color: user.role==="trainer" ? "var(--gold)" : "var(--cyan)", marginLeft:4 }}>
                {user.role==="trainer" ? "🔭 Trainer" : "🌱 Seeker"}
              </span>
            </div>
          </div>
          <div style={{ display:"flex", gap:9, alignItems:"center", flexWrap:"wrap" }}>
            <button className="btn btn-ghost btn-sm" onClick={loadPanels}>↻ Refresh</button>
            {isAdmin && (
              <button className="btn btn-rose btn-sm" onClick={async()=>{
                if(!confirm("Delete ALL panels?")) return;
                await Promise.all(rooms.map(r=>apiFetch(`/api/panels/${r.id}/delete/`,{method:"POST"})));
                push("All panels cleared","cyan"); loadPanels();
              }}>⛔ Delete All</button>
            )}
            {user.role==="trainer" && (
              <button className="btn btn-primary" style={{ width:"auto" }} onClick={()=>setShowCreate(true)}>+ New Panel</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={logout}>← Exit</button>
          </div>
        </div>

        {roomsLoading ? (
          <div style={{ textAlign:"center", padding:60 }}><div className="spinner" /></div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌌</div>
            <h3>The void is quiet</h3>
            <p>{user.role==="trainer" ? "Create the first panel to start a conversation." : "No panels live right now. Check back soon."}</p>
          </div>
        ) : (
          <>
            {recRows.because_your_course?.length > 0 && (
              <>
                <div className="row-label">✨ {recRows.labels?.because_your_course || "Because of your course"}</div>
                {recRows.because_your_course.map(room => (
                  <div key={room.id} className="room-card" onClick={()=>handleJoinRoom(room)}>
                    <div className="room-card-info">
                      <h3>{room.title}</h3>
                      <div className="room-card-meta">
                        <span className="badge badge-live"><span className="live-dot" /> LIVE</span>
                        <span className="badge badge-host">⭐ {room.hostName}</span>
                        <span className="badge badge-users">👥 {room.memberCount}</span>
                      </div>
                    </div>
                    <button className="btn btn-cyan btn-sm" onClick={e=>{ e.stopPropagation(); handleJoinRoom(room); }}>Enter →</button>
                  </div>
                ))}
              </>
            )}

            {recRows.others_also_joined?.length > 0 && (
              <>
                <div className="row-label">🔗 {recRows.labels?.others_also_joined || "Others also joined"}</div>
                {recRows.others_also_joined.map(room => (
                  <div key={room.id} className="room-card" onClick={()=>handleJoinRoom(room)}>
                    <div className="room-card-info">
                      <h3>{room.title}</h3>
                      <div className="room-card-meta">
                        <span className="badge badge-live"><span className="live-dot" /> LIVE</span>
                        <span className="badge badge-host">⭐ {room.hostName}</span>
                        <span className="badge badge-users">👥 {room.memberCount}</span>
                      </div>
                    </div>
                    <button className="btn btn-cyan btn-sm" onClick={e=>{ e.stopPropagation(); handleJoinRoom(room); }}>Enter →</button>
                  </div>
                ))}
              </>
            )}

            {recRows.trending_now?.length > 0 && (
              <>
                <div className="row-label">🔥 {recRows.labels?.trending_now || "Trending now"}</div>
                {recRows.trending_now.map(room => (
                  <div key={room.id} className="room-card" onClick={()=>handleJoinRoom(room)}>
                    <div className="room-card-info">
                      <h3>{room.title}</h3>
                      <div className="room-card-meta">
                        <span className="badge badge-live"><span className="live-dot" /> LIVE</span>
                        <span className="badge badge-host">⭐ {room.hostName}</span>
                        <span className="badge badge-users">👥 {room.memberCount}</span>
                      </div>
                    </div>
                    <button className="btn btn-cyan btn-sm" onClick={e=>{ e.stopPropagation(); handleJoinRoom(room); }}>Enter →</button>
                  </div>
                ))}
              </>
            )}

            {recRows.because_your_course?.length === 0 &&
             recRows.others_also_joined?.length  === 0 &&
             recRows.trending_now?.length        === 0 && (
              <>
                <div className="row-label">🌌 All Live Panels</div>
                {rooms.filter(r=>r.isActive).map(room => (
                  <div key={room.id} className="room-card" onClick={()=>handleJoinRoom(room)}>
                    <div className="room-card-info">
                      <h3>{room.title}</h3>
                      {room.desc && <p>{room.desc}</p>}
                      <div className="room-card-meta">
                        <span className="badge badge-live"><span className="live-dot" /> LIVE</span>
                        <span className="badge badge-host">⭐ Host: {room.hostName || "Unknown"}</span>
                        <span className="badge badge-users">👥 {room.memberCount}</span>
                      </div>
                    </div>
                    <button className="btn btn-cyan btn-sm" onClick={e=>{ e.stopPropagation(); handleJoinRoom(room); }}>Enter →</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: PANEL
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="cosmos-root">
      <CosmosCanvas />
      <NotifStack notifs={notifs} />

      <div className="panel-screen">

        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-info">
            <h2>{panelInfo?.title || "Live Panel"}</h2>
            <p>{panelInfo?.hostName && `Hosted by ${panelInfo.hostName} · `}{participants.length} in space</p>
          </div>
          <div className="panel-header-actions">
            <div className={`status-pill ${connected?"connected":""}`}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:connected?"var(--cyan)":"var(--muted)",display:"inline-block" }} />
              {connected?"CONNECTED":"CONNECTING"}
            </div>
            {myRole==="host" && (
              <button className="btn btn-ghost btn-sm" onClick={()=>{ navigator.clipboard.writeText(shareUrl); push("🔗 Link copied!","cyan"); }}>
                🔗 Share
              </button>
            )}
            {myRole==="host"
              ? <button className="btn btn-rose btn-sm" onClick={endPanel}>⛔ End</button>
              : <button className="btn btn-ghost btn-sm" onClick={leavePanel}>← Leave</button>
            }
          </div>
        </div>

        {/* Stage + controls */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div className="stage-area" style={{ flex:1 }}>

            <div className="stage-section-label">ON STAGE</div>
            <div className="avatar-grid">
              {stageParticipants.map(p => {
                const isMe = p.id===String(user.id);
                const isSpeaking = speakingIds.has(isMe?"__me__":p.peerId);
                return (
                  <AvatarOrb
                    key={p.id}
                    participant={p}
                    isSpeaking={isSpeaking}
                    canControl={isController&&!isMe}
                    onMute={isController?muteParticipant:null}
                    onKick={isController&&p.role!=="host"?kickParticipant:null}
                    onPromote={null}
                    onUpvote={handleUpvote}
                    myId={String(user.id)}
                    myRole={myRole}
                  />
                );
              })}
              {stageParticipants.length===0 && (
                <div style={{ color:"var(--muted)",fontSize:"0.82rem",textAlign:"center",width:"100%",padding:"20px 0" }}>
                  No one on stage yet
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="stage-section-label">
              AUDIENCE ({audienceParticipants.length})
              {audienceParticipants.filter(p=>p.handRaised).length>0 && (
                <span style={{ color:"var(--gold)",marginLeft:8 }}>· {audienceParticipants.filter(p=>p.handRaised).length} hand(s) raised</span>
              )}
            </div>
            <div className="audience-grid">
              {audienceParticipants.map(p => {
                const isMe = p.id===String(user.id);
                return (
                  <div key={p.id} className={`audience-chip ${p.handRaised?"hand-raised":""}`}>
                    <div className="chip-avatar">{(p.name||"?")[0].toUpperCase()}</div>
                    <span>{isMe?`${p.name} (you)`:p.name}</span>
                    {p.handRaised&&<span>✋</span>}
                    {isController&&!isMe&&(
                      <div className="audience-chip-controls">
                        {p.handRaised&&<button className="btn btn-gold btn-icon btn-sm" title="Approve to stage" onClick={()=>approveHandRaise(p.id,p.backendId)}>⬆</button>}
                        <button className="btn btn-ghost btn-icon btn-sm" title="Make co-host" onClick={()=>assignCoHost(p.id,p.backendId)}>⭐</button>
                        <button className="btn btn-rose btn-icon btn-sm" title="Remove" onClick={()=>kickParticipant(p.id,p.backendId)}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {audienceParticipants.length===0&&<span style={{ color:"var(--muted)",fontSize:"0.78rem" }}>No listeners yet</span>}
            </div>
          </div>

          {/* My Controls */}
          <div className="my-controls">
            <div style={{ color:"var(--muted)",fontSize:"0.65rem",fontFamily:"var(--font-display)",letterSpacing:"0.14em",flexShrink:0 }}>
              {myRole.toUpperCase()}
            </div>
            {(myRole==="host"||myRole==="cohost"||myRole==="speaker")&&(
              <button className={`btn ${muted?"btn-rose":"btn-cyan"}`} onClick={toggleMute}>
                {muted?"🔇 Unmuted":"🎙️ Mute"}
              </button>
            )}
            {myRole==="listener"&&(
              <button className={`btn ${handRaised?"btn-gold":"btn-ghost"}`} onClick={toggleHand}>
                {handRaised?"✋ Lower Hand":"✋ Raise Hand"}
              </button>
            )}
            <button className="btn btn-ghost" onClick={()=>setSidebarTab("chat")}>💬 Chat</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab==="chat"?"active":""}`} onClick={()=>setSidebarTab("chat")}>CHAT</button>
            <button className={`sidebar-tab ${sidebarTab==="people"?"active":""}`} onClick={()=>setSidebarTab("people")}>PEOPLE</button>
            <button className={`sidebar-tab ${sidebarTab==="ranks"?"active":""}`} onClick={()=>setSidebarTab("ranks")}>RANKS</button>
            {myRole==="host"&&<button className={`sidebar-tab ${sidebarTab==="host"?"active":""}`} onClick={()=>setSidebarTab("host")}>HOST</button>}
          </div>

          <div className="sidebar-content">

            {/* ─── CHAT TAB ─── */}
            {sidebarTab==="chat"&&(
              <>
                {/* ← NEW: GROUP / DM subtabs */}
                <div className="chat-subtabs">
                  <button
                    className={`chat-subtab ${chatTab==="group"?"active":""}`}
                    onClick={()=>{ setChatTab("group"); setActiveDM(null); }}
                  >
                    💬 GROUP
                  </button>
                  <button
                    className={`chat-subtab ${chatTab==="dm"?"active":""}`}
                    onClick={()=>setChatTab("dm")}
                  >
                    🔒 PRIVATE DM
                    {/* Show unread count badge */}
                    {Object.values(dmMessages).reduce((a,b)=>a+b.filter(m=>!m.mine).length,0) > 0 && (
                      <span style={{
                        marginLeft:4, background:"var(--rose)", color:"#fff",
                        borderRadius:"50%", width:14, height:14, fontSize:"0.5rem",
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"var(--font-display)", fontWeight:700,
                      }}>
                        {Object.values(dmMessages).reduce((a,b)=>a+b.filter(m=>!m.mine).length,0)}
                      </span>
                    )}
                  </button>
                </div>

                {/* GROUP CHAT — unchanged from original */}
                {chatTab==="group" && (
                  <>
                    <div className="chat-messages">
                      {messages.length===0&&<div style={{ color:"var(--muted)",fontSize:"0.82rem",textAlign:"center",padding:"28px 0" }}>The conversation begins here...</div>}
                      {messages.map(m=>(
                        <div key={m.id} className={`chat-msg ${m.mine?"mine":""}`}>
                          {!m.mine&&<div className="chat-msg-header"><span className="chat-msg-name" style={{ color:"var(--violet)" }}>{m.from.name}</span><span className="chat-msg-time">{m.time}</span></div>}
                          <div className="chat-msg-text">{m.text}</div>
                          {m.mine&&<div className="chat-msg-header"><span className="chat-msg-time">{m.time}</span></div>}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="chat-input-area">
                      <input placeholder="Say something to everyone..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} />
                      <button className="btn btn-primary btn-icon" onClick={sendChat}>→</button>
                    </div>
                  </>
                )}

                {/* ← NEW: DM — person list */}
                {chatTab==="dm" && !activeDM && (
                  <div className="dm-list">
                    <div style={{ color:"var(--muted)",fontSize:"0.62rem",padding:"8px 4px",fontFamily:"var(--font-display)",letterSpacing:"0.1em" }}>
                      SELECT PERSON TO MESSAGE PRIVATELY
                    </div>
                    {participants
                      .filter(p => p.id !== String(user.id))
                      .map(p => {
                        const unread = (dmMessages[p.peerId] || []).filter(m => !m.mine).length;
                        const lastMsg = (dmMessages[p.peerId] || []).slice(-1)[0];
                        return (
                          <div
                            key={p.id}
                            className={`dm-person ${activeDM===p.peerId?"active":""}`}
                            onClick={() => setActiveDM(p.peerId)}
                          >
                            <div className="p-avatar" style={{ flexShrink:0 }}>{(p.name||"?")[0].toUpperCase()}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontFamily:"var(--font-display)",fontSize:"0.62rem",color:"var(--text)" }}>{p.name}</div>
                              {lastMsg && (
                                <div style={{ fontSize:"0.58rem",color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                                  {lastMsg.mine?"You: ":""}{lastMsg.text}
                                </div>
                              )}
                              {!lastMsg && (
                                <div style={{ fontSize:"0.55rem",color:"var(--muted)" }}>{p.role}</div>
                              )}
                            </div>
                            {unread > 0 && <div className="dm-unread">{unread}</div>}
                          </div>
                        );
                      })
                    }
                    {participants.filter(p=>p.id!==String(user.id)).length===0 && (
                      <div style={{ color:"var(--muted)",fontSize:"0.78rem",textAlign:"center",padding:"30px 0" }}>
                        No other participants yet
                      </div>
                    )}
                  </div>
                )}

                {/* ← NEW: DM — conversation thread */}
                {chatTab==="dm" && activeDM && (
                  <>
                    <button className="dm-back" onClick={()=>setActiveDM(null)}>
                      ← {participants.find(p=>p.peerId===activeDM)?.name || "Back to DMs"}
                    </button>
                    <div className="chat-messages">
                      {(dmMessages[activeDM]||[]).length===0 && (
                        <div style={{ color:"var(--muted)",fontSize:"0.82rem",textAlign:"center",padding:"28px 0" }}>
                          Start a private conversation...
                        </div>
                      )}
                      {(dmMessages[activeDM]||[]).map((m,i)=>(
                        <div key={m.id||i} className={`chat-msg ${m.mine?"mine":""}`}>
                          {!m.mine&&<div className="chat-msg-header"><span className="chat-msg-name" style={{ color:"var(--violet)" }}>{m.from.name}</span><span className="chat-msg-time">{m.time}</span></div>}
                          <div className="chat-msg-text" style={{ background: m.mine?"rgba(0,245,255,0.08)":undefined, borderColor: m.mine?"var(--border2)":undefined }}>{m.text}</div>
                          {m.mine&&<div className="chat-msg-header"><span className="chat-msg-time">{m.time}</span></div>}
                        </div>
                      ))}
                    </div>
                    <div className="chat-input-area">
                      <input
                        placeholder={`Message ${participants.find(p=>p.peerId===activeDM)?.name||"privately"}...`}
                        value={dmInput}
                        onChange={e=>setDmInput(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&sendDM(activeDM)}
                      />
                      <button className="btn btn-cyan btn-icon" onClick={()=>sendDM(activeDM)}>→</button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ─── PEOPLE TAB ─── */}
            {sidebarTab==="people"&&(
              <div className="participants-list">
                {participants.map(p=>(
                  <div key={p.id} className="participant-item">
                    <div className="p-avatar">{(p.name||"?")[0].toUpperCase()}</div>
                    <div className="p-info">
                      <div className="p-name">{p.name}{p.id===String(user.id)?" (you)":""}</div>
                      <div style={{ marginTop:3,display:"flex",gap:4,flexWrap:"wrap" }}>
                        <span className={`badge badge-${p.role==="host"?"host":p.role==="cohost"?"cohost":p.role==="speaker"?"speaker":"users"}`} style={{ fontSize:"0.58rem" }}>{p.role}</span>
                        {p.handRaised&&<span className="badge" style={{ background:"rgba(255,215,0,0.14)",color:"var(--gold)",border:"1px solid rgba(255,215,0,0.3)",fontSize:"0.58rem" }}>✋</span>}
                        {p.muted&&<span className="badge" style={{ fontSize:"0.58rem" }}>🔇</span>}
                      </div>
                    </div>
                    <div className="p-actions">
                      {p.id !== String(user.id) && (
                        <button
                          className={`btn btn-sm ${followedIds.has(p.backendId) ? "btn-cyan" : "btn-ghost"}`}
                          onClick={() => handleFollow(p.backendId)}
                          title={followedIds.has(p.backendId) ? "Unfollow" : "Follow"}
                        >
                          {followedIds.has(p.backendId) ? "✓" : "+ Follow"}
                        </button>
                      )}
                      {/* ← NEW: DM button in people tab */}
                      {p.id !== String(user.id) && p.peerId && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Send private message"
                          onClick={() => { setSidebarTab("chat"); setChatTab("dm"); setActiveDM(p.peerId); }}
                        >
                          💬
                        </button>
                      )}
                      {isController&&p.id!==String(user.id)&&p.role!=="host"&&(
                        <>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>muteParticipant(p.id,p.backendId)}>🔇</button>
                          <button className="btn btn-rose btn-icon btn-sm"  onClick={()=>kickParticipant(p.id,p.backendId)}>✕</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── RANKS TAB ─── */}
            {sidebarTab==="ranks"&&(
              <VCRLeaderboard userId={user.id} />
            )}

            {/* ─── HOST TAB ─── */}
            {sidebarTab==="host"&&myRole==="host"&&(
              <div className="participants-list">
                <div className="stage-section-label" style={{ margin:"12px 0 8px",padding:"0 4px" }}>SHARE PANEL</div>
                <div className="share-box">
                  <code>{shareUrl}</code>
                  <button className="btn btn-cyan btn-sm" onClick={()=>{ navigator.clipboard.writeText(shareUrl); push("Copied!","cyan"); }}>Copy</button>
                </div>

                <div className="stage-section-label" style={{ margin:"12px 0 8px",padding:"0 4px" }}>
                  HAND RAISES ({participants.filter(p=>p.handRaised).length})
                </div>
                {participants.filter(p=>p.handRaised).map(p=>(
                  <div key={p.id} className="participant-item" style={{ borderColor:"rgba(255,215,0,0.4)" }}>
                    <div className="p-avatar" style={{ borderColor:"var(--gold)" }}>{(p.name||"?")[0].toUpperCase()}</div>
                    <div className="p-info">
                      <div className="p-name">{p.name}</div>
                      <span className="badge" style={{ fontSize:"0.58rem",background:"rgba(255,215,0,0.14)",color:"var(--gold)",border:"1px solid rgba(255,215,0,0.3)" }}>wants to speak</span>
                    </div>
                    <div className="p-actions">
                      <button className="btn btn-gold btn-sm" onClick={()=>approveHandRaise(p.id,p.backendId)}>⬆ Stage</button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>assignCoHost(p.id,p.backendId)}>⭐</button>
                      <button className="btn btn-rose btn-icon btn-sm"  onClick={()=>kickParticipant(p.id,p.backendId)}>✕</button>
                    </div>
                  </div>
                ))}
                {participants.filter(p=>p.handRaised).length===0&&<div style={{ color:"var(--muted)",fontSize:"0.78rem",padding:"14px 4px" }}>No hands raised</div>}

                <div className="divider" style={{ margin:"14px 0" }} />
                <div className="stage-section-label" style={{ marginBottom:8,padding:"0 4px" }}>DANGER ZONE</div>
                <button className="btn btn-rose" style={{ width:"100%" }} onClick={endPanel}>⛔ End Panel for Everyone</button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}