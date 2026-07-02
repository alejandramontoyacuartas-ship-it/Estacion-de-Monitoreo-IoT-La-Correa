# Geoportal de Gestión del Riesgo — Girardota (SAT Quebrada La Correa)

Geoportal web del **Sistema de Alerta Temprana (SAT) por avenida torrencial** del municipio de
Girardota (Antioquia), centrado en la microcuenca **Quebrada La Correa** y con extensión a otras
cuencas (El Salado). Publica las capas del análisis SIG (proyecto **N_CORREA**, MDE LiDAR 2 m),
los **puntos críticos de riesgo validados en campo** (con foto) y la **lectura del sensor en
tiempo real** vía API.

> **Para retomar el trabajo en VS Code, lee primero esta sección y luego `docs/`.**
> Toda la lógica está documentada para no repetir trabajo.

---

## 🚀 Inicio rápido (VS Code)

El geoportal funciona de **dos formas**:

1. **Doble clic en `index.html` (offline / `file://`)** — ✅ funciona, porque todos los datos
   están embebidos en `js/data.js` (`window.GEO`). Las capas, menús y fotos cargan sin servidor.
2. **Con servidor (recomendado para desarrollo)** — Live Server o Python:
   ```bash
   python -m http.server 5599
   # abre http://localhost:5599/index.html
   ```
   Con servidor también funciona el `fetch` directo a `data/*.geojson` (modo de respaldo).

> La extensión **Live Server** ya está recomendada en `.vscode/extensions.json`.

⚠️ **Si editas un archivo `data/*.geojson`, debes regenerar `js/data.js`** (ver
[docs/PENDIENTES.md](docs/PENDIENTES.md#regenerar-datajs)). Si no, los cambios no se verán al
abrir por doble clic.

---

## 🗺️ Páginas del geoportal

| Página | Qué es | Estado |
|---|---|---|
| **`index.html`** | **Visor principal**: mapa + menú de capas + panel del sensor + herramientas | ✅ Actual |
| **`puntos_riesgo.html`** | **Página analítica de puntos críticos**: filtros (vereda/riesgo) + mapa + tabla + dashboard con gráficos | ✅ Actual |
| **`escenarios.html`** | Escenarios de riesgo (26 tarjetas en 6 categorías con iconos) | ✅ Actual |
| **`cambio_climatico.html`** | Cambio climático (intro + tarjetas, ligado al SAT) | ✅ Actual |
| `dashboard.html` | Tablero | ⚠️ **Pendiente** (contenido viejo 12,5 m) |
| `monitoreo.html` | Portal estación tipo SIATA | ⚠️ **Pendiente** |
| `informes.html` | Informes / visitas | ⚠️ **Pendiente** |

El **menú superior** (navbar) es compartido por todas las páginas (`js/navbar.js`). La estructura
completa de menús está en [docs/MENUS.md](docs/MENUS.md).

---

## 📁 Estructura de la carpeta

```
GeoportalGRDGirardota/
├─ index.html               VISOR principal
├─ puntos_riesgo.html       Página analítica de puntos críticos (filtros + dashboard)
├─ escenarios.html          Escenarios de riesgo (tarjetas)
├─ cambio_climatico.html    Cambio climático
├─ dashboard.html · monitoreo.html · informes.html   (heredadas, pendientes de actualizar)
│
├─ css/
│  ├─ estilos.css           Tema verde institucional + visor + herramientas + popups
│  ├─ navbar.css            Menú superior
│  └─ puntos_riesgo.css     Estilos de la página analítica de puntos críticos
│
├─ js/
│  ├─ config.js             API del sensor + coords de P1 (SIN credenciales)
│  ├─ data.js               ⭐ TODAS las capas embebidas (window.GEO) — permite abrir offline
│  ├─ app.js                Núcleo del VISOR: catálogo de capas, leyenda, sensor, herramientas
│  ├─ navbar.js             Menú compartido (5 menús, acordeones, flyouts, sensores)
│  ├─ medicion.js           Herramienta de medición (distancia / área)
│  └─ puntos_riesgo.js      Lógica de la página analítica (filtros, tabla, gráficos)
│
├─ data/                    32 capas GeoJSON (WGS84 / EPSG:4326)   → ver docs/DICCIONARIO_CAPAS.md
├─ img/                     Logos, pie de página y fotos
│  └─ puntos/               18 fotos de los puntos críticos (ID1.jpg … ID18.jpg)
├─ docs/                    📚 DOCUMENTACIÓN (este proyecto) + entregables del análisis
├─ scripts/                 Utilidades Python (aplicar_puntos.py)
├─ .vscode/                 Recomendación de extensiones (Live Server)
│
├─ INFORMACION DE PUNTOS EN RIESGO/   (FUENTE: página original de puntos críticos de la usuaria)
└─ imegenes puntos criticos/          (FUENTE: fotos originales de los puntos)
```

> Las dos últimas carpetas son **material fuente** (de donde se integró el trabajo). No son
> necesarias para que el geoportal funcione; están excluidas del repo en `.gitignore`.

---

## 📚 Documentación detallada (`docs/`)

| Documento | Contenido |
|---|---|
| **[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)** | Cómo funciona el código: catálogo `DEF`, `geoToggle`, carga perezosa, `window.GEO`, navbar, página por página. **Léelo antes de tocar el JS.** |
| **[docs/MENUS.md](docs/MENUS.md)** | Mapa completo de menús y a dónde lleva cada opción (sitemap + comportamiento). |
| **[docs/DICCIONARIO_CAPAS.md](docs/DICCIONARIO_CAPAS.md)** | Las 32 capas GeoJSON: qué son, geometría, campos, origen. |
| **[docs/RESULTADOS_TECNICOS.md](docs/RESULTADOS_TECNICOS.md)** | Resultados del análisis SIG: morfometría, caudales, GEE/CHIRPS, exposición, AHP, sirenas. |
| **[docs/PENDIENTES.md](docs/PENDIENTES.md)** | Qué falta, marcadores `#`, cómo regenerar `data.js`, cómo continuar en VS Code, publicar. |
| **[docs/CHANGELOG.md](docs/CHANGELOG.md)** | Historial de lo construido (orden de avance). |

---

## 🧩 Stack técnico
- **Leaflet 1.9.4** (mapa) · **Leaflet.heat** (mapa de calor) · **Chart.js 4.4** (gráficos).
- **GeoJSON** estático embebido (`js/data.js`) — sin backend propio.
- Sensor en tiempo real: el navegador lee una **API REST** (Render) definida en `js/config.js`.
- CRS de los datos: **WGS84 (EPSG:4326)**.

---

## ⚠️ Seguridad (importante)
- **NUNCA** poner usuario/contraseña de base de datos en el front-end.
- El navegador lee **solo** la API REST (con CORS), nunca PostgreSQL directo.
- Si en algún momento se compartieron credenciales de BD, **rotarlas**.

---

## 🔗 Fuente del análisis (no se publica)
Proyecto ArcGIS Pro: `…\IOT\N_CORREA\N_CORREA\N_CORREA.aprx` (gdb `GIRARDOTA.gdb`).
De ahí se exportan los GeoJSON de `data/` (exportar la **capa** en EPSG:4326, no el dataSource).
