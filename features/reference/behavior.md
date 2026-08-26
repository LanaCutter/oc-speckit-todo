# Behavior & Rules Reference

**Living snapshot** of product rules currently in force on `dev` (not API shapes or columns — see [api.md](./api.md) and [data-model.md](./data-model.md)).

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md` (**FR-00N** + Gherkin). Deep scenarios stay in the introducing feature; this file is an **index**.

**Related:** [ADR-0002 — Security architecture](../../docs/adr/0002-security-architecture.md)

---

## Maintenance

| When | Action |
|------|--------|
| Feature changes a product rule (sort, ownership, validation, UI rule) | Update this file in the **same PR** |
| Feature only changes routes/payloads/schema | Update [api.md](./api.md) / [data-model.md](./data-model.md); touch this file only if rules changed |
| Drift suspected | Compare this file → code + mapped tests; fix reference or code |

---

## Auth & sessions

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Login is **username + password** (not email-only) | Auth API + Login UI | Feature 1 |
| Passwords hashed with bcrypt (`SALT_ROUNDS = 10`); hash never returned | Register/login APIs; user `defaultScope` | Feature 1 |
| Password minimum **8** characters at registration | Register API + Register UI | Feature 1 |
| Session = JWT stored server-side; client sends `Authorization: Bearer <token>` | `authenticate` middleware + `sessions` table | Feature 1 |
| Session lifetime **24 hours** from creation | Session create on register/login | Feature 1 |
| Login reuses a non-expired session for the same user when one exists | Login controller | Feature 1 |
| Logout invalidates the server session and clears client `user` storage | Logout API + `authServices.logoutUser` | Feature 1 |
| Unauthenticated protected API → `401` | `authenticate` | Feature 1 |
| Unauthenticated protected UI → redirect to login | Router `beforeEach` | Feature 1 |
| Signed-in user visiting login/register → redirect to home | Router `beforeEach` | Feature 1 |
| Default role for new users is `worker` | Register | Feature 1 |
| Username normalized `trim().toLowerCase()` on save | User model `beforeValidate` hook | Feature 1 |
| Shared `emailRules` for registration (required + format `"Enter a valid email address."`) | `frontend/src/config/validation.js` | Feature 1 |
| Session stored in `localStorage` key `user` | Login/register success | Feature 1 |
| Auth pages: full-screen layout, **no MenuBar** | Login, Register | Feature 1 |

## Ownership & isolation

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Every authenticated request resolves to `req.user.id` from the session | `authenticate` | Feature 1 |
| Cross-user list access → **`404`**, never `403` | `list.controller` + `getAccessibleListOrNull` | Feature 2 |
| Lists: reads/writes scoped to `userId = req.user.id`; create ownership from server only | `list.controller` + helper | Feature 2 |
| Client-supplied `userId` on list create is ignored | `list.controller` create | Feature 2 |
| Cross-user todo or parent list access → **`404`**, never `403` | `todo.controller` + `getAccessibleTodoOrNull` | Feature 3 |
| Todos: reads/writes scoped to `userId = req.user.id`; create ownership from server only | `todo.controller` + helpers | Feature 3 |
| Client-supplied `userId` on todo create is ignored | `todo.controller` create | Feature 3 |
| Deleting a list cascades delete of its todos | `List hasMany Todo` `onDelete: CASCADE` | Feature 3 |

## Lists

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| List name trimmed; empty/whitespace rejected | Create/update API + Dashboard dialogs | Feature 2 |
| List name max **100** characters | API + client rules | Feature 2 |
| Lists returned **alphabetically by name** | `findAll` `order: name ASC` | Feature 2 |
| Single-view lists UI (`Dashboard.vue`); list CRUD via dialogs; no sidebar/main split | Dashboard | Feature 2 |
| Empty lists: **"No lists yet. Create your first list."** | Dashboard | Feature 2 |
| **+ New List** and dialog **Create** use class **`oc-cta`** | Dashboard | Feature 2 |
| List row icon actions: **Edit list**, **Delete list** (`size="small"`) | Dashboard | Feature 2 |
| List row **Items** icon opens list-items dialog (`aria-label`: **View items for &lt;list name&gt;**) | Dashboard | Feature 3 |
| **+ Add Item** only inside list-items dialog; nested add/edit/delete todo dialogs | Dashboard | Feature 3 |
| Todo title trimmed; empty/whitespace rejected | Create/update API + Dashboard dialogs | Feature 3 |
| Todo title max **255** characters | API + client rules | Feature 3 |
| Todos ordered **incomplete first**, then **`createdAt` ASC** | `todo.controller` findAll + client sort | Feature 3 |
| Completed todos show struck-through or muted title | Dashboard items dialog | Feature 3 |
| Empty todos: **"No todos in this list yet."** | Dashboard items dialog | Feature 3 |
| **+ Add Item** and add dialog **Add** use class **`oc-cta`** | Dashboard | Feature 3 |
| Todo row icon actions: **Edit todo**, **Delete todo** | Dashboard items dialog | Feature 3 |
| Deleting a list closes its open items dialog | Dashboard | Feature 3 |

## MenuBar

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| `MenuBar` on signed-in routes; hidden on login/register | `App.vue` | Feature 2 |
| Shows signed-in user's display name and **Sign out** | `MenuBar.vue` | Feature 2 |

## Errors (product convention)

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Error body shape `{ "message": "Human-readable explanation." }` | Controllers | Feature 1 |
| Duplicate username → `"Username is already taken."`; duplicate email → `"Email is already registered."` | Register API | Feature 1 |
| Invalid login (wrong username or password) → `"Invalid username or password."` | Login API | Feature 1 |
| Unowned list → `"List with id=<id> not found."` | List controller | Feature 2 |
| Unowned todo → `"Todo with id=<id> not found."` | Todo controller | Feature 3 |

---

## How to use

| Question | Look here |
|----------|-----------|
| What rule is in force now? | This file |
| Why was this rule chosen? | Feature FR / Gherkin, or ADR |
| Exact scenario / test name | Introducing `feature-N-*.md` Test Coverage Map |
| Routes and payloads | [api.md](./api.md) |
| Tables and columns | [data-model.md](./data-model.md) |
