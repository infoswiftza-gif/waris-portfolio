param(
  [string]$Base = "http://localhost:3210"
)

# Round-trips one real image through the whole CMS image path against a running
# production server, proving the five things that actually break in practice:
#
#   1. /api/upload stores it and returns a Cloudinary delivery URL
#   2. that URL is PUBLICLY fetchable (the whole reason for leaving Blob behind)
#   3. it shows up in the media library listing
#   4. the CMS accepts and persists that URL on a real record
#   5. deletion works, and the library is empty again afterwards
#
# Everything it creates is removed before it exits, so it is safe to re-run.

$ErrorActionPreference = "Stop"

$env_lines = Get-Content -LiteralPath ".env.local"
function EnvValue($name) {
  $line = $env_lines | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -split "=", 2)[1].Trim().Trim('"')
}

$email = EnvValue "ADMIN_EMAIL"
$password = EnvValue "ADMIN_PASSWORD"
if (-not $email -or -not $password) { throw "ADMIN_EMAIL / ADMIN_PASSWORD missing from .env.local" }

$cloudName = EnvValue "CLOUDINARY_CLOUD_NAME"
if (-not $cloudName) {
  throw "CLOUDINARY_CLOUD_NAME missing from .env.local - add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET first."
}

# A real 1x1 PNG, sent the same way FileUpload sends it (base64 data URL in a
# `file` form field). Using a genuinely valid image matters: Cloudinary rejects
# corrupt payloads, which would otherwise look like a code bug.
$png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = (Invoke-WebRequest "$Base/api/auth/csrf" -WebSession $session -UseBasicParsing).Content | ConvertFrom-Json
Invoke-WebRequest "$Base/api/auth/callback/credentials" -Method POST -WebSession $session -UseBasicParsing -ContentType "application/x-www-form-urlencoded" -Body @{
  csrfToken   = $csrf.csrfToken
  email       = $email
  password    = $password
  json        = "true"
  callbackUrl = "$Base/admin"
} | Out-Null

$sess = (Invoke-WebRequest "$Base/api/auth/session" -WebSession $session -UseBasicParsing).Content | ConvertFrom-Json
if (-not $sess.user) { throw "Sign-in failed" }
Write-Host "  signed in as $($sess.user.email)  cloud=$cloudName" -ForegroundColor Green

function Api($method, $path, $payload) {
  $params = @{ Uri = "$Base$path"; Method = $method; WebSession = $session; UseBasicParsing = $true }
  if ($null -ne $payload) {
    $params.Body = ($payload | ConvertTo-Json -Depth 8)
    $params.ContentType = "application/json"
  }
  try {
    $r = Invoke-WebRequest @params
    return @{ status = $r.StatusCode; body = ($r.Content | ConvertFrom-Json) }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $raw = ""
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      $raw = $reader.ReadToEnd()
      $reader.Close()
    }
    $parsed = $null
    if ($raw) { try { $parsed = $raw | ConvertFrom-Json } catch {} }
    return @{ status = $code; body = $parsed; raw = $raw }
  }
}

$results = @()
function Check($step, $status, $expect, $pass) {
  $script:results += [pscustomobject]@{ Step = $step; Status = $status; Expect = $expect; Pass = $pass }
}

# --- 1. upload --------------------------------------------------------------
$up = $null
try {
  $r = Invoke-WebRequest "$Base/api/upload" -Method POST -WebSession $session -UseBasicParsing -ContentType "application/x-www-form-urlencoded" -Body @{ file = $png } -TimeoutSec 120
  $up = @{ status = $r.StatusCode; body = ($r.Content | ConvertFrom-Json) }
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $raw = ""
  $stream = $_.Exception.Response.GetResponseStream()
  if ($stream) { $rd = New-Object System.IO.StreamReader($stream); $raw = $rd.ReadToEnd(); $rd.Close() }
  $up = @{ status = $code; body = $null; raw = $raw }
}

$url = $up.body.url
Check "upload image" "$($up.status)" "200" ($up.status -eq 200)
if ($up.status -ne 200) {
  Write-Host "  upload failed: $($up.raw)" -ForegroundColor Red
  $results | Format-Table -AutoSize | Out-String | Write-Host
  exit 1
}
Write-Host "  uploaded -> $url"

Check "url is Cloudinary delivery" $(if ($url -match "^https://res\.cloudinary\.com/$([regex]::Escape($cloudName))/") { "yes" } else { "no" }) "res.cloudinary.com/$cloudName" ($url -match "^https://res\.cloudinary\.com/$([regex]::Escape($cloudName))/")

# --- 2. publicly fetchable (no auth, no token) ------------------------------
$publicStatus = 0
$contentType = ""
$bytes = 0
try {
  $img = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 60
  $publicStatus = $img.StatusCode
  $contentType = $img.Headers["Content-Type"]
  $bytes = $img.RawContentLength
} catch {
  $publicStatus = $_.Exception.Response.StatusCode.value__
}
Check "publicly fetchable (anonymous)" $publicStatus "200" ($publicStatus -eq 200)
Write-Host "  anonymous fetch -> $publicStatus  type=$contentType  bytes=$bytes"

# --- 3. appears in the media library ---------------------------------------
$list = Api GET "/api/admin/media" $null
$asset = @($list.body.data | Where-Object { $_.url -eq $url })
Check "listed in media library" "found=$($asset.Count)" "found=1" ($asset.Count -eq 1)
if ($asset.Count -eq 1) {
  Write-Host "  library entry -> $($asset[0].pathname)  $($asset[0].size)B  ext=$($asset[0].contentType)"
}

# --- 4. CMS persists the URL on a real record ------------------------------
$post = Api POST "/api/blog" @{
  title      = "Media probe $stamp"
  excerpt    = "created by the image round-trip probe"
  content    = "This body exists to prove the cover image URL is stored and returned."
  coverImage = $url
  tags       = @("probe", "media")
  published  = $false
}
$postId = if ($post.body.data) { $post.body.data._id } else { $null }
$storedUrl = if ($post.body.data) { $post.body.data.coverImage } else { "" }
Check "create record with coverImage" "$($post.status)" "201" ($post.status -eq 201)
Check "coverImage round-trips" $(if ($storedUrl -eq $url) { "same" } else { "different" }) "same url" ($storedUrl -eq $url)

$readBack = Api GET "/api/blog/$postId" $null
Check "coverImage persists on re-read" $(if ($readBack.body.data.coverImage -eq $url) { "same" } else { "different" }) "same url" ($readBack.body.data.coverImage -eq $url)

# --- 5. delete everything, then confirm the library is clean ---------------
$delRecord = Api DELETE "/api/blog/$postId" $null
Check "delete probe record" "$($delRecord.status)" "200" ($delRecord.status -eq 200)

$delImage = Api DELETE "/api/admin/media?url=$([uri]::EscapeDataString($url))" $null
Check "delete image" "$($delImage.status)" "200" ($delImage.status -eq 200)

$list2 = Api GET "/api/admin/media" $null
$stillThere = @($list2.body.data | Where-Object { $_.url -eq $url })
Check "image gone from library" "remaining=$($stillThere.Count)" "remaining=0" ($stillThere.Count -eq 0)

# The asset is destroyed server-side immediately, but the delivery CDN can keep
# serving the cached copy for a while even after `invalidate`. So this polls for
# up to ~90s instead of asserting on the very first response, and reports how
# long the cache actually took to drop.
$goneStatus = 0
$goneAfter = 0
for ($wait = 0; $wait -le 90; $wait += 15) {
  try { $goneStatus = (Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 30).StatusCode } catch { $goneStatus = $_.Exception.Response.StatusCode.value__ }
  if ($goneStatus -ne 200) { $goneAfter = $wait; break }
  if ($wait -lt 90) { Start-Sleep -Seconds 15 }
}
Check "deleted url stops serving (CDN)" "$goneStatus after ~${goneAfter}s" "non-200" ($goneStatus -ne 200)

Write-Host ""
$results | Format-Table -AutoSize | Out-String | Write-Host
$failed = @($results | Where-Object { -not $_.Pass })
Write-Host "  $($results.Count - $failed.Count)/$($results.Count) passed"
if ($failed.Count) { exit 1 }
