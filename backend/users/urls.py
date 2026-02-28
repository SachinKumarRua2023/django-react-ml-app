# from rest_framework.routers import DefaultRouter
# from .views import EmployeeViewSet

# router = DefaultRouter()
# router.register(r'employees', EmployeeViewSet)

# urlpatterns = router.urls
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet

router = DefaultRouter()
router.register(r'', EmployeeViewSet, basename='employee')  # Changed from 'employees' to ''

urlpatterns = router.urls