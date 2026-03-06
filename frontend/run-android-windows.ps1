# Configura ANDROID_HOME, JAVA_HOME (JDK 17) y PATH para esta sesion y ejecuta run-android
$sdk = "C:\Users\mille\AppData\Local\Android\Sdk"
# Gradle 8.0 + React Native requieren JDK 17 (Java 21 da "Unsupported class file major version 65")
$jdk17 = $null
foreach ($path in @(
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Amazon Corretto\jdk17*"
)) {
    $resolved = Get-Item $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($resolved) { $jdk17 = $resolved.FullName; break }
}
if (-not $jdk17) {
    $jbr = "C:\Program Files\Android\Android Studio\jbr"
    $env:JAVA_HOME = $jbr
    Write-Host "AVISO: No se encontro JDK 17. Usando Java de Android Studio (puede fallar el build)." -ForegroundColor Yellow
    Write-Host "Para instalar JDK 17: https://adoptium.net/temurin/releases/?version=17&os=windows" -ForegroundColor Yellow
} else {
    $env:JAVA_HOME = $jdk17
}
$env:ANDROID_HOME = $sdk
$env:PATH = "$sdk\platform-tools;$sdk\emulator;$env:JAVA_HOME\bin;$env:PATH"

Write-Host "ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Green
Write-Host "JAVA_HOME   = $env:JAVA_HOME" -ForegroundColor Green

# Ver si ya hay un dispositivo/emulador
$devices = & adb devices
if ($devices -match "emulator-\d+\s+device") {
    Write-Host "Emulador o dispositivo ya conectado." -ForegroundColor Green
} else {
    Write-Host "Iniciando emulador Pixel_5 (espera ~30 s)..." -ForegroundColor Cyan
    Start-Process -FilePath "$sdk\emulator\emulator.exe" -ArgumentList "-avd", "Pixel_5" -WindowStyle Normal
    $wait = 0
    while ($wait -lt 60) {
        Start-Sleep -Seconds 5
        $devices = & adb devices 2>$null
        if ($devices -match "emulator-\d+\s+device") { break }
        $wait += 5
        Write-Host "  Esperando emulador... ${wait}s" -ForegroundColor Gray
    }
    if ($wait -ge 60) {
        Write-Host "El emulador tardo mucho. Abrelo manualmente desde Android Studio y vuelve a ejecutar este script." -ForegroundColor Yellow
    }
}

Write-Host "Instalando y abriendo la app..." -ForegroundColor Cyan
npx react-native run-android
