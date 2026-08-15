import os
import sys
import json
import tempfile
import subprocess
import webbrowser
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QScrollArea, QFrame, QProgressBar, QMessageBox, QFileDialog,
    QStackedWidget
)
from PyQt5.QtCore import Qt, pyqtSignal, QObject, QThread, QUrl
from PyQt5.QtGui import QPixmap

from config import get_server_url, DUCK_PNG, DUCKLAB_HOME
from lib.apps import (
    get_app_dir, get_manifest, is_app_installed, installed_version,
    install_zip, library_dir, set_library_dir, library_is_set,
)


class InstallWorker(QObject):
    """Descarga el instalador (zip) desde su URL y lo descomprime e instala."""
    progress = pyqtSignal(int, int)    # descargado, total (bytes)
    finished = pyqtSignal(bool, str)   # ok, etapa que falló ('descarga'/'extraccion'/'')

    def __init__(self, api, app, url):
        super().__init__()
        self.api = api
        self.app = app
        self.url = url

    def run(self):
        tmp = os.path.join(tempfile.gettempdir(), f"ducklab_{self.app['id']}.zip")
        ok = self.api.download_url(self.url, tmp, lambda d, t: self.progress.emit(d, t))
        if not ok:
            self.finished.emit(False, 'descarga')
            return
        try:
            install_zip(self.app['id'], tmp, self.app.get('version', '1.0.0'), self.app.get('name'))
        except Exception:
            self.finished.emit(False, 'extraccion')
            return
        finally:
            try:
                os.remove(tmp)
            except Exception:
                pass
        self.finished.emit(True, '')


class LibraryItem(QFrame):
    """Fila de la biblioteca (estilo lista de juegos de Steam)."""
    clicked = pyqtSignal(object)

    def __init__(self, app):
        super().__init__()
        self.app = app
        self.setObjectName('libItem')
        self.setCursor(Qt.PointingHandCursor)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(12, 9, 12, 9)
        lay.setSpacing(10)

        icon = QLabel(app.get('icon', '📦'))
        icon.setStyleSheet('font-size: 20px; background: transparent;')
        lay.addWidget(icon)

        col = QVBoxLayout()
        col.setSpacing(1)
        name = QLabel(app.get('name', 'App'))
        name.setObjectName('libItemName')
        col.addWidget(name)
        meta = QLabel(self._meta())
        meta.setObjectName('libItemMeta')
        col.addWidget(meta)
        lay.addLayout(col, 1)

        st = app.get('status', 'offline')
        dot = QLabel('●')
        dot.setObjectName('dotOnline' if st == 'online' else 'dotError' if st == 'error' else 'dotOffline')
        dot.setStyleSheet('background: transparent;')
        lay.addWidget(dot)

    def _meta(self):
        t = 'Online' if self.app.get('type') == 'online' else 'Escritorio'
        return f"{t} · v{self.app.get('version', '0.0.0')}"

    def mousePressEvent(self, event):
        self.clicked.emit(self.app)
        super().mousePressEvent(event)

    def set_active(self, active):
        self.setObjectName('libItemActive' if active else 'libItem')
        self.style().unpolish(self)
        self.style().polish(self)


class MainWindow(QWidget):
    logout_signal = pyqtSignal()

    def __init__(self, api_client, user_data=None):
        super().__init__()
        self.api = api_client
        self.user = user_data or {}
        self.apps = []
        self.items = []
        self.current = None
        self.setObjectName('mainContainer')
        self._setup_ui()

    # ───────────────────────── UI ─────────────────────────
    def _setup_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        root.addWidget(self._build_sidebar())

        # Pila de contenido: [0] = biblioteca/detalle, [1] = navegador embebido.
        # El navegador (Chromium) se crea de forma PEREZOSA al abrir el primer
        # sistema web, para que el launcher arranque rápido y liviano.
        self.content_stack = QStackedWidget()
        self.content_stack.addWidget(self._build_hero())   # índice 0
        self._web_page = None                              # se crea al primer uso
        self.web_view = None
        self._zoom = 1.0                                   # zoom del navegador embebido
        root.addWidget(self.content_stack, 1)

    def _build_sidebar(self):
        sidebar = QFrame()
        sidebar.setObjectName('sidebar')
        sidebar.setFixedWidth(290)
        v = QVBoxLayout(sidebar)
        v.setContentsMargins(16, 20, 16, 16)
        v.setSpacing(14)

        # Brand
        brand = QHBoxLayout()
        brand.setSpacing(8)
        badge = QLabel()
        badge.setFixedSize(36, 36)
        badge.setAlignment(Qt.AlignCenter)
        badge.setStyleSheet('background: transparent;')
        badge.setPixmap(QPixmap(DUCK_PNG).scaled(
            36, 36, Qt.KeepAspectRatio, Qt.SmoothTransformation))
        brand.addWidget(badge)
        bt = QLabel('Duck<span style="color:#db1f2e">lab</span>')
        bt.setTextFormat(Qt.RichText)
        bt.setObjectName('brandText')
        brand.addWidget(bt)
        brand.addStretch()
        v.addLayout(brand)

        # Profile
        prof = QFrame()
        prof.setObjectName('profileCard')
        ph = QHBoxLayout(prof)
        ph.setContentsMargins(12, 10, 12, 10)
        ph.setSpacing(10)
        initial = (self.user.get('name') or 'U')[0].upper()
        av = QLabel(initial)
        av.setFixedSize(40, 40)
        av.setAlignment(Qt.AlignCenter)
        av.setStyleSheet(
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #ef4444, stop:1 #b91c1c);"
            "border-radius: 20px; color: white; font-weight: bold; font-size: 16px;"
        )
        ph.addWidget(av)
        pc = QVBoxLayout()
        pc.setSpacing(1)
        pn = QLabel(self.user.get('name', 'Usuario'))
        pn.setObjectName('profileName')
        pc.addWidget(pn)
        pp = QLabel(f"Plan {self.user.get('plan')}" if self.user.get('plan') else 'Cliente')
        pp.setObjectName('profilePlan')
        pc.addWidget(pp)
        ph.addLayout(pc)
        ph.addStretch()
        v.addWidget(prof)

        lib = QLabel('BIBLIOTECA')
        lib.setObjectName('libLabel')
        v.addWidget(lib)

        # Library list
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        host = QWidget()
        self.list_layout = QVBoxLayout(host)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(6)
        self.list_layout.addStretch()
        scroll.setWidget(host)
        v.addWidget(scroll, 1)

        logout = QPushButton('Cerrar sesión')
        logout.setObjectName('logoutBtn')
        logout.setCursor(Qt.PointingHandCursor)
        logout.clicked.connect(self.logout_signal.emit)
        v.addWidget(logout)
        return sidebar

    def _build_hero(self):
        wrap = QFrame()
        wrap.setObjectName('heroWrap')
        v = QVBoxLayout(wrap)
        v.setContentsMargins(0, 0, 0, 0)
        v.setSpacing(0)

        # Banner
        banner = QFrame()
        banner.setObjectName('heroBanner')
        banner.setMinimumHeight(220)
        b = QHBoxLayout(banner)
        b.setContentsMargins(40, 32, 40, 32)
        b.setSpacing(24)

        self.hero_icon = QLabel('📦')
        self.hero_icon.setObjectName('heroIcon')
        self.hero_icon.setFixedSize(110, 110)
        self.hero_icon.setAlignment(Qt.AlignCenter)
        b.addWidget(self.hero_icon, 0, Qt.AlignVCenter)

        tcol = QVBoxLayout()
        tcol.setSpacing(12)
        tcol.addStretch()
        self.hero_name = QLabel('—')
        self.hero_name.setObjectName('heroName')
        tcol.addWidget(self.hero_name)

        badges = QHBoxLayout()
        badges.setSpacing(8)
        self.badge_type = QLabel('—')
        self.badge_type.setObjectName('badgeType')
        self.badge_status = QLabel('—')
        self.badge_status.setObjectName('badgeType')
        badges.addWidget(self.badge_type)
        badges.addWidget(self.badge_status)
        badges.addStretch()
        tcol.addLayout(badges)
        tcol.addStretch()
        b.addLayout(tcol, 1)
        v.addWidget(banner)

        # Content
        content = QWidget()
        c = QVBoxLayout(content)
        c.setContentsMargins(40, 28, 40, 28)
        c.setSpacing(22)

        self.hero_desc = QLabel('')
        self.hero_desc.setObjectName('heroDesc')
        self.hero_desc.setWordWrap(True)
        c.addWidget(self.hero_desc)

        meta_row = QHBoxLayout()
        meta_row.setSpacing(48)
        for key, attr in [('ESTADO', 'meta_estado'), ('TIPO', 'meta_tipo'), ('VERSIÓN', 'meta_version')]:
            col = QVBoxLayout()
            col.setSpacing(3)
            k = QLabel(key)
            k.setObjectName('heroMetaKey')
            col.addWidget(k)
            val = QLabel('—')
            val.setObjectName('heroMetaVal')
            col.addWidget(val)
            setattr(self, attr, val)
            meta_row.addLayout(col)
        meta_row.addStretch()
        c.addLayout(meta_row)

        self.progress = QProgressBar()
        self.progress.setTextVisible(False)
        self.progress.hide()
        c.addWidget(self.progress)

        c.addStretch()

        actions = QHBoxLayout()
        actions.setSpacing(12)
        self.primary_btn = QPushButton('▶   Abrir')
        self.primary_btn.setObjectName('primaryBtn')
        self.primary_btn.setCursor(Qt.PointingHandCursor)
        self.primary_btn.clicked.connect(self._primary_action)
        actions.addWidget(self.primary_btn)

        self.secondary_btn = QPushButton('Ver en el portal')
        self.secondary_btn.setObjectName('secondaryBtn')
        self.secondary_btn.setCursor(Qt.PointingHandCursor)
        self.secondary_btn.clicked.connect(self._secondary_action)
        actions.addWidget(self.secondary_btn)
        actions.addStretch()
        c.addLayout(actions)

        v.addWidget(content, 1)
        return wrap

    # ─────────────────────── Lógica ───────────────────────
    def load_apps(self, apps):
        self.apps = apps or []
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        self.items = []

        if not self.apps:
            empty = QLabel('Sin sistemas asignados')
            empty.setObjectName('libItemMeta')
            self.list_layout.insertWidget(0, empty)
            self.hero_name.setText('No tienes sistemas aún')
            self.hero_desc.setText('Cuando se te asigne un sistema, aparecerá aquí en tu biblioteca.')
            self.primary_btn.hide()
            self.secondary_btn.hide()
            return

        for app in self.apps:
            it = LibraryItem(app)
            it.clicked.connect(self._select_app)
            self.list_layout.insertWidget(self.list_layout.count() - 1, it)
            self.items.append(it)

        self.primary_btn.show()
        self._select_app(self.apps[0])

    def _select_app(self, app):
        self.current = app
        for it in self.items:
            it.set_active(it.app.get('id') == app.get('id'))

        self.hero_icon.setText(app.get('icon', '📦'))
        self.hero_name.setText(app.get('name', '—'))
        self.badge_type.setText('Web' if app.get('type') == 'online' else 'Escritorio')

        st = app.get('status', 'offline')
        if st == 'online':
            self.badge_status.setText('● En línea')
            self.badge_status.setObjectName('badgeOnline')
        elif st == 'error':
            self.badge_status.setText('● Con errores')
            self.badge_status.setObjectName('badgeError')
        else:
            self.badge_status.setText('● Sin conexión')
            self.badge_status.setObjectName('badgeType')
        self._repolish(self.badge_status)

        self.hero_desc.setText(app.get('description', ''))
        self.meta_estado.setText({'online': 'En línea', 'error': 'Con errores'}.get(st, 'Sin conexión'))
        self.meta_tipo.setText('Online' if app.get('type') == 'online' else 'Escritorio')
        self.meta_version.setText('v' + str(app.get('version', '0.0.0')))

        self.progress.hide()
        self.primary_btn.setEnabled(True)
        self.primary_btn.show()
        self._update_buttons()

    def _state(self, app):
        if app.get('type') == 'online':
            return 'open'
        # Escritorio: el instalador vive en external_url (GitHub Releases)
        if not is_app_installed(app.get('id')):
            return 'install'
        if installed_version(app.get('id')) != str(app.get('version', '0.0.0')):
            return 'update'
        return 'play'

    def _install_url(self, app):
        return app.get('externalUrl')

    # ─────────────────── Navegador embebido (Steam-like) ───────────────────
    def _ensure_web_page(self):
        """Crea el navegador Chromium la PRIMERA vez que se abre un sistema web.
        Una sola vista reutilizable + perfil persistente (caché y cookies en
        disco), para no gastar recursos hasta que se usa y que el cliente quede
        logueado entre sesiones."""
        if self._web_page is not None:
            return
        from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineProfile, QWebEnginePage

        page = QWidget()
        v = QVBoxLayout(page)
        v.setContentsMargins(0, 0, 0, 0)
        v.setSpacing(0)

        bar = QFrame()
        bar.setObjectName('webBar')
        bar.setFixedHeight(48)
        bh = QHBoxLayout(bar)
        bh.setContentsMargins(12, 6, 12, 6)
        bh.setSpacing(10)
        back = QPushButton('←  Biblioteca')
        back.setObjectName('webBack')
        back.setCursor(Qt.PointingHandCursor)
        back.clicked.connect(self._close_web)
        reload_btn = QPushButton('⟳')
        reload_btn.setObjectName('webIcon')
        reload_btn.setCursor(Qt.PointingHandCursor)
        reload_btn.clicked.connect(lambda: self.web_view and self.web_view.reload())
        # Controles de zoom (para que la página se vea del tamaño que el cliente quiera)
        zoom_out = QPushButton('A−')
        zoom_out.setObjectName('webIcon')
        zoom_out.setCursor(Qt.PointingHandCursor)
        zoom_out.clicked.connect(lambda: self._zoom_step(-0.1))
        self.zoom_label = QLabel('100%')
        self.zoom_label.setObjectName('webZoom')
        zoom_in = QPushButton('A+')
        zoom_in.setObjectName('webIcon')
        zoom_in.setCursor(Qt.PointingHandCursor)
        zoom_in.clicked.connect(lambda: self._zoom_step(0.1))
        self.web_title = QLabel('')
        self.web_title.setObjectName('webTitle')
        ext = QPushButton('Abrir en navegador ↗')
        ext.setObjectName('webIcon')
        ext.setCursor(Qt.PointingHandCursor)
        ext.clicked.connect(lambda: self.current and webbrowser.open(self.current.get('externalUrl', '')))
        bh.addWidget(back)
        bh.addWidget(reload_btn)
        bh.addWidget(zoom_out)
        bh.addWidget(self.zoom_label)
        bh.addWidget(zoom_in)
        bh.addWidget(self.web_title, 1)
        bh.addWidget(ext)
        v.addWidget(bar)

        # Perfil persistente: cachea y guarda cookies en disco (cliente logueado).
        profile = QWebEngineProfile('ducklab', self)
        webdata = os.path.join(DUCKLAB_HOME, 'webdata')
        os.makedirs(webdata, exist_ok=True)
        profile.setPersistentStoragePath(webdata)
        profile.setCachePath(webdata)
        profile.setHttpCacheType(QWebEngineProfile.DiskHttpCache)
        profile.setPersistentCookiesPolicy(QWebEngineProfile.ForcePersistentCookies)

        self.web_view = QWebEngineView()
        self.web_view.setPage(QWebEnginePage(profile, self.web_view))
        self.web_view.setZoomFactor(self._zoom)
        self.web_view.setUrl(QUrl('about:blank'))
        v.addWidget(self.web_view, 1)

        self._web_page = page
        self.content_stack.addWidget(page)   # índice 1

    def _zoom_step(self, delta):
        if self.web_view is None:
            return
        self._zoom = max(0.5, min(2.0, round(self._zoom + delta, 2)))
        self.web_view.setZoomFactor(self._zoom)
        self.zoom_label.setText(f'{int(self._zoom * 100)}%')

    def _open_in_app(self, url, title):
        self._ensure_web_page()
        self.web_title.setText(title or '')
        self.web_view.setZoomFactor(self._zoom)
        self.web_view.setUrl(QUrl(url))
        self.content_stack.setCurrentWidget(self._web_page)

    def _close_web(self):
        # Vuelve a la biblioteca. Deja de cargar para liberar CPU/red.
        if self.web_view is not None:
            self.web_view.stop()
            self.web_view.setUrl(QUrl('about:blank'))
        self.content_stack.setCurrentIndex(0)

    def _update_buttons(self):
        state = self._state(self.current)
        labels = {'open': '▶   Abrir sistema', 'install': '⬇   Instalar', 'update': '↻   Actualizar', 'play': '▶   Abrir'}

        if state in ('install', 'update') and not self._install_url(self.current):
            self.primary_btn.setText('Instalador en camino')
            self.primary_btn.setEnabled(False)
        else:
            self.primary_btn.setText(labels[state])
            self.primary_btn.setEnabled(True)

        if state == 'open':
            self.secondary_btn.setText('Abrir en navegador')
            self.secondary_btn.show()
        elif state in ('play', 'update'):
            self.secondary_btn.setText('Abrir carpeta')
            self.secondary_btn.show()
        else:
            self.secondary_btn.hide()

    def _primary_action(self):
        if not self.current:
            return
        state = self._state(self.current)
        if state == 'open':
            url = self.current.get('externalUrl')
            if url:
                self._open_in_app(url, self.current.get('name'))
        elif state in ('install', 'update'):
            self._install()
        else:
            self._launch()

    def _secondary_action(self):
        if not self.current:
            return
        if self._state(self.current) == 'open':
            # Fallback: abrir el mismo sistema en el navegador real del cliente.
            webbrowser.open(self.current.get('externalUrl') or f'{get_server_url()}/dashboard/sistemas')
        else:
            m = get_manifest(self.current.get('id')) or {}
            folder = m.get('install_dir') or get_app_dir(self.current.get('id'))
            if folder and os.path.isdir(folder):
                self._open_path(folder)

    # ─────────────────────── Instalación / actualización ───────────────────────
    def _ensure_library(self):
        """La primera vez, pregunta al usuario dónde instalar sus aplicaciones."""
        if library_is_set():
            return
        default = library_dir()
        os.makedirs(default, exist_ok=True)
        chosen = QFileDialog.getExistingDirectory(
            self, 'Elige dónde instalar tus aplicaciones', default
        )
        set_library_dir(chosen if chosen else default)

    def _install(self):
        url = self._install_url(self.current)
        if not url:
            QMessageBox.warning(self, 'Sin instalador',
                                'Este sistema todavía no tiene instalador disponible.')
            return
        self._ensure_library()

        self.primary_btn.setEnabled(False)
        self.primary_btn.setText('Descargando...')
        self.progress.setRange(0, 100)
        self.progress.setValue(0)
        self.progress.show()

        self._worker = InstallWorker(self.api, self.current, url)
        self._thread = QThread()
        self._worker.moveToThread(self._thread)
        self._worker.progress.connect(self._on_install_progress)
        self._thread.started.connect(self._worker.run)
        self._worker.finished.connect(self._on_install_done)
        self._thread.start()

    def _on_install_progress(self, done, total):
        if total:
            pct = int(done * 100 / total)
            self.progress.setValue(pct)
            self.primary_btn.setText(f'Descargando... {pct}%')

    def _on_install_done(self, ok, stage):
        self._thread.quit()
        self.progress.hide()
        self.primary_btn.setEnabled(True)
        if ok:
            QMessageBox.information(
                self, 'Instalación completa',
                f"{self.current.get('name', 'La aplicación')} quedó instalada.\n"
                "Ya puedes abrirla con el botón Abrir."
            )
        elif stage == 'extraccion':
            QMessageBox.warning(
                self, 'No se pudo instalar',
                'Se descargó pero no pudimos descomprimir el instalador. '
                'Intenta de nuevo; si el problema sigue, escríbenos por Soporte.'
            )
        else:
            QMessageBox.warning(
                self, 'No se pudo descargar',
                'La descarga no se completó. Revisa tu conexión a internet e inténtalo de nuevo.'
            )
        self._update_buttons()

    def _launch(self):
        m = get_manifest(self.current['id']) or {}
        exe = m.get('exe_path')
        if exe and os.path.exists(exe):
            self._open_path(exe)
        else:
            QMessageBox.warning(
                self, 'No encontrado',
                'No encontramos el ejecutable instalado. Prueba a reinstalar la aplicación.'
            )

    # ─────────────────────── Helpers ───────────────────────
    def _open_path(self, path):
        try:
            if sys.platform == 'win32':
                os.startfile(path)
            elif sys.platform == 'darwin':
                subprocess.Popen(['open', path])
            else:
                subprocess.Popen(['xdg-open', path])
        except Exception as e:
            print(f'Error al abrir: {e}')

    def _repolish(self, widget):
        widget.style().unpolish(widget)
        widget.style().polish(widget)
