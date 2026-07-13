import os
import sys
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton, QFrame, QSpacerItem,
    QSizePolicy, QMessageBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QPixmap
from config import DUCK_PNG, is_server_url_set, set_server_url, DEFAULT_SERVER_URL

class LoginWindow(QWidget):
    login_successful = pyqtSignal()

    def __init__(self, api_client):
        super().__init__()
        self.api = api_client
        self.setObjectName('loginContainer')
        self._setup_ui()

    def _setup_ui(self):
        # Si no hay URL del servidor configurada, mostrar pantalla de configuración
        if not is_server_url_set():
            self._setup_server_config()
            return

        self._setup_login_form()

    def _setup_server_config(self):
        """Pantalla inicial para configurar la URL del portal."""
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        layout.setContentsMargins(20, 20, 20, 20)

        # Card
        card = QFrame()
        card.setObjectName('loginCard')
        card.setFixedWidth(420)

        card_layout = QVBoxLayout()
        card_layout.setSpacing(16)

        # Brand
        brand_layout = QHBoxLayout()
        brand_layout.setAlignment(Qt.AlignCenter)
        badge = QLabel()
        badge.setFixedSize(44, 44)
        badge.setStyleSheet('background: transparent;')
        badge.setPixmap(QPixmap(DUCK_PNG).scaled(
            44, 44, Qt.KeepAspectRatio, Qt.SmoothTransformation))
        brand_text = QLabel('Duck<span style="color:#db1f2e">lab</span>')
        brand_text.setTextFormat(Qt.RichText)
        brand_text.setStyleSheet("color: #e2e8f0; font-size: 22px; font-weight: bold;")
        brand_layout.addWidget(badge)
        brand_layout.addWidget(brand_text)
        card_layout.addLayout(brand_layout)

        card_layout.addSpacing(10)

        # Título
        title = QLabel('Bienvenido al Launcher')
        title.setObjectName('loginTitle')
        title.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(title)

        subtitle = QLabel('Ingresa la dirección de tu portal')
        subtitle.setObjectName('loginSubtitle')
        subtitle.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(subtitle)

        card_layout.addSpacing(10)

        # Server URL input
        url_label = QLabel('URL del Portal')
        card_layout.addWidget(url_label)

        self.server_url_input = QLineEdit()
        self.server_url_input.setPlaceholderText(f'https://tu-portal.vercel.app (default: {DEFAULT_SERVER_URL})')
        self.server_url_input.setText(DEFAULT_SERVER_URL)
        self.server_url_input.returnPressed.connect(self._save_server_url)
        card_layout.addWidget(self.server_url_input)

        # Help text
        help_text = QLabel(
            'Esta dirección te la proporcionó tu proveedor de software.<br>'
            'Ejemplo: https://mi-empresa.ducklab.co'
        )
        help_text.setObjectName('loginSubtitle')
        help_text.setAlignment(Qt.AlignCenter)
        help_text.setStyleSheet('color: #94a3b8; font-size: 12px;')
        card_layout.addWidget(help_text)

        card_layout.addSpacing(10)

        # Save button
        save_btn = QPushButton('Continuar')
        save_btn.setObjectName('loginBtn')
        save_btn.clicked.connect(self._save_server_url)
        card_layout.addWidget(save_btn)

        card.setLayout(card_layout)
        layout.addWidget(card)
        self.setLayout(layout)

    def _save_server_url(self):
        url = self.server_url_input.text().strip()
        if not url:
            return

        # Validación básica: debe ser una URL
        if not url.startswith(('http://', 'https://')):
            QMessageBox.warning(
                self, 'URL inválida',
                'La dirección debe comenzar con http:// o https://'
            )
            return

        set_server_url(url)

        # Reconstruir UI con el formulario de login
        # (elimina widgets actuales y crea de nuevo)
        self._clear_layout()
        self._setup_login_form()

    def _clear_layout(self):
        """Elimina todos los widgets del layout principal."""
        if self.layout():
            while self.layout().count():
                item = self.layout().takeAt(0)
                if item.widget():
                    item.widget().deleteLater()

    def _setup_login_form(self):

        # Card wrapper
        card = QFrame()
        card.setObjectName('loginCard')
        card.setFixedWidth(400)

        card_layout = QVBoxLayout()
        card_layout.setSpacing(16)

        # Brand
        brand_layout = QHBoxLayout()
        brand_layout.setAlignment(Qt.AlignCenter)

        badge = QLabel()
        badge.setAlignment(Qt.AlignCenter)
        badge.setFixedSize(44, 44)
        badge.setStyleSheet('background: transparent;')
        badge.setPixmap(QPixmap(DUCK_PNG).scaled(
            44, 44, Qt.KeepAspectRatio, Qt.SmoothTransformation))

        brand_text = QLabel('Duck<span style="color:#db1f2e">lab</span>')
        brand_text.setTextFormat(Qt.RichText)
        brand_text.setStyleSheet("color: #e2e8f0; font-size: 22px; font-weight: bold;")

        brand_layout.addWidget(badge)
        brand_layout.addWidget(brand_text)
        card_layout.addLayout(brand_layout)

        card_layout.addSpacing(10)

        # Title
        title = QLabel('Iniciar Sesión')
        title.setObjectName('loginTitle')
        title.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(title)

        subtitle = QLabel('Accede a tu portal de software')
        subtitle.setObjectName('loginSubtitle')
        subtitle.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(subtitle)

        card_layout.addSpacing(10)

        # Email
        email_label = QLabel('Correo Electrónico')
        card_layout.addWidget(email_label)

        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText('cliente@empresa.com')
        card_layout.addWidget(self.email_input)

        # Password
        pass_label = QLabel('Contraseña')
        card_layout.addWidget(pass_label)

        self.pass_input = QLineEdit()
        self.pass_input.setPlaceholderText('••••••••')
        self.pass_input.setEchoMode(QLineEdit.Password)
        self.pass_input.returnPressed.connect(self._do_login)
        card_layout.addWidget(self.pass_input)

        # Error
        self.error_label = QLabel('')
        self.error_label.setObjectName('loginError')
        self.error_label.setAlignment(Qt.AlignCenter)
        self.error_label.hide()
        card_layout.addWidget(self.error_label)

        card_layout.addSpacing(6)

        # Login button
        self.login_btn = QPushButton('Iniciar Sesión')
        self.login_btn.setObjectName('loginBtn')
        self.login_btn.clicked.connect(self._do_login)
        card_layout.addWidget(self.login_btn)

        card.setLayout(card_layout)

        layout.addWidget(card)
        self.setLayout(layout)

    def _do_login(self):
        email = self.email_input.text().strip()
        password = self.pass_input.text()

        if not email or not password:
            self.error_label.setText('Completa todos los campos')
            self.error_label.show()
            return

        self.login_btn.setEnabled(False)
        self.login_btn.setText('Conectando...')
        self.error_label.hide()

        try:
            resp = self.api.login(email, password)
            if resp.status_code == 200:
                self.login_successful.emit()
            else:
                try:
                    data = resp.json()
                    msg = data.get('error', 'Credenciales incorrectas')
                except:
                    msg = 'Credenciales incorrectas'
                self.error_label.setText(msg)
                self.error_label.show()
        except Exception:
            self.error_label.setText('No pudimos conectar con el portal. Revisa tu conexión a internet e intenta de nuevo.')
            self.error_label.show()
        finally:
            self.login_btn.setEnabled(True)
            self.login_btn.setText('Iniciar Sesión')
