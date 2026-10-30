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

Create a `.env` file in `backend/` (see `.env.example` if included):

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
```

Start the server:

```bash
npm start
```

The API runs at `http://localhost:5000`.

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


## Author

**Rusiru Vinvidu**
GitHub: [@Rv2003](https://github.com/Rv2003)

## License

[Add a license, e.g. MIT, or state that this project is for academic submission.]
