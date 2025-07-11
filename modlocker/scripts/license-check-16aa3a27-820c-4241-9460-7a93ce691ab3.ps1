# BeamNG License Verification Script
# Generated for license: 16aa3a27-820c-4241-9460-7a93ce691ab3

try {
    # Disable progress bar for cleaner output
    $ProgressPreference = 'SilentlyContinue'

    # Create request body
    $licenseKey = '16aa3a27-820c-4241-9460-7a93ce691ab3'
    $body = @{
        licenseKey = $licenseKey
    } | ConvertTo-Json -Compress

    # Make verification request
    $uri = 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/api/verify'
    Write-Output "[*] Verifying license with server..."

    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30

    # Check response
    if ($response.valid -eq $true) {
        Write-Output "[√] License VALID - Access granted"
        exit 0
    } else {
        Write-Output "[!] License INVALID - Access denied"
        exit 1
    }
} catch {
    Write-Output "[ERROR] Verification failed: $($_.Exception.Message)"
    Write-Output "[ERROR] Check your internet connection and try again"
    exit 1
}