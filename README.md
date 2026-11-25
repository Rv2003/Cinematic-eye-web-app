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
| `npm run test:e2e` | Run Selenium browser smoke tests (start the dev server first) |

### GitHub Actions CI

The workflow in `.github/workflows/ci.yml` runs on pushes, pull requests, and
manual dispatches. It installs the frontend and Cucumber dependencies, runs
frontend lint and build checks, starts the Vite development server, and runs
the Cucumber browser scenarios in headless Chrome. No backend credentials are
required for these current scenarios. Check the repository's **Actions** tab
for run results.

### Automated test coverage

| Layer | Tests | Scope |
|---|---|---|
| Frontend | Selenium browser smoke tests (`frontend/tests/e2e.test.js`) | Eight checks for the home page/navigation, portfolio and About navigation, login carousel, registration form validation, booking session/OTP validation, and unauthenticated profile redirect. |
| Browser acceptance | Cucumber (`QA/cucumber/features/`) | Homepage portfolio navigation and booking session/required-email validation, driven through Selenium and headless Chrome. |
| API | Postman collection (`QA/postman/Cinematic-Eye-Complete-API.postman_collection.json`) | 51 requests across authentication, public/user routes, bookings, OTP, authorization, and admin workflows; includes success, validation, and access-control cases. |
| Load | JMeter plans in `QA/jmeter/` | API request/load scenarios. `studio-load.jmx` models 50 users split across visitor, client, booking, and admin workloads. |

The frontend suite is a browser-level smoke test, not a backend integration
suite. The backend package currently has no unit-test script; use the Postman
suite for API behavior and JMeter for load testing.

### Selenium browser tests

The frontend E2E tests use Selenium WebDriver, ChromeDriver, and headless Chrome.
Install the frontend dependencies, start the app with `npm run dev`, then in
another terminal run:

Each test launches a fresh Chrome session. The eight checks cover:

- The home page hero and primary navigation.
- Scrolling to the portfolio work section and navigating to About.
- Changing the active login carousel slide.
- Navigating from login to registration and validating required form fields.
- Selecting a booking session and showing the required-email message for OTP.
- Redirecting unauthenticated visitors from the profile page to login.

```bash
cd frontend
npm run test:e2e
```

The `chromedriver` package supplies ChromeDriver; it must be compatible with
your installed Chrome version. Set `CHROMEDRIVER_PATH` to use an existing
matching driver, or update the `chromedriver` dev dependency. The tests default
to `http://localhost:5173`, matching Vite's default URL. To test against a
different running frontend URL, set `BASE_URL` before running the test command.

To watch the tests in a visible Chrome window on Windows PowerShell, set
`$env:HEADLESS = 'false'` before running `npm run test:e2e`. Remove the setting
afterward with `Remove-Item Env:HEADLESS`; tests run headlessly by default.

### Cucumber browser tests

The Cucumber suite lives in `QA/cucumber/` and uses Selenium with headless
Chrome. Start the frontend in one terminal:

```bash
cd frontend
npm run dev
```

In another terminal, install and run the suite from the repository root:

```bash
cd QA/cucumber
npm ci
npm test
```

The tests default to `http://localhost:5173`. Set `BASE_URL` to use a different
frontend URL. Cucumber feature files are in `QA/cucumber/features/`; matching
step definitions are in `QA/cucumber/features/step_definitions/`.

### Postman API tests

The collection is in `QA/postman/`. Start the backend with its development
environment configured, then import
`Cinematic-Eye-Complete-API.postman_collection.json` into Postman and run the
requests in order. Its `baseUrl` collection variable defaults to
`http://localhost:5500`. The collection covers all registered API route/method
combinations, success paths, validation errors, authentication/authorization,
and stateful booking/member/gallery operations. Requests create and store
their test IDs and tokens automatically.

To run it from PowerShell with Newman and write a JUnit XML report:

```powershell
npx newman run ".\QA\postman\Cinematic-Eye-Complete-API.postman_collection.json" --reporters cli,junit --reporter-junit-export ".\QA\postman\api-report.xml"
```

Set collection variables such as `adminToken` in Postman to run the admin
workflow requests. With Newman, pass optional values using
`--env-var "adminToken=..."`. Gallery upload additionally requires `galleryImagePath` and
working Cloudinary credentials. The optional live OTP request requires
`otpEmail` and working email credentials; it sends a real email. A valid Google
ID token is needed to exercise a successful Google sign-in. Requests requiring
these optional values are skipped when the values are empty. Run against a
disposable development/test database, not production. Authentication
registration requires MongoDB transaction support.

The complete suite may create test accounts and records; it cleans up bookings,
members, and uploaded gallery photos when those workflows run. The user-delete
case runs last and is a contract test for the registered delete route.
The JUnit report is overwritten at the specified path on a subsequent run;
choose another filename to keep earlier reports.

### JMeter API load testing

The loopback-only JMeter plan is `QA/jmeter/Cinematic-Eye-API-Load-Test.jmx`.
Install Apache JMeter 5.6+ and Java, start the backend, then run from the
repository root in PowerShell:

```powershell
jmeter -n -t "QA\jmeter\Cinematic-Eye-API-Load-Test.jmx" -Jthreads=1 -Jloops=1 -JrampUp=1 -JtestEmail="test@example.com" -JtestPassword="your-test-password" -JadminToken="your-admin-access-token" -l "QA\jmeter\results.jtl" -e -o "QA\jmeter\html-report"
```

The plan targets only `127.0.0.1:5500`, defaults to one virtual user and one
iteration, and waits 250 ms between requests. Supply a test account to exercise
authenticated routes; `adminToken` enables administrator workflows. For an
existing access token instead of login credentials, pass `-JaccessToken=...`
and `-JuserId=...`. Use a new JTL file and an empty/new HTML report directory
for each run. Avoid putting real credentials in shared files or shell history.

The plan creates and deletes a booking and a temporary team member during each
iteration when those requests succeed. It does not send OTP emails or upload
gallery files; it exercises those routes with validation requests instead.
Start with the defaults and increase concurrency gradually only against your
own local test database.
The JMeter plan includes a **Summary Report** and **View Results Tree** listener
for GUI runs. The response tree is useful for debugging but retains request and
response data in memory; disable it before increasing the load.

To create or refresh only the 50 JMeter client accounts and one admin in the
database configured by `backend/.env.development.local`, run
`node .\scripts\seed-jmeter-users.js` from `backend/`. This does not clear or
modify gallery, team-member, or booking collections.

For the 70/20/8/2 visitor/client/booking/admin workload, use
`QA/jmeter/studio-load.jmx`. It defaults to 50 virtual users, a 60-second
ramp-up, and a 10-minute duration. It asserts JSON-object responses and a
configurable 5-second maximum per request (`-JmaxResponseMs=5000`). Booking
scenarios create and delete their own records; the admin scenario also creates
and deletes a temporary team member. Authenticated scenarios sign out after
each loop, and the admin scenario no longer changes an existing booking. An
interrupted run can leave a record created during its unfinished iteration, so
use a disposable test database. The **View Results Tree** listener is disabled
by default to reduce memory use; enable it only when debugging.

To save a separate, complete set of analysis artifacts for each run, execute
`QA/jmeter/run-studio-load.ps1` from PowerShell in the repository root. Start
the backend against the disposable test database first and confirm it is
available at `http://127.0.0.1:5500`. If JMeter is not on `PATH`, pass the
full path to `jmeter.bat`:

```powershell
& ".\QA\jmeter\run-studio-load.ps1" -JMeterPath "C:\Users\rusir\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"
```

The default test uses 50 virtual users, a 60-second ramp-up, and runs for
10 minutes. Wait for JMeter to finish before opening the report. The plugin
package-scanning deprecation warnings can be ignored; an error or nonzero exit
code indicates a failed run.

The script creates a timestamped folder under `QA/jmeter/runs/` containing
`results.jtl` (raw sample data), `html-report/index.html` (the interactive
JMeter dashboard with response-time, throughput, error, and thread charts),
and `jmeter.log`. The JTL is CSV with headers, assertion failure messages,
timestamps, URLs, response/latency/connect times, bytes, and active-thread
counts for analysis. The JTL and dashboard are created in non-GUI mode; each
run gets a new folder so earlier results are not overwritten. The script
accepts optional `-Users`, `-Ramp`, `-Duration`, and `-MaxResponseMs` values.
Avoid enabling response-body capture for load tests: it can consume substantial
disk/memory and may save sensitive response data.

For a gradual capacity check, run the staged profile from the repository root:

```powershell
& ".\QA\jmeter\run-staged-load.ps1" -JMeterPath "C:\Users\rusir\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"
```

It runs 50, 75, then 100 virtual users, for five minutes per stage, with a
60-second ramp-up and a one-minute cooldown between stages. It attempts all
three stages even if sample requests fail. Each stage has its own JTL, HTML
dashboard, and JMeter log; `summary.csv` in the enclosing timestamped folder
compares sample count, failures, mean/P95/P99/max response times, and throughput.
If any stage fails, the runner still writes the summary and then reports failure.
Use only a disposable test database. During the run, monitor backend CPU/memory
in Windows Task Manager and database load in the database provider's metrics.

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
