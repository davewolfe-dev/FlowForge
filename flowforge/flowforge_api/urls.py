# urls.py
from django.urls import path

from .views import LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="api-register"),
    path("api/login/", LoginView.as_view(), name="api-login"),
    path("api/logout/", LogoutView.as_view(), name="api-logout"),
    path("api/me/", MeView.as_view(), name="api-me"),
]
