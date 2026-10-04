from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
import django.contrib.auth.password_validation as validators
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Project


class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message='A user with that email already exists.')]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    def validate_password(self, value):
        """Validates that the password meets requirements in Django's configured AUTH_PASSWORD_VALIDATORS setting."""
        try:
            validators.validate_password(password=value, user=None)
        except DjangoValidationError as e:
            # re-raise exception as DRF-compliant error
            raise serializers.ValidationError(list(e.messages))

        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password')


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(read_only=True, source='is_staff')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name','last_name', 'is_admin')


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'owner', 'description', 'document', 'created_at', 'updated_at')


class AllProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'owner', 'description', 'created_at', 'updated_at')