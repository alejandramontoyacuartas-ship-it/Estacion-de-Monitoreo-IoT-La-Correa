// =====================================================
// GEO PORTAL GIRARDOTA — OBRAS DE MITIGACIÓN
// Reducción del riesgo · Quebrada La Correa
// Misma lógica que "Puntos críticos" (mapa + filtros + tabla + panel SIG),
// pero aplicada al inventario de obras y medidas de mitigación.
// =====================================================

const map = L.map("map", { zoomControl: true }).setView([6.3778, -75.4467], 13);

/* CAPAS BASE */
const capaOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
});
const capaSatelital = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: 'Tiles &copy; Esri' });
const capaTerreno = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  { attribution: 'Tiles &copy; Esri' });
const capaClaro = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: '&copy; OpenStreetMap &copy; CARTO' });

capaTerreno.addTo(map);

L.control.layers({
  "Mapa base": capaOSM,
  "Satelital": capaSatelital,
  "Terreno": capaTerreno,
  "Mapa claro": capaClaro
}, null, { collapsed: false }).addTo(map);

L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(map);

/* Carga datos desde window.GEO (embebido) o por fetch (servidor) */
function cargarGeo(name, url) {
  if (window.GEO && window.GEO[name]) return Promise.resolve(window.GEO[name]);
  return fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.json(); });
}

let veredasLayer = null;
let obrasLayer = null;
let obrasData = null;
let veredasData = null;
let graficoObras = null;
let graficoEstado = null;

/* Colores institucionales de la Alcaldía de Girardota 2024-2027 */
const coloresGraficos = ["#1f5a43", "#2f7a57", "#4f9a6a", "#8ccf4d", "#79b85d", "#5c8f6b", "#aacd8f", "#d7ead8"];

/* ===== Lectores de atributos (tolerantes a mayúsculas/variantes) ===== */
function obtenerNombreVereda(p = {}) {
  return (p.vereda || p.VEREDA || p.nombre_vereda || p.NOMBRE_VEREDA ||
          p.Vereda || p.nombre || p.NOMBRE || "Sin dato");
}
function obtenerObra(p = {}) {
  return (p.obra || p.OBRA || p.tipo_obra || p.TIPO_OBRA ||
          p.medida || p.MEDIDA || p.nombre || "Sin clasificar");
}
function obtenerEstado(p = {}) {
  return (p.estado || p.ESTADO || p.status || "Sin dato");
}
function obtenerSector(p = {}) {
  return (p.sector || p.SECTOR || p.sitio || p.SITIO || p.lugar || p.LUGAR || "Sin dato");
}
function obtenerDescripcion(p = {}) {
  return (p.description || p.descripcion || p.DESCRIPCION ||
          p.observacion || p.OBSERVACION || p.detalle || "Sin descripción");
}
function obtenerImage(p = {}) {
  return (p.image || p.IMAGE || p.foto || p.FOTO || "");
}
function obtenerAnio(p = {}) {
  return (p.anio || p.ANIO || p.año || p.year || p.YEAR || "");
}

/* Color del marcador según el ESTADO de la obra */
function obtenerColorPorEstado(estado = "") {
  const v = estado.toLowerCase().trim();
  if (v.includes("operaci") || v.includes("instalad") || v.includes("ejecut") || v.includes("construid") || v.includes("termin")) return "#2f7a57"; // verde: ya existe/opera
  if (v.includes("proceso") || v.includes("construcci") || v.includes("ejecuci") || v.includes("marcha")) return "#e6a817"; // ámbar: en proceso
  if (v.includes("mantenim") || v.includes("rehabilit")) return "#8d6e63";   // café: mantenimiento
  if (v.includes("propuest") || v.includes("proyect") || v.includes("diseñ") || v.includes("recomend") || v.includes("óptim") || v.includes("optim")) return "#2980b9"; // azul: propuesta
  return "#1f5a43";
}

/* ===== Capa de VEREDAS (contexto) ===== */
cargarGeo("veredas", "data/veredas.geojson")
  .then(data => {
    veredasData = data;
    veredasLayer = L.geoJSON(data, {
      style: () => ({ color: "#2f7a57", weight: 2, fillColor: "#8ccf4d", fillOpacity: 0.08 }),
      onEachFeature: (feature, layer) => {
        const nombreVereda = obtenerNombreVereda(feature.properties);
        layer.bindPopup(`<div><b>Vereda:</b> ${nombreVereda}</div>`);
        layer.bindTooltip(nombreVereda, { permanent: false, direction: "center", className: "tooltip-vereda" });
        layer.on({
          mouseover: e => e.target.setStyle({ weight: 3, color: "#1f5a43", fillOpacity: 0.18 }),
          mouseout: e => veredasLayer.resetStyle(e.target)
        });
      }
    }).addTo(map);
    if (veredasLayer.getBounds && veredasLayer.getBounds().isValid()) {
      map.fitBounds(veredasLayer.getBounds(), { padding: [20, 20] });
    }
  })
  .catch(err => console.error("Error cargando veredas:", err));

/* ===== Capa de OBRAS DE MITIGACIÓN ===== */
cargarGeo("obras_mitigacion", "data/obras_mitigacion.geojson")
  .then(data => {
    obrasData = data;
    llenarSelectorVeredas(data);
    llenarSelectorObras(data);
    limpiarEstadisticas();
    limpiarTabla();
  })
  .catch(err => console.error("Error cargando obras de mitigación:", err));

/* ===== Selectores ===== */
function llenarSelectorVeredas(data) {
  const select = document.getElementById("veredaSelect");
  if (!select) return;
  select.innerHTML = `<option value="">Seleccione vereda</option>`;
  if (!data || !Array.isArray(data.features)) return;
  const set = new Set();
  data.features.forEach(f => {
    const v = obtenerNombreVereda(f.properties).trim();
    if (v && v !== "Sin dato") set.add(v);
  });
  Array.from(set).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; select.appendChild(o); });
}

function llenarSelectorObras(data) {
  const select = document.getElementById("obraSelect");
  if (!select) return;
  select.innerHTML = `<option value="">Todas las obras</option>`;
  if (!data || !Array.isArray(data.features)) return;
  const set = new Set();
  data.features.forEach(f => {
    const o = obtenerObra(f.properties).trim();
    if (o && o !== "Sin clasificar") set.add(o);
  });
  Array.from(set).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .forEach(o => { const op = document.createElement("option"); op.value = o; op.textContent = o; select.appendChild(op); });
}

/* ===== Crear capa de marcadores ===== */
function crearCapaObras(data) {
  return L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const color = obtenerColorPorEstado(obtenerEstado(feature.properties));
      // Marcador cuadrado para distinguir las OBRAS de los puntos de riesgo (círculos)
      return L.marker(latlng, {
        icon: L.divIcon({
          className: "obra-marker",
          html: `<span style="display:block;width:16px;height:16px;background:${color};border:2px solid #fff;border-radius:3px;box-shadow:0 1px 4px rgba(0,0,0,.45);transform:rotate(45deg)"></span>`,
          iconSize: [16, 16], iconAnchor: [8, 8]
        })
      });
    },
    onEachFeature: (feature, layer) => {
      const obra = obtenerObra(feature.properties);
      const estado = obtenerEstado(feature.properties);
      const vereda = obtenerNombreVereda(feature.properties);
      const sector = obtenerSector(feature.properties);
      const descripcion = obtenerDescripcion(feature.properties);
      const anio = obtenerAnio(feature.properties);
      const image = obtenerImage(feature.properties);
      const color = obtenerColorPorEstado(estado);

      let html = `<div style="min-width:240px;">
          <b>Obra / medida:</b> ${obra}<br>
          <b>Estado:</b> <span style="color:${color};font-weight:700">${estado}</span>${anio ? ` · ${anio}` : ""}<br>
          <b>Vereda:</b> ${vereda}<br>
          <b>Sitio / sector:</b> ${sector}<br>
          <b>Descripción:</b> ${descripcion}`;
      if (image && image.trim() !== "") {
        html += `<br><br><img src="${image}" alt="Obra de mitigación" style="width:100%;max-width:240px;border-radius:8px;">`;
      }
      html += `</div>`;
      layer.bindPopup(html);
    }
  });
}

/* ===== Filtrar ===== */
function filtrarDatos() {
  const veredaSel = (document.getElementById("veredaSelect") || {}).value || "";
  const obraSel = (document.getElementById("obraSelect") || {}).value || "";
  if (!obrasData || !obrasData.features) { alert("No se han cargado las obras de mitigación."); return; }
  if (obrasLayer && map.hasLayer(obrasLayer)) map.removeLayer(obrasLayer);

  const filtrados = {
    type: "FeatureCollection",
    features: obrasData.features.filter(f => {
      const v = obtenerNombreVereda(f.properties).trim();
      const o = obtenerObra(f.properties).trim();
      return (!veredaSel || v === veredaSel.trim()) && (!obraSel || o === obraSel.trim());
    })
  };

  if (filtrados.features.length === 0) {
    generarTabla(filtrados);
    calcularEstadisticas(filtrados);
    return;
  }

  obrasLayer = crearCapaObras(filtrados).addTo(map);
  if (obrasLayer.getBounds().isValid()) map.fitBounds(obrasLayer.getBounds(), { padding: [40, 40], maxZoom: 16 });

  generarTabla(filtrados);
  calcularEstadisticas(filtrados);
}

/* ===== Limpiar ===== */
function limpiarFiltro() {
  const vs = document.getElementById("veredaSelect"); if (vs) vs.value = "";
  const os = document.getElementById("obraSelect"); if (os) os.value = "";
  if (obrasLayer && map.hasLayer(obrasLayer)) map.removeLayer(obrasLayer);
  limpiarTabla();
  limpiarEstadisticas();
  if (veredasLayer && veredasLayer.getBounds().isValid()) map.fitBounds(veredasLayer.getBounds(), { padding: [20, 20] });
}

/* ===== Tabla ===== */
function generarTabla(data) {
  const tbody = document.getElementById("tablaResultados");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!data || !data.features || data.features.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No se encontraron obras para el filtro seleccionado.</td></tr>`;
    return;
  }
  data.features.forEach((feature, i) => {
    const vereda = obtenerNombreVereda(feature.properties);
    const sector = obtenerSector(feature.properties);
    const obra = obtenerObra(feature.properties);
    const estado = obtenerEstado(feature.properties);
    const descripcion = obtenerDescripcion(feature.properties);
    const color = obtenerColorPorEstado(estado);

    const fila = document.createElement("tr");
    fila.style.cursor = "pointer";
    fila.innerHTML = `
      <td>${i + 1}</td>
      <td>${vereda}</td>
      <td>${sector}</td>
      <td>${obra}</td>
      <td><span style="color:${color};font-weight:700">${estado}</span></td>
      <td>${descripcion}</td>`;
    fila.addEventListener("click", () => {
      const g = feature.geometry;
      if (!g || !g.coordinates) return;
      if (g.type === "Point" && g.coordinates.length >= 2) {
        const [lon, lat] = g.coordinates;
        map.setView([lat, lon], 17);
        if (obrasLayer) obrasLayer.eachLayer(l => {
          if (l.feature && l.feature.geometry && l.feature.geometry.type === "Point") {
            const c = l.feature.geometry.coordinates;
            if (c[0] === lon && c[1] === lat) l.openPopup();
          }
        });
      }
    });
    tbody.appendChild(fila);
  });
}

function limpiarTabla() {
  const tbody = document.getElementById("tablaResultados");
  if (tbody) tbody.innerHTML = `<tr><td colspan="6">Aún no se ha aplicado ningún filtro.</td></tr>`;
}

/* ===== Estadísticas ===== */
function limpiarEstadisticas() {
  const to = document.getElementById("totalObras");
  const tv = document.getElementById("totalVeredas");
  const op = document.getElementById("obraPredominante");
  if (to) to.textContent = "—";
  if (tv) tv.textContent = "—";
  if (op) op.textContent = "—";
  const det = document.getElementById("estadisticasObras");
  if (det) det.innerHTML = `<div class="item-estadistica"><span>Aplica un filtro para ver las estadísticas</span></div>`;
  if (graficoObras) { graficoObras.destroy(); graficoObras = null; }
  if (graficoEstado) { graficoEstado.destroy(); graficoEstado = null; }
}

function calcularEstadisticas(data) {
  if (!data || !data.features) return;
  const conteoObras = {};
  const conteoEstado = {};
  const veredas = new Set();
  data.features.forEach(f => {
    const o = obtenerObra(f.properties);
    const e = obtenerEstado(f.properties);
    conteoObras[o] = (conteoObras[o] || 0) + 1;
    conteoEstado[e] = (conteoEstado[e] || 0) + 1;
    veredas.add(obtenerNombreVereda(f.properties));
  });

  const to = document.getElementById("totalObras");
  const tv = document.getElementById("totalVeredas");
  const op = document.getElementById("obraPredominante");
  if (to) to.textContent = data.features.length;
  if (tv) tv.textContent = veredas.size;
  let max = 0, obraMax = "—";
  Object.keys(conteoObras).forEach(k => { if (conteoObras[k] > max) { max = conteoObras[k]; obraMax = k; } });
  if (op) op.textContent = obraMax;

  mostrarDetalle(conteoEstado);
  crearGraficoObras(conteoObras);
  crearGraficoEstado(conteoEstado);
}

function mostrarDetalle(conteoEstado) {
  const cont = document.getElementById("estadisticasObras");
  if (!cont) return;
  const total = Object.values(conteoEstado).reduce((a, b) => a + b, 0);
  let html = `<div class="item-estadistica"><span>Total de obras</span><span>${total}</span></div>`;
  Object.keys(conteoEstado).forEach(k => {
    html += `<div class="item-estadistica"><span>${k}</span><span>${conteoEstado[k]}</span></div>`;
  });
  cont.innerHTML = html;
}

function crearGraficoObras(conteo) {
  const canvas = document.getElementById("graficoObras");
  if (!canvas || typeof Chart === "undefined") return;
  if (graficoObras) graficoObras.destroy();
  const labels = Object.keys(conteo);
  graficoObras = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Cantidad de obras",
        data: Object.values(conteo),
        backgroundColor: labels.map((_, i) => coloresGraficos[i % coloresGraficos.length]),
        borderColor: "#1f5a43", borderWidth: 1, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } }
    }
  });
}

function crearGraficoEstado(conteo) {
  const canvas = document.getElementById("graficoEstado");
  if (!canvas || typeof Chart === "undefined") return;
  if (graficoEstado) graficoEstado.destroy();
  const labels = Object.keys(conteo);
  graficoEstado = new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: "Obras por estado",
        data: Object.values(conteo),
        backgroundColor: labels.map(k => obtenerColorPorEstado(k)),
        borderColor: "#ffffff", borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });
}

/* ===== Estado inicial ===== */
document.addEventListener("DOMContentLoaded", () => { limpiarTabla(); limpiarEstadisticas(); });
