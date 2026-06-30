import os
import sys
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton, QFrame, QSpacerItem,
    QSizePolicy
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QPixmap
from config import DUCK_PNG

class LoginWindow(QWidget):
    login_successful = pyqtSignal()

    def __init__(self, api_client):
        super().__init__()
        self.api = api_client
        self.setObjectName('loginContainer')
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        layout.setContentsMargins(20, 20, 20, 20)

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
