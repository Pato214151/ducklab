import os
import json
import zipfile
import shutil

from config import DEFAULT_LIBRARY, SETTINGS_FILE, DUCKLAB_HOME, _load_settings, _save_settings


# ───────────────────────── Ajustes / biblioteca ─────────────────────────


def library_dir():
    """Carpeta donde se instalan las apps (elegida por el usuario o por defecto)."""
    return _load_settings().get('library') or DEFAULT_LIBRARY


def set_library_dir(path):
    s = _load_settings()
    s['library'] = path
    _save_settings(s)


def library_is_set():
    return bool(_load_settings().get('library'))


# ───────────────────────── Apps instaladas ─────────────────────────
def get_app_dir(app_id):
    return os.path.join(library_dir(), str(app_id))


def get_installed_apps():
    """Lee los manifest.json de cada app instalada en la biblioteca."""
    base = library_dir()
    installed = []
    if not os.path.isdir(base):
        return installed
    for item in os.listdir(base):
        manifest_path = os.path.join(base, item, 'manifest.json')
        if os.path.isfile(manifest_path):
            try:
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    installed.append(json.load(f))
            except Exception:
                pass
    return installed


def is_app_installed(app_id):
    return any(a.get('id') == app_id for a in get_installed_apps())


def installed_version(app_id):
    for a in get_installed_apps():
        if a.get('id') == app_id:
            return a.get('installed_version')
    return None


def get_manifest(app_id):
    path = os.path.join(get_app_dir(app_id), 'manifest.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def save_manifest(app_id, manifest):
    app_dir = get_app_dir(app_id)
    os.makedirs(app_dir, exist_ok=True)
    with open(os.path.join(app_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)


# ───────────────────────── Instalación desde .zip ─────────────────────────
def find_executable(root, prefer=None):
    """Busca el .exe a ejecutar dentro de una carpeta extraída."""
    exes = []
    for dirpath, _dirs, files in os.walk(root):
        for fn in files:
            if fn.lower().endswith('.exe'):
                exes.append(os.path.join(dirpath, fn))
    if not exes:
        return None

    # Excluir desinstaladores
    exes = [e for e in exes if 'unins' not in os.path.basename(e).lower()]

    # Preferir uno cuyo nombre coincida con la app (ej. PocitosAzufrados.exe)
    if prefer:
        key = ''.join(ch for ch in prefer.lower() if ch.isalnum())
        if len(key) >= 4:  # Mínimo 4 chars para evitar colisiones
            for e in exes:
                name = ''.join(ch for ch in os.path.basename(e).lower() if ch.isalnum())
                # Coincidir al menos 8 chars del nombre para ser más preciso
                if len(key) >= 8 and key[:8] in name:
                    return e
                elif len(key) >= 4 and key in name[:12]:  # 12 chars de tolerancia
                    return e

    # Si no hay coincidencia, el más superficial (menos subdirectorios)
    # y que no parezca desinstalador
    if exes:
        exes.sort(key=lambda p: (len(p.split(os.sep)), 'unins' in os.path.basename(p).lower()))
        return exes[0]

    return None


def install_zip(app_id, zip_path, version, app_name=None):
    """Extrae el .zip en la biblioteca y deja el manifest con la ruta del .exe.

    Reinstala/actualiza limpio: borra la versión anterior de la app. Los DATOS
    del programa NO viven aquí (van a la carpeta del propio programa en
    %LOCALAPPDATA%), así que reextraer no borra nada del cliente.
    """
    app_dir = get_app_dir(app_id)
    pkg = os.path.join(app_dir, 'app')
    if os.path.isdir(pkg):
        shutil.rmtree(pkg, ignore_errors=True)
    os.makedirs(pkg, exist_ok=True)

    with zipfile.ZipFile(zip_path) as z:
        z.extractall(pkg)

    # Si el zip trae una única carpeta raíz, esa es la base real
    entries = [os.path.join(pkg, e) for e in os.listdir(pkg)]
    base = entries[0] if len(entries) == 1 and os.path.isdir(entries[0]) else pkg

    exe = find_executable(base, app_name)
    manifest = {
        'id': app_id,
        'name': app_name,
        'installed_version': str(version),
        'install_dir': base,
        'exe_path': exe,
    }
    save_manifest(app_id, manifest)
    return manifest
