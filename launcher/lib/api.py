"""
Cliente HTTP del portal. Hace login contra /api/auth/login y guarda la
cookie de sesión en el Administrador de Credenciales de Windows (keyring).
"""

import requests
import json
import os
from config import get_server_url

SESSION_FILE = os.path.join(os.path.dirname(__file__), '..', 'session.json')
KEYRING_SERVICE = 'Ducklab'
KEYRING_ACCOUNT = 'session'

# El token de sesión se guarda en el Administrador de Credenciales de Windows
# (cifrado por el SO) en vez de un archivo de texto plano.
try:
    import keyring
    _HAS_KEYRING = True
except Exception:
    _HAS_KEYRING = False


class APIClient:
    """Sesión HTTP con el portal (cookie persistente entre aperturas)."""
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self._load_session()

    def _load_session(self):
        """Recupera la cookie guardada (y migra el viejo session.json al llavero)."""
        cookie = None
        # 1) Llavero del SO (preferido)
        if _HAS_KEYRING:
            try:
                cookie = keyring.get_password(KEYRING_SERVICE, KEYRING_ACCOUNT)
            except Exception:
                cookie = None
        # 2) Migración: si quedó un session.json viejo, úsalo y pásalo al llavero
        if not cookie and os.path.exists(SESSION_FILE):
            try:
                with open(SESSION_FILE, 'r') as f:
                    cookie = json.load(f).get('cookie')
                if cookie:
                    self._save_session(cookie)
            except Exception:
                cookie = None
            finally:
                try:
                    os.remove(SESSION_FILE)  # ya no se guarda en texto plano
                except Exception:
                    pass
        if cookie:
            self.session.headers.update({'Cookie': cookie})

    def _save_session(self, cookie_str):
        """Guarda la cookie en el llavero del sistema (o en archivo si no hay)."""
        if _HAS_KEYRING:
            try:
                keyring.set_password(KEYRING_SERVICE, KEYRING_ACCOUNT, cookie_str)
                return
            except Exception:
                pass
        # Fallback si keyring no está disponible
        try:
            with open(SESSION_FILE, 'w') as f:
                json.dump({'cookie': cookie_str}, f)
        except Exception:
            pass

    def clear_session(self):
        """Borra la cookie guardada."""
        if _HAS_KEYRING:
            try:
                keyring.delete_password(KEYRING_SERVICE, KEYRING_ACCOUNT)
            except Exception:
                pass
        if os.path.exists(SESSION_FILE):
            try:
                os.remove(SESSION_FILE)
            except Exception:
                pass
        self.session.headers.pop('Cookie', None)

    def logout(self):
        """Avisa al portal y borra la sesión local."""
        try:
            self.session.post(f'{get_server_url()}/api/auth/logout', timeout=5)
        except Exception:
            pass
        self.clear_session()

    def login(self, email, password):
        """Login via API"""
        self.session.headers.pop('Cookie', None)
        url = f'{get_server_url()}/api/auth/login'
        payload = {'email': email, 'password': password}
        resp = self.session.post(url, json=payload, allow_redirects=False, timeout=10)
        if resp.status_code == 200:
            # Get the Set-Cookie header from the response
            set_cookie = resp.headers.get('Set-Cookie', '')
            if set_cookie:
                cookie_val = set_cookie.split(';')[0]
                self.session.headers.update({'Cookie': cookie_val})
                self._save_session(cookie_val)
        return resp

    def get_dashboard(self):
        resp = self.session.get(f'{get_server_url()}/dashboard', allow_redirects=False)
        return resp

    def get_downloads(self):
        resp = self.session.get(f'{get_server_url()}/dashboard/downloads', allow_redirects=False)
        return resp

    def download_file(self, download_id, save_path):
        """Descarga un instalador del portal (usa la sesión)."""
        url = f'{get_server_url()}/api/downloads/{download_id}'
        resp = self.session.get(url, stream=True, allow_redirects=False)
        if resp.status_code == 200:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        return False

    def download_url(self, url, save_path, progress_cb=None):
        """Descarga directa desde una URL pública (ej. GitHub Releases).

        Sigue redirects (GitHub redirige a una URL firmada) y NO manda la cookie
        del portal a terceros. progress_cb(descargado, total) para la barra.
        """
        try:
            with requests.get(url, stream=True, allow_redirects=True, timeout=30) as r:
                if r.status_code != 200:
                    return False
                total = int(r.headers.get('Content-Length') or 0)
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                done = 0
                with open(save_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=65536):
                        if not chunk:
                            continue
                        f.write(chunk)
                        done += len(chunk)
                        if progress_cb and total:
                            progress_cb(done, total)
            return True
        except Exception:
            return False

    def get_my_apps(self):
        """Get list of apps assigned to the logged-in user"""
        resp = self.session.get(f'{get_server_url()}/api/my-apps', allow_redirects=False)
        if resp.status_code == 200:
            try:
                return resp.json()
            except:
                pass
        return []

    def is_authenticated(self):
        """True si la sesión guardada sigue siendo válida."""
        try:
            resp = self.session.get(f'{get_server_url()}/api/me', allow_redirects=False, timeout=5)
            return resp.status_code == 200
        except Exception:
            return False

    def get_me(self):
        """Datos del usuario logueado (name, email, plan, ...)."""
        try:
            resp = self.session.get(f'{get_server_url()}/api/me', allow_redirects=False)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None
