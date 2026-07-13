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
def _load_settings():
    """Carga settings.json (puede fallar si no existe)."""
    try:
        import json
        os.makedirs(DUCKLAB_HOME, exist_ok=True)
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def get_server_url():
    """URL del portal (de settings.json o fallback para desarrollo)."""
    return _load_settings().get('server_url') or DEFAULT_SERVER_URL


def set_server_url(url):
    """Guarda la URL del portal en settings.json."""
    import json
    os.makedirs(DUCKLAB_HOME, exist_ok=True)
    s = _load_settings()
    s['server_url'] = url.rstrip('/')
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(s, f, indent=2)


def is_server_url_set():
    """True si el usuario ya configuró la URL del portal."""
    return bool(_load_settings().get('server_url'))
