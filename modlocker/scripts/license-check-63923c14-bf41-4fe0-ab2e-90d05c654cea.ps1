
try {
  $body = @{ licenseKey = '63923c14-bf41-4fe0-ab2e-90d05c654cea' } | ConvertTo-Json
  $res = Invoke-RestMethod -Uri 'https://72e77026-aba8-4368-a676-eed33ebfb436-00-2eg0np7toc252.picard.replit.dev/api/verify' -Method POST -Body $body -ContentType 'application/json'

  if ($res.valid -eq $true) {
    Write-Host '[√] License VALID'
    exit 0
  } else {
    Write-Host '[!] License INVALID'
    exit 1
  }
}
catch {
  Write-Host ('[ERROR] ' + $_.Exception.Message)
  exit 1
}
