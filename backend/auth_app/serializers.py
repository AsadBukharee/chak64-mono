from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'bio', 'location',
            'cnic', 'phone_number', 'profile_image_url', 'profile_media_type',
            'cover_image_url', 'language', 'notification_preferences', 'role',
            'is_verified', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'cnic']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            cnic=validated_data.get('cnic', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
