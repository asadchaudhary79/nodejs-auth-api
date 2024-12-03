# API Documentation

## Authentication Endpoints

### Register User
```http
POST /users/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "isEmailVerified": false
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "This email is already registered. Please login or use a different email",
  "action": "registration_failed"
}
```

### Verify Email
```http
POST /users/verify-email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "isEmailVerified": true
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired verification code"
}
```

### Login User
```http
POST /users/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "isEmailVerified": true
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

or

```json
{
  "message": "Please verify your email before logging in",
  "isEmailVerified": false
}
```

### Get User Profile
```http
GET /users/profile
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Success Response (200):**
```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "isEmailVerified": true
  }
}
```

### Logout User
```http
GET /users/logout
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Validation Rules

### Registration Validation
- Email must be a valid email address
- First name must be at least 3 characters long
- Password must be at least 6 characters long

### Login Validation
- Email must be a valid email address
- Password must be at least 6 characters long

### Email Verification Validation
- Email must be a valid email address
- Verification code must be exactly 6 digits

## Notes
- All successful responses will return with an appropriate HTTP status code
- Error responses will include a message describing the error
- Authentication endpoints (except register and login) require a valid JWT token in the Authorization header
- Verification codes expire after 10 minutes
- JWT tokens expire after 24 hours
