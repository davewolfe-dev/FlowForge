from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


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
