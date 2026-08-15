# Marca Ducklab — sello "Hecho por Ducklab"

Estos archivos son para poner el logo de Ducklab (abajo-izquierda, como marca
de agua flotante) dentro de los **sitios reales de los clientes** — no en
este repo, sino pegados en los otros proyectos.

En el portafolio de esta misma web (`src/app/page.js`) el sello ya existe en
cada tarjeta de proyecto, así que estos archivos son solo para los otros
repos.

## Qué usar en cada proyecto

| Proyecto | Tipo | Qué pegar |
|---|---|---|
| Raloz Web (panel admin/POS) | React | `DucklabBadge.jsx` |
| Tienda Pública Raloz | Sitio estático/HTML | `ducklab-badge.html` |
| Página Los Pocitos Azufrados | Sitio web | `ducklab-badge.html` |
| Pocitos POS (Tkinter) | App de escritorio | No aplica igual — ver nota abajo |

## Pasos

1. Copia el archivo correspondiente al repo del proyecto.
2. Reemplaza `HREF_DUCKLAB` por la URL real donde vive el portal Ducklab
   (mientras no exista `ducklab.co`, usa la URL de Vercel del deploy).
3. Móntalo una vez:
   - React: importa `<DucklabBadge />` en el layout raíz.
   - HTML: pega el bloque `<a>...</a>` antes de `</body>`.

No tiene dependencias externas — SVG y estilos van inline, funciona aunque
el proyecto no use Tailwind ni ninguna librería.

## Pocitos POS (app de escritorio, Tkinter)

Una marca de agua flotante tipo "badge web" no aplica igual en una ventana
nativa. Ahí lo natural es un pequeño label en la esquina inferior izquierda
de la ventana principal, por ejemplo:

```python
tk.Label(root, text="Ducklab", fg="#db1f2e", font=("Segoe UI", 8, "bold")) \
    .place(relx=0.0, rely=1.0, x=8, y=-8, anchor="sw")
```

No tengo ese repo conectado en esta sesión — si quieres que lo agregue
directamente, conecta la carpeta del proyecto de Pocitos (o Raloz) y lo hago
igual que aquí.
