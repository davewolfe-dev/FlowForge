# urls.py
from django.urls import path

from .views import LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path(r'^api/register/?$', RegisterView.as_view(), name="api-register"),
    path(r'^api/login/?$', LoginView.as_view(), name="api-login"),
    path(r'^api/logout/?$', LogoutView.as_view(), name="api-logout"),
    path(r'^api/me/?$', MeView.as_view(), name="api-me"),
]
