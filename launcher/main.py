"""
Ducklab Launcher: app de escritorio (tipo Steam) para los clientes.

Flujo: si ya hay sesión guardada abre la biblioteca; si no, muestra el
login. La biblioteca lista los sistemas del cliente (/api/my-apps): los web
se abren en un navegador embebido y los de escritorio se descargan, instalan,
actualizan y abren desde aquí.
"""

import os
import sys
import json

# Ensure APP_DIR exists
from config import APP_DIR, DUCK_PNG
os.makedirs(APP_DIR, exist_ok=True)

from PyQt5.QtWidgets import QApplication, QMainWindow, QStackedWidget, QMessageBox
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon

from ui.styles import STYLES
from ui.login_window import LoginWindow
from ui.main_window import MainWindow
from lib.api import APIClient


class LauncherApp(QMainWindow):
    """Ventana principal: alterna entre la pantalla de login y la biblioteca."""
    def __init__(self):
        super().__init__()
        self.api = APIClient()
        self.setWindowTitle('Ducklab Launcher')
        self.setWindowIcon(QIcon(DUCK_PNG))
        self.setMinimumSize(960, 620)
        self.resize(1160, 740)
        self.setStyleSheet(STYLES)

        # Stacked widget to switch between login and main
        self.stack = QStackedWidget()
        self.setCentralWidget(self.stack)

        # Login screen
        self.login_widget = LoginWindow(self.api)
        self.login_widget.login_successful.connect(self._on_login)
        self.stack.addWidget(self.login_widget)

        # Main screen (lazy init)
        self.main_widget = None

        # Check if already authenticated
        if self.api.is_authenticated():
            self._show_main()
        else:
            self.stack.setCurrentWidget(self.login_widget)

    def _on_login(self):
        self._show_main()

    def _show_main(self):
        """Carga los datos del usuario y muestra la biblioteca."""
        # Datos reales del usuario desde la API
        me = self.api.get_me() or {}
        user = {
            'name': me.get('name', 'Usuario'),
            'plan': me.get('plan'),
            'email': me.get('email'),
        }

        if self.main_widget:
            self.main_widget.deleteLater()

        self.main_widget = MainWindow(self.api, user)
        self.main_widget.logout_signal.connect(self._on_logout)
        self.stack.addWidget(self.main_widget)
        self.stack.setCurrentWidget(self.main_widget)
        self._load_apps()

    def _load_apps(self):
        """Pide al portal las apps del cliente y las pinta."""
        # /api/my-apps devuelve los sistemas del cliente (con descargas y estado).
        apps = self.api.get_my_apps()
        self.main_widget.load_apps(apps or [])

    def _on_logout(self):
        """Cierra sesión y vuelve al login."""
        self.api.logout()
        self.stack.removeWidget(self.main_widget)
        self.main_widget = None
        self.stack.setCurrentWidget(self.login_widget)


def main():
    """Configura Qt (OpenGL compartido, DPI, icono) y abre el launcher."""
    # QtWebEngine (navegador embebido) EXIGE compartir contexto OpenGL antes de
    # crear la app. Se setea siempre aunque el navegador se cargue después (lazy).
    QApplication.setAttribute(Qt.AA_ShareOpenGLContexts)
    # Respeta el escalado del sistema (DPI) → las páginas web embebidas se ven
    # del tamaño correcto, como en un navegador normal.
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling)
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    app.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    app.setWindowIcon(QIcon(DUCK_PNG))
    # Windows: agrupa la app bajo su propio icono en la barra de tareas
    if sys.platform == 'win32':
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID('com.ducklab.launcher')
        except Exception:
            pass

    launcher = LauncherApp()
    launcher.show()

    sys.exit(app.exec_())


if __name__ == '__main__':
    main()
