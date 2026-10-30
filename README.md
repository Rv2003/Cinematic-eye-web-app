# Cinematic Eye

[One or two sentences describing what the app does and who it is for.]

**Live demo:** [add link if deployed]
**Repositories merged from:** [cinematic-eye-backend](https://github.com/Rv2003/cinematic-eye-backend) and [cinematic-eye-webpage](https://github.com/Rv2003/cinematic-eye-webpage)

---

## Features

- [Gallery to browse photos/videos]
- [Feature 2]
- [Feature 3]
- [Responsive design for mobile and desktop]

## Tech Stack

| Part     | Technologies                                   |
|----------|------------------------------------------------|
| Frontend | React, Vite, ESLint, [CSS framework if any]    |
| Backend  | [Node.js, Express, etc.]                       |
| Database | [MongoDB / MySQL / etc.]                       |

## Project Structure

```
cinematic-eye/
├── backend/     # Server and API
├── frontend/    # React + Vite web app
├── .gitignore
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)
- [Database, e.g. MongoDB] installed locally or a cloud connection string

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rv2003/Cinematic-eye-web-app.git
cd Cinematic-eye-web-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

The backend loads an environment file named `.env.<NODE_ENV>.local` from
`backend/`. For local development, create `backend/.env.development.local`:

```env
PORT=5500
NODE_ENV=development
DB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_REF_SECRET=replace_with_a_different_long_random_secret
JWT_EXPIRES_IN=1000s
JWT_REFRESH_EXPIRES_IN=1000s
CLIENT_ID=your_google_oauth_client_id
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
META_TOKEN=your_meta_access_token
META_GRAPH_API_VERSION=v26.0
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_page_access_token
```

Keep real credentials in this local file or a secrets manager; never commit them
or paste them into documentation. The development environment file is ignored by
Git. If credentials have been exposed, revoke or rotate them before using them
again.

Start the development server:

```bash
npm run dev
```

The API runs at `http://localhost:5500` with the configuration above.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
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
| `npm run dev`   | Start with nodemon  |

## Original Repositories

This project was originally developed in two separate repositories, which were merged into this one for submission with their full commit history preserved:

| Part     | Original repository |
|----------|---------------------|
| Backend  | [cinematic-eye-backend](https://github.com/Rv2003/cinematic-eye-backend) |
| Frontend | [cinematic-eye-webpage](https://github.com/Rv2003/cinematic-eye-webpage) |
## Author

**Rusiru Vinvidu**
GitHub: [@Rv2003](https://github.com/Rv2003)
