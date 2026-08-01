<div align="center">

# Gate — Event Registration System

A full-stack event registration platform. Organizers list events, attendees claim seats, admins run the show.

**Backend:** Express.js · MongoDB (Mongoose) · JWT auth
**Frontend:** React · Vite · React Router

</div>

---

## Overview

Gate is a MERN-style application split into two independent projects in this monorepo:

```
event-registration/
├── backend/     Express REST API + MongoDB models, auth, and admin logic
└── frontend/    React + Vite client that consumes the API
```

Three roles drive the permission model:

| Role | Can do |
|---|---|
| `user` | Browse events, register for events, view/cancel their own registrations |
| `organizer` | Everything a `user` can, plus create/edit/delete their own events and view attendee lists |
| `admin` | Everything an `organizer` can, plus manage every event, view dashboard stats, and promote/demote/delete user accounts |

---

## Features

- JWT-based authentication (register/login), passwords hashed with bcrypt
- Role-based access control enforced on the API, not just the UI
- Event capacity is tracked and enforced — registrations run inside a MongoDB transaction so seats can't be oversold under concurrent requests
- Users can view and cancel their own registrations at any time
- Organizers get a dashboard to create, edit, and delete their events, and see who's registered
- Admins get a panel with platform-wide stats and full user management
- Frontend is built around a distinctive "physical ticket" design system — perforated ticket-stub cards, a boarding-pass hero, and a booth-window login — rather than a generic admin template

---

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose (schemas, transactions)
- JSON Web Tokens for auth (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `cors`, `dotenv`

**Frontend**
- React 18 + Vite
- React Router v6
- Axios for API calls
- Plain CSS with design tokens (no UI framework)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance — local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- npm

### 1. Clone and install

```bash
git clone https://github.com/MohdAdil-02/event-registration.git
cd event-registration
```

Install each project's dependencies separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Each project needs its own `.env` file. **Do not commit these** — see the [Security](#security) note below.

**`backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
JWT_EXPIRES_IN=7d
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the backend

```bash
cd backend
npm run dev
```
Starts on `http://localhost:5000`. You should see `MongoDB connected: ...` and `Server running on port 5000`.

If you're on MongoDB Atlas, make sure your current IP is added under **Network Access** in the Atlas dashboard, or the connection will be refused.

### 4. Create your first admin account

There's no public signup for the `admin` role by design. Bootstrap one with:

```bash
cd backend
node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPass123"
```

That admin can then promote other users to `organizer` or `admin` from the Admin panel in the UI (or via the API directly).

### 5. Run the frontend

```bash
cd frontend
npm run dev
```
Opens on `http://localhost:5173` and talks to the backend at the URL set in `VITE_API_URL`.

---

## API Reference

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create an account (role: `user`) |
| POST | `/login` | Public | Log in, returns a JWT |
| GET | `/me` | Private | Get the logged-in user's profile |

### Events — `/events`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List events (`?search=&category=&status=&page=&limit=`) |
| GET | `/:id` | Public | Get one event's details |
| POST | `/` | organizer, admin | Create an event |
| PUT | `/:id` | Owning organizer, admin | Update an event |
| DELETE | `/:id` | Owning organizer, admin | Delete an event (and its registrations) |
| GET | `/:id/registrations` | Owning organizer, admin | View everyone registered for an event |

### Registrations — `/registrations`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Private | Register the logged-in user for an event |
| GET | `/my` | Private | View the logged-in user's own registrations |
| GET | `/:id` | Owner, event organizer, admin | View a single registration |
| DELETE | `/:id` | Owner, event organizer, admin | Cancel a registration (frees a seat) |

### Admin — `/admin` (all require `admin` role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard summary (users, organizers, events, registrations) |
| GET | `/users` | List all users |
| PUT | `/users/:id/role` | Change a user's role |
| DELETE | `/users/:id` | Delete a user account |

---

## Frontend Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Browse/search events |
| `/events/:id` | Public (registering requires login) | Event details + registration form |
| `/login`, `/register` | Public | Auth |
| `/my-registrations` | Logged in | View/cancel your own tickets |
| `/organizer` | organizer, admin | Create/edit/delete your events |
| `/organizer/events/:id/edit` | organizer (owner), admin | Edit an event |
| `/organizer/events/:id/registrations` | organizer (owner), admin | View attendee list |
| `/admin` | admin | Stats + manage all users' roles |

---

## Data Model

- **User** → has many **Events** (as organizer), has many **Registrations**
- **Event** → belongs to one **User** (organizer), has many **Registrations**
- **Registration** → links one **User** to one **Event**

---

## Security

> **Action needed:** this repository currently has `backend/.env` and `frontend/.env` committed, along with `node_modules/`. If your real MongoDB URI or JWT secret were ever pushed, treat them as compromised:
>
> 1. **Rotate the credentials now** — change your MongoDB Atlas user password (or delete/recreate the DB user) and generate a new `JWT_SECRET`.
> 2. Add a `.gitignore` at the project root:
>    ```
>    node_modules/
>    .env
>    dist/
>    *.log
>    ```
> 3. Stop tracking the files that shouldn't be committed:
>    ```bash
>    git rm -r --cached backend/node_modules frontend/node_modules backend/.env frontend/.env
>    git commit -m "Stop tracking node_modules and .env files"
>    git push
>    ```
> 4. This removes them going forward, but they still exist in your git **history**. Since the repo is public, treat the old secret as burned — rotating it (step 1) matters more than trying to scrub history. If you do want to scrub history too, look into [git filter-repo](https://github.com/newren/git-filter-repo) or the [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/), then force-push.
>
> Going forward, only commit `.env.example` files with placeholder values, never real `.env` files.

---

## License

Add a license of your choice (e.g. MIT) if you intend for others to reuse this code.