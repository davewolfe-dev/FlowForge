from rest_framework import serializers

from flowforge.flowforge_api.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'owner', 'description', 'document', 'created_at', 'updated_at')