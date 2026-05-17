from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended User model with fields the frontend expects."""
    full_name = models.CharField(max_length=255, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    cnic = models.CharField(max_length=20, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    profile_image_url = models.URLField(max_length=1024, blank=True, default='')
    profile_media_type = models.CharField(max_length=10, blank=True, default='image')
    cover_image_url = models.URLField(max_length=1024, blank=True, default='')
    language = models.CharField(max_length=5, blank=True, default='en')
    notification_preferences = models.JSONField(blank=True, null=True, default=dict)
    role = models.CharField(
        max_length=20,
        choices=[('user', 'User'), ('admin', 'Admin')],
        default='user',
    )
    is_verified = models.BooleanField(default=False, help_text='Verified badge for the user')
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.full_name and self.first_name:
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or self.username
