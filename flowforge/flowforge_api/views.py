from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from flowforge.flowforge_api.models import Project
from flowforge.flowforge_api.serializers import ProjectSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')


class LoginView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user) # This automatically sets the session cookie!
            return Response({"detail": "Successfully logged in."}, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)


class ProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(owner=request.user).order_by("-updated_at")

        serializer = ProjectSerializer(data=projects, many=True)
        return Response(serializer.data)