from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'full_name', 'role', 'is_verified', 'created_date']
    list_filter = ['role', 'is_verified']
    list_editable = ['is_verified']
    search_fields = ['username', 'email', 'full_name']
