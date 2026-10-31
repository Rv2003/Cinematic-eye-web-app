# Cinematic Eye

Cinematic Eye is a film and photography studio website where clients can explore the studio's work, meet the team, and request a booking. Administrators use a protected dashboard to review bookings and manage gallery photos and team-member profiles.

## Features

| Area | Create | Read | Update | Delete |
|---|---|---|---|---|
| Bookings | Authenticated clients submit a booking request. | Clients see their own bookings; the admin dashboard displays booking records. | Booking status can be changed to `pending`, `confirmed`, `completed`, or `cancelled`. | Booking records can be removed from the admin bookings screen. |
| Gallery | Administrators upload up to 20 photos at once; images are stored with Cloudinary. | Gallery photos are available publicly and appear in the client-facing gallery. | Administrators can edit photo details, including category, title, featured state, and order. | Administrators can delete photos. |
| Team members | Administrators add a member with a photo and profile details. | Team profiles are displayed publicly. | Administrators can edit a member's name, role, photo, and Instagram link. | Administrators can remove a member. |
| Administration | Administrators sign in through the regular account flow; accounts with the `admin` role can access the dashboard. | The dashboard summarizes bookings and provides booking, gallery, team, and settings views. | Administrators manage booking status, gallery entries, and team profiles. | Administrators delete bookings, gallery photos, and team profiles. |

Clients can register with email and password or Google sign-in, browse the portfolio and team, and submit booking requests. Authentication uses access tokens and an HTTP-only refresh-token cookie. Email OTP verification is also available in the booking flow.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, CSS |
| Backend | Node.js, Express |
| Data | MongoDB Atlas, Mongoose |
| Media | Cloudinary |
| Authentication and email | JSON Web Tokens, Google OAuth, Nodemailer |

## Repository structure

```text
cinematic-eye/
├── backend/
│   ├── config/          # Environment and Cloudinary configuration
│   ├── controller/      # Request handlers
│   ├── database/        # MongoDB connection
│   ├── middleware/     # Authentication, upload, validation, and error handling
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routers
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── public/          # Public static assets
│   ├── src/
│   │   ├── admin/       # Admin layout, route guard, and dashboard pages
│   │   ├── assets/      # Photography and other imported assets
│   │   ├── components/  # Shared navigation, hero, gallery, and team components
│   │   ├── utils/       # Route guards and utilities
│   │   └── webpages/    # Home, about, login, register, booking, and profile pages
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── images/          # README screenshots and diagrams
└── README.md
```

## Setup

### Prerequisites

- Node.js 20.19+ (or a compatible newer LTS release) and npm
- A MongoDB Atlas database and connection string
- A Cloudinary account for gallery and team-photo uploads
- Gmail credentials (or an app password) for OTP email

### 1. Install dependencies

From the repository root, install each package separately:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure the backend

The backend loads `.env.development.local` by default (or `.env.production.local` when `NODE_ENV=production`). Create `backend/.env.development.local`:

```env
PORT=5500
NODE_ENV=development
DB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-access-token-secret>
JWT_REF_SECRET=<different-long-random-refresh-token-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
```

Keep the environment file private; do not commit real credentials. `CLIENT_ID` and `META_TOKEN` are read by the backend environment module but are not currently required by the routes described here.

Start the API from the `backend/` directory:

```bash
npm start
```

The server listens on `http://localhost:5500` when `PORT=5500`.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The app runs at `http://localhost:5173`.

> The frontend must point to the backend URL. If the API address is set in a
> config or `.env` file in `frontend/`, make sure it matches the port above.

## Available Scripts

**Frontend** (`frontend/`)

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start the development server   |
| `npm run build`   | Build for production           |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

**Backend** (`backend/`)

| Command         | Description         |
|-----------------|---------------------|
| `npm start`     | Start the server    |

## Original Repositories

This project was originally developed in two separate repositories, which were merged into this one for submission with their full commit history preserved:

| Part     | Original repository |
|----------|---------------------|
| Backend  | [cinematic-eye-backend](https://github.com/Rv2003/cinematic-eye-backend) |
| Frontend | [cinematic-eye-webpage](https://github.com/Rv2003/cinematic-eye-webpage) |
## Author

**Rusiru Vinvidu**  
GitHub: [@Rv2003](https://github.com/Rv2003)
