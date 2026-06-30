# Launcher Ducklab — Estilos PyQt5 (estética tipo Steam · negro / rojo / perla)

STYLES = """
QWidget {
    font-family: 'Segoe UI', 'Arial', sans-serif;
    color: #e5e7eb;
}

QMainWindow, #loginContainer, #mainContainer {
    background-color: #0a0a0a;
}

/* ───────────────── LOGIN ───────────────── */
#loginCard {
    background-color: #121212;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 40px;
}
#loginTitle { color: #ffffff; font-size: 24px; font-weight: bold; }
#loginSubtitle { color: #9ca3af; font-size: 14px; }
#loginError { color: #f87171; font-size: 13px; }

QLabel { color: #d1d5db; }

QLineEdit {
    background-color: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 10px;
    padding: 12px 16px;
    color: white;
    font-size: 14px;
    selection-background-color: #ef4444;
}
QLineEdit:focus { border-color: #ef4444; }

QPushButton#loginBtn {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #ef4444, stop:1 #b91c1c);
    color: white; border: none; border-radius: 12px;
    padding: 13px; font-size: 15px; font-weight: bold;
}
QPushButton#loginBtn:hover {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #f87171, stop:1 #dc2626);
}
QPushButton#loginBtn:pressed { padding-top: 15px; padding-bottom: 11px; }
QPushButton#loginBtn:disabled { background: #3f1414; color: #9ca3af; }

/* ───────────────── SIDEBAR (biblioteca) ───────────────── */
#sidebar {
    background-color: #0d0d0d;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
}
#brandText { color: #ffffff; font-size: 18px; font-weight: bold; }

#profileCard {
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
}
#profileName { color: #ffffff; font-size: 14px; font-weight: bold; }
#profilePlan { color: #ef4444; font-size: 12px; font-weight: bold; }

#libLabel {
    color: #6b7280; font-size: 11px; font-weight: bold;
    letter-spacing: 2px;
}

/* Items de la biblioteca */
#libItem, #libItemActive {
    border-radius: 10px;
    border: 1px solid transparent;
}
#libItem:hover { background-color: rgba(255, 255, 255, 0.04); }
#libItemActive {
    background-color: rgba(239, 68, 68, 0.10);
    border: 1px solid rgba(239, 68, 68, 0.30);
}
#libItemName { color: #f3f4f6; font-size: 14px; font-weight: bold; }
#libItemMeta { color: #6b7280; font-size: 11px; }

#dotOnline { color: #22c55e; font-size: 12px; }
#dotError  { color: #ef4444; font-size: 12px; }
#dotOffline{ color: #6b7280; font-size: 12px; }

QPushButton#logoutBtn {
    background-color: transparent;
    color: #9ca3af;
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 10px;
    padding: 10px;
    font-size: 13px;
    font-weight: bold;
}
QPushButton#logoutBtn:hover {
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.40);
    background-color: rgba(239, 68, 68, 0.08);
}

/* ───────────────── HERO (detalle) ───────────────── */
#heroWrap { background-color: #0a0a0a; }

#heroBanner {
    border-radius: 0px;
    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
        stop:0 #2a0a0a, stop:0.5 #140404, stop:1 #0a0a0a);
    border-bottom: 1px solid rgba(239, 68, 68, 0.15);
}
#heroIcon {
    font-size: 56px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 20px;
}
#heroName { color: #ffffff; font-size: 34px; font-weight: bold; }
#heroDesc { color: #cbd5e1; font-size: 15px; }
#heroMetaKey { color: #6b7280; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
#heroMetaVal { color: #e5e7eb; font-size: 14px; font-weight: bold; }

#badgeType {
    color: #cbd5e1; font-size: 12px; font-weight: bold;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px; padding: 3px 10px;
}
#badgeOnline {
    color: #22c55e; font-size: 12px; font-weight: bold;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.30);
    border-radius: 10px; padding: 3px 10px;
}
#badgeError {
    color: #f87171; font-size: 12px; font-weight: bold;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.30);
    border-radius: 10px; padding: 3px 10px;
}

/* Botón principal grande (PLAY / INSTALAR / ACTUALIZAR) */
QPushButton#primaryBtn {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #ef4444, stop:1 #b91c1c);
    color: white; border: none; border-radius: 12px;
    padding: 16px 40px; font-size: 16px; font-weight: bold;
}
QPushButton#primaryBtn:hover {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #f87171, stop:1 #dc2626);
}
QPushButton#primaryBtn:pressed { padding-top: 18px; padding-bottom: 14px; }

QPushButton#secondaryBtn {
    background-color: rgba(255,255,255,0.05);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 16px 24px; font-size: 14px; font-weight: bold;
}
QPushButton#secondaryBtn:hover { background-color: rgba(255,255,255,0.10); }

#emptyText { color: #6b7280; font-size: 15px; }

QProgressBar {
    border: none; border-radius: 6px;
    background-color: rgba(255,255,255,0.06);
    height: 10px; text-align: center; color: transparent;
}
QProgressBar::chunk {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #ef4444, stop:1 #dc2626);
    border-radius: 6px;
}

/* Scroll */
QScrollArea { border: none; background: transparent; }
QScrollArea > QWidget > QWidget { background: transparent; }
QScrollBar:vertical { background-color: transparent; width: 8px; margin: 4px; }
QScrollBar::handle:vertical { background-color: rgba(255,255,255,0.10); border-radius: 4px; min-height: 30px; }
QScrollBar::handle:vertical:hover { background-color: rgba(239,68,68,0.40); }
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0px; }
QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical { background: transparent; }

/* ───────────────── NAVEGADOR EMBEBIDO ───────────────── */
#webBar {
    background-color: #0d0d0d;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
QPushButton#webBack {
    background-color: rgba(255,255,255,0.05);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    padding: 7px 14px; font-size: 13px; font-weight: bold;
}
QPushButton#webBack:hover {
    color: #f87171;
    border-color: rgba(239,68,68,0.40);
    background-color: rgba(239,68,68,0.08);
}
QPushButton#webIcon {
    background-color: transparent;
    color: #9ca3af;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    padding: 7px 12px; font-size: 13px;
}
QPushButton#webIcon:hover { color: #e5e7eb; background-color: rgba(255,255,255,0.06); }
#webTitle { color: #f3f4f6; font-size: 14px; font-weight: bold; }
#webZoom { color: #9ca3af; font-size: 12px; min-width: 38px; qproperty-alignment: AlignCenter; }

"""
