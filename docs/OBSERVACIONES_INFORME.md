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
