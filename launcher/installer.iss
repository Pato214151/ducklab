; Instalador de un clic para el Ducklab Launcher (Inno Setup 6).
; Empaqueta el build onedir (dist/DucklabLauncher) en un único Setup.exe que
; instala por-usuario (sin UAC) y crea accesos directos. Compilar con:
;   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss

#define AppName "Ducklab Launcher"
#define AppVersion "1.1.1"

[Setup]
AppId={{B7D2E1A4-7C3F-4E9A-9D21-DUCKLAB000001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=Ducklab
DefaultDirName={autopf}\Ducklab Launcher
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=dist
OutputBaseFilename=DucklabLauncher-Setup
SetupIconFile=assets\duck.ico
UninstallDisplayIcon={app}\DucklabLauncher.exe
UninstallDisplayName={#AppName}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
; Cierra automáticamente la app (y sus procesos) si tiene archivos en uso, para
; evitar el error "MoveFile código 5 / Acceso denegado" al actualizar.
CloseApplications=force
RestartApplications=no

[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear un acceso directo en el escritorio"; GroupDescription: "Accesos directos:"

; Borra la instalación anterior ANTES de copiar la nueva: así no se intenta
; renombrar sobre un .exe bloqueado (causa del error código 5).
[InstallDelete]
Type: filesandordirs; Name: "{app}\_internal"
Type: files; Name: "{app}\DucklabLauncher.exe"

[Files]
Source: "dist\DucklabLauncher\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\DucklabLauncher.exe"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\DucklabLauncher.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\DucklabLauncher.exe"; Description: "Abrir Ducklab Launcher ahora"; Flags: nowait postinstall skipifsilent

[Code]
var KillResult: Integer;

// Antes de instalar, termina cualquier instancia del launcher y sus procesos
// hijos de Chromium (QtWebEngineProcess) que puedan estar bloqueando archivos,
// aunque no se vean en primer plano.
function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  Exec('taskkill.exe', '/F /T /IM DucklabLauncher.exe', '', SW_HIDE, ewWaitUntilTerminated, KillResult);
  Exec('taskkill.exe', '/F /IM QtWebEngineProcess.exe', '', SW_HIDE, ewWaitUntilTerminated, KillResult);
  Sleep(1000);
  Result := '';
end;
