# BeamNG License Verification Script
# Generated for license: 9d1013d8-6b49-439c-86e7-b348a9bacc87

try {
    # Disable progress bar for cleaner output
    $ProgressPreference = 'SilentlyContinue'

    # Create request body
    $licenseKey = '9d1013d8-6b49-439c-86e7-b348a9bacc87'
    $body = @{
        licenseKey = $licenseKey
    } | ConvertTo-Json -Compress

    # Make verification request
    $uri = 'http://localhost:3000/api/verify'
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