
try {
  $body = @{ licenseKey = 'c2d858f9-01c4-47f9-9380-785fcc0cd072' } | ConvertTo-Json
  $res = Invoke-RestMethod -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/api/verify' -Method POST -Body $body -ContentType 'application/json'

  if ($res.valid -eq $true) {
    Write-Output '[√] License VALID'
    exit 0
  } else {
    Write-Output '[!] License INVALID'
    exit 1
  }
} catch {
  Write-Output '[ERROR] ' + $_.Exception.Message
  exit 1
}
