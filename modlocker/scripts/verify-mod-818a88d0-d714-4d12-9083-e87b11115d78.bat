@echo off
setlocal enabledelayedexpansion

:: BeamNG Mod Verifier & Downloader

:: CONFIG — auto-filled by server
set "LICENSE_KEY=818a88d0-d714-4d12-9083-e87b11115d78"
set "MOD_DOWNLOAD=https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/818a88d0-d714-4d12-9083-e87b11115d78"
set "PS_SCRIPT=license-check-818a88d0-d714-4d12-9083-e87b11115d78.ps1"
set "LOGFILE=log.txt"
set "LOCK_FILE=%TEMP%\modlocker.lock"

:: Initialize log file
(
  echo === BeamNG Mod Locker Log ===
  echo Timestamp: %DATE% %TIME%
  echo License Key: 818a88d0-d714-4d12-9083-e87b11115d78
  echo PS Script: %PS_SCRIPT%
  echo Mod URL: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/818a88d0-d714-4d12-9083-e87b11115d78
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
echo [*] Starting download from: https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/818a88d0-d714-4d12-9083-e87b11115d78 >> "%LOGFILE%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "try { $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/mods/download/818a88d0-d714-4d12-9083-e87b11115d78' -OutFile 'active_mod.zip' -UseBasicParsing -TimeoutSec 60; Write-Output '[√] Download completed successfully'; exit 0 } catch { Write-Output ('[ERROR] Download failed: ' + $_.Exception.Message); exit 1 }" >> "%LOGFILE%" 2>&1

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

:: Create hidden file to mark that the download has occurred
echo [*] Creating system lock file... >> "%LOGFILE%"
echo [*] Lock file path: %LOCK_FILE% >> "%LOGFILE%"
echo [*] Lock file path: %LOCK_FILE%

echo Downloaded=818a88d0-d714-4d12-9083-e87b11115d78 > "%LOCK_FILE%"
if exist "%LOCK_FILE%" (
  attrib +h "%LOCK_FILE%" >nul 2>&1
  echo [√] System lock file created successfully at %LOCK_FILE% >> "%LOGFILE%"
  echo [√] System lock file created successfully at %LOCK_FILE%
) else (
  echo [!] Warning: Could not create system lock file at %LOCK_FILE% >> "%LOGFILE%"
  echo [!] Warning: Could not create system lock file at %LOCK_FILE%
)

echo. >> "%LOGFILE%"
echo [*] Process completed at %TIME% >> "%LOGFILE%"
echo [*] Check log.txt for details >> "%LOGFILE%"

echo.
echo [*] Process completed. Check log.txt for details.
echo [*] Press any key to close...
pause >nul
exit /b 0