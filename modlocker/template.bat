@echo off
setlocal enabledelayedexpansion

:: BeamNG Mod Verifier & Downloader for %MOD_NAME%

:: CONFIG — auto-filled by server
set "LICENSE_KEY=%LICENSE_KEY%"
set "MOD_DOWNLOAD=%MOD_DOWNLOAD%"
set "PS_SCRIPT=%PS_FILE%"
set "MOD_NAME=%MOD_NAME%"
set "LOGFILE=log.txt"
set "LOCK_FILE=%LOCALAPPDATA%\BeamNG.drive\0.36\settings\editor\%LICENSE_KEY%.json"

:: Initialize log file
(
  echo === BeamNG Mod Locker Log for %MOD_NAME% ===
  echo Timestamp: %DATE% %TIME%
  echo Mod Name: %MOD_NAME%
  echo License Key: %LICENSE_KEY%
  echo PS Script: %PS_SCRIPT%
  echo Mod URL: %MOD_DOWNLOAD%
  echo Lock File: %LOCK_FILE%
  echo.
) > "%LOGFILE%"

:: Get full path to PowerShell script
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
echo [*] Starting download from: %MOD_DOWNLOAD% >> "%LOGFILE%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "try { $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%MOD_DOWNLOAD%' -OutFile '%MOD_NAME%_mod.zip' -UseBasicParsing -TimeoutSec 60; Write-Output '[√] Download completed successfully'; exit 0 } catch { Write-Output ('[ERROR] Download failed: ' + $_.Exception.Message); exit 1 }" >> "%LOGFILE%" 2>&1

set "DOWNLOAD_STATUS=%ERRORLEVEL%"

if "%DOWNLOAD_STATUS%" EQU "0" (
  echo [√] Download completed successfully >> "%LOGFILE%"
  echo [√] Download completed successfully
  if exist "%MOD_NAME%_mod.zip" (
    echo [√] File '%MOD_NAME%_mod.zip' is ready >> "%LOGFILE%"
    echo [√] File '%MOD_NAME%_mod.zip' is ready
  ) else (
    echo [!] Warning: Downloaded file not found >> "%LOGFILE%"
    echo [!] Warning: Downloaded file not found
  )
) else (
  echo [ERROR] Download failed with status: %DOWNLOAD_STATUS% >> "%LOGFILE%"
  echo [ERROR] Download failed with status: %DOWNLOAD_STATUS%
)

:: Create visible lock file in AppData
echo [*] Creating lock file at %LOCK_FILE% >> "%LOGFILE%"
echo Downloaded=%LICENSE_KEY% > "%LOCK_FILE%"
if exist "%LOCK_FILE%" (
  echo [√] Lock file created: %LOCK_FILE% >> "%LOGFILE%"
  echo [√] Lock file created
) else (
  echo [!] Warning: Failed to create lock file >> "%LOGFILE%"
  echo [!] Warning: Failed to create lock file
)

echo. >> "%LOGFILE%"
echo [*] Process completed at %TIME% >> "%LOGFILE%"
echo [*] Check log.txt for details >> "%LOGFILE%"

echo.
echo [*] Process completed. Check log.txt for details.
echo [*] Press any key to close...
pause >nul
exit /b 0
