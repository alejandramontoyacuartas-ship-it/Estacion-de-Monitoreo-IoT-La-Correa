# Mapa de menús y navegación

Estructura del menú superior (definida en `js/navbar.js` → array `NAV`). Es **compartida por todas
las páginas**. Esquema basado en el diagrama de la usuaria.

```
GEOPORTAL (index.html)
│
├─ 1. CONOCIMIENTO DEL RIESGO
│   ├─ Puntos de riesgo ───────────────► puntos_riesgo.html  (página analítica: filtros + mapa + tabla + dashboard)
│   ├─ Hidrología — subcuencas ───────── acordeón #nav-cuencas (22 subcuencas del municipio)
│   │      ├─ Quebrada de la Correa ▸ ── activa cuenca + FLYOUT de 12 productos (ver abajo)
│   │      ├─ Quebrada El Salado ▸ ───── activa cuenca + FLYOUT (Amenaza/Exposición/Riesgo)
│   │      └─ (otras 20 subcuencas) ──── activan su polígono + red hídrica
│   ├─ Uso del suelo ─────────────────── acordeón #nav-uso (6 coberturas, una por clase)
│   └─ Inspecciones técnicas ─────────► informes.html  (⚠ pendiente)
│
├─ 2. ESCENARIOS DE RIESGO Y CAMBIO CLIMÁTICO
│   ├─ Escenarios de Riesgos ─────────► escenarios.html  (26 tarjetas en 6 categorías)
│   └─ Cambio Climático ──────────────► cambio_climatico.html
│
├─ 3. REDUCCIÓN DEL RIESGO
│   ├─ Obras de mitigación ───────────► #  (PENDIENTE definir destino)
│   ├─ Otras acciones (acordeón)
│   │      ├─ SAT La Correa ──────────► index.html?capa=puntos_sensor_ahp,bocinas  (P1 + sirenas)
│   │      ├─ Subsidio de arriendo ───► #  (PENDIENTE)
│   │      └─ Subsidio de materiales ─► #  (PENDIENTE)
│   └─ Cobertura de alertas ──────────► index.html?capa=cobertura
│
├─ 4. MONITOREO Y ALERTAS
│   ├─ Estaciones de monitoreo (SIATA) ↗ ─► https://geoportal.siata.gov.co/  (pestaña nueva)
│   └─ Estación monitoreo Quebrada La Correa (acordeón) ── sensores de P1:
│          Nivel de la quebrada · Sensor de lluvia · Temperatura · Humedad
│          (cada interruptor muestra el ícono del sensor sobre P1 en el visor)
│
└─ 5. MANEJO DE DESASTRES
    ├─ Emergencias atendidas ─────────► index.html?capa=antecedentes
    └─ Cuerpo de Bomberos Voluntarios de Girardota (CBVG) ─► #  (PENDIENTE)
```

---

## FLYOUT "Productos · La Correa" (12 capas)
Aparece a la derecha al activar **Quebrada de la Correa**. Todos inician **apagados**; el usuario
activa lo que quiera ver. Capas (claves `DEF`):

`microcuenca_abastecedora`, `zona_inundable`, `exposicion`, `riesgo`, `puntos_campo`,
`susceptibilidad`, `elementos`, `puntos_sensor_ahp`, `bocinas`, `sistema_hidrico`, `amenaza`,
`cobertura`.

## FLYOUT "Productos · El Salado" (3 capas)
`salado_amenaza` (⚠ Amenaza), `salado_exposicion` (👥 Exposición), `salado_riesgo` (🔴 Riesgo).

---

## Panel "☰ Capas" (botón en el visor) — capas de referencia municipal
Solo 4: **Curvas de Nivel 5 m**, **Límites Veredales_Girardota**, **Red Hídrica Muni**,
**Red Oficial CORANTIOQUIA**. (Las 3 de red/curvas se cargan bajo demanda.)

## Vista por defecto del visor
Al abrir `index.html` solo se ven **Veredas** + **Río Medellín**. El resto se activa por menú.

---

## Parámetros `?capa=` soportados por `index.html`
Encienden capas al cargar (separar varias con coma). Claves válidas = las de `DEF` (ver
[DICCIONARIO_CAPAS.md](DICCIONARIO_CAPAS.md)). Ejemplos en uso:
- `?capa=puntos_sensor_ahp,bocinas` (SAT La Correa)
- `?capa=cobertura` (cobertura de sirenas)
- `?capa=antecedentes` (emergencias atendidas)
- `?capa=puntos_riesgo` (mapa de calor de puntos críticos — la capa, no la página)

---

## Pendientes de enlazar (marcadores `#`)
`Obras de mitigación`, `Subsidio de arriendo`, `Subsidio de materiales`, `CBVG`.
Definir si van a: página propia, PDF, o sitio externo de la Alcaldía. Ver [PENDIENTES.md](PENDIENTES.md).
