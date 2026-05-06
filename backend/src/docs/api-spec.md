# GrandCare Backend API Specification

All routes are prefixed with `/api`.
All protected routes require an `Authorization: Bearer <token>` header.

## Authentication & Users
- `POST /api/auth/register` - Register a new user (elder or helper). Returns JWT token and profile.
- `POST /api/auth/login` - Login user. Returns JWT token and profile.
- `GET /api/users/me` (Protected) - Get logged-in user's profile.
- `PUT /api/users/me` (Protected) - Update logged-in user's profile.
- `PUT /api/users/location` (Protected) - Update user's geolocation (expects `lat` and `lng`).
- `GET /api/users/leaderboard` (Protected) - Get top 10 elders by `grandScore`.

## Daily Routines
- `GET /api/routines` (Elder) - Get all routines for the logged-in elder.
- `POST /api/routines` (Elder) - Create a new routine task.
- `PUT /api/routines/:id/complete` (Elder) - Mark a task as complete for the day and award points.
- `GET /api/routines/today-summary` (Elder) - Get summary of today's completed tasks.

## Medicines
- `GET /api/medicines` (Elder) - Get all medicines.
- `POST /api/medicines` (Elder) - Add a new medicine.
- `DELETE /api/medicines/:id` (Elder) - Delete a medicine.

## News Quiz
- `GET /api/quiz/today` (Elder) - Fetch today's questions.
- `POST /api/quiz/submit` (Elder) - Submit answers, compute score, award `grandScore` points.

## Community Help (Help Requests)
- `POST /api/help-requests` (Elder) - Create a new help request.
- `GET /api/help-requests/nearby?lat=x&lng=y&radiusKm=z` (Helper) - Find pending requests near the helper's coordinates.
- `GET /api/help-requests/mine` (Protected) - Get elder's own requests or helper's accepted requests.
- `POST /api/help-requests/:id/accept` (Helper) - Accept a pending help request.
- `POST /api/help-requests/:id/complete` (Protected) - Mark request as completed (by owner or assigned helper).

## Chat
- `GET /api/chat/:requestId` (Protected) - Fetch message history for a specific help request.

## SOS / Emergency
- `GET /api/sos/contacts` (Elder) - Get emergency contacts.
- `POST /api/sos/contacts` (Elder) - Add a new emergency contact.
- `POST /api/sos/trigger` (Elder) - Trigger SOS alert (mocked).
