param(
  [string]$Base = "http://localhost:3210"
)

# Signs in through the real NextAuth credentials flow, then exercises the CMS
# API as that admin. Verifies the create path (dead before the rebuild), the
# audit trail, bulk actions and the per-field validation errors.

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

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# --- 1. sign in -------------------------------------------------------------
$csrf = (Invoke-WebRequest "$Base/api/auth/csrf" -WebSession $session -UseBasicParsing).Content | ConvertFrom-Json
$body = @{
  csrfToken = $csrf.csrfToken
  email     = $email
  password  = $password
  json      = "true"
  callbackUrl = "$Base/admin"
}
$signin = Invoke-WebRequest "$Base/api/auth/callback/credentials" -Method POST -Body $body -WebSession $session -UseBasicParsing -ContentType "application/x-www-form-urlencoded"

$sess = (Invoke-WebRequest "$Base/api/auth/session" -WebSession $session -UseBasicParsing).Content | ConvertFrom-Json
if (-not $sess.user) { throw "Sign-in failed: no session returned. HTTP $($signin.StatusCode)" }
Write-Host "  signed in as $($sess.user.email)  isAdmin=$($sess.user.isAdmin)" -ForegroundColor Green

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
    # PowerShell 5.1 leaves ErrorDetails empty for 4xx, so the body has to be
    # read off the response stream - otherwise every failure looks identical.
    $raw = ""
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      $raw = $reader.ReadToEnd()
      $reader.Close()
    }
    $parsed = $null
    if ($raw) { try { $parsed = $raw | ConvertFrom-Json } catch {} }
    return @{ status = $code; body = $parsed }
  }
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$results = @()

# --- 2. create (this path could never run before) --------------------------
$newPost = @{
  title = "E2E probe post $stamp"
  excerpt = "created by the authenticated probe"
  content = "This body exists to prove the create path works. It has a handful of words."
  coverImage = $null
  tags = @("probe", "e2e")
  published = $false
}
$r = Api POST "/api/blog" $newPost
$results += [pscustomobject]@{ Step = "create blog post"; Status = $r.status; Expect = 201; Pass = ($r.status -eq 201) }
if ($r.status -ne 201) { Write-Host "  create failed: $($r.body | ConvertTo-Json -Depth 5)" -ForegroundColor Red; $r.body | ConvertTo-Json -Depth 5; exit 1 }
$id = $r.body.data._id
Write-Host "  created id=$id slug=$($r.body.data.slug) readingTime=$($r.body.data.readingTime) published=$($r.body.data.published)"

# --- 3. draft must not appear on the public API ----------------------------
$pub = (Invoke-WebRequest "$Base/api/public/blog?pageSize=100" -UseBasicParsing).Content | ConvertFrom-Json
# `@(...)` matters: in Windows PowerShell 5.1 `(<empty>).Count` is $null, not 0.
$leaked = @($pub.data | Where-Object { $_.slug -eq $r.body.data.slug }).Count
$results += [pscustomobject]@{ Step = "draft hidden from public API"; Status = "leaked=$leaked"; Expect = "leaked=0"; Pass = ($leaked -eq 0) }

# --- 4. search finds it (admin list) ---------------------------------------
$found = Api GET "/api/blog?search=E2E%20probe%20post&status=draft" $null
$hit = @($found.body.data | Where-Object { $_.slug -eq $r.body.data.slug }).Count
$results += [pscustomobject]@{ Step = "admin search + draft filter"; Status = "hits=$hit total=$($found.body.meta.total)"; Expect = "hits=1"; Pass = ($hit -eq 1) }

# --- 5. update (optimistic path + publishedAt transition) ------------------
$upd = Api PUT "/api/blog/$id" @{ title = "E2E probe post $stamp (edited)"; published = $true }
$newSlug = $upd.body.data.slug
$results += [pscustomobject]@{ Step = "update blog post"; Status = $upd.status; Expect = 200; Pass = ($upd.status -eq 200) }
$results += [pscustomobject]@{ Step = "publishedAt stamped on publish"; Status = [bool]$upd.body.data.publishedAt; Expect = "True"; Pass = [bool]$upd.body.data.publishedAt }

# second save while already published must NOT move publishedAt
$first = $upd.body.data.publishedAt
$upd2 = Api PUT "/api/blog/$id" @{ excerpt = "edited excerpt" }
$results += [pscustomobject]@{ Step = "publishedAt stable on re-save"; Status = ($first -eq $upd2.body.data.publishedAt); Expect = "True"; Pass = ($first -eq $upd2.body.data.publishedAt) }

# --- 6. now it IS public ----------------------------------------------------
$pub2 = (Invoke-WebRequest "$Base/api/public/blog?pageSize=100" -UseBasicParsing).Content | ConvertFrom-Json
$visible = @($pub2.data | Where-Object { $_.slug -eq $newSlug }).Count
$results += [pscustomobject]@{ Step = "published post visible publicly"; Status = "visible=$visible"; Expect = "visible=1"; Pass = ($visible -eq 1) }

# --- 7. validation errors are per-field ------------------------------------
$bad = Api POST "/api/blog" @{ title = ""; excerpt = ""; content = ""; tags = @() }
$fieldNames = if ($bad.body.fields) { ($bad.body.fields.PSObject.Properties.Name -join ",") } else { "none" }
$results += [pscustomobject]@{ Step = "validation returns field errors"; Status = "$($bad.status) fields=$fieldNames"; Expect = "400 with title/excerpt/content"; Pass = ($bad.status -eq 400 -and $fieldNames -match "title") }

# --- 8. slug uniqueness ----------------------------------------------------
$dupe = Api POST "/api/blog" @{ title = "dup"; slug = $newSlug; excerpt = "x"; content = "y y y"; tags = @() }
$results += [pscustomobject]@{ Step = "duplicate slug rejected"; Status = $dupe.status; Expect = 409; Pass = ($dupe.status -eq 409) }

# --- 9. bulk unpublish then delete -----------------------------------------
$bulk = Api POST "/api/blog/bulk" @{ ids = @($id); action = "unpublish" }
$results += [pscustomobject]@{ Step = "bulk unpublish"; Status = "applied=$($bulk.body.data.applied)"; Expect = "applied=1"; Pass = ($bulk.body.data.applied -eq 1) }

$afterBulk = Api GET "/api/blog/$id" $null
$results += [pscustomobject]@{ Step = "bulk unpublish persisted"; Status = "published=$($afterBulk.body.data.published)"; Expect = "published=False"; Pass = (-not $afterBulk.body.data.published) }

# --- 10. audit trail recorded all of it ------------------------------------
$audit = Api GET "/api/admin/audit?pageSize=50" $null
$mine = @($audit.body.data | Where-Object { $_.recordId -like "*$id*" -or ($_.label -like "*$stamp*") })
$actions = ($mine | ForEach-Object { $_.action }) -join ","
$results += [pscustomobject]@{ Step = "audit rows written"; Status = "actions=$actions"; Expect = "create,update,bulk"; Pass = ($actions -match "create" -and $actions -match "update") }

# --- 11. stats reflect the new row ----------------------------------------
$stats = Api GET "/api/admin/stats" $null
$results += [pscustomobject]@{ Step = "stats endpoint returns counts"; Status = "records=$($stats.body.data.totals.records) drafts=$($stats.body.data.totals.drafts)"; Expect = "numbers"; Pass = ($stats.body.data.totals.records -gt 0) }

# --- 12. cleanup -----------------------------------------------------------
$del = Api DELETE "/api/blog/$id" $null
$results += [pscustomobject]@{ Step = "delete blog post"; Status = $del.status; Expect = 200; Pass = ($del.status -eq 200) }
$gone = Api GET "/api/blog/$id" $null
$results += [pscustomobject]@{ Step = "deleted post is gone"; Status = $gone.status; Expect = 404; Pass = ($gone.status -eq 404) }

Write-Host ""
$results | Format-Table -AutoSize | Out-String | Write-Host
$failed = @($results | Where-Object { -not $_.Pass })
Write-Host "  $($results.Count - $failed.Count)/$($results.Count) passed"
if ($failed.Count) { exit 1 }
