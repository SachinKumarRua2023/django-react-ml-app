import pandas as pd
import os
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import NearestNeighbors
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from sklearn.preprocessing import StandardScaler
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.core.management import call_command

from .models import Course, Module, Topic

User = get_user_model()

# -------------------------
# MIGRATION ENDPOINT
# -------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def run_migrations_endpoint(request):
    """Run database migrations - accessible via GET for easy triggering"""
    try:
        call_command('migrate', '--noinput')
        return Response({
            'status': 'success',
            'message': 'Migrations completed successfully'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

# -------------------------
# SYLLABUS API ENDPOINTS
# -------------------------

def is_master_user(user):
    """Check if user is master@gmail.com"""
    return user.is_authenticated and user.email == 'master@gmail.com'


@api_view(['GET'])
@permission_classes([AllowAny])
def get_courses(request):
    """Get all courses with their modules and topics"""
    try:
        courses = Course.objects.filter(is_active=True).prefetch_related(
            'modules__topics'
        )
        
        data = []
        for course in courses:
            course_data = {
                'id': course.id,
                'title': course.title,
                'icon': course.icon,
                'color': course.color,
                'description': course.description,
                'order': course.order,
                'modules': []
            }
            
            for module in course.modules.filter(is_active=True):
                module_data = {
                    'id': module.id,
                    'title': module.title,
                    'order': module.order,
                    'topics': []
                }
                
                for topic in module.topics.filter(is_active=True):
                    module_data['topics'].append({
                        'id': topic.id,
                        'title': topic.title,
                        'order': topic.order,
                        'content': topic.get_content()
                    })
                
                course_data['modules'].append(module_data)
            
            data.append(course_data)
        
        return Response(data)
    except Exception as e:
        # Check if tables don't exist
        if 'relation' in str(e).lower() and 'does not exist' in str(e).lower():
            return Response({
                'error': 'Database tables not created. Please run migrations first.',
                'migration_endpoint': '/api/ml/migrate/',
                'message': 'Visit /api/ml/migrate/ to create database tables'
            }, status=503)
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    """Create a new course - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can create courses'}, status=403)
    
    data = request.data
    course = Course.objects.create(
        id=data.get('id'),
        title=data.get('title'),
        icon=data.get('icon', '📚'),
        color=data.get('color', '#00d9ff'),
        description=data.get('description', ''),
        order=data.get('order', 0)
    )
    
    return Response({
        'id': course.id,
        'title': course.title,
        'message': 'Course created successfully'
    }, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_course(request, course_id):
    """Update a course - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can update courses'}, status=403)
    
    try:
        course = Course.objects.get(id=course_id)
        data = request.data
        
        course.title = data.get('title', course.title)
        course.icon = data.get('icon', course.icon)
        course.color = data.get('color', course.color)
        course.description = data.get('description', course.description)
        course.order = data.get('order', course.order)
        course.is_active = data.get('is_active', course.is_active)
        course.save()
        
        return Response({'message': 'Course updated successfully'})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    """Delete a course - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can delete courses'}, status=403)
    
    try:
        course = Course.objects.get(id=course_id)
        course.delete()
        return Response({'message': 'Course deleted successfully'})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_module(request, course_id):
    """Create a module in a course - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can create modules'}, status=403)
    
    try:
        course = Course.objects.get(id=course_id)
        data = request.data
        
        module = Module.objects.create(
            course=course,
            title=data.get('title'),
            order=data.get('order', 0)
        )
        
        return Response({
            'id': module.id,
            'title': module.title,
            'message': 'Module created successfully'
        }, status=201)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_module(request, module_id):
    """Update a module - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can update modules'}, status=403)
    
    try:
        module = Module.objects.get(id=module_id)
        data = request.data
        
        module.title = data.get('title', module.title)
        module.order = data.get('order', module.order)
        module.is_active = data.get('is_active', module.is_active)
        module.save()
        
        return Response({'message': 'Module updated successfully'})
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_module(request, module_id):
    """Delete a module - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can delete modules'}, status=403)
    
    try:
        module = Module.objects.get(id=module_id)
        module.delete()
        return Response({'message': 'Module deleted successfully'})
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_topic(request, module_id):
    """Create a topic in a module - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can create topics'}, status=403)
    
    try:
        module = Module.objects.get(id=module_id)
        data = request.data
        
        topic = Topic.objects.create(
            module=module,
            title=data.get('title'),
            order=data.get('order', 0),
            content=data.get('content', {})
        )
        
        return Response({
            'id': topic.id,
            'title': topic.title,
            'message': 'Topic created successfully'
        }, status=201)
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_topic(request, topic_id):
    """Update a topic - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can update topics'}, status=403)
    
    try:
        topic = Topic.objects.get(id=topic_id)
        data = request.data
        
        topic.title = data.get('title', topic.title)
        topic.order = data.get('order', topic.order)
        topic.content = data.get('content', topic.content)
        topic.is_active = data.get('is_active', topic.is_active)
        topic.save()
        
        return Response({'message': 'Topic updated successfully'})
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_topic(request, topic_id):
    """Delete a topic - only master@gmail.com"""
    if not is_master_user(request.user):
        return Response({'error': 'Only master can delete topics'}, status=403)
    
    try:
        topic = Topic.objects.get(id=topic_id)
        topic.delete()
        return Response({'message': 'Topic deleted successfully'})
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=404)


# -------------------------
# Load Data
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, "youtube_data.csv")

data = pd.read_csv(file_path)

# Normalize column names
data.columns = data.columns.str.strip().str.lower().str.replace(" ", "_")

# Fix Channel Name Column
if "channel_name" not in data.columns:
    if "youtuber" in data.columns:
        data.rename(columns={"youtuber": "channel_name"}, inplace=True)
    elif "title" in data.columns:
        data.rename(columns={"title": "channel_name"}, inplace=True)

# Validate Required Columns
required_columns = ["channel_name", "subscribers", "video_views", "uploads"]
for col in required_columns:
    if col not in data.columns:
        raise ValueError(f"Missing column in CSV: {col}")

# -------------------------
# Models
# -------------------------
features = ["subscribers", "video_views", "uploads"]

# Model 1: Predict Subscribers
X_sub = data[["video_views", "uploads"]]
y_sub = data["subscribers"]
reg_sub_model = LinearRegression()
reg_sub_model.fit(X_sub, y_sub)

# Model 2: Predict Video Views
X_views = data[["subscribers", "uploads"]]
y_views = data["video_views"]
reg_views_model = LinearRegression()
reg_views_model.fit(X_views, y_views)

# KNN Model
scaler = StandardScaler()
scaled_features = scaler.fit_transform(data[features])
n_neighbors = min(5, len(data))
knn = NearestNeighbors(n_neighbors=n_neighbors)
knn.fit(scaled_features)

# -------------------------
# API - FIXED ORDER
# -------------------------
@api_view(["POST"])              # ← First (closest to function)
@permission_classes([AllowAny])  # ← Second
def recommend(request):
    try:
        subscribers = request.data.get("subscribers")
        views = request.data.get("views")
        uploads = request.data.get("uploads")

        if subscribers is None or views is None or uploads is None:
            return Response(
                {"error": "Missing required fields: subscribers, views, uploads"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscribers = float(subscribers)
        views = float(views)
        uploads = float(uploads)

        # Predictions
        predicted_subscribers = reg_sub_model.predict([[views, uploads]])[0]
        predicted_views = reg_views_model.predict([[subscribers, uploads]])[0]

        # Similar Channels
        input_data = [[subscribers, views, uploads]]
        input_scaled = scaler.transform(input_data)
        distances, indices = knn.kneighbors(input_scaled)

        similar = data.iloc[indices[0]][
            ["channel_name", "subscribers", "video_views", "uploads"]
        ].to_dict(orient="records")

        return Response({
            "predicted_subscribers": int(predicted_subscribers),
            "predicted_video_views": int(predicted_views),
            "similar_channels": similar
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )