# API Documentation

Base URL: `http://localhost:3000` (development) / `https://api.businessnavigator.com` (production)

All endpoints except auth registration/login require authentication via `Authorization: Bearer <token>` header.

## Authentication Endpoints

See full API documentation in the repository.

Key endpoints:

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/password/validate
- GET /api/auth/oauth/google

## Onboarding Endpoints

- GET /api/onboarding/status
- GET /api/onboarding/resume
- POST /api/onboarding/save
- POST /api/onboarding/complete

## Dashboard Endpoints

- GET /api/dashboard
- GET /api/dashboard/confidence
- POST /api/dashboard/hero-task/complete
- POST /api/dashboard/hero-task/skip

## AI Chat Endpoints

- POST /api/agent/chat

For detailed request/response formats, see the full documentation.
