# Scratch script: start the Express server in the background (from backend/),
# hit /health, POST /api/analyze with the generated real PDF (scripts/test-resume.pdf)
# via curl.exe, check /api/history, then stop the server and print its log.
# Safe to delete.

$backend = Join-Path $PWD 'backend'
$log = Join-Path $backend 'dev.log'
if (Test-Path $log) { Remove-Item $log -ErrorAction SilentlyContinue }

# Kill anything already on port 5000 from an earlier run
foreach ($line in (netstat -ano | Select-String ':5000 .*LISTENING')) {
  $pid5 = ($line -split '\s+')[-1]
  "Pre-existing listener on :5000, killing PID $pid5"
  Stop-Process -Id $pid5 -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

$p = Start-Process cmd -ArgumentList '/c npm start > dev.log 2>&1' -PassThru -WindowStyle Hidden -WorkingDirectory $backend
Start-Sleep -Seconds 8

# /health check
try {
  $health = Invoke-RestMethod -Uri http://localhost:5000/health -TimeoutSec 10
  "/health: $($health | ConvertTo-Json -Compress)"
} catch {
  "/health FAILED: $($_.Exception.Message)"
}

# /api/analyze round trip with the real generated PDF (curl builds proper multipart)
$pdf = Join-Path $backend 'scripts\test-resume.pdf'
$jdFile = Join-Path $env:TEMP 'jd.txt'
[IO.File]::WriteAllText($jdFile, 'We are looking for a full-stack developer with strong JavaScript, React, Node.js and Docker experience. Familiarity with SQL is a plus.')

$res = & curl.exe -s -w "`n%{http_code}" `
  -F "resume=@$pdf;type=application/pdf" `
  -F "jobDescription=<$jdFile" `
  http://localhost:5000/api/analyze
$lines = $res -split "`n"
$code = $lines[-1]
$body = $lines[0..($lines.Length - 2)] -join "`n"
"/api/analyze (HTTP $code):"
$body

# /api/history
try {
  $hist = Invoke-RestMethod -Uri http://localhost:5000/api/history -TimeoutSec 10
  "/api/history: count=$($hist.count)"
} catch {
  "/api/history FAILED: $($_.Exception.Message)"
}

Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "ParentProcessId=$($p.Id)" |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
# Also stop the node child two levels down (cmd -> npm -> node)
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like '*src/server.js*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

if (Test-Path $log) { "--- backend dev.log ---"; Get-Content $log }
