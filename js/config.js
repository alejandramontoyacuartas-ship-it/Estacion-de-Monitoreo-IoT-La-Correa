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

  // ---- Umbrales de alerta (cm de nivel_agua) ----
  // Tomados de /configuracion-alertas de la API. El geoportal DERIVA el estado
  // del nivel medido contra estos umbrales, porque el campo estado_alerta crudo
  // es inconsistente en el prototipo (mezcla códigos "1".."4" y textos de prueba).
  UMBRALES: {
    preventivo: 10,   // >= 10 cm  -> PREVENCIÓN (naranja)
    critico:    20    // >= 20 cm  -> CRÍTICO    (rojo)
  },

  // ---- Estación de monitoreo (Producto A) ----
  SENSOR: {
    lat: 6.407003,
    lon: -75.446880,
    nombre: "Estación de Monitoreo La Correa"
  },

  // ---- Umbral hidrológico de referencia ----
  CAUDAL_DISENO_M3S: 249,

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
