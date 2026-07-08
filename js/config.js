// =====================================================================
//  CONFIGURACIÓN DEL GEOPORTAL — SAT Quebrada La Correa (Girardota)
//  ⚠️ Aquí NO van credenciales de base de datos. Solo URLs públicas.
//     El navegador lee SIEMPRE la API REST, nunca PostgreSQL directo.
// =====================================================================
const CONFIG = {
  // ---- API de lecturas IoT (servicio en Render) ----
  // Cambia ENDPOINT_ULTIMA a la ruta REAL que devuelva la última medición en JSON.
  // Si abres por el proxy local (scripts/servidor_proxy.py, puerto 8080) usa "/api"
  // (reenvía a la API y evita CORS). En Live Server o producción usa la URL directa
  // (que requiere CORS habilitado en la API).
  API_BASE:        (typeof location !== "undefined" && location.port === "8080")
                     ? "/api"
                     : "https://iot-trabajo.onrender.com",
  ENDPOINT_ULTIMA: "/mediciones/ultima",        // ruta REAL confirmada (FastAPI)
  ENDPOINT_MAPA:   "/mapa",                      // GeoJSON con TODAS las mediciones (punto P1) — fuente del tablero
  REFRESH_MS:      10000,                        // cada cuántos ms se relee la API

  // ---- Estado de conexión REAL del sensor ----
  // Se considera CONECTADO si están llegando lecturas nuevas (el id_medicion crece)
  // dentro de esta ventana. Si el último dato quedó estático/viejo => DESCONECTADO.
  // Así el panel muestra la VERDAD y no un "Conectado" falso con datos de hace días.
  CONEXION_MAX_MIN: 15,

  // ---- Umbrales de alerta (cm de nivel_agua) ----
  // Tomados de /configuracion-alertas de la API. El geoportal DERIVA el estado
  // del nivel medido contra estos umbrales, porque el campo estado_alerta crudo
  // es inconsistente en el prototipo (mezcla códigos "1".."4" y textos de prueba).
  // Umbrales de alerta en cm de lámina sobre el lecho seco, derivados de la
  // curva de gasto (Manning n=0,05, S=8%) en la sección de P1 con los caudales
  // de diseño Log-Pearson III (Q Tr100 = 280 m³/s). Escala progresiva (4 niveles):
  //   < 150  -> N1 NORMAL (verde) | 150 -> N2 PRECAUCIÓN (amarillo)
  //   250    -> N3 PREVENCIÓN (naranja) | 350 -> N4 CRÍTICO (rojo, ~Tr100 = evacuación)
  // ⚠️ El sensor debe montarse por encima de ~3,7 m (nivel de diseño + borde libre).
  // Además del umbral de nivel, el SAT dispara por TASA DE ASCENSO (dz/dt) para la alerta temprana.
  UMBRALES: {
    preventivo: 150,   // >= 150 cm -> N2 PRECAUCIÓN (amarillo)
    prevencion: 250,   // >= 250 cm -> N3 PREVENCIÓN (naranja)
    critico:    350    // >= 350 cm -> N4 CRÍTICO    (rojo)
  },

  // ---- Estación de monitoreo (Producto A) ----
  SENSOR: {
    lat: 6.407003,
    lon: -75.446880,
    nombre: "Estación de Monitoreo La Correa"
  },

  // ---- Umbral hidrológico de referencia ----
  // Caudal de diseño Tr 100 (Log-Pearson III + SCS-CN, con bulking ×1,5 por carga de sedimentos).
  CAUDAL_DISENO_M3S: 280,

  // ---- Mapeo de nombres de campos que llegan de la API ----
  // Ajusta la derecha a como vengan en tu JSON (tabla tbl_mediciones).
  CAMPOS: {
    nivel:      "nivel_agua",
    fluvial:    "nivel_fluvial",
    temp:       "temperatura",
    humedad:    "humedad",
    lluvia:     "esta_lloviendo",
    estado:     "estado_alerta",
    fecha:      "fecha_hora"
  }
};
