"""
Rutas y ajustes del launcher. Todo se guarda en %LOCALAPPDATA%\Ducklab
(settings.json y la biblioteca de apps), no junto al .exe.
"""

import os
import sys

# La URL del portal se guarda en settings.json (primera vez que el usuario la ingresa).
# Para desarrollo local puedes definirla aquí como fallback:
DEFAULT_SERVER_URL = 'http://localhost:3000'

# Carpeta base de Ducklab en el equipo del usuario (no junto al .exe, así puede
# mover el launcher sin perder nada). En Windows: %LOCALAPPDATA%\Ducklab
DUCKLAB_HOME = os.path.join(os.environ.get('LOCALAPPDATA') or os.path.expanduser('~'), 'Ducklab')
SETTINGS_FILE = os.path.join(DUCKLAB_HOME, 'settings.json')
DEFAULT_LIBRARY = os.path.join(DUCKLAB_HOME, 'apps')   # biblioteca por defecto
APP_DIR = DEFAULT_LIBRARY                               # compat (la real se resuelve en lib/apps.py)


def resource_path(rel):
    """Ruta a un recurso, válida en desarrollo y dentro del .exe (PyInstaller)."""
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)


DUCK_PNG = resource_path('assets/duck.png')
DUCK_ICO = resource_path('assets/duck.ico')


# ───────────────────────── Servidor / Portal URL ─────────────────────────
_settings_cache = None

def _load_settings():
    """Carga settings.json (cacheada en memoria)."""
    global _settings_cache
    if _settings_cache is not None:
        return _settings_cache
    try:
        import json
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            _settings_cache = json.load(f)
    except Exception:
        _settings_cache = {}
    return _settings_cache


def _save_settings(s):
    """Guarda settings.json y actualiza la caché."""
    global _settings_cache
    import json
    os.makedirs(DUCKLAB_HOME, exist_ok=True)
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(s, f, indent=2)
    _settings_cache = s


def get_server_url():
    """URL del portal (de settings.json o fallback para desarrollo)."""
    return _load_settings().get('server_url') or DEFAULT_SERVER_URL


def set_server_url(url):
    """Guarda la URL del portal en settings.json."""
    s = _load_settings()
    s['server_url'] = url.rstrip('/')
    _save_settings(s)


def is_server_url_set():
    """True si el usuario ya configuró la URL del portal."""
    return bool(_load_settings().get('server_url'))
