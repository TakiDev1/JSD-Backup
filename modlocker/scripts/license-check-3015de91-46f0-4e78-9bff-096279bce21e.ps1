# BeamNG License Verification Script
# Generated for license: 3015de91-46f0-4e78-9bff-096279bce21e

try {
    # Disable progress bar for cleaner output
    $ProgressPreference = 'SilentlyContinue'

    # Create request body
    $licenseKey = '3015de91-46f0-4e78-9bff-096279bce21e'
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