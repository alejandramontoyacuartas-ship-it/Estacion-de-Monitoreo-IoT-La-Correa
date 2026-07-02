# Resultados técnicos del análisis SIG/SAT

Resumen de los análisis que **alimentan las capas** del geoportal. Detalle completo en
`docs/Informe_SAT_LaCorrea_N_CORREA.docx` y `docs/Flujo_Metodologico_SAT.pdf`.
Proyecto fuente: ArcGIS `N_CORREA` (MDE LiDAR 2 m, EPSG:9377; export a 4326 para web).

---

## 1. Quebrada La Correa (cuenca principal del SAT)

- **Cuenca:** 856,4 ha · carácter **torrencial** (Melton 0,474) · Tc ≈ 43 min.
- **Sistema hídrico (2 cauces):** La Correa / San Andrés (8,84 km, mayor nº de emergencias) +
  Potrerito / Cedral (2,25 km, donde están los puntos de campo).
- **Caudal de diseño:** **Q(Tr100) ≈ 249 m³/s** con abultamiento (bulking) por sedimentos/bloques.
  (Valor en `js/config.js` → `CAUDAL_DISENO_M3S: 249`.)
  ⚠️ **PROVISIONAL** — lluvia CHIRPS ×1,39; debe validarse con lluvia local (IDEAM/SIATA) y modelación
  hidráulica (HEC-RAS/IBER). Ver **`docs/OBSERVACIONES_INFORME.md` → OBS-1** (limitación para el informe).
- **Zonificación de riesgo:** ALTO 39,7 ha · MEDIO 61,3 ha · BAJO 97,5 ha.
- **Elementos expuestos:** 61 puntos validados en campo (clasificados por nivel de riesgo).

### Estación de monitoreo (AHP)
- Localización multicriterio (Saaty, **CR = 0,008**). **P1 óptimo**: justo bajo la confluencia,
  capta los 2 cauces, tiempo de reacción 3,4–7,9 min. P2/P3 alternos (solo análisis).
- En el geoportal: `js/config.js` apunta el sensor a **P1** (6.407003 / −75.446880).

### Sirenas de alerta
- 3 sirenas **aguas abajo de P1** (Kernel density + MCLP + soundshed).
- Cobertura acústica: **100 % de las vidas críticas audibles** (≥ 70 dB).

---

## 2. Quebrada El Salado (cuenca de extensión, sin datos de campo)

- **Cuenca oficial POMCA río Aburrá:** 2.530 ha (termina en el Río Medellín). Melton 0,247 ·
  Gravelius 2,07 · densidad de drenaje 7,05 · red orden 5 (Strahler) · cauce 12,04 km · Tc 64,8 min.
- **Caudal (SCS-CN + lluvia de diseño GEV):**
  - CN ponderado **grupo hidrológico C**: CN(II)=74 → CN(III)=87 (húmedo).
  - **Q(Tr100): AMC II líquido ≈ 188 m³/s · AMC III + abultamiento ≈ 488 m³/s.**
  - ✅ El escenario conservador (488) **coincide con la transferencia regional (489)** → doble validación.
- **Amenaza:** ALTA 34 ha · MEDIA 365 ha · BAJA 13 ha.
- **Riesgo:** ALTO 31 ha · MEDIO 56 ha · BAJO 121 ha.

---

## 3. Insumos Google Earth Engine (GEE)

Descargados y procesados para las cuencas sin datos de campo (script `GEE_Girardota_integral.js`
en el proyecto N_CORREA).

- **CHIRPS — lluvia máxima 24 h (1981–2024):** media 42,6 mm · máx **77,2 mm (2022)**.
  - Mejor ajuste **GEV** (KS = 0,065, mejor que Gumbel 0,126; cola pesada → coherente con torrencial).
  - **Lluvia de diseño (GEV):** Tr10 = 52,5 · Tr25 = 61,6 · Tr50 = 70,0 · **Tr100 = 80,2 mm**.
  - ⚠️ CHIRPS es satelital (~5,5 km) → **subestima picos locales**; valores preliminares regionales.
    Ideal: calibrar con curva IDF de IDEAM.
- **Suelo (OpenLandMap):** 99 % Clay Loam → **grupo hidrológico C** (escorrentía alta).
- **NDVI (Sentinel-2):** media 0,68 (82 % vegetación densa, solo 3,9 % urbano/desnudo).
- **Figura:** `Frecuencia_Pmax24h_CHIRPS.png` (GEV vs Gumbel) — en el proyecto N_CORREA `docs/`.

---

## 4. Exposición por cuenca (Google Open Buildings + WorldPop)

| Cuenca | Construcciones | Área construida | Población (WorldPop 2020) |
|---|---|---|---|
| **La Correa** (856 ha) | 1.056 | 12,2 ha | ~1.701 hab |
| **El Salado** (2.530 ha) | 4.298 | 61,4 ha | ~8.331 hab |

> WorldPop (~100 m) subestima población rural dispersa → usar el **conteo de construcciones** como
> métrica principal de exposición.

---

## 5. Puntos críticos de riesgo (inventario de campo, 18 puntos)

Fuente: GeoJSON de campo de la usuaria (con foto por punto). Se muestran en `puntos_riesgo.html`
(filtrable) y como mapa de calor en el visor.

| Tipo de riesgo | nº | Color |
|---|---|---|
| Avenida Torrencial | 6 | magenta `#c832b4` |
| Movimiento en Masa | 6 | rojo `#f03c3c` |
| Inundación | 2 | cian `#32c8f0` |
| Estructural | 2 | verde `#2dc83c` |
| Socavación | 1 | amarillo `#e1fa32` |
| Hundimiento | 1 | amarillo `#e1fa32` |

- **Veredas con puntos:** Holanda Alta, La Mata, Manga Arriba, Mercedes Abrego, Portachuelo,
  San Andrés, San Diego, San Esteban, Totumo (+ 2 "Sin dato").
- Cada punto: Evento, Vereda, Sector, Descripción y **foto** (`img/puntos/IDn.jpg`).

---

## 6. Trazabilidad de capas (análisis → geoportal)

| Resultado del análisis | Capa(s) en el geoportal |
|---|---|
| Delimitación cuenca / cauces | `cuenca`, `sistema_hidrico`, `red_hidrica` |
| Amenaza / Exposición / Riesgo La Correa | `amenaza`, `exposicion`, `riesgo`, `susceptibilidad`, `zona_inundable` |
| Estación AHP / Sirenas / Soundshed | `sensor`(=`puntos_sensor_ahp`), `bocinas`, `cobertura`, `cobertura_sonido` |
| Validación de campo (61 pts) | `elementos`, `puntos_campo`, `antecedentes` |
| Inventario crítico (18 pts + foto) | `puntos_criticos`, `puntos_riesgo` |
| El Salado (POMCA + modelado) | `salado_cuenca/cauce/red/amenaza/exposicion/riesgo` |
| GEE / referencia municipal | `curvas_nivel`, `red_hidrica_muni`, `red_oficial_corantioquia`, `uso_suelo` |
