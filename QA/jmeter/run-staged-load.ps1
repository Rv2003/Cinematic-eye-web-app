param(
  [string]$JMeterPath = "",
  [int]$Ramp = 60,
  [int]$Duration = 300,
  [int]$CooldownSeconds = 60,
  [int]$MaxResponseMs = 5000
)

$ErrorActionPreference = "Stop"
$singleRunScript = Join-Path $PSScriptRoot "run-studio-load.ps1"
$jmeterPlan = Join-Path $PSScriptRoot "studio-load.jmx"
$csvPath = Join-Path $PSScriptRoot "users.csv"

if ([string]::IsNullOrWhiteSpace($JMeterPath)) {
  $jmeterCommand = Get-Command "jmeter.bat" -ErrorAction SilentlyContinue
  if ($null -eq $jmeterCommand) {
    throw "JMeter was not found on PATH. Pass its full path with -JMeterPath."
  }
  $JMeterPath = $jmeterCommand.Source
}

if (-not (Test-Path -LiteralPath $JMeterPath -PathType Leaf)) {
  throw "JMeter executable not found: $JMeterPath"
}
if (-not (Test-Path -LiteralPath $singleRunScript -PathType Leaf) -or
    -not (Test-Path -LiteralPath $jmeterPlan -PathType Leaf) -or
    -not (Test-Path -LiteralPath $csvPath -PathType Leaf)) {
  throw "The staged runner, studio-load.jmx, and users.csv must all exist under $PSScriptRoot."
}
if ($Ramp -lt 1 -or $Duration -lt 1 -or $CooldownSeconds -lt 0 -or $MaxResponseMs -lt 1) {
  throw "Ramp, Duration, and MaxResponseMs must be positive; CooldownSeconds cannot be negative."
}

$batchName = "staged-{0}" -f (Get-Date -Format "yyyyMMdd-HHmmss-fff")
$batchDirectory = Join-Path $PSScriptRoot "runs\$batchName"
New-Item -ItemType Directory -Path $batchDirectory -Force | Out-Null

$userStages = @(50, 75, 100)
$summaryRows = @()
for ($stageIndex = 0; $stageIndex -lt $userStages.Count; $stageIndex++) {
  $users = $userStages[$stageIndex]
  $stageName = "stage-{0:D2}-{1}-users" -f ($stageIndex + 1), $users
  $stageDirectory = Join-Path $batchDirectory $stageName
  Write-Host ""
  Write-Host "Starting stage $($stageIndex + 1)/$($userStages.Count): $users users for $Duration seconds."

  try {
    $run = & $singleRunScript `
      -JMeterPath $JMeterPath `
      -Users $users `
      -Ramp $Ramp `
      -Duration $Duration `
      -MaxResponseMs $MaxResponseMs `
      -OutputDirectory $stageDirectory

    $samples = @(Import-Csv -LiteralPath $run.ResultsPath)
    $failedSamples = @($samples | Where-Object { $_.success -ne "true" })
    $elapsedTimes = @($samples | ForEach-Object { [double]$_.elapsed } | Sort-Object)
    $sampleCount = $samples.Count
    $meanMs = 0
    $p95Ms = 0
    $p99Ms = 0
    $maxMs = 0
    $throughput = 0

    if ($sampleCount -gt 0) {
      $meanMs = [Math]::Round(($elapsedTimes | Measure-Object -Average).Average, 2)
      $p95Ms = $elapsedTimes[[int][Math]::Max(0, [Math]::Ceiling($sampleCount * 0.95) - 1)]
      $p99Ms = $elapsedTimes[[int][Math]::Max(0, [Math]::Ceiling($sampleCount * 0.99) - 1)]
      $maxMs = $elapsedTimes[-1]
      $timestamps = @($samples | ForEach-Object { [long]$_.timeStamp })
      $timeSpanMs = ($timestamps | Measure-Object -Maximum).Maximum -
        ($timestamps | Measure-Object -Minimum).Minimum
      if ($timeSpanMs -gt 0) {
        $throughput = [Math]::Round($sampleCount / ($timeSpanMs / 1000), 3)
      }
    }

    $errorPercent = 0
    if ($sampleCount -gt 0) {
      $errorPercent = [Math]::Round($failedSamples.Count * 100 / $sampleCount, 2)
    }
    if ($sampleCount -eq 0) {
      $status = "NO SAMPLES"
    }
    elseif ($failedSamples.Count -gt 0) {
      $status = "SAMPLE FAILURES"
    }
    else {
      $status = "PASS"
    }
    $scenarioSplit = $run.ScenarioSplit
    $reportPath = $run.ReportPath
    $logPath = $run.LogPath
    $errorMessage = ""
  }
  catch {
    Write-Warning "Stage $users could not complete: $($_.Exception.Message)"
    $sampleCount = 0
    $failedSamples = @()
    $errorPercent = 0
    $meanMs = 0
    $p95Ms = 0
    $p99Ms = 0
    $maxMs = 0
    $throughput = 0
    $scenarioSplit = ""
    $reportPath = ""
    $logPath = ""
    $status = "RUNNER FAILED"
    $errorMessage = $_.Exception.Message
  }

  $summaryRows += [PSCustomObject]@{
    Stage = $stageIndex + 1
    Users = $users
    ScenarioSplit = $scenarioSplit
    Samples = $sampleCount
    Failures = $failedSamples.Count
    ErrorPercent = $errorPercent
    MeanMs = $meanMs
    P95Ms = $p95Ms
    P99Ms = $p99Ms
    MaxMs = $maxMs
    ThroughputPerSecond = $throughput
    Status = $status
    ReportPath = $reportPath
    LogPath = $logPath
    Error = $errorMessage
  }

  if ($stageIndex -lt ($userStages.Count - 1) -and $CooldownSeconds -gt 0) {
    Write-Host "Cooling down for $CooldownSeconds seconds before the next stage."
    Start-Sleep -Seconds $CooldownSeconds
  }
}

$summaryPath = Join-Path $batchDirectory "summary.csv"
$summaryRows | Export-Csv -LiteralPath $summaryPath -NoTypeInformation -Encoding UTF8
$summaryRows |
  Select-Object Stage, Users, ScenarioSplit, Samples, Failures, ErrorPercent, MeanMs, P95Ms, P99Ms, MaxMs, ThroughputPerSecond, Status |
  Format-Table -AutoSize |
  Out-Host
Write-Host "Combined summary: $summaryPath"

if (@($summaryRows | Where-Object { $_.Status -ne "PASS" }).Count -gt 0) {
  throw "All stages were attempted. At least one stage reported errors; review $summaryPath and its reports."
}
