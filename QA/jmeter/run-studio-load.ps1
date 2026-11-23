param(
  [string]$JMeterPath = "",
  [int]$Users = 50,
  [int]$Ramp = 60,
  [int]$Duration = 600,
  [int]$MaxResponseMs = 5000,
  [string]$OutputDirectory = ""
)

$ErrorActionPreference = "Stop"
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
if (-not (Test-Path -LiteralPath $jmeterPlan -PathType Leaf)) {
  throw "JMeter test plan not found: $jmeterPlan"
}
if (-not (Test-Path -LiteralPath $csvPath -PathType Leaf)) {
  throw "JMeter users CSV not found: $csvPath"
}
if ($Users -lt 1 -or $Ramp -lt 1 -or $Duration -lt 1 -or $MaxResponseMs -lt 1) {
  throw "Users, Ramp, Duration, and MaxResponseMs must all be positive integers."
}

$scenarioMix = @(
  [PSCustomObject]@{ Name = "visitor"; Weight = 0.70; Order = 0 }
  [PSCustomObject]@{ Name = "client"; Weight = 0.20; Order = 1 }
  [PSCustomObject]@{ Name = "booking"; Weight = 0.08; Order = 2 }
  [PSCustomObject]@{ Name = "admin"; Weight = 0.02; Order = 3 }
)
$scenarioUsers = @{}
$remainders = @()
$unallocatedUsers = $Users
foreach ($scenario in $scenarioMix) {
  $exactUsers = $Users * $scenario.Weight
  $wholeUsers = [int][Math]::Floor($exactUsers)
  $scenarioUsers[$scenario.Name] = $wholeUsers
  $unallocatedUsers -= $wholeUsers
  $remainders += [PSCustomObject]@{
    Name = $scenario.Name
    Fraction = $exactUsers - $wholeUsers
    Order = $scenario.Order
  }
}
$allocationOrder = @(
  $remainders | Sort-Object `
    @{ Expression = { $_.Fraction }; Descending = $true },
    @{ Expression = { $_.Order }; Descending = $false }
)
for ($index = 0; $index -lt $unallocatedUsers; $index++) {
  $scenarioUsers[$allocationOrder[$index].Name]++
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $runName = Get-Date -Format "yyyyMMdd-HHmmss-fff"
  $runDirectory = Join-Path $PSScriptRoot "runs\$runName"
  $suffix = 1
  while (Test-Path -LiteralPath $runDirectory) {
    $runDirectory = Join-Path $PSScriptRoot "runs\$runName-$suffix"
    $suffix++
  }
}
else {
  $runDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
  if (Test-Path -LiteralPath $runDirectory) {
    throw "Output directory already exists; choose a new path: $runDirectory"
  }
}

$reportDirectory = Join-Path $runDirectory "html-report"
$resultsPath = Join-Path $runDirectory "results.jtl"
$logPath = Join-Path $runDirectory "jmeter.log"
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

$jmeterArguments = @(
  "-n",
  "-t", $jmeterPlan,
  "-Jusers=$Users",
  "-Jusers_visitor=$($scenarioUsers['visitor'])",
  "-Jusers_client=$($scenarioUsers['client'])",
  "-Jusers_booking=$($scenarioUsers['booking'])",
  "-Jusers_admin=$($scenarioUsers['admin'])",
  "-Jramp=$Ramp",
  "-Jduration=$Duration",
  "-JcsvPath=$csvPath",
  "-JmaxResponseMs=$MaxResponseMs",
  "-Jjmeter.save.saveservice.output_format=csv",
  "-Jjmeter.save.saveservice.print_field_names=true",
  "-Jjmeter.save.saveservice.assertion_results_failure_message=true",
  "-Jjmeter.save.saveservice.thread_counts=true",
  "-Jjmeter.save.saveservice.connect_time=true",
  "-Jjmeter.save.saveservice.sent_bytes=true",
  "-Jjmeter.save.saveservice.url=true",
  "-Jjmeter.save.saveservice.idle_time=true",
  "-Jjmeter.save.saveservice.timestamp_format=ms",
  "-l", $resultsPath,
  "-j", $logPath,
  "-e",
  "-o", $reportDirectory
)

Write-Host "Starting JMeter load test. Results will be saved to:"
Write-Host $runDirectory
& $JMeterPath @jmeterArguments 2>&1 | ForEach-Object { Write-Host $_ }
$jmeterExitCode = $LASTEXITCODE
if ($jmeterExitCode -ne 0) {
  throw "JMeter failed with exit code $jmeterExitCode. See $logPath"
}

$reportIndex = Join-Path $reportDirectory "index.html"
if (-not (Test-Path -LiteralPath $resultsPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $reportIndex -PathType Leaf)) {
  throw "JMeter exited successfully, but the JTL or HTML report is missing. Check $logPath"
}

Write-Host "JTL results:  $resultsPath"
Write-Host "HTML report:  $reportIndex"
Write-Host "JMeter log:   $logPath"

[PSCustomObject]@{
  Users = $Users
  ScenarioSplit = "$($scenarioUsers['visitor'])/$($scenarioUsers['client'])/$($scenarioUsers['booking'])/$($scenarioUsers['admin'])"
  RunDirectory = $runDirectory
  ResultsPath = $resultsPath
  ReportPath = $reportIndex
  LogPath = $logPath
}
