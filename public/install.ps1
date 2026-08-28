$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-worktree-agent-pulse"
$release = Invoke-RestMethod -Headers @{ Accept = "application/vnd.github+json" } -Uri "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $asset -or -not $sums) { throw "Downloads are still being published. Visit https://github.com/$repo/releases" }
$temp = Join-Path ([System.IO.Path]::GetTempPath()) $asset.name
$sumFile = Join-Path ([System.IO.Path]::GetTempPath()) "pulse-SHA256SUMS"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $temp
Invoke-WebRequest -Uri $sums.browser_download_url -OutFile $sumFile
$expected = (Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) } | Select-Object -First 1).Split(' ')[0]
$actual = (Get-FileHash -Algorithm SHA256 $temp).Hash.ToLowerInvariant()
if ($expected.ToLowerInvariant() -ne $actual) { Remove-Item $temp; throw "Checksum did not match. Nothing was installed." }
Start-Process $temp
Write-Host "Verified and opened $($asset.name). Follow the installer prompts."
