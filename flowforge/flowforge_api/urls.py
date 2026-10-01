# urls.py
from django.urls import path, re_path

from .views import LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path("api/register/", RegisterView.as_view()),
    path("api/login/", LoginView.as_view()),
    path("api/logout/", LogoutView.as_view()),
    path("api/me/", MeView.as_view()),
]
