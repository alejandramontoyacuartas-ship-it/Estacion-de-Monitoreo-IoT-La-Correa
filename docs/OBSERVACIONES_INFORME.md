# Observaciones y limitaciones para el informe final — SAT Quebrada La Correa

Registro de salvedades técnicas que **deben incluirse en el informe final** (capítulos de
alcance/limitaciones y de resultados). Cada observación indica el dato afectado, por qué es
provisional y qué se requiere para cerrarlo.

---

## OBS-1 · Caudal de diseño (Q_Tr100 ≈ 249 m³/s) — VALOR PROVISIONAL

**Dato afectado:** caudal pico de diseño para periodo de retorno 100 años,
**Q(Tr100) ≈ 249 m³/s** (con abultamiento/*bulking* ×1,5; rango 216–332 m³/s).

**Cómo se obtuvo:** método hidrológico SCS-CN (CN III = 77,5) con lluvia de diseño derivada de
**CHIRPS** (satelital, ~5,5 km) corregida por un **factor ×1,39** (Tr100: 70,8 → **98,4 mm**). El
factor se ancló a un estudio de curvas IDF revisado por pares de la **cuenca del río Medellín**, que
documenta una subestimación estacionaria de la precipitación de hasta ~39 %.

**Por qué es una limitación:** el análisis **geoespacial** permite caracterizar la cuenca
(morfometría, tiempo de concentración, red de drenaje, amenaza por *stream power*) y estimar un
caudal de **primer orden**, pero **no reemplaza una modelación hidrológica/hidráulica formal**. El
valor:
- Depende de un producto satelital que **subestima los picos locales** de lluvia.
- Usa un **factor de corrección regional**, no una serie pluviográfica de la microcuenca.
- **No incorpora** la onda de represamiento/*dam-break* (documentada en campo) ni la mancha de
  inundación (que requiere modelo hidráulico 1D/2D).

**Qué se requiere para cerrarlo (por otro medio):**
1. **Serie de lluvia local** — IDEAM (DHIME: máximos en 24 h de estaciones Girardota/Copacabana/
   Barbosa), **SIATA** (resolución sub-diaria) o **POMCA río Aburrá** (Cornare), para reemplazar el
   factor ×1,39 por una curva IDF real.
2. **Modelación hidráulica** — HEC-RAS / IBER (con el MDT de dron/LiDAR y secciones transversales
   levantadas) para obtener el hidrograma, la mancha de inundación y validar el caudal.

**Conclusión para el informe:** el caudal de 249 m³/s se reporta como **referencia de diseño
provisional** para dimensionar el umbral de alarma del SAT; **debe validarse/recalcularse** con lluvia
local y modelación hidráulica. Es un resultado que, por la naturaleza del análisis geoespacial, **no
fue posible cerrar dentro de este trabajo** y se deja como recomendación para la fase de ingeniería
de detalle.

---

## OBS-2 · Precipitación de entrada (CHIRPS satelital)

**Dato afectado:** toda la hidrología que depende de la lluvia de diseño (caudales de La Correa y
El Salado, umbrales del SAT).

**Limitación:** la lluvia se obtuvo de **CHIRPS** (producto satelital, resolución ~5,5 km), que
**subestima los picos locales** de precipitación en cuencas pequeñas y de montaña. Por eso se aplicó
un factor de corrección regional (×1,39, ver OBS-1) y, en El Salado, un mejor ajuste **GEV** (cola
pesada, coherente con torrencialidad). Aun así son valores **preliminares**.

**Qué se requiere:** curva **IDF** construida con estaciones **IDEAM (DHIME)** / **SIATA** /
**POMCA río Aburrá** próximas a la cuenca, para reemplazar CHIRPS + factor por lluvia medida.

---

## OBS-3 · Amenaza y riesgo sin modelación hidráulica (no hay mancha de inundación)

**Dato afectado:** mapa de **amenaza** por avenida torrencial y **zonificación del riesgo**.

**Cómo se obtuvo:** la amenaza se modeló con ***stream power*** (área acumulada × pendiente
longitudinal del cauce) calibrada con 29 puntos de peligro de campo; la exposición/riesgo se delimitó
con **corredores de retiro** (buffers 30/60/100 m) sobre la red hídrica, **no** con una mancha de
inundación hidráulica.

**Limitación:** el resultado es una **amenaza relativa** (alta/media/baja por tramo) y una franja de
exposición geométrica, **no** una lámina de inundación con profundidad/velocidad ni periodo de
retorno espacializado. El *stream power* enfatiza tramos de transporte; el abanico de deposición
(Santa Clara) se elevó a ALTA por *override* de emergencias documentadas. Tampoco se modeló la
**onda de represamiento / *dam-break*** (evidenciada en campo por escarpes de socavación y aporte de
sedimentos), que es un escenario mayor aparte.

**Qué se requiere:** modelación hidráulica **1D/2D (HEC-RAS / IBER)** para la mancha real de
inundación y para el escenario de represamiento.

---

## OBS-4 · Modelo digital de elevación (ALOS PALSAR / SRTM remuestreado)

**Dato afectado:** morfometría, delimitación de cuenca, red de drenaje y pendientes del análisis
hidrológico.

**Limitación:** el MDE base del análisis hidrológico es **ALOS PALSAR RTC** (SRTM 30 m **remuestreado**
a 12,5 m), **no LiDAR**. El mayor "detalle" de 12,5 m es **interpolación de datos de 30 m**, no
exactitud real; no debe presentarse como mejora de precisión por resolución. (La sección transversal
del sensor en el geoportal sí usa un MDT de 2 m, `MDT_2m.tif`, más fino, pero puntual.)

**Qué se requiere:** **MDT de dron / LiDAR** para secciones transversales, geomorfología de detalle
y la modelación hidráulica de OBS-3.

---

## OBS-5 · Exposición poblacional (WorldPop)

**Dato afectado:** población expuesta por cuenca (La Correa ~1.701 hab; El Salado ~8.331 hab).

**Limitación:** **WorldPop** (~100 m) **subestima la población rural dispersa**. Por eso la métrica
principal de exposición es el **conteo de construcciones** (Google Open Buildings: 1.056 en La Correa),
más robusto en zona rural que el estimador poblacional.

**Qué se requiere:** validación con **SISBÉN / catastro municipal** o censo local para la población
efectivamente expuesta.

---

## OBS-6 · Umbrales de alerta del sensor (nivel) — por calibrar

**Dato afectado:** umbrales del SAT (`CONFIG.UMBRALES`: ADVERTENCIA ≥ 100 cm · CRÍTICO ≥ 130 cm ·
EVACUACIÓN ≥ 150 cm) y los niveles **N1–N4** de la sección transversal en el geoportal.

**Limitación:** son valores **provisionales del prototipo** (tomados de la configuración de la API),
no calibrados hidráulicamente. La activación por **solo nivel** no captura la dinámica torrencial.

**Qué se requiere:** calibrar los umbrales contra el **caudal de diseño** (OBS-1) y la **sección
transversal real** en P1; incorporar disparo por **tasa de ascenso (dz/dt)**, no solo por nivel; y
validar en campo la sección del sensor (dron).

---

## OBS-7 · Inventario de puntos críticos (campo) — datos por completar

**Dato afectado:** los 61 elementos expuestos (`elementos.geojson`) y los 18 puntos críticos con foto.

**Limitación:** el inventario es de **campo/observación**; las columnas **Fecha** y **Responsable** de
las inspecciones están "por registrar" y la clasificación de riesgo es **cualitativa** (multi-etiqueta:
un mismo punto puede ser represamiento + salto + movimiento en masa).

**Qué se requiere:** completar los informes de inspección de la **Secretaría de Infraestructura (GRD)**
(fecha, responsable, fotos) y consolidar la categorización.
