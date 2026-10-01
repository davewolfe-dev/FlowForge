# urls.py
from django.urls import path, re_path

from .views import LoginView, LogoutView, MeView

urlpatterns = [
    path("api/login/", LoginView.as_view()),
    path("api/logout/", LogoutView.as_view()),
    path("api/me/", MeView.as_view()),
]
