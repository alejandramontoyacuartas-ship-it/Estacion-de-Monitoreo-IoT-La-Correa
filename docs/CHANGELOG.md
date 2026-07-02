# Historial de avance — Geoportal La Correa

Orden cronológico de lo construido (para entender el punto de avance).

## Base
- Visor `index.html` con capas de N_CORREA, panel del sensor en tiempo real y leyenda.
- Encabezado y pie institucionales (escudo + pie de la Alcaldía de Girardota).

## Estructura y datos
- Catálogo de capas `DEF` + controlador único `geoToggle` (sincroniza panel ☰ Capas y flyouts).
- **`data.js`**: todas las capas embebidas → el geoportal abre por **doble clic** (offline).
- Panel ☰ Capas reconvertido a **referencia municipal** (curvas de nivel 5 m, límites veredales,
  red hídrica muni, red oficial CORANTIOQUIA), con carga perezosa de las pesadas.
- Vista por defecto mínima: Veredas + Río Medellín.

## Cuencas y flyouts
- Submenú "Hidrología — subcuencas" (22 cuencas del municipio).
- **El Salado**: al activar la cuenca → flyout/panel con Amenaza/Exposición/Riesgo (análisis F0–F9).
- **La Correa**: al activar la cuenca → flyout de 12 productos a la derecha; inician apagados; se
  cierra solo al salir del menú.

## Análisis (insumos)
- Procesados insumos **GEE** (CHIRPS, WorldPop, Open Buildings, suelo, NDVI).
- **Caudal El Salado** recalculado (SCS-CN + lluvia de diseño GEV; Tr100 ≈ 488 m³/s, validado).
- **Exposición** por cuenca (construcciones + población).

## Herramientas del mapa
- Coordenadas que siguen el puntero (G°M'S") + escala → barra **centrada** abajo.
- Botón **"Mi ubicación"** (geolocalización).
- **Medición** propia (distancia = polilínea, área = polígono, botón Borrar).

## Menús (reorganización según diagrama de la usuaria)
- 5 menús: Conocimiento · Escenarios de Riesgo y Cambio Climático · Reducción · Monitoreo · Manejo.
- **Escenarios de Riesgos** (`escenarios.html`): 26 tarjetas en 6 categorías (Geológicos,
  Hidrológicos, Climáticos, Ambientales, Tecnológicos, Salud Pública) con iconos por categoría.
- **Cambio Climático** (`cambio_climatico.html`).
- **Reducción** → Otras acciones (SAT La Correa, subsidios) + Cobertura de alertas.
- **Monitoreo** → Estaciones SIATA (externo) + Estación Quebrada La Correa (sensores P1).
- **Manejo** → Emergencias atendidas + CBVG.

## Puntos de riesgo
- "Puntos de riesgo" inició como mapa de calor del KMZ de campo (50 pts, solo nombre).
- Se reemplazó por el **inventario final de 18 puntos críticos** (GeoJSON de la usuaria con foto,
  tipo, vereda, sector, descripción).
- Popup enriquecido (Evento/Vereda/Sector/Descripción + foto) + mapa de calor + puntos por color.
- Integrada la **página analítica `puntos_riesgo.html`** (filtros vereda/riesgo + tabla + dashboard
  con gráficos de barras y torta) a partir del trabajo de la usuaria.

## Estación de monitoreo — paneles por sensor (2026-07-01)
- Estación renombrada a **"Estación de Monitoreo La Correa"** (config + navbar).
- Íconos de sensor **apagados por defecto**; al activarlos aparecen sobre P1 y son **clicables**.
- Clic en un ícono → **panel de detalle** tipo SIATA (`#sensor-detalle`) con valor actual +
  **serie de tiempo** (Chart.js, GET `/mediciones`, últimos 40; descarta registros de prueba
  sin `fecha_hora`, ordena por `id_medicion`).
- **Sección transversal en P1** (solo sensor *Nivel de la quebrada*):
  - Perfil del cauce extraído del **MDT 2 m** (`MDT_2m.tif`, EPSG:9377) sobre una línea
    perpendicular al cauce en P1 (±25 m, paso 0.5 m → 101 puntos). Valle en "V";
    thalweg ≈ 1551.7 m s.n.m.
  - Terreno (gris) + **lámina de agua (azul)** dibujada según `nivel_agua` en vivo.
  - Barra **N1–N4** con el nivel actual resaltado (umbrales derivados de `CONFIG.UMBRALES`
    → N1<10, N2 10–20, N3 20–40, N4 >40 cm; *pendiente calibración oficial del equipo*).
  - Dato embebido en **`js/corte_p1.js`** (funciona offline / file://); fuente `data/corte_p1.json`.

## Uniformidad de páginas heredadas (2026-07-01)
- **`informes.html`** (Inspecciones técnicas): reformateado con `puntos_riesgo.css` (formato
  institucional), navbar v20 + pie. Tabla reescrita con los **campos reales** de `elementos.geojson`
  (Elemento, Categoría, Amenaza, Nivel de riesgo por `Niv_num`, Corredor) — antes usaba columnas
  inexistentes y se veía sin estilo.
- **`dashboard.html`**: modernizado al formato del geoportal + **monitoreo en vivo desde la API (P1)**;
  cifras corregidas (856,4 ha, 61 elementos, sensor P1 CR 0,008, zonificación 39,7/61,3/97,5 ha,
  elementos por nivel 13/4/17/24/3, lluvia GEV Tr100 80,2 mm). Eliminado el "DATOS SIMULADOS".
- **`monitoreo.html`**: consola de red de monitoreo con navbar compartido; estación **P1 con API real**
  (nivel/temp/humedad/lluvia + histórico + CSV), sirenas activadas por estado CRÍTICO real,
  umbrales de `CONFIG.UMBRALES` (PREVENCIÓN ≥10 · CRÍTICO ≥20). Eliminada la simulación.

## Tablero (dashboard) — datos y cartografía de N_CORREA (2026-07-01)
- Menú: nuevo ítem **"Tablero de lectura"** en Monitoreo y Alertas → `dashboard.html` (navbar v21).
- Quitada la sección "Flujo metodológico".
- **Datos corregidos al análisis real de La Correa:** lluvia de diseño **CHIRPS ×1,39 = 98,4 mm**
  (antes tenía 80,2 mm, que es de El Salado) · SCS CN III 77,5 · Qp 249 m³/s · Producto A capta ~89 %.
  Morfometría (Kc 2,27 · Dd 7,12 · Lc 8,32 km · pend. cauce 14,6% · Melton 0,472 · Tc 43 min) verificada
  contra el modelo DTM12 corregido.
- **Cartografía del análisis:** galería reemplazada por los mapas reales `docs/01–06`
  (sistema hídrico, amenaza, exposición, riesgo, susceptibilidad, productos SAT); antes usaba
  mapas de `img/` del proyecto viejo (12,5 m).

## Inspecciones técnicas Interinstitucionales (2026-07-01)
- Nueva página **`interinstitucionales.html`** (clon del modelo de `puntos_riesgo`): mapa de visitas
  (base Terreno), panel estadístico por vereda, tabla, y **modal** que muestra/descarga el informe
  técnico al hacer clic en un punto. En el menú **Conocimiento del riesgo → "Inspecciones técnicas de
  campo — Interinstitucionales"** (navbar v22).
- Datos: **`data/pt_inter.geojson`** — **actualizado a 18 puntos** (KML `puntos_grd_girardota_P1_P18`);
  embebido en `js/pt_inter.js`. Veredas: San Andrés 3, Mercedes Ábrego 2, El Socorro 2, Potreritos 2,
  La Matica 2, El Totumo 1, San Esteban 1, Manga Arriba 1, Sin dato 4.
- **8 informes** en `informes/`, cada punto apunta al suyo según el prefijo del número del archivo
  (convención "1-10…", "11.", "12.", "13.", "14-15", "16.", "17.", "18."): p1-10 IT2307-8323 ·
  p11 DAGRAN Socorro Rancho Alegre · p12 160AN-IT2602-1057 Totumo · p13 160AN-COI2410-24668 ·
  p14-15 160AN-COI2610-28891 · p16 AMVA Colcerámica · p17 AMVA San Esteban · p18 AMVA Manga Arriba.
- ArcGIS: capa **`pt_inter_1`** en `GIRARDOTA.gdb` (18 puntos, 4326) añadida al mapa de N_CORREA.
- Parser reproducible: `scripts/parse_kml_interinstitucionales.py` (KML→GeoJSON + copia de PDF + mapeo punto→informe).

## Documentación
- README reescrito + `docs/ARQUITECTURA.md`, `MENUS.md`, `DICCIONARIO_CAPAS.md`,
  `RESULTADOS_TECNICOS.md`, `PENDIENTES.md`, este CHANGELOG.
