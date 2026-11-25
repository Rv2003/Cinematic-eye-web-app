param(
    [string]$TargetUrl = "http://host.docker.internal:5173"
)

$ErrorActionPreference = "Stop"

# Run this script from the repository root.
$repoRoot = (Get-Location).Path
$reportDir = Join-Path $repoRoot "QA/owasp-zap/reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

Write-Host "Target: $TargetUrl"
Write-Host "Reports: $reportDir"

# Confirm Docker is available and the daemon is running.
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker is unavailable. Start Docker Desktop and try again."
}

# ZAP runs inside Docker. host.docker.internal lets the container reach
# a service running on the Windows host.
$containerTarget = $TargetUrl
if ($TargetUrl -match "^http://(localhost|127\.0\.0\.1)(:\d+)?") {
    $containerTarget = $TargetUrl -replace "^http://localhost", "http://host.docker.internal"
    $containerTarget = $containerTarget -replace "^http://127\.0\.0\.1", "http://host.docker.internal"
}

docker run --rm -t `
    -v "${repoRoot}:/zap/wrk/:rw" `
    ghcr.io/zaproxy/zaproxy:stable `
    zap-baseline.py `
    -t $containerTarget `
    -r QA/owasp-zap/reports/zap-report.html `
    -J QA/owasp-zap/reports/zap-report.json

$zapExitCode = $LASTEXITCODE
Write-Host ""
Write-Host "ZAP finished with exit code: $zapExitCode"
Write-Host "Check QA/owasp-zap/reports/zap-report.html and zap-report.json"

# ZAP may return a non-zero code when it reports alerts. Preserve that
# status so it can be used in CI, while still explaining where the report is.
exit $zapExitCode
