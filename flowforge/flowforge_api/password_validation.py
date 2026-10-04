import string

from django.core.exceptions import ValidationError


class AlphaNumericSpecialCharValidator:
    error_message = "Password must contain upper and lower case letters, at least one number, and at least one of the following characters: " + string.punctuation
    error_code = "missing_required_character"

    def validate(self, password, user=None):
        has_digit = any(char.isdigit() for char in password)
        if not has_digit:
            raise ValidationError(self.error_message, code=self.error_code)

        has_lowercase = any(char.islower() for char in password)
        if not has_lowercase:
            raise ValidationError(self.error_message, code=self.error_code)

        has_uppercase = any(char.isupper() for char in password)
        if not has_uppercase:
            raise ValidationError(self.error_message, code=self.error_code)

        has_alpha = any(char.isalpha() for char in password)
        if not has_alpha:
            raise ValidationError(self.error_message, code=self.error_code)

        has_punctuation = any(char in string.punctuation for char in password)
        if not has_punctuation:
            raise ValidationError(self.error_message, code=self.error_code)

