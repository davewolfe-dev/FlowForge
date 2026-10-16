from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from flowforge_api.models import Project


class AuthAPITests(APITestCase):

    def setUp(self):
        # Create a sample user in the test database
        self.username = "testuser"
        self.password = "securepass123"
        self.user = User.objects.create_user(
            username=self.username,
            email="test@example.com",
            password=self.password,
            first_name="Test",
            last_name="User",
        )
        self.login_url = reverse('api-login')
        self.me_url = reverse('api-me')
        self.logout_url = reverse('api-logout')

    def test_login_sets_cookie(self):
        """Verify that a successful login establishes backend tracking and cookies."""
        response = self.client.post(
            self.login_url,
            {
                "username": self.username,
                "password": self.password
            },
            format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sessionid', self.client.cookies)

    def test_unauthenticated_user_cannot_access_me(self):
        """Verify that an anonymous request to /api/me/ returns 403 Forbidden."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_can_access_me(self):
        """Verify that logging in attaches the session context to all following requests."""
        # Log the user session into the test client
        self.client.login(username=self.username, password=self.password)

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.username)


class RegisterAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('api-register')
        self.me_url = reverse('api-me')

        # valid payload for a new user
        self.valid_payload = {
            "username": "new_user",
            "email": "new@example.com",
            "password": "securePassword123!",
            "first_name": "Test",
            "last_name": "User",
        }

    def test_successful_registration_creates_user_and_hashes_password(self):
        """Verify registration saves a new user to the DB with an encrypted password."""
        response = self.client.post(self.register_url, self.valid_payload, format='json')

        # assert correct HTTP 201 Created status code
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # verify user exists in the test database
        user = User.objects.get(username=self.valid_payload["username"])
        self.assertEqual(user.email, self.valid_payload["email"])

        # verify password is encrypted, NOT plain text
        self.assertNotEqual(user.password, self.valid_payload["password"])
        self.assertTrue(user.check_password(self.valid_payload["password"]))

    def test_successful_registration_automatically_logs_user_in(self):
        """Verify strict same-origin behavior: sign-up sets session cookies immediately."""
        response = self.client.post(self.register_url, self.valid_payload, format='json')

        # check that sessionid cookie is in the client wrapper
        self.assertIn('sessionid', self.client.cookies)

        # confirm the session is actively authenticated by hitting the protected /api/me/ route
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], self.valid_payload["username"])

    def test_registration_fails_with_duplicate_username(self):
        """Verify database integrity constraints return a clean 400 Bad Request."""
        # create an existing user with the same username
        User.objects.create_user(username="new_user", email="other@test.com", password="password")

        response = self.client.post(self.register_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # ensure django rest framework error dictionary targets the duplicate username field
        self.assertIn('username', response.data)

    def test_registration_fails_with_duplicate_email(self):
        """Verify serializer UniqueValidator blocks duplicate email addresses."""
        # create an existing user with the same email address
        User.objects.create_user(username="old_user", email="new@example.com", password="password")

        response = self.client.post(self.register_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # ensure django rest framework error dictionary targets the duplicate email field
        self.assertIn('email', response.data)

    def test_registration_fails_missing_required_fields(self):
        """Verify validation errors trigger if empty or incomplete payloads are submitted."""
        incomplete_payload = {
            "first_name": "Anonymous"
            # Missing username, email, and password
        }
        response = self.client.post(self.register_url, incomplete_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # ensure django rest framework error dictionary targets the missing required fields
        self.assertIn('username', response.data)
        self.assertIn('password', response.data)
        self.assertIn('email', response.data)

    def test_registration_fails_invalid_password(self):
        """Verify validation errors trigger if invalid password is entered."""
        invalid_payload = {
            "username": "new_user",
            "email": "new@example.com",
            "password": "123",
            "first_name": "Test",
            "last_name": "User",
        }

        response = self.client.post(self.register_url, invalid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # ensure django rest framework error dictionary targets the password field
        self.assertIn('password', response.data)


class ProjectAPITests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username="user_a", email="user_a@test.com", password="password123")
        self.user_b = User.objects.create_user(username="user_b", email="user_b@test.com", password="password123")

        self.project_a = Project.objects.create(
            owner=self.user_a,
            name="Test Project A",
            description="Project owned by User A",
        )

        self.project_b = Project.objects.create(
            owner=self.user_b,
            name="Test Project B",
            description="Project owned by User B",
        )

        self.projects_url = reverse('api-all-projects')

    def test_unauthenticated_user_blocked_from_projects(self):
        """Verify that unauthenticated users cannot access the projects API."""
        response = self.client.get(self.projects_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_endpoint_returns_only_owned_projects(self):
        """Verify that endpoint returns only projects owned by logged-in user."""
        self.client.login(username=self.user_a.username, password="password123")

        response = self.client.get(self.projects_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Test Project A")

        # verify the document field is not included
        self.assertNotIn('document', response.data[0])

    def test_create_project_succeeds_and_assigns_owner(self):
        """Verify that new projects are added to the database and owner field is populated."""
        self.client.login(username=self.user_a.username, password="password123")
        payload = {
            "name": "A New Project",
            "description": "A new test project from user_a",
        }
        response = self.client.post(self.projects_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify record exists in db and has matching owner
        project = Project.objects.get(id=response.data['id'])
        self.assertEqual(project.owner, self.user_a)
        self.assertEqual(project.name, payload['name'])

        # Verify that document defaulted to an empty dictionary
        self.assertEqual(project.document, {})

    def test_single_project_detail_includes_documents(self):
        """Verify that single project fetch by id includes the heavy document."""
        self.client.login(username=self.user_a.username, password="password123")
        detail_url = reverse('api-single-project', kwargs={'pk': self.project_a.id})
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Test Project A")
        # Verify the heavy document schema block is present for detail views
        self.assertIn('document', response.data)

    def test_user_blocked_from_accessing_other_peoples_projects(self):
        """Verify User A cannot access User B's project data."""
        self.client.login(username="user_a", password="password123")

        # Malicious Attempt: User A explicitly tries to fetch User B's project ID details
        malicious_url = reverse('api-single-project', kwargs={'pk': self.project_b.id})
        response = self.client.get(malicious_url)

        # Verify the backend intercepts the ID mismatch and blocks the transfer
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], "You do not have permission to view this project.")

    def test_save_project_document(self):
        self.client.login(username=self.user_a.username, password="password123")
        document_url = reverse('api-project-document', kwargs={'pk': self.project_a.id})
        payload = {
            "document_version": 1,
            "document": {
                "schemaVersion": 1,
                "nodes": [
                    {
                        "id": "node-a1",
                        "type": "trigger",
                        "position": { "x": 120, "y": 160 },
                        "data": {
                            "label": "Start",
                            "config": {}
                        }
                    }
                ],
                "edges": [],
                "viewport": {
                    "x": 0,
                    "y": 0,
                    "zoom": 1
                }
            }
        }

        response = self.client.put(document_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # verify document version is incremented
        self.assertEqual(response.data['document_version'], 2)

    def test_version_mismatch_raises_error(self):
        self.client.login(username=self.user_a.username, password="password123")
        project_v2 = Project.objects.create(
            owner=self.user_a,
            name="Test Project Version 2",
            description="Project owned by User A",
            document_version=3,
        )

        document_url = reverse('api-project-document', kwargs={'pk': project_v2.id})
        payload = {
            "document_version": 1,
            "document": {
                "schemaVersion": 1,
                "nodes": [],
                "edges": [],
                "viewport": {
                    "x": 0,
                    "y": 0,
                    "zoom": 1
                }
            }
        }

        response = self.client.put(document_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        # verify document version was not incremented
        self.assertEqual(project_v2.document_version, 3)
