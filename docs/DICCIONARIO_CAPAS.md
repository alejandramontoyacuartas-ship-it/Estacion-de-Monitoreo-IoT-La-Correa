# Diccionario de datos — `data/*.geojson`

32 capas, todas en **WGS84 (EPSG:4326)**. Origen: proyecto ArcGIS **N_CORREA** (`GIRARDOTA.gdb`),
insumos GEE y datos de campo. `n` = número de features.

> Todas están embebidas en `js/data.js` (`window.GEO`). Si editas una, **regenera `data.js`**.

---

## A. Quebrada La Correa — productos del SAT (flyout de La Correa)

| Capa (`k`) | n | Geom | Campos clave | Qué es |
|---|---|---|---|---|
| `cuenca` | 1 | Polígono | Area_ha, Tipo, Nombre | Microcuenca La Correa (856 ha) |
| `microcuenca_abastecedora` | 1 | Polígono | NOMBRE_1, ABASTECE | Microcuenca abastecedora (CORANTIOQUIA) |
| `sistema_hidrico` | 2 | Línea | Tipo, Nombre_ofi, Rol_SAT, Long_km | Cauces principales (La Correa + Potrerito/Cedral) |
| `red_hidrica` | 1 | MultiLínea | — | Red hídrica unificada de la cuenca |
| `amenaza` | 3 | MultiPolígono | **Amenaza** (ALTA/MEDIA/BAJA), Area_ha | Amenaza torrencial |
| `exposicion` | 3 | Polígono | **Zona**, Exp_n | Corredor de exposición (30/60/100 m) |
| `riesgo` | 3 | MultiPolígono | **Riesgo** (ALTO/MEDIO/BAJO), Area_ha | Zonificación de riesgo |
| `susceptibilidad` | 5 | MultiPolígono | **Suscept** (Muy alta…Muy baja) | Susceptibilidad multicriterio |
| `zona_inundable` | 1 | MultiPolígono | gridcode | Mancha de inundación (HAND) |
| `elementos` | 61 | Punto | Tipo_elem, **Nivel_riesgo**, Corredor, Vereda, Amenaza_sitio | Elementos expuestos (validados en campo) |
| `puntos_campo` | 61 | Punto | **Nivel_riesgo**, Categoria, HAND_val | Puntos de campo (validación KMZ) |
| `puntos_sensor_ahp` (usa `sensor`) | 3 | Punto | **Punto** (P1/P2/P3), Prioridad, Lead_min, Score | Candidatos AHP de la estación (P1 óptimo) |
| `bocinas` | 3 | Punto | Sirena, Sitio, Rol | Sirenas de alerta (aguas abajo de P1) |
| `cobertura` | 1 | Polígono | — | Cobertura de sirenas (radio 400 m) |
| `cobertura_sonido` | 5 | MultiPolígono | **Nivel_dB**, Area_ha | Cobertura acústica (soundshed) |
| `sensor` | 3 | Punto | Punto, Prioridad, Cauce, Score, Lead_min | (archivo base de `puntos_sensor_ahp`) |

## B. Puntos críticos (página analítica + capa de calor)

| Capa | n | Geom | Campos | Qué es |
|---|---|---|---|---|
| `puntos_criticos` | 18 | Punto | id, **riesgo**, description, vereda, sector, marker-color, image | 18 puntos críticos finales (usa `puntos_riesgo.html`). Fotos en `img/puntos/IDn.jpg` |
| `puntos_riesgo` | 18 | Punto | Nombre, **Evento**, Descripcion, Vereda, Sector, color, foto | Mismos 18, esquema para la capa de calor del visor (popup enriquecido) |
| `antecedentes` | 61 | Punto | Nombre, **Nivel_riesgo** | Eventos antecedentes (menú "Emergencias atendidas") |

> `puntos_criticos` y `puntos_riesgo` son los **mismos 18 puntos** con distinto esquema de campos:
> `puntos_criticos` lo usa la página analítica (`puntos_riesgo.js`); `puntos_riesgo` lo usa la capa
> de calor del visor (`app.js`). Las fotos están en `img/puntos/ID1.jpg … ID18.jpg`.

## C. Quebrada El Salado (flyout de El Salado)

| Capa | n | Geom | Campos | Qué es |
|---|---|---|---|---|
| `salado_cuenca` | 1 | Polígono | IDMIC, NMG, CODIGO | Cuenca El Salado (POMCA, 2.530 ha) |
| `salado_cauce` | 1 | Línea | — | Cauce principal |
| `salado_red` | 1207 | Línea | arcid, grid_code | Red de drenaje |
| `salado_amenaza` | 3 | MultiPolígono | **Amenaza** | Amenaza torrencial |
| `salado_exposicion` | 3 | Polígono | **Zona** | Corredor de exposición |
| `salado_riesgo` | 3 | MultiPolígono | **Riesgo** | Zonificación de riesgo |

## D. Capas de referencia municipal (panel ☰ Capas)

| Capa | n | Geom | Campos | Qué es | Lazy |
|---|---|---|---|---|---|
| `veredas` | 25 | Polígono | Layer/Vereda | Límites veredales de Girardota | no (default ON) |
| `curvas_nivel` | 2014 | Línea | **Contour**, Indice | Curvas de nivel 5 m (1285–2715 m) | **sí** |
| `red_hidrica_muni` | 3942 | Línea | arcid, grid_code | Red hídrica municipal | **sí** |
| `red_oficial_corantioquia` | 651 | Línea | NMG | Red hídrica oficial CORANTIOQUIA | **sí** |

## E. Otras capas base / municipales

| Capa | n | Geom | Campos | Qué es |
|---|---|---|---|---|
| `rio_medellin` | 32 | Línea | NMG (='Medellin') | Río Medellín (receptor) — default ON |
| `cuencas_municipio` | 22 | MultiPolígono | **Nombre**, Area_ha | Subcuencas del municipio (menú Hidrología) |
| `red_subcuencas` | 16 | MultiLínea | **Nombre** | Red hídrica por subcuenca (se activa con cada cuenca) |
| `uso_suelo` | 6 | MultiPolígono | **Cobertura**, AreaHa | Coberturas/uso del suelo (6 clases, menú Uso del suelo) |

---

## Notas de mantenimiento
- **Regenerar un GeoJSON desde ArcGIS:** exportar la **capa** (respeta el definition query), NO el
  dataSource, proyectando a EPSG:4326 con `FeaturesToJSON ... GEOJSON`.
- **Tras editar cualquier `data/*.geojson`:** regenerar `js/data.js` (ver PENDIENTES.md).
- Capas pesadas (`curvas_nivel`, `red_hidrica_muni`) ya vienen **simplificadas** para web.
