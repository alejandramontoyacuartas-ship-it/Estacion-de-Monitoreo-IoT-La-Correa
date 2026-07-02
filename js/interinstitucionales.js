// ============================================================
//  Inspecciones técnicas de campo — Interinstitucionales
//  Puntos de la visita (KMZ) + panel estadístico por vereda +
//  modal para ver/descargar el informe técnico asociado.
// ============================================================

// ---- Carga GEO-first (modo offline) con respaldo a fetch ----
async function cargarGeo(name, url){
  if(window.GEO && GEO[name]) return GEO[name];
  return (await (await fetch(url)).json());
}

// ---- Mapa (inicia con base Terreno, igual que puntos_riesgo) ----
const map = L.map('map').setView([6.408, -75.448], 14);
const capaOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:19});
const capaSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; Esri',maxZoom:19});
const capaTerreno = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; Esri',maxZoom:19});
const capaClaro = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; CARTO',maxZoom:19,subdomains:'abcd'});
capaTerreno.addTo(map);
L.control.layers({'Mapa base':capaOSM,'Satelital':capaSat,'Terreno':capaTerreno,'Mapa claro':capaClaro}, null, {collapsed:false}).addTo(map);

let PUNTOS = [];            // features del KMZ
let markers = {};          // punto -> marker
let grafico = null;
let selPunto = null;

// Límites veredales de fondo
cargarGeo('veredas','data/veredas.geojson').then(gj=>{
  L.geoJSON(gj,{style:{color:'#2e7d32',weight:1.5,fillColor:'#a5d6a7',fillOpacity:.10},
    onEachFeature:(f,l)=>{const nm=f.properties.Vereda||'—';
      l.bindTooltip(nm,{sticky:true,direction:'top',className:'vereda-label'});}}).addTo(map);
}).catch(()=>{});

// Puntos de la visita
cargarGeo('pt_inter','data/pt_inter.geojson').then(gj=>{
  PUNTOS = gj.features||[];
  poblarFiltro();
  render();
  const grp = L.featureGroup(Object.values(markers));
  if(grp.getLayers().length) map.fitBounds(grp.getBounds(),{padding:[40,40]});
}).catch(e=>{ document.getElementById('tablaResultados').innerHTML='<tr><td colspan="5">No se pudieron cargar los puntos.</td></tr>'; });

function poblarFiltro(){
  const sel=document.getElementById('veredaSelect');
  [...new Set(PUNTOS.map(f=>f.properties.vereda).filter(Boolean))].sort()
    .forEach(v=>sel.add(new Option(v,v)));
}

function seleccionados(){
  const v=document.getElementById('veredaSelect').value;
  return PUNTOS.filter(f=>!v || f.properties.vereda===v);
}

function markerIcon(num, sel){
  return L.divIcon({className:'', html:`<div class="pt-badge${sel?' sel':''}">${num}</div>`, iconSize:[26,26], iconAnchor:[13,13]});
}

function render(){
  // limpiar marcadores
  Object.values(markers).forEach(m=>map.removeLayer(m)); markers={};
  const sel=seleccionados();
  // marcadores
  sel.forEach(f=>{
    const p=f.properties, c=f.geometry.coordinates;
    const num=(p.punto||'').replace(/\D/g,'')||'•';
    const m=L.marker([c[1],c[0]],{icon:markerIcon(num, selPunto===p.punto)})
      .bindTooltip(`${p.punto} — ${p.vereda}`,{direction:'top'})
      .on('click',()=>abrirInforme(p));
    m.addTo(map); markers[p.punto]=m;
  });
  // tabla
  document.getElementById('cuenta').textContent=sel.length;
  document.getElementById('tablaResultados').innerHTML = sel.length ? sel.map(f=>{
    const p=f.properties;
    return `<tr onclick="irAPunto('${p.punto}')">
      <td>${(p.punto||'').replace(/\D/g,'')}</td><td>${p.punto||'—'}</td>
      <td>${p.vereda||'—'}</td><td>${p.altitud||'—'}</td>
      <td><button class="btn-ver" onclick="event.stopPropagation();abrirInformePorPunto('${p.punto}')">Ver informe</button></td></tr>`;
  }).join('') : '<tr><td colspan="5">No hay puntos para esta vereda.</td></tr>';
  renderStats(sel);
}

function renderStats(sel){
  const conteo={};
  sel.forEach(f=>{const v=f.properties.vereda||'Sin dato'; conteo[v]=(conteo[v]||0)+1;});
  const veredas=Object.keys(conteo).sort((a,b)=>conteo[b]-conteo[a]);
  const reales=veredas.filter(v=>v!=='Sin dato');
  document.getElementById('totalPuntos').textContent=sel.length;
  document.getElementById('totalVeredas').textContent=reales.length;
  document.getElementById('veredaPredominante').textContent=reales[0]||'—';
  // gráfico (paleta verde institucional)
  const VERDES=['#1f5a43','#2f7a57','#4f9a6a','#8ccf4d','#b7e08a','#d9edc4'];
  if(grafico) grafico.destroy();
  grafico=new Chart(document.getElementById('graficoVeredas').getContext('2d'),{type:'bar',
    data:{labels:veredas,datasets:[{label:'Puntos',data:veredas.map(v=>conteo[v]),
      backgroundColor:veredas.map((v,i)=>VERDES[i%VERDES.length]),borderRadius:5,maxBarThickness:42}]},
    options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}},
      maintainAspectRatio:false}});
  // detalle
  document.getElementById('estadisticasVereda').innerHTML = veredas.map(v=>
    `<div class="item-estadistica"><span>${v}</span><span>${conteo[v]}</span></div>`).join('');
}

function irAPunto(punto){
  const f=PUNTOS.find(x=>x.properties.punto===punto); if(!f) return;
  const c=f.geometry.coordinates; map.setView([c[1],c[0]],16);
  const m=markers[punto]; if(m) m.openTooltip();
  abrirInforme(f.properties);
}
function abrirInformePorPunto(punto){
  const f=PUNTOS.find(x=>x.properties.punto===punto); if(f) abrirInforme(f.properties);
}

// ---- Modal del informe ----
function abrirInforme(p){
  selPunto=p.punto; render();
  document.getElementById('rep-tit').textContent = 'Informe técnico · '+(p.punto||'');
  document.getElementById('rep-sub').innerHTML =
    `<b>Punto:</b> ${p.punto} &nbsp;·&nbsp; <b>Vereda:</b> ${p.vereda} &nbsp;·&nbsp; `
    +`<b>Ubicación:</b> ${p.ubicacion||'—'} &nbsp;·&nbsp; <b>Altitud:</b> ${p.altitud||'—'}<br>`
    +`<span style="color:#777">${p.informe_nombre||''}</span>`;
  document.getElementById('rep-frame').src = p.informe;
  document.getElementById('rep-dl').href = p.informe;
  document.getElementById('rep-open').href = p.informe;
  document.getElementById('rep-modal').classList.add('open');
}
function cerrarInforme(){
  document.getElementById('rep-modal').classList.remove('open');
  document.getElementById('rep-frame').src='';    // liberar el PDF
  selPunto=null; render();
}
document.getElementById('rep-modal').addEventListener('click',e=>{ if(e.target.id==='rep-modal') cerrarInforme(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') cerrarInforme(); });

// ---- Filtros ----
function filtrarDatos(){ render(); }
function limpiarFiltro(){ document.getElementById('veredaSelect').value=''; selPunto=null; render(); }
