"""Root URL configuration."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from auth_app.upload_views import upload_file_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('posts.urls')),
    path('api/auth/', include('auth_app.urls')),
    path('api/upload/', upload_file_view, name='upload-file'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
