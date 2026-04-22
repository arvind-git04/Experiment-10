# 🎥 CineBook — Movie Ticket Booking Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application to manage movie listings, show schedules, seat bookings, and cancellations. Built as a modern replacement for the original C++ Library Management System.

---

## 🗂️ Project Structure

```
movie-ticket-booking/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── User.js           # User schema (admin / user roles)
│   │   ├── Movie.js          # Movie details
│   │   ├── Show.js           # Show schedule + auto seat generation
│   │   └── Booking.js        # Booking with atomic transactions
│   ├── routes/
│   │   ├── auth.js           # Register, Login, /me
│   │   ├── movies.js         # CRUD for movies
│   │   ├── shows.js          # CRUD for shows
│   │   ├── bookings.js       # Book / cancel tickets
│   │   └── dashboard.js      # Admin stats
│   ├── middleware/
│   │   └── auth.js           # JWT protect + adminOnly guards
│   ├── server.js             # Entry point
│   ├── seed.js               # Database seeder
│   └── .env                  # Environment variables
│
└── frontend/                 # React 18 SPA
    └── src/
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── components/
        │   └── Layout.js      # Sidebar + route shell
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js   # Admin stats overview
        │   ├── Movies.js      # Browse movies (user)
        │   ├── Shows.js       # Browse shows by movie
        │   ├── SeatBooking.js # Interactive seat map + checkout
        │   ├── Bookings.js    # View / cancel bookings
        │   ├── ManageMovies.js # Admin CRUD movies
        │   └── ManageShows.js  # Admin CRUD shows
        ├── App.js             # Routes + role guards
        └── index.css          # Dark-mode design system
```

---

## ✨ Features

### 👤 User
- Register / Login with JWT authentication
- Browse currently showing movies (search + genre filter)
- View show timings grouped by movie
- **Interactive seat map** — Standard / Premium / VIP tiers with live availability
- Confirm booking with payment mode selection
- View and cancel own bookings
- Auto-generated unique booking reference (e.g. `BK1K9XJABC`)

### 🔑 Admin
- Dashboard with live stats: movies, shows, bookings, users, revenue
- Full CRUD for Movies (title, genre, cast, poster, rating, etc.)
- Full CRUD for Shows (screen, datetime, seat count, tiered pricing)
- View and cancel any customer booking
- Seats auto-generated on show creation (row A–H, categories by row)

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local `mongod` or Atlas)

---

### 1 — Backend Setup

```bash
cd backend
npm install
```

Edit **`.env`** if needed:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/movieticketdb
JWT_SECRET=change_this_secret
```

Seed demo data:
```bash
node seed.js
```

Start the server:
```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

API runs on **http://localhost:5000**

---

### 2 — Frontend Setup

```bash
cd frontend
npm install
npm start
```

React app runs on **http://localhost:3000**  
Requests to `/api/*` are proxied to the backend via `"proxy"` in `package.json`.

---

### 3 — Demo Accounts

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@cinebook.com     | admin123  |
| User  | user@cinebook.com      | user123   |

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Database  | MongoDB + Mongoose ODM                  |
| Backend   | Node.js, Express.js                     |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| Frontend  | React 18, React Router v6               |
| HTTP      | Axios                                   |
| Toasts    | react-hot-toast                         |
| Styling   | Custom CSS Design System (dark theme)   |

---

## 🔌 API Reference

### Auth
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| POST   | /api/auth/register   | Register user     |
| POST   | /api/auth/login      | Login             |
| GET    | /api/auth/me         | Current user      |

### Movies
| Method | Endpoint             | Auth     |
|--------|----------------------|----------|
| GET    | /api/movies          | Public   |
| GET    | /api/movies/:id      | Public   |
| POST   | /api/movies          | Admin    |
| PUT    | /api/movies/:id      | Admin    |
| DELETE | /api/movies/:id      | Admin    |

### Shows
| Method | Endpoint             | Auth     |
|--------|----------------------|----------|
| GET    | /api/shows           | Public   |
| GET    | /api/shows/:id       | Public   |
| POST   | /api/shows           | Admin    |
| PUT    | /api/shows/:id       | Admin    |
| DELETE | /api/shows/:id       | Admin    |

### Bookings
| Method | Endpoint                    | Auth     |
|--------|-----------------------------|----------|
| GET    | /api/bookings               | User/Admin |
| GET    | /api/bookings/:id           | User/Admin |
| POST   | /api/bookings               | User     |
| PUT    | /api/bookings/:id/cancel    | User/Admin |

### Dashboard
| Method | Endpoint               | Auth  |
|--------|------------------------|-------|
| GET    | /api/dashboard/stats   | Admin |

---

## 📐 Comparison with Original C++ LMS

| Feature            | Original (C++ / Crow)    | New (MERN)                     |
|--------------------|--------------------------|--------------------------------|
| Language           | C++ with Crow framework  | JavaScript (Node + React)      |
| Database           | MySQL                    | MongoDB                        |
| Auth               | None                     | JWT + bcrypt                   |
| Frontend           | Plain HTML/JS/CSS        | React 18 SPA                   |
| Role management    | ❌                        | ✅ Admin / User roles           |
| Seat map           | ❌                        | ✅ Interactive, tiered pricing  |
| Atomic bookings    | ❌                        | ✅ MongoDB transactions         |
| Deployment ready   | ❌                        | ✅ env-based config             |
