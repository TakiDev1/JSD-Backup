@echo off
set "LICENSE_KEY=60156cd5-2385-421f-9761-4ab65464025e"
set "PS_SCRIPT=license-check-60156cd5-2385-421f-9761-4ab65464025e.ps1"
set "MOD_DOWNLOAD=https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/60156cd5-2385-421f-9761-4ab65464025e"
set "LOGFILE=log.txt"

(
  echo === BeamNG Mod Locker Log ===
  echo Timestamp: %DATE% %TIME%
  echo License Key: 60156cd5-2385-421f-9761-4ab65464025e
  echo Mod Download URL: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/60156cd5-2385-421f-9761-4ab65464025e
) > "%LOGFILE%"

echo [*] Verifying license using %PS_SCRIPT% >> "%LOGFILE%"
powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%" >> "%LOGFILE%" 2>&1
set "STATUS=%ERRORLEVEL%"

if "%STATUS%" NEQ "0" (
  echo [!] Invalid license. Locked mod will be used. >> "%LOGFILE%"
) else (
  echo [√] License valid. Unlocked mod will be used. >> "%LOGFILE%"
)

echo [*] Downloading mod from: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/60156cd5-2385-421f-9761-4ab65464025e >> "%LOGFILE%"
powershell -NoProfile -Command ^
  "try {
    Invoke-WebRequest -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/60156cd5-2385-421f-9761-4ab65464025e' -OutFile 'active_mod.zip' -UseBasicParsing;
    Write-Output '[√] Download complete';
  } catch {
    Write-Output '[ERROR] Download failed: ' + $_.Exception.Message
  }" >> "%LOGFILE%" 2>&1

echo. >> "%LOGFILE%"
echo [*] Done! >> "%LOGFILE%"
pause >nul
