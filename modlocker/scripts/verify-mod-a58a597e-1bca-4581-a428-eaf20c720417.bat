@echo off
:: BeamNG Mod Verifier & Downloader — Final Version

:: CONFIG — auto-filled by server
set "LICENSE_KEY=a58a597e-1bca-4581-a428-eaf20c720417"
set "MOD_DOWNLOAD=https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/a58a597e-1bca-4581-a428-eaf20c720417"
set "PS_SCRIPT=license-check-a58a597e-1bca-4581-a428-eaf20c720417.ps1"
set "LOGFILE=log.txt"

(
  echo === BeamNG Mod Locker Log ===
  echo Timestamp: %DATE% %TIME%
  echo License Key: a58a597e-1bca-4581-a428-eaf20c720417
  echo PS Script: %PS_SCRIPT%
  echo Mod URL: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/a58a597e-1bca-4581-a428-eaf20c720417
  echo.
  echo [*] Verifying license using %PS_SCRIPT%
) > "%LOGFILE%"

:: --- Run PowerShell license checker
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" >> "%LOGFILE%" 2>&1
set "STATUS=%ERRORLEVEL%"

if "%STATUS%" NEQ "0" (
  echo [!] Invalid license. Locked mod will be used. >> "%LOGFILE%"
  set "MOD_FILE=locked.zip"
) else (
  echo [√] License valid. Unlocked mod will be used. >> "%LOGFILE%"
  set "MOD_FILE=unlocked.zip"
)

:: --- Download mod
echo. >> "%LOGFILE%"
echo [*] Downloading mod from: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/a58a597e-1bca-4581-a428-eaf20c720417 >> "%LOGFILE%"
powershell -NoProfile -Command "try {
  Invoke-WebRequest -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/a58a597e-1bca-4581-a428-eaf20c720417' -OutFile 'active_mod.zip' -UseBasicParsing;
  Write-Output '[√] Download complete';
} catch {
  Write-Output '[ERROR] Download failed: ' + $_.Exception.Message;
}" >> "%LOGFILE%" 2>&1

echo. >> "%LOGFILE%"
echo [*] Finished at %TIME% >> "%LOGFILE%"
echo [*] Press any key to close... >> "%LOGFILE%"

:: Prevent instant close
echo.
echo [*] Press any key to close...
pause >nul
exit /b 0
