# PowerShell script to package the LastMileDeliveryTracker codebase cleanly
$sourceDir = $PSScriptRoot
$zipPath = Join-Path $sourceDir "LastMileDeliveryTracker.zip"

Write-Host "Creating clean distribution zip at: $zipPath"

$tempDir = Join-Path $env:TEMP "delivery_tracker_package"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy Backend (excluding target)
$backendDest = Join-Path $tempDir "backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null
Copy-Item -Path (Join-Path $sourceDir "backend\pom.xml") -Destination $backendDest
Copy-Item -Path (Join-Path $sourceDir "backend\Dockerfile") -Destination $backendDest
Copy-Item -Recurse -Path (Join-Path $sourceDir "backend\src") -Destination (Join-Path $backendDest "src")

# Copy Frontend (excluding node_modules and dist)
$frontendDest = Join-Path $tempDir "frontend"
New-Item -ItemType Directory -Path $frontendDest | Out-Null
Copy-Item -Path (Join-Path $sourceDir "frontend\package.json") -Destination $frontendDest
Copy-Item -Path (Join-Path $sourceDir "frontend\vite.config.js") -Destination $frontendDest
Copy-Item -Path (Join-Path $sourceDir "frontend\index.html") -Destination $frontendDest
Copy-Item -Path (Join-Path $sourceDir "frontend\Dockerfile") -Destination $frontendDest
Copy-Item -Recurse -Path (Join-Path $sourceDir "frontend\src") -Destination (Join-Path $frontendDest "src")
Copy-Item -Recurse -Path (Join-Path $sourceDir "frontend\public") -Destination (Join-Path $frontendDest "public")

# Copy Root Deliverables
Copy-Item -Path (Join-Path $sourceDir "README.md") -Destination $tempDir
Copy-Item -Path (Join-Path $sourceDir "SYSTEM_DESIGN.md") -Destination $tempDir
Copy-Item -Path (Join-Path $sourceDir ".env.example") -Destination $tempDir
Copy-Item -Path (Join-Path $sourceDir "docker-compose.yml") -Destination $tempDir

# Create Zip
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

Remove-Item -Recurse -Force $tempDir
Write-Host "Package created successfully at: $zipPath"
