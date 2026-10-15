from django.db import transaction
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Project
from .serializers import ProjectSerializer, UserSerializer, RegistrationSerializer, AllProjectsSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    # create a new user and log them in immediately after signup
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        login(request, user)
        user_data = UserSerializer(user).data
        return Response(user_data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user) # This automatically sets the session cookie!
            return Response({"detail": "Successfully logged in."}, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RevisionConflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = (
        "The document has changed since it was loaded."
    )
    default_code = "revision_conflict"


class ProjectDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        """ updates a project document """
        document = request.data.get('document')
        if not isinstance(document, dict):
            return Response(
                {'detail': 'Invalid document structure.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expected_version = request.data.get('document_version')
        if not isinstance(expected_version, int) or isinstance(expected_version, bool):
            return Response(
                {'detail': 'Invalid document version.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                project: Project = (
                    Project.objects
                    .select_for_update()
                    .get(pk=pk, owner=request.user)
                )

            if project.document_version != expected_version:
                raise RevisionConflict()

            project.document = document
            project.document_version += 1
            project.save(
                update_fields=['document', 'document_version']
            )
            return Response({"document_version": project.document_version})

        except Project.DoesNotExist:
            return Response({"detail": "Project does not exist."}, status=status.HTTP_404_NOT_FOUND)


class ProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """ fetch a single project by the primary key """
        project = get_object_or_404(Project, pk=pk)

        if project.owner != request.user:
            return Response(
                {'detail': 'You do not have permission to view this project.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)




class AllProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(owner=request.user).order_by("-updated_at")

        serializer = AllProjectsSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AllProjectsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_project = serializer.save(owner=request.user)

        return Response(AllProjectsSerializer(new_project).data, status=status.HTTP_201_CREATED)