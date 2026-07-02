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

## Documentación
- README reescrito + `docs/ARQUITECTURA.md`, `MENUS.md`, `DICCIONARIO_CAPAS.md`,
  `RESULTADOS_TECNICOS.md`, `PENDIENTES.md`, este CHANGELOG.
