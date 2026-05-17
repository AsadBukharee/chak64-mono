from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET: return current user. PATCH: update current user profile."""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user and return auth token."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login and return auth token."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Delete auth token to logout."""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'detail': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list_view(request):
    """List all users (for @mention feature)."""
    users = User.objects.all().order_by('full_name')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail_view(request, pk):
    """Admin-only: update or delete a user."""
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
