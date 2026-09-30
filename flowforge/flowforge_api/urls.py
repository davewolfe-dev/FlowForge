# urls.py
from django.urls import path, re_path

from flowforge.flowforge_api.views import LoginView

urlpatterns = [
    path("api/auth/login/", LoginView.as_view()),
]
