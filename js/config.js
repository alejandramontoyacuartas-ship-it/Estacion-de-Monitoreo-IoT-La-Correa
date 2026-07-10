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
  // El geoportal DERIVA el estado del nivel medido contra estos umbrales.
  //   < 100 -> N1 NORMAL (verde) | 100 -> N2 ADVERTENCIA (amarillo)
  //   130   -> N3 CRÍTICO (naranja) | 150 -> N4 EVACUACIÓN (rojo)
  // ⚠️ Umbrales de DISEÑO del SAT (implementación real en campo): 150 / 250 / 350 cm,
  //   derivados de la curva de gasto de Manning con el caudal Log-Pearson III (Q Tr100 = 280 m³/s).
  //   Requieren un sensor de mayor alcance montado por encima del nivel de diseño (>~3,7 m).
  UMBRALES: {
    preventivo: 100,  // >= 100 cm -> N2 ADVERTENCIA (amarillo)
    prevencion: 130,  // >= 130 cm -> N3 CRÍTICO     (naranja)
    critico:    150   // >= 150 cm -> N4 EVACUACIÓN  (rojo)
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
