# Pendientes y flujo de trabajo en VS Code

Punto de avance actual y lo que falta. **Continúa desde aquí; no repitas lo ya hecho.**

---

## ✅ Hecho (no rehacer)
### Sesión 2026-07-04 — CBVG, puntos de riesgo, PDFs y ajustes de ventana
- **Nueva ventana `emergencias_cbvg.html`** (Manejo de desastres → Emergencias atendidas / CBVG): estilo Puntos de riesgo,
  con datos del **KMZ auditado** `CBVG/BOMBEROS_EMERGENCIAS_AUDITADO_COMPLETO_RVDO.xlsx` → **69 emergencias** con foto y
  ubicación. Filtros **vereda + tipo + año**. `data/emergencias_cbvg.geojson` (vereda por point-in-polygon), 69 fotos en
  `img/cbvg/`. **Botón "Descargar PDF"** (jsPDF): filtros aplicados + resumen + tabla + **fotos de evidencia 6 por hoja**.
  Lógica en `js/emergencias_cbvg.js`. Para reconstruir: `scratchpad/build_cbvg.py`.
- **Puntos de riesgo actualizados a 55** (18 previos + **37 nuevos IDs 19-60**) desde `INFORMACION DE PUNTOS EN RIESGO/
  NUEVA INFORMACION PUNTOS CRITICOS/PUNTOS_RIESGO_REF.xlsx`. `data/puntos_criticos.geojson` regenerado; 37 fotos a
  `img/puntos/` (ID{n}.jpeg). Color por tipo ampliado en `puntos_riesgo.js` (ladera/creciente/sanitario/incendio/colapso).
  Reconstruir: `scratchpad/build_puntos.py`.
- **Botón "← Regresa al geoportal"** (verde, estilo Limpiar) inyectado por `navbar.js` en el encabezado de TODAS las páginas
  analíticas (`.header` y `.esc-head`); no en el visor del mapa.
- **Ventana flotante de nivel**: abre SOLO con la estación propia P1; **se cierra** al clic en cualquier otro ícono/opción
  (gracia de 350ms para el clic que la abre). Corregida etiqueta `<iframe>` malformada.
- **Panel de sensor** (#sensor-detalle): encabezado "Registros de lectura / SENSORES EST. LA CORREA"; oculta pestañas
  Niveles de riesgo/Perfil/Galería para lluvia/temp/humedad.
- **Tablero de lectura**: monitoreo dinámico (selector 3h/24h/72h/30d, gráfica formato ventana flotante) + **descarga PDF**
  con tabla de lecturas. Fuera del mapa, tocar un sensor del menú **regresa al geoportal**.
- **"Sensores de nivel"** enciende la **red hídrica municipal** (capa de contexto), que se apaga al elegir otra opción.
  Clic en cada ícono de nivel **resalta su microcuenca** (point-in-polygon). El menú se cierra al hacer clic fuera.
- Retirado del menú "Niveles de riesgo — Estación P1".
- **Versiones actuales:** app.js v57 · navbar.js v49 · estilos.css v17 · data.js v8 · puntos_riesgo.css v5 ·
  emergencias_cbvg.js v7 · puntos_riesgo.js v4.

### Sesión 2026-07-02 (tarde/noche) — Ventana flotante "Registros de lectura" + estación
- **Página `niveles.html`** (vista SIATA-like): escala de niveles N1–N4, serie de tiempo con **selector 3h/24h/72h/30d**,
  marcador de máximo, panel Resumen (tipo sensor, resolución, % datos, promedio) y **sección transversal en P1** con
  **deslizador de instante** (mueve la lámina). Lee la API real (`/mediciones`→`/mapa`), fallback demo. Modo `?embed=1`
  = presentación compacta (encabezado 2 líneas, escala **horizontal al final**, lectura primero). Encabezado:
  **"Registros de lectura — Nivel de agua"**.
- **Ventana FLOTANTE lateral** (`#niv-modal`, ~1/3 a la derecha) = `niveles.html?embed=1&v=N` en iframe. Lógica en `app.js`
  (`abrirNivelesFlotante`/`cerrarNivelesFlotante`). **Abre SOLO al clic en el ícono de nivel** (onda + marcador verde P1);
  **cierra** con ✕/Esc, al desactivar el nivel, al activar otro sensor o **al elegir otra opción de menú**. El toggle
  "Nivel de la quebrada" ya NO abre la ventana (solo enciende ícono).
- **Panel compacto `#sensor-detalle`**: encabezado verde "Niveles de Riesgo", pestaña **"Series"→"Lectura"**; se abre para
  lluvia/temp/humedad. `#panel-sensor` "Estación de monitoreo" movido a **arriba-izquierda** (antes abajo-derecha, chocaba
  con la ventana flotante).
- **Red hídrica municipal (`red_hidrica_muni`) = capa de CONTEXTO del nivel:** se enciende con "Sensores de nivel"
  (`?capa=siata_nivel,red_hidrica_muni`) y con el toggle "Nivel de la quebrada"; se apaga al elegir cualquier otra opción-hoja.
- **Menú:** "Niveles de riesgo — Estación P1" (bajo Reducción) abre la ventana flotante (visor) o navega con `?niveles=1`.
- **Documentos:** `Informe_Proceso_Detallado_N_CORREA` (.docx+.pdf, con figuras) en Downloads y `N_CORREA/docs`.
  MED corregido a **LiDAR 2 m (AMVA)** en el PDF de actualización. Versiones actuales: app.js v53, navbar.js v42, estilos.css v17.

### Base
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
0. **⭐ Dejar FIJA/robusta la conexión con `/mapa` — CRÍTICO para publicar en GitHub Pages** (pedido de la usuaria, 2026-07-02):
   - El geoportal (panel en vivo `leerSensor`) y el dashboard leen de `https://iot-trabajo.onrender.com/mapa`.
     En local funciona por el **proxy** (`.claude/launch.json` / `scripts/servidor_proxy.py`, puerto 8080).
   - **En GitHub Pages NO hay proxy → fallará por CORS.** Solución de fondo: **habilitar CORSMiddleware
     (allow_origins) en la API FastAPI de Render** (tarea del equipo). Alternativa: proxy/servicio externo con CORS.
   - Mantener SIEMPRE embebidas/activables: **Hidrología (subcuencas)**, **Uso del suelo** (ya en `data.js`) y la conexión **/mapa**.
   - Ver memoria `feedback-geoportal-conexiones`.
1. **Definir destinos de los marcadores `#`** del menú (hoy no llevan a ningún lado):
   - `Obras de mitigación`, `Subsidio de arriendo`, `Subsidio de materiales`, `CBVG`.
   - Decidir: página propia, PDF, o enlace externo de la Alcaldía. Editar en `js/navbar.js` (array `NAV`).
2. ~~**Actualizar las páginas heredadas**: `dashboard.html`, `monitoreo.html`, `informes.html`.~~
   ✅ HECHO (2026-07-01): formato uniforme con el geoportal (navbar v20 + CSS institucional + pie),
   cifras verificadas y conexión a la **API real (P1)** en dashboard y monitoreo. `informes.html`
   ahora usa los campos reales de `elementos.geojson`.
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
