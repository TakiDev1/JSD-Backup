@echo off
set "LICENSE_KEY=c2d858f9-01c4-47f9-9380-785fcc0cd072"
set "PS_SCRIPT=license-check-c2d858f9-01c4-47f9-9380-785fcc0cd072.ps1"
set "MOD_DOWNLOAD=https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/c2d858f9-01c4-47f9-9380-785fcc0cd072"
set "LOGFILE=log.txt"

(
  echo === BeamNG Mod Locker Log ===
  echo Timestamp: %DATE% %TIME%
  echo License Key: c2d858f9-01c4-47f9-9380-785fcc0cd072
  echo Mod Download URL: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/c2d858f9-01c4-47f9-9380-785fcc0cd072
) > "%LOGFILE%"

echo [*] Verifying license using %PS_SCRIPT% >> "%LOGFILE%"
powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%" >> "%LOGFILE%" 2>&1
set "STATUS=%ERRORLEVEL%"

if "%STATUS%" NEQ "0" (
  echo [!] Invalid license. Locked mod will be used. >> "%LOGFILE%"
) else (
  echo [√] License valid. Unlocked mod will be used. >> "%LOGFILE%"
)

echo [*] Downloading mod from: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/c2d858f9-01c4-47f9-9380-785fcc0cd072 >> "%LOGFILE%"
powershell -NoProfile -Command "try {
    Invoke-WebRequest -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/c2d858f9-01c4-47f9-9380-785fcc0cd072' -OutFile 'active_mod.zip' -UseBasicParsing;
    Write-Output '[√] Download complete'
} catch {
    Write-Output '[ERROR] Download failed: ' + $_.Exception.Message
}" >> "%LOGFILE%" 2>&1


echo. >> "%LOGFILE%"
echo [*] Done! >> "%LOGFILE%"
pause >nul
