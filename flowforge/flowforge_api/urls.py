# urls.py
from django.urls import re_path

from .views import LoginView, LogoutView, MeView, RegisterView, AllProjectsView, ProjectView, ProjectDocumentView

urlpatterns = [
    re_path(r'^api/register/?$', RegisterView.as_view(), name="api-register"),
    re_path(r'^api/login/?$', LoginView.as_view(), name="api-login"),
    re_path(r'^api/logout/?$', LogoutView.as_view(), name="api-logout"),
    re_path(r'^api/me/?$', MeView.as_view(), name="api-me"),
    re_path(r'^api/projects/?$', AllProjectsView.as_view(), name="api-all-projects"),
    re_path(r'^api/projects/(?P<pk>[0-9]+)/?$', ProjectView.as_view(), name="api-single-project"),
    re_path(r'^api/projects/(?P<pk>[0-9]+)/document/?$', ProjectDocumentView.as_view(), name="api-project-document"),
]
