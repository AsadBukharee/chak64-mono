from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.me_view, name='auth-me'),
    path('register/', views.register_view, name='auth-register'),
    path('login/', views.login_view, name='auth-login'),
    path('logout/', views.logout_view, name='auth-logout'),
    path('users/', views.users_list_view, name='auth-users'),
    path('users/<int:pk>/', views.user_detail_view, name='auth-user-detail'),
]
