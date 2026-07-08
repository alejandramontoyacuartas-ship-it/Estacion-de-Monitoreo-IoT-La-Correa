# Arquitectura del código — Geoportal La Correa

Documento técnico para continuar el desarrollo en VS Code. Explica cómo está construido el
geoportal, archivo por archivo, y los patrones clave para no romper nada.

---

## 1. Orden de carga (en `index.html`)

```html
<!-- librerías externas (CDN) -->
leaflet.css / leaflet.js          (mapa)
chart.js                          (gráficos del panel del sensor)
leaflet.heat                      (mapa de calor de puntos de riesgo)
<!-- estilos -->
css/estilos.css?v=10  css/navbar.css?v=3
<!-- al final del body, EN ESTE ORDEN: -->
js/navbar.js?v=20     (menú; se inyecta en #navbar-root)
js/config.js?v=3      (CONFIG: API del sensor)
js/data.js?v=5        (window.GEO = TODAS las capas embebidas)   ← debe ir ANTES de app.js
js/corte_p1.js?v=1    (window.CORTE_P1 = sección transversal del cauce en P1) ← ANTES de app.js
js/app.js?v=36        (núcleo del visor)
js/medicion.js?v=2    (herramienta de medición)
```

> **Control de caché:** cada `.js`/`.css` lleva `?v=N`. **Al editar un archivo, sube su `?v=`**
> en TODAS las páginas que lo usan, o el navegador servirá la versión vieja.

---

## 2. `js/data.js` — datos embebidos (clave del modo offline)

- Define `window.GEO = { "<nombre_capa>": <GeoJSON>, ... }` con las **32 capas** de `data/`.
- Permite **abrir el geoportal por doble clic** (`file://`) porque no hace falta `fetch`.
- **Se genera automáticamente** desde `data/*.geojson`. Si editas una capa, regenéralo
  (ver `docs/PENDIENTES.md` → "Regenerar data.js"). Pesa ~13 MB.

La función `cargar(url)` en `app.js` y `cargarGeo(name,url)` en `puntos_riesgo.js`:
**primero buscan en `window.GEO`**, y solo si no existe hacen `fetch`. Así funciona offline y online.

```js
async function cargar(u){
  if(window.GEO){ const m=u.match(/([^/]+)\.geojson$/); if(m && GEO[m[1]]) return GEO[m[1]]; }
  const r=await fetch(u); if(!r.ok) throw new Error(u); return r.json();
}
```

---

## 3. `js/app.js` — núcleo del VISOR (`index.html`)

### 3.1 Catálogo de capas: `DEF`
Array de objetos; **cada capa del visor es un objeto** con esta forma:
```js
{ k:'riesgo',                 // clave única (= nombre del geojson, salvo que use 'file')
  label:'Riesgo (zonificación)', sub:'Amenaza × exposición',
  icon:'🔴', color:'#b71c1c',
  def:false,                  // true = encendida al cargar
  capas:true,                 // (opcional) true = aparece en el panel "☰ Capas"
  lazy:true,                  // (opcional) true = se descarga solo al activarse
  file:'sensor',              // (opcional) nombre de geojson distinto a k
  build:j => L.geoJSON(j, {…}) // función que construye la capa Leaflet desde el GeoJSON
}
```

- **`DEFBYK`**: índice `{k: def}` para acceso rápido (se llena en `init()`).
- **`window.geoToggle(k, on)`**: ÚNICO controlador para encender/apagar capas.
  - Si la capa es `lazy` y aún no está construida, hace `cargar()` la primera vez.
  - Sincroniza TODOS los checkboxes con `data-k="<k>"` (panel Capas + flyouts) → no se desincronizan.
  - Llama `updateLegend()`.
- **`init()`** (IIFE async):
  1. Lee `?capa=` de la URL (admite **varias separadas por coma**, ej. `?capa=puntos_sensor_ahp,bocinas`).
  2. Construye todas las capas **no-`lazy`** y enciende las `def:true` o las pedidas por `?capa=`.
  3. Llena el panel **☰ Capas** SOLO con `CAPAS_KEYS` (capas de referencia, ver 3.4).
  4. Hace `fitBounds` a la microcuenca, añade la leyenda y la barra inferior (coordenadas+escala).

### 3.2 Leyenda dinámica
- `legendSpec` = `{ k: () => 'html…' }`. `updateLegend()` arma la leyenda con los bloques de las
  capas que están **activas en el mapa**. Para que una capa muestre leyenda, agrega su entrada en `legendSpec`.

### 3.3 Cuencas y flyouts (La Correa / El Salado)
- `window.setCuenca(nombre,on,color)`: dibuja el polígono de la subcuenca (+ su red) desde
  `cuencas_municipio.geojson`, hace zoom, y:
  - **"Quebrada de la Correa"** → al activarla abre el **flyout** de productos (12 capas). Productos
    inician **inactivos**; al desactivar la cuenca se apagan todos.
  - **"Quebrada El Salado"** → flyout con Amenaza/Exposición/Riesgo (`salado_*`).
- **Flyout** (`abrirFlyout` / `cerrarFlyout`): panel `#cuenca-flyout` (position:fixed) que sale a la
  **derecha** de la fila. Se **cierra solo** al salir del menú (timeout 260 ms; se mantiene si el
  mouse está sobre él).
- `initCuencas()` llena el submenú "Hidrología — subcuencas" (#nav-cuencas); las cuencas con flyout
  (La Correa, El Salado) llevan una flecha ▸.

### 3.4 Panel "☰ Capas" = capas de referencia municipal
`CAPAS_KEYS = ['curvas_nivel','veredas','red_hidrica_muni','red_oficial_corantioquia']`.
Solo estas aparecen en el panel ☰ Capas. Las pesadas (`curvas_nivel`, `red_hidrica_muni`,
`red_oficial_corantioquia`) son **`lazy`** (se cargan al activarlas).

### 3.5 Vista por defecto
Solo `veredas` + `rio_medellin` (`def:true`). Todo lo demás se enciende por menú/flyout.

### 3.6 Puntos de riesgo (capa `puntos_riesgo`)
- `build` = `L.layerGroup([ L.heatLayer(...), L.geoJSON(circleMarkers por color) ])`.
- Popup enriquecido con `popupRiesgo(f,idx)`: **Evento / Vereda / Sector / Descripción + foto + coordenada**.
  Lee `properties.Evento/Vereda/Sector/Descripcion/foto`; si falta Evento lo infiere del nombre
  (`inferEvento`). Foto desde `properties.foto` (ej. `img/puntos/ID1.jpg`).
- (El menú "Puntos de riesgo" abre la **página analítica** `puntos_riesgo.html`, no esta capa; la
  capa sigue disponible vía `?capa=puntos_riesgo`.)

### 3.7 Sensor en tiempo real + iconos de sensores
- `sensorMarker` (P1) NO se añade al cargar; aparece al activar la cuenca La Correa.
- `setSensorIcon(key,on)`: muestra/oculta el ícono de cada sensor (nivel/lluvia/temp/humedad) sobre P1.
  Los íconos inician **apagados** y son **clicables**.
- `leerSensor()`: hace `fetch` a `CONFIG.API_BASE + CONFIG.ENDPOINT_ULTIMA` cada `REFRESH_MS`,
  actualiza el panel `#panel-sensor` y la gráfica Chart.js. Si la API no responde → "SIN DATO".
- **Panel de detalle por sensor** (`abrirPanelSensor(key)` → `#sensor-detalle`): al hacer clic en un
  ícono activo abre un panel tipo SIATA con el valor actual + **serie de tiempo** (GET `/mediciones`,
  cache 20 s, últimos 40, filtra registros sin `fecha_hora`, ordena por `id_medicion`).
- **Sección transversal** (`renderCorte(nivelCm)`, solo sensor *nivel*): dibuja el corte del cauce
  desde `window.CORTE_P1` (MDT 2 m) — terreno gris + lámina de agua azul según `nivel_agua` — y la
  barra **N1–N4** (`nivelesN()`/`nivelActual()` a partir de `CONFIG.UMBRALES`).

### 3.8 Herramientas del mapa
- **Coordenadas** que siguen el puntero (formato G°M'S") + **escala** → barra **centrada abajo** (`.map-bottombar`).
- **"Mi ubicación"** (botón) → `map.locate`.
- **Medición** → en `js/medicion.js` (distancia = polilínea, área = polígono, con botón Borrar).

---

## 4. `js/navbar.js` — menú compartido

- `NAV` = array de 5 menús; cada uno con `items`. Tipos de ítem (flags):
  - `h:'pagina.html'` → enlace simple. `ext:true` → abre en pestaña nueva (↗).
  - `cuencas:true` → acordeón "Hidrología — subcuencas" (lo llena `initCuencas` de app.js → `#nav-cuencas`).
  - `uso:true` → acordeón "Uso del suelo" (`#nav-uso`).
  - `estacion:true` → acordeón "Estación monitoreo Quebrada La Correa" con los 4 sensores + descripción.
  - `sub:[…]` → acordeón de sub-enlaces (ej. "Otras acciones": SAT La Correa, subsidios).
- Acordeones: clase `.sat-grp` + `.sat-head` (clic alterna `.open`). CSS con **combinadores de hijo
  directo** (`.sat-grp.open > .sat-sensores`) para permitir anidación.
- La marca (escudo + "SAT · La Correa") y el `?v=` se definen aquí. **Editar el menú = editar `NAV`.**

> El árbol completo de menús está en [MENUS.md](MENUS.md).

---

## 5. `js/puntos_riesgo.js` — página analítica

- Carga `veredas` + `puntos_criticos` con `cargarGeo()` (GEO-first → offline).
- `filtrarDatos()` / `limpiarFiltro()`: filtra por vereda y tipo de riesgo, pinta puntos, llena la
  tabla y recalcula el panel estadístico.
- `calcularEstadisticas()` → tarjetas (total eventos/veredas/predominante) + **gráfico de barras**
  (por evento) y **torta** (por vereda) con Chart.js + detalle.
- Lee atributos con funciones tolerantes (`obtenerRiesgo`, `obtenerNombreVereda`, etc.) que aceptan
  varias variantes de nombre de campo. **Datos: `data/puntos_criticos.geojson`** (esquema
  `riesgo/description/vereda/sector/marker-color/image`).

---

## 6. Reglas de oro (para no romper nada)
1. **Una capa nueva en el visor** = agregar un objeto a `DEF` (con `build`) + su `data/<k>.geojson`
   + regenerar `data.js`. Si va en el panel ☰ Capas, agrégala a `CAPAS_KEYS`. Si necesita leyenda,
   agrégala a `legendSpec`.
2. **Encender/apagar capas** = SIEMPRE `window.geoToggle(k,on)` (no `addTo`/`removeLayer` sueltos).
3. **Editaste un `data/*.geojson`** = **regenera `js/data.js`** y sube `?v=` de `data.js`.
4. **Editaste un `.js`/`.css`** = sube su `?v=` en las páginas que lo usan.
5. **Exportar GeoJSON desde ArcGIS** = exportar la **capa** (no el dataSource) en **EPSG:4326**.
