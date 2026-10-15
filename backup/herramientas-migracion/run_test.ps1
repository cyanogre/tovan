param([string]$Dir, [string]$Name, [int]$Budget = 31000, [string]$Size = "1280,720", [string]$Page = "index.test.html")
$sp = $PSScriptRoot
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = Join-Path $sp "prof-$Name"
if (Test-Path $prof) { Remove-Item -Recurse -Force $prof }
$base = if ([System.IO.Path]::IsPathRooted($Dir)) { $Dir } else { Join-Path $sp $Dir }
$url = "file:///" + ((Join-Path $base $Page) -replace '\\', '/')
$outFile = Join-Path $sp "dom-$Name.html"
$errFile = Join-Path $sp "chrome-$Name.log"
$args = @('--headless=new', '--no-first-run', '--no-default-browser-check', "--user-data-dir=$prof",
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required',
  "--window-size=$Size", "--virtual-time-budget=$Budget", '--dump-dom', $url)
$p = Start-Process -FilePath $chrome -ArgumentList $args -RedirectStandardOutput $outFile -RedirectStandardError $errFile -NoNewWindow -PassThru -Wait
$dom = [System.IO.File]::ReadAllText($outFile)
$m = [regex]::Match($dom, '<pre id="__report">(.*?)</pre>', 'Singleline')
$rep = [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
[System.IO.File]::WriteAllText((Join-Path $sp "report-$Name.json"), $rep, (New-Object System.Text.UTF8Encoding($false)))
"exit=$($p.ExitCode) dom=$((Get-Item $outFile).Length) report=$($rep.Length)"
