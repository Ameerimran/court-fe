# Courtly Backend Contract

This frontend currently uses local browser storage through `src/app/services`. Replace those implementations with HTTP calls to the endpoints below when the backend is ready. Keep the service method signatures stable so components do not need to change.

## 1. Recommended stack

- REST API returning JSON
- PostgreSQL or MySQL
- JWT access token with refresh token, or secure cookie sessions
- Password hashing with Argon2id or bcrypt
- UTC timestamps in ISO 8601 format
- Store and return monetary amounts in Malaysian Ringgit (MYR); use `RM` for UI display and minor units such as sen in the database if payment precision is required.
- Request validation and rate limiting on all public endpoints

Suggested base URL: `/api/v1`

## 2. Authentication

### `POST /auth/register`

Request:

```json
{ "name": "Jordan Miles", "email": "jordan@example.com", "password": "strong-password" }
```

Response `201`:

```json
{ "user": { "id": "uuid", "name": "Jordan Miles", "email": "jordan@example.com", "role": "user" }, "accessToken": "jwt" }
```

Rules:

- Email must be unique and normalized to lowercase.
- Password minimum 8 characters; hash it, never return it.
- Return `409` when email already exists.

### `POST /auth/login`

Request:

```json
{ "email": "jordan@example.com", "password": "strong-password" }
```

Response `200`: same shape as register.

- Return `401` for invalid credentials.
- Rate-limit repeated failures.

### `POST /auth/logout`

Invalidate the refresh token/session. Return `204`.

### `GET /auth/me`

Return the current user:

```json
{ "id": "uuid", "name": "Jordan Miles", "email": "jordan@example.com", "role": "user" }
```

## 3. Courts

### `GET /courts?sport=Badminton&date=2026-06-16`

Return available courts. `sport` and `date` are optional filters.

```json
[
  {
    "id": "uuid",
    "name": "Northside Arena",
    "sport": "Badminton",
    "location": "Riverside District",
    "price": 18,
    "rating": 4.9,
    "accent": "coral",
    "isActive": true
  }
]
```

### `POST /admin/courts`

Admin only. Create a court with `name`, `sport`, `location`, `price`.

### `PATCH /admin/courts/:courtId`

Admin only. Update court fields.

### `DELETE /admin/courts/:courtId`

Admin only. Soft-delete or deactivate a court. Do not delete historical bookings.

## 4. Availability and bookings

### `GET /courts/:courtId/availability?date=2026-06-16`

Return time slots:

```json
[
  { "time": "08:30", "available": true, "price": 18 },
  { "time": "10:00", "available": false, "price": 18 }
]
```

### `POST /bookings`

Authenticated user only.

Request:

```json
{ "courtId": "uuid", "date": "2026-06-16", "time": "08:30" }
```

Response `201`:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "courtId": "uuid",
  "court": "Northside Arena",
  "sport": "Badminton",
  "date": "2026-06-16",
  "time": "08:30",
  "status": "confirmed",
  "totalPrice": 18
}
```

Backend must enforce:

- User is authenticated.
- Court exists and is active.
- Date is valid and not in the past.
- Time is a valid slot.
- No overlapping booking for the same court/date/time.
- Use a database transaction and unique constraint on `(court_id, date, time)` to prevent race-condition double bookings.
- Return `409` when the slot is taken.

### `GET /bookings/me`

Authenticated user only. Return the current user's bookings, newest first.

### `PATCH /bookings/:bookingId/cancel`

Authenticated user can cancel their own booking. Admin can cancel any booking. Return the updated booking.

## 5. Admin dashboard

All admin endpoints require an authenticated user with `role = admin`.

### `GET /admin/dashboard`

Return dashboard data:

```json
{
  "bookingsThisMonth": 128,
  "averageOccupancy": 86,
  "revenueThisMonth": 8420,
  "averageRating": 4.9,
  "recentBookings": [],
  "courts": []
}
```

### `GET /admin/bookings?status=confirmed&from=2026-06-01&to=2026-06-30`

Support pagination, status/date filters, sorting, and search by customer or court.

### `PATCH /admin/bookings/:bookingId/status`

Request:

```json
{ "status": "confirmed" }
```

Allowed statuses: `pending`, `confirmed`, `cancelled`, `completed`.

## 6. Database tables

Minimum tables:

- `users`: `id`, `name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`
- `courts`: `id`, `name`, `sport`, `location`, `price`, `rating`, `is_active`, `created_at`, `updated_at`
- `bookings`: `id`, `user_id`, `court_id`, `date`, `time`, `status`, `total_price`, `created_at`, `updated_at`
- `refresh_tokens` or server-side sessions

Required indexes/constraints:

- Unique normalized user email
- Foreign keys from bookings to users and courts
- Unique `(court_id, date, time)` for active bookings, or an equivalent partial unique index
- Index bookings by `user_id`, `court_id`, and `date`

## 7. Error format

Use one consistent shape:

```json
{ "error": { "code": "SLOT_UNAVAILABLE", "message": "This court is already booked for that time.", "fields": {} } }
```

Recommended HTTP statuses: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `422` business rule, `429` rate limit, `500` server error.

## 8. Security and operations checklist

- Never trust price, role, user ID, or availability values from the browser.
- Calculate price and ownership on the backend.
- Configure CORS only for known frontend origins.
- Use HTTPS in all non-local environments.
- Add request IDs, structured logs, health endpoint, and database migrations.
- Add automated tests for auth, permissions, booking conflicts, cancellation, and admin reporting.
- Add payment flow later if bookings require payment; use a payment provider webhook to confirm payment server-side.

## 9. Frontend service mapping

- `AuthService.login/register/logout` -> `/auth/*`
- `CourtService.courts/addCourt/updateCourt/removeCourt` -> `/courts` and `/admin/courts`
- `BookingService.createBooking/userBookings/cancelBooking` -> `/bookings`

The localStorage implementation is only a development adapter. It is not secure and must not be used as production authentication or authorization.
