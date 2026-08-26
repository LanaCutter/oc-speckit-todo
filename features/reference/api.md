# API Reference

**Base path:** `/todo/`  
**Status:** Integrated API through **Feature 5** (authentication, sessions, list CRUD, todo CRUD with due dates, profile).  
**Authority for new work:** feature specs in `features/` — update this file in the same PR when routes or payloads change.

**Auth:** Send `Authorization: Bearer <token>` on protected routes.  
**Errors:** `{ "message": "Human-readable explanation." }` unless noted.

## Feature provenance

| Area | Feature |
|------|---------|
| Register, login, logout | 1 |
| List CRUD (`GET/POST/PUT/DELETE /todo/lists`) | 2 |
| Todo CRUD (`GET/POST .../lists/:listId/todos`, `PUT/DELETE /todo/todos/:id`) | 3 |
| Profile (`GET/PUT /todo/users/:id`) | 4 |
| Todo `dueDate` on create/update/read | 5 |

---

## Authentication (Feature 1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/todo/register` | No | Create account |
| `POST` | `/todo/login` | No | Sign in; returns session payload |
| `POST` | `/todo/logout` | Yes | Invalidate session token |

**Register body:**
```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jdoe@example.com",
  "username": "jdoe",
  "password": "password123"
}
```

**Login body:**
```json
{
  "username": "jdoe",
  "password": "password123"
}
```

**Register / login success** (`201` register · `200` login):
```json
{
  "userId": 1,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "fName": "Jane",
  "lName": "Doe",
  "role": "worker",
  "token": "<jwt>"
}
```

Password hashes are never returned.

**Logout success** (`200`):
```json
{
  "message": "Signed out successfully."
}
```

**Common auth errors:** missing fields `400`; password < 8 chars `400` with `"Password must be at least 8 characters."`; duplicate username `400` with `"Username is already taken."`; duplicate email `400` with `"Email is already registered."`; invalid login `401` with `"Invalid username or password."`; missing token on protected routes `401` with `"Unauthorized! No token provided."`; invalid or expired token `401` with `"Unauthorized! Invalid or expired token."`

---

## Lists (Feature 2)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/todo/lists` | Yes | Lists owned by caller (array, ordered by `name` ASC) |
| `POST` | `/todo/lists` | Yes | Create a new list |
| `PUT` | `/todo/lists/:listId` | Yes | Rename a list |
| `DELETE` | `/todo/lists/:listId` | Yes | Delete a list owned by the caller |

**Create / rename body:**
```json
{ "name": "Groceries" }
```

Client-supplied `userId` in the body is ignored on create; ownership is always `req.user.id`.

**List success** (`200` / `201`):
```json
{
  "id": 1,
  "name": "Groceries",
  "userId": 42,
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Delete success** (`200`):
```json
{ "message": "List deleted successfully." }
```

**Validation errors:** empty/whitespace name `400` with `"List name is required."`; name > 100 chars `400` with `"List name must be 100 characters or fewer."`; invalid `listId` `400`; unowned list `404` with `"List with id=<id> not found."`; unauthenticated `401`.

---

## Todos (Feature 3)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/todo/lists/:listId/todos` | Yes | Todos in an owned list (incomplete first, then `createdAt` ASC) |
| `POST` | `/todo/lists/:listId/todos` | Yes | Add a todo to an owned list |
| `PUT` | `/todo/todos/:id` | Yes | Update todo title and/or `completed` |
| `DELETE` | `/todo/todos/:id` | Yes | Delete a todo owned by the caller |

Parent list must belong to the caller; cross-user list or todo access returns `404`. Client-supplied `userId` on create is ignored; ownership is always `req.user.id`.

**Create todo body:**
```json
{ "title": "Buy milk", "dueDate": "2026-07-15" }
```

`dueDate` is optional (Feature 5); omit it or send `null` for no due date.

**Update todo body** (at least one field):
```json
{ "title": "Buy oat milk", "completed": true, "dueDate": "2026-07-20" }
```

Omitting `dueDate` leaves the stored value unchanged; sending `null` clears it.

**Todo success** (`200` / `201`):
```json
{
  "id": 10,
  "listId": 1,
  "title": "Buy milk",
  "completed": false,
  "dueDate": "2026-07-15",
  "userId": 42,
  "createdAt": "2026-07-02T12:05:00.000Z",
  "updatedAt": "2026-07-02T12:05:00.000Z"
}
```

`dueDate` is `null` when not set.

**Delete success** (`200`):
```json
{ "message": "Todo deleted successfully." }
```

**Validation errors:** empty/whitespace title `400` with `"Todo title is required."`; title > 255 chars `400` with `"Todo title must be 255 characters or fewer."`; invalid `dueDate` `400` with `"Due date must be a valid date in YYYY-MM-DD format."`; invalid `listId` or `id` `400`; unowned list or todo `404` with `"List with id=<id> not found."` or `"Todo with id=<id> not found."`; unauthenticated `401`.

---

## Profile (Feature 4)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/todo/users/:id` | Yes | Fetch the authenticated user's profile |
| `PUT` | `/todo/users/:id` | Yes | Update the authenticated user's profile |

Self-access only (`:id` must equal `req.user.id`); cross-user access returns `404`.

**Update profile body:**
```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@example.com",
  "username": "jdoe",
  "password": "newpassword123"
}
```

`password` is optional; omit to leave the current password unchanged.

**Profile success** (`200`):
```json
{
  "id": 42,
  "fName": "Jane",
  "lName": "Doe",
  "email": "jane@example.com",
  "username": "jdoe",
  "role": "worker",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:05:00.000Z"
}
```

Password hash is never returned.

**Validation errors:** missing required field `400` (e.g. `"First name is required."`); password < 8 chars `400` with `"Password must be at least 8 characters."`; duplicate username `400` with `"Username is already taken."`; duplicate email `400` with `"Email is already registered."`; invalid `id` `400`; unowned user `404` with `"User with id=<id> not found."`; unauthenticated `401`.
