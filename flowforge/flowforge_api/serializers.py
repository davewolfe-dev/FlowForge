from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Project


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(read_only=True, source='is_staff')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name','last_name', 'is_admin')


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'owner', 'description', 'document', 'created_at', 'updated_at')