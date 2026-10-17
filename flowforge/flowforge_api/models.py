from django.db import models
from django.contrib.auth.models import User

def get_default_document():
    return {
        'schemaVersion': 1,
        'nodes': [],
        'edges': [],
        'viewPort': {'x': 0, 'y': 0, 'zoom': 1},
    }

class Project(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    document = models.JSONField(default=get_default_document)
    document_version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

