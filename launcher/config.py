import os
import sys

# URL del portal en producción. Para desarrollo local, cambia a http://localhost:3000
SERVER_URL = 'https://mi-pagina-web-two-lilac.vercel.app'

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
