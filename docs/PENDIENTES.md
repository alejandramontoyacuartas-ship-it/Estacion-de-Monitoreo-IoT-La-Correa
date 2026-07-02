# Pendientes y flujo de trabajo en VS Code

Punto de avance actual y lo que falta. **Continúa desde aquí; no repitas lo ya hecho.**

---

## ✅ Hecho (no rehacer)
- Visor `index.html` con catálogo de capas (`DEF`), leyenda dinámica, panel del sensor, herramientas
  (coordenadas G°M'S, escala, "Mi ubicación", medición distancia/área).
- **Datos embebidos** en `js/data.js` → el geoportal abre por **doble clic** (offline).
- Menús reorganizados (5 menús, según diagrama) con acordeones, flyouts y submenú de sensores.
- **Flyouts** de productos para **La Correa** (12 capas) y **El Salado** (3 capas); se abren a la
  derecha y se cierran solos al salir del menú; productos inician apagados.
- Panel **☰ Capas** = 4 capas de referencia municipal (curvas, veredas, red hídrica muni, red oficial).
- **Puntos de riesgo:** 18 puntos críticos con foto → mapa de calor + popup (Evento/Vereda/Sector/
  Descripción + foto) en el visor, y **página analítica `puntos_riesgo.html`** (filtros + tabla +
  dashboard con gráficos).
- Páginas `escenarios.html` (26 tarjetas, 6 categorías) y `cambio_climatico.html`.
- Encabezado/pie institucionales (escudo + pie de Girardota).
- Documentación completa en `docs/`.

---

## ⏳ Pendiente

### ✅ Conexión a la API (resuelto — modo desarrollo)
- La API `https://iot-trabajo.onrender.com` responde bien; endpoints reales: `GET /mediciones/ultima`, `/mediciones`, `/alertas`. Los campos de `config.js` (nivel_agua, temperatura, humedad, esta_lloviendo, estado_alerta, fecha_hora) **coinciden** con el modelo de la API.
- La API **no tiene CORS**, por eso Live Server queda en "SIN DATO". Solución sin tocar la API: **`scripts/servidor_proxy.py`** (sirve el geoportal en :8080 y reenvía `/api` → Render). `config.js` usa `/api` automáticamente si `location.port === '8080'`.
- **Para ver datos en vivo:** `python scripts/servidor_proxy.py` → abrir `http://localhost:8080/index.html`.
- **Fix permanente (para producción/GitHub Pages):** habilitar CORS en la API FastAPI (CORSMiddleware, allow_origins). Ver bloque abajo.

### Alta prioridad
1. **Definir destinos de los marcadores `#`** del menú (hoy no llevan a ningún lado):
   - `Obras de mitigación`, `Subsidio de arriendo`, `Subsidio de materiales`, `CBVG`.
   - Decidir: página propia, PDF, o enlace externo de la Alcaldía. Editar en `js/navbar.js` (array `NAV`).
2. **Actualizar las páginas heredadas** (aún con contenido del proyecto viejo 12,5 m):
   `dashboard.html`, `monitoreo.html`, `informes.html`.
3. **API del sensor:** confirmar `ENDPOINT_ULTIMA` real en `js/config.js` y CORS habilitado.

### Media
4. Reemplazar imágenes viejas de `img/` (varias son del proyecto 12,5 m) por los mapas nuevos de `docs/`.
5. Revisar que cada capa con interés tenga su entrada en `legendSpec` (leyenda del visor).
6. (Opcional) Añadir el mapa de calor como capa opcional dentro de `puntos_riesgo.html`.

### Baja
7. Publicar en GitHub Pages (ver abajo).
8. Rotar credenciales de BD si alguna vez se expusieron.

---

## 🔄 Regenerar `data.js`  <a name="regenerar-datajs"></a>
**Hazlo cada vez que edites un archivo `data/*.geojson`** (si no, el modo offline no verá el cambio).

Desde la carpeta `GeoportalGRDGirardota`, en la terminal de VS Code:
```bash
python -c "import json,glob,os; GEO={}; [GEO.__setitem__(os.path.splitext(os.path.basename(f))[0], json.load(open(f,encoding='utf-8'))) for f in glob.glob('data/*.geojson')]; open('js/data.js','w',encoding='utf-8').write('window.GEO='+json.dumps(GEO,ensure_ascii=False,separators=(',',':'))+';'); print('data.js OK -', len(GEO), 'capas')"
```
Luego **sube el `?v=` de `data.js`** en `index.html` y `puntos_riesgo.html`.

---

## 🧱 Cómo agregar una capa nueva al visor
1. Pon el GeoJSON en `data/<clave>.geojson` (WGS84).
2. En `js/app.js`, agrega un objeto al array `DEF` con su `build:` (ver `ARQUITECTURA.md` §3.1).
3. Si va en el panel ☰ Capas → añádela a `CAPAS_KEYS`. Si necesita leyenda → a `legendSpec`.
4. Regenera `data.js` y sube los `?v=`.

## 🧱 Cómo agregar/editar un menú
- Edita el array `NAV` en `js/navbar.js`. Tipos de ítem: enlace (`h`), `ext`, `cuencas`, `uso`,
  `estacion`, `sub`. (Ver `ARQUITECTURA.md` §4 y `MENUS.md`.) Sube `?v=` de `navbar.js`.

## 📸 Cómo actualizar datos/fotos de puntos críticos
- Datos: `data/puntos_criticos.geojson` (esquema `riesgo/description/vereda/sector/marker-color/image`)
  y `data/puntos_riesgo.geojson` (esquema `Evento/Vereda/Sector/Descripcion/color/foto`).
- Fotos: `img/puntos/IDn.jpg`. Regenera `data.js`.
- Hay una plantilla y script de apoyo: `plantilla_puntos_riesgo.csv` + `scripts/aplicar_puntos.py`.

---

## 🚀 Publicar en GitHub Pages
```bash
git init && git add . && git commit -m "Geoportal SAT La Correa"
git branch -M main
git remote add origin https://github.com/<usuario>/GeoportalGRDGirardota.git
git push -u origin main
```
GitHub → **Settings → Pages → Branch: main / root**. (El `.gitignore` ya excluye las carpetas
fuente pesadas para que el repo quede liviano.)
