# ScrapIt API Contracts (v1)

**Base URL:** `/api/v1`
**Auth:** `Authorization: Bearer <accessToken>` on all protected routes.
**Cookies:** Refresh token issued as httpOnly cookie `rt` (SameSite=Strict, Secure in prod).
**Content type:** `application/json` unless stated (uploads use `multipart/form-data`).

---

## 1. Response Envelope

Every endpoint returns the same envelope.

### Success
```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 20, "total": 87 }
}
```

`meta` is present on list endpoints only.

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "scheduledFor must be today or later",
    "details": [
      { "field": "scheduledFor", "rule": "min", "expected": "2026-05-14" }
    ]
  }
}
```

### Error Codes

| HTTP | Code                  | Used when                                    |
|------|-----------------------|----------------------------------------------|
| 400  | `VALIDATION_ERROR`    | Body/query fails schema validation           |
| 401  | `UNAUTHENTICATED`     | Missing/invalid/expired access token         |
| 403  | `FORBIDDEN`           | Authenticated but wrong role or not owner    |
| 404  | `NOT_FOUND`           | Resource missing or hidden by ownership rule |
| 409  | `CONFLICT`            | Duplicate (e.g. email), insufficient points  |
| 422  | `BUSINESS_RULE`       | Domain rule violated (e.g. past pickup date) |
| 429  | `RATE_LIMITED`        | Too many requests                            |
| 500  | `INTERNAL`            | Unhandled exception                          |

---

## 2. Conventions

- **Pagination:** `?page=1&limit=20` (max `limit=100`).
- **Sorting:** `?sort=-createdAt` (prefix `-` = desc).
- **Filtering:** documented per endpoint.
- **IDs:** human-friendly where shown (`PCK-2041`, `R-104`, `u_001`); Mongo `_id` returned as string.
- **Dates:** ISO 8601 (`2026-05-14T08:30:00.000Z`).
- **Currency:** NGN (Naira), integer Naira amounts (no kobo).
- **Status enum (Pickup):** `Pending` · `Approved` · `In Progress` · `Completed` · `Rejected` · `Cancelled`.

---

## 3. Auth

### 3.1 `POST /auth/register`
Register a new end-user. Admins and Collectors are seeded/created by an existing admin.

**Request**
```json
{
  "name": "Adaeze Okafor",
  "email": "adaeze@example.com",
  "phone": "+2348035550142",
  "password": "S3cure!Pass"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "user": { "id": "u_001", "name": "Adaeze Okafor", "email": "adaeze@example.com", "role": "user", "points": 0, "profileComplete": false },
    "accessToken": "eyJhbGciOi..."
  }
}
```

Refresh token set as `rt` cookie.

### 3.2 `POST /auth/login`
End-user login.

**Request** `{ "email": "...", "password": "..." }`
**Response 200** same shape as 3.1.

### 3.3 `POST /auth/admin/login`
Admin-only login. Returns 403 if account is not `role=admin`.

### 3.4 `POST /auth/collector/login`
Collector-only login. Returns 403 if account is not `role=collector`.

### 3.5 `POST /auth/refresh`
Rotates refresh token, returns new access token.

**Request** (cookie `rt` only — no body)
**Response 200** `{ "success": true, "data": { "accessToken": "..." } }`

### 3.6 `POST /auth/logout`
Clears `rt` cookie, blacklists current jti.

**Response 204** (no body)

### 3.7 `GET /auth/me`
Returns current user document.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "u_001",
    "name": "Adaeze Okafor",
    "email": "adaeze@example.com",
    "phone": "+2348035550142",
    "role": "user",
    "address": "14 Marina Road, Apapa, Lagos",
    "points": 4280,
    "profileComplete": true,
    "createdAt": "2024-08-12T10:00:00.000Z"
  }
}
```

---

## 4. User (self)

### 4.1 `GET /users/me` — same as `/auth/me`.

### 4.2 `PATCH /users/me`
Update profile.

**Request** (any subset)
```json
{ "name": "...", "phone": "...", "address": "..." }
```

**Response 200** updated user (4.1 shape). `profileComplete` flips to true once `name`, `phone`, `address` are all set.

### 4.3 `PATCH /users/me/password`
```json
{ "currentPassword": "...", "newPassword": "..." }
```
**Response 204**.

---

## 5. Pickups (user-scoped)

### 5.1 `POST /pickups`
Create a pickup request.

**Request**
```json
{
  "wasteType": "plastic",
  "weight": 4.2,
  "scheduledFor": "2026-05-16",
  "address": "14 Marina Road, Apapa, Lagos",
  "imageUrls": ["https://res.cloudinary.com/.../pickup1.jpg"],
  "notes": "Optional pickup notes"
}
```

**Validation**
- `wasteType` ∈ `plastic|glass|metal`
- `weight` > 0, ≤ 200
- `scheduledFor` must be ≥ today (server time)
- `imageUrls` length 1..5; HTTPS URLs only
- Caller `profileComplete` must be true (else 422)

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "PCK-2042",
    "userId": "u_001",
    "wasteType": "plastic",
    "weight": 4.2,
    "estimatedPoints": 42,
    "scheduledFor": "2026-05-16T00:00:00.000Z",
    "status": "Pending",
    "address": "14 Marina Road, Apapa, Lagos",
    "imageUrls": ["..."],
    "createdAt": "2026-05-14T12:30:00.000Z"
  }
}
```

### 5.2 `GET /pickups/me`
List caller's pickups.

**Query** `?status=Pending|Approved|...&page=1&limit=20&sort=-createdAt`

**Response 200**
```json
{
  "success": true,
  "data": [ { "id": "PCK-2041", "...": "..." } ],
  "meta": { "page": 1, "limit": 20, "total": 23 }
}
```

### 5.3 `GET /pickups/:id`
Returns pickup detail. Visible to: owner, assigned collector, any admin. Else 404.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "PCK-2038",
    "userId": "u_001",
    "userName": "Adaeze Okafor",
    "wasteType": "metal",
    "weight": 6.1,
    "verifiedWeight": null,
    "estimatedPoints": 122,
    "pointsAwarded": 0,
    "scheduledFor": "2026-05-12T00:00:00.000Z",
    "status": "In Progress",
    "address": "14 Marina Road, Apapa, Lagos",
    "imageUrls": ["..."],
    "collector": { "id": "c_002", "name": "Bisi Adeyemi", "phone": "+2348023456789" },
    "timeline": [
      { "status": "Pending",     "by": "System",       "at": "2026-05-10T08:00:00.000Z" },
      { "status": "Approved",    "by": "Admin Bola",   "at": "2026-05-11T09:15:00.000Z" },
      { "status": "In Progress", "by": "Bisi Adeyemi", "at": "2026-05-12T11:00:00.000Z" }
    ],
    "rejectionReason": null,
    "notes": ""
  }
}
```

### 5.4 `PATCH /pickups/:id/cancel`
Owner cancels a `Pending` or `Approved` pickup.

**Response 200** updated pickup. 422 if status not cancellable.

---

## 6. Rewards

### 6.1 `GET /rewards/catalog`
```json
{
  "success": true,
  "data": {
    "airtime": {
      "minPoints": 500,
      "providers": [
        { "id": "mtn",     "label": "MTN" },
        { "id": "airtel",  "label": "Airtel" },
        { "id": "glo",     "label": "Glo" },
        { "id": "9mobile", "label": "9mobile" }
      ],
      "denominations": [
        { "value": 500,  "cost": 500 },
        { "value": 1000, "cost": 1000 },
        { "value": 2000, "cost": 2000 }
      ]
    },
    "giftcard": {
      "minPoints": 2500,
      "providers": [
        { "id": "gplay",  "label": "Google Play" },
        { "id": "apple",  "label": "Apple" },
        { "id": "amazon", "label": "Amazon" }
      ],
      "denominations": [
        { "value": 1000, "cost": 2500 },
        { "value": 2000, "cost": 5000 },
        { "value": 5000, "cost": 12000 }
      ]
    }
  }
}
```

### 6.2 `POST /rewards/redeem`
```json
{
  "type": "airtime",
  "provider": "mtn",
  "denomination": 1000,
  "phone": "+2348035550142"
}
```
For gift cards omit `phone`.

**Validation**
- `type` ∈ `airtime|giftcard`
- `provider` exists in catalog for that type
- `denomination` exists in catalog for that type
- Caller `points >= denomination.cost`
- `phone` required when `type=airtime` (E.164)

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "R-104",
    "type": "airtime",
    "provider": "MTN",
    "value": 1000,
    "pointsSpent": 1000,
    "code": "MTN-9F2K-7H1Q",
    "status": "fulfilled",
    "createdAt": "2026-05-14T13:00:00.000Z"
  }
}
```

Points deducted atomically (`$inc` with `points >= cost` filter). If filter fails: 409 `INSUFFICIENT_POINTS`.

### 6.3 `GET /rewards/me`
```json
{
  "success": true,
  "data": [
    { "id": "R-104", "date": "...", "type": "airtime", "provider": "MTN", "value": 500, "pointsSpent": 500, "code": "MTN-9F2K-7H1Q", "status": "fulfilled" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 4 }
}
```

---

## 7. Notifications

### 7.1 `GET /notifications/me`
**Query** `?unread=true&page=1&limit=20`
```json
{
  "success": true,
  "data": [
    { "id": "n1", "message": "Your pickup PCK-2038 is now In Progress.", "kind": "status", "readAt": null, "createdAt": "2026-05-12T11:00:00.000Z", "meta": { "pickupId": "PCK-2038" } }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "unreadCount": 3 }
}
```

### 7.2 `PATCH /notifications/:id/read`
**Response 204**.

### 7.3 `PATCH /notifications/read-all`
**Response 204**.

---

## 8. Admin

All endpoints require `role=admin`.

### 8.1 `GET /admin/pickups`
**Query** `?status=Pending&from=2026-05-01&to=2026-05-31&search=PCK-204&page=1&limit=20&sort=-createdAt`

**Response 200** — array of pickup summaries (5.3 shape, lighter).

### 8.2 `PATCH /admin/pickups/:id/approve`
**Request** `{ "collectorId": "c_001" }` (optional — can be assigned later)
**Response 200** updated pickup. 422 if status not `Pending`.

### 8.3 `PATCH /admin/pickups/:id/reject`
**Request** `{ "reason": "Photo unclear — please re-upload with clear lighting." }`
**Response 200** updated pickup. 422 if status not `Pending`.

### 8.4 `PATCH /admin/pickups/:id/assign`
**Request** `{ "collectorId": "c_001" }`
**Response 200** updated pickup. 422 if status ∉ `Approved`. 400 if collector inactive.

### 8.5 `GET /admin/users`
**Query** `?search=adaeze&page=1&limit=20`
```json
{
  "success": true,
  "data": [
    { "id": "u_001", "name": "Adaeze Okafor", "email": "...", "phone": "...", "pickups": 23, "points": 4280, "joinDate": "2024-08-12T..." }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

### 8.6 `GET /admin/users/:id`
Full user with pickup history summary.

### 8.7 `GET /admin/collectors`
```json
{
  "success": true,
  "data": [
    { "id": "c_001", "name": "Chidi Eze", "email": "...", "phone": "...", "active": true, "assignedCount": 4 }
  ]
}
```

### 8.8 `POST /admin/collectors`
Create collector (admin-seeded).
**Request** `{ "name": "...", "email": "...", "phone": "...", "tempPassword": "..." }`
**Response 201** collector.

### 8.9 `PATCH /admin/collectors/:id`
Toggle active or update profile.
**Request** any of `{ "active": false, "name": "...", "phone": "..." }`

### 8.10 `GET /admin/analytics/summary`
```json
{
  "success": true,
  "data": {
    "totals":   { "users": 248, "collectors": 5, "pickups": 1042, "pointsAwarded": 184320 },
    "byStatus": { "Pending": 18, "Approved": 32, "In Progress": 11, "Completed": 967, "Rejected": 14 },
    "weekly":   [ { "week": "2026-W18", "pickups": 64, "kg": 412 } ],
    "topUsers": [ { "id": "u_003", "name": "Ngozi Eze", "points": 7950 } ]
  }
}
```

### 8.11 `GET /admin/activity`
Recent admin/system activity log (last 100). Used for the dashboard activity feed.

---

## 9. Collector

All endpoints require `role=collector`.

### 9.1 `GET /collector/pickups`
**Query** `?status=Approved|In Progress|Completed&page=1&limit=20`
Returns only pickups where `collector === me`.

### 9.2 `PATCH /collector/pickups/:id/start`
Marks `Approved → In Progress`. 422 if not assigned to caller or wrong status.
**Response 200** updated pickup.

### 9.3 `PATCH /collector/pickups/:id/complete`
**Request**
```json
{
  "verifiedWeight": 4.0,
  "completionNote": "Collected without issues."
}
```
Marks `In Progress → Completed`, awards points using `verifiedWeight`.
**Response 200** updated pickup with `pointsAwarded` set.

### 9.4 `PATCH /collector/availability`
**Request** `{ "availability": "available" | "busy" | "offline" }`
**Response 204**.

---

## 10. Uploads

### 10.1 `POST /uploads/pickup-image`
Multipart upload to Cloudinary (proxied server-side OR signed-direct-upload flow). Result returns the Cloudinary URL only.

**Request** `multipart/form-data` with field `image` (jpg/png/webp, ≤ 5 MB).
**Response 201**
```json
{
  "success": true,
  "data": { "url": "https://res.cloudinary.com/.../v123/pickup_abc.jpg", "publicId": "pickup_abc" }
}
```

---

## 11. Rate Limits

| Scope                     | Window  | Max  |
|---------------------------|---------|------|
| Global per IP             | 15 min  | 100  |
| `/auth/*`                 | 15 min  | 5    |
| `/uploads/*`              | 1 hour  | 30   |
| `/rewards/redeem`         | 1 hour  | 10   |

Exceeding returns 429 with `Retry-After` header.

---

## 12. Webhooks (future, v2)

Reserved namespace `/webhooks/*` for redemption provider callbacks (airtime fulfillment, gift-card delivery).
