from django.urls import path
from .views import (
    recommend, run_migrations_endpoint,
    get_courses, create_course, update_course, delete_course,
    create_module, update_module, delete_module,
    create_topic, update_topic, delete_topic
)

urlpatterns = [
    path('recommend/', recommend, name='recommend'),
    # Migration endpoint
    path('migrate/', run_migrations_endpoint, name='run_migrations'),
    # Syllabus API
    path('syllabus/courses/', get_courses, name='get_courses'),
    path('syllabus/courses/create/', create_course, name='create_course'),
    path('syllabus/courses/<str:course_id>/update/', update_course, name='update_course'),
    path('syllabus/courses/<str:course_id>/delete/', delete_course, name='delete_course'),
    # Modules
    path('syllabus/courses/<str:course_id>/modules/create/', create_module, name='create_module'),
    path('syllabus/modules/<int:module_id>/update/', update_module, name='update_module'),
    path('syllabus/modules/<int:module_id>/delete/', delete_module, name='delete_module'),
    # Topics
    path('syllabus/modules/<int:module_id>/topics/create/', create_topic, name='create_topic'),
    path('syllabus/topics/<int:topic_id>/update/', update_topic, name='update_topic'),
    path('syllabus/topics/<int:topic_id>/delete/', delete_topic, name='delete_topic'),
]
