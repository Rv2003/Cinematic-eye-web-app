# OWASP ZAP Security Scan — Cinematic Eye

This folder adds a **safe, automated baseline security scan** using OWASP ZAP. It complements (does not replace) the manual checklist.

## What it does

- Starts from a running Cinematic Eye web application.
- Crawls pages it can reach.
- Runs passive security checks on observed requests and responses.
- Saves HTML and JSON reports.

The baseline scan is designed for an initial, non-destructive security check. It is **not** a full penetration test and does not prove that the application is secure.

## Requirements

- Docker Desktop running on Windows, or Docker on Linux/macOS.
- Cinematic Eye frontend running and reachable.
- Permission to scan the target. Use a local/test environment and test data.

## 1. Start the application

In a separate terminal, start the frontend using the project's normal command. For a Vite frontend this is commonly:

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Check the URL printed by Vite. This pack defaults to `http://host.docker.internal:5173`. If your app uses another port, pass it to the script.

If the scan needs backend routes, start the backend too and use the frontend as the target first; the browser-facing frontend may call the backend through its configured API URL. For a separate backend scan, run the script again with the backend URL.

## 2. Run the scan on Windows PowerShell

From the **repository root**:

```powershell
.\QA\owasp-zap\owasp-zap\run-zap-baseline.ps1
```

If the frontend uses a different port:

```powershell
.\QA\owasp-zap\owasp-zap\run-zap-baseline.ps1 -TargetUrl "http://host.docker.internal:3000"
```

To scan a backend API separately:

```powershell
.\QA\owasp-zap\owasp-zap\run-zap-baseline.ps1 -TargetUrl "http://host.docker.internal:4000"
```

Change the port to the actual port used by your project. Do not assume these example ports are correct.

## 3. Reports

The script writes these files into `QA/owasp-zap/reports/`:

- `zap-report.html` — human-readable report.
- `zap-report.json` — machine-readable report.

## 4. Run from Ubuntu

From the repository root, start the frontend in one terminal:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

In another terminal, from the repository root, run ZAP in Docker:

```bash
mkdir -p QA/owasp-zap/reports
docker run --rm -t \
  --add-host=host.docker.internal:host-gateway \
  -v "$PWD:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t http://host.docker.internal:5173 \
  -r QA/owasp-zap/reports/zap-report.html \
  -J QA/owasp-zap/reports/zap-report.json
```

This requires Docker to be installed and running. The `--add-host` option makes
the host's Vite server reachable from the ZAP container on native Linux.

Review every alert. Confirm whether it is a real issue, a false positive, or not applicable. Record confirmed defects in your team's issue tracker with sanitised evidence.

## 5. Optional: run the Docker command directly

```powershell
docker run --rm -t `
  -v "${PWD}:/zap/wrk/:rw" `
  ghcr.io/zaproxy/zaproxy:stable `
  zap-baseline.py `
  -t http://host.docker.internal:5173 `
  -r QA/owasp-zap/reports/zap-report.html `
  -J QA/owasp-zap/reports/zap-report.json
```

## 6. GitHub Actions

The current `.github/workflows/ci.yml` runs frontend lint/build checks and
Cucumber tests; it does not run ZAP. Run the baseline scan locally using the
instructions above, or add a dedicated ZAP workflow if you want security scans
on pushes and pull requests.

If your project uses a different start command, port, or requires environment variables, update the workflow. Do not commit real secrets; use GitHub Actions secrets for sensitive configuration.

## Important limitations

- The baseline scan mainly uses spidering and passive rules; it does not perform aggressive active attacks.
- A frontend scan does not automatically test every backend API route.
- Authenticated pages may not be crawled unless authentication is configured.
- A scan finding is not automatically a confirmed vulnerability. Validate it manually.
- Only scan systems you own or have explicit permission to test.
