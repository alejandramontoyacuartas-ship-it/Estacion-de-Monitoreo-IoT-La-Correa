// =====================================================================
//  GEOPORTAL SAT — Quebrada La Correa | VISOR DE CAPAS
//  Mapa grande + menú de capas (interruptores) + sensor en tiempo real
// =====================================================================
// URL original al cargar (antes de que el manejo de ?capa= la limpie con replaceState).
// Sirve para saber si entramos en contexto de "sensores de La Correa".
window._initSearch = location.search;
const C_RIESGO={Critico:'#8B0000',Alto:'#E24B4A',Medio:'#EF9F27',Bajo:'#FFE13C',Marginal:'#9a9a92',ALTO:'#E24B4A',MEDIO:'#EF9F27',BAJO:'#FFE13C'};
const C_NIVEL={ALTA:'#E24B4A',MEDIA:'#EF9F27',BAJA:'#FFE13C'};
const C_SUSC={'Muy alta':'#c80000','Alta':'#ff7800','Media':'#ffe146','Baja':'#aad278','Muy baja':'#5aaa5a'};
const C_SENSOR={'P1':'#00d200','P2':'#ff8c00','P3':'#e600e6'};
const C_DB={'>=90 dB muy alta':'#b40000','80-90 dB alta':'#f05a00','70-80 dB audible':'#ffbe00','60-70 dB marginal':'#96c8ff','<60 dB insuficiente':'#d2d2d2'};
const C_COB={'Tejido urbano continuo':'#c80000','Tejido urbano discontinuo':'#f5966e','Territorios agrícolas':'#f5de82','Bosques':'#378c46','Aguas continentales':'#468ce6','Tierras desnudas y degradas':'#966e46'};
// Ícono estación de nivel (estilo SIATA: círculo con olas) — color según estado
const iconNivel=(color='#2e9e57')=>L.divIcon({className:'',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-15],
  html:`<svg width="34" height="34" viewBox="0 0 34 34" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">
    <circle cx="17" cy="17" r="14" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
    <path d="M7 14 q2.5 -3 5 0 t5 0 t5 0 t5 0" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <path d="M7 19 q2.5 -3 5 0 t5 0 t5 0 t5 0" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <path d="M7 24 q2.5 -3 5 0 t5 0 t5 0 t5 0" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  </svg>`});
const ICON_NIVEL=iconNivel();
// Ícono de cámara SIATA: se coloca al lado (derecha) del sensor de nivel; clic → abre la foto SIATA
const iconCamara=()=>L.divIcon({className:'',iconSize:[24,24],iconAnchor:[-15,10],popupAnchor:[0,-8],
  html:'<div class="cam-ico" title="Ver cámara SIATA">📷</div>'});
// Visor flotante de la cámara SIATA (dentro del geoportal). Clic fuera de la ventana → se cierra.
function cerrarCamara(){ const m=document.getElementById('cam-modal'); if(m) m.classList.remove('open'); }
window.abrirCamaraSiata=function(url,nombre){
  let m=document.getElementById('cam-modal');
  if(!m){
    m=document.createElement('div'); m.id='cam-modal'; m.className='cam-modal';
    m.innerHTML='<div class="cam-box" role="dialog" aria-label="Cámara SIATA">'
      +'<div class="cam-head"><span id="cam-title"></span><button class="cam-x" title="Cerrar">✕</button></div>'
      +'<div class="cam-imgwrap"><span class="cam-loading">Cargando imagen…</span><img id="cam-img" alt="Cámara SIATA" style="display:none"></div>'
      +'<div class="cam-foot"><span>Última foto de la cámara SIATA</span> · <a id="cam-link" target="_blank" rel="noopener">abrir original ↗</a></div>'
      +'</div>';
    document.body.appendChild(m);
    // cerrar al hacer clic FUERA de la caja (en el fondo) o en la X, o con Esc
    m.addEventListener('click',e=>{ if(e.target===m || e.target.classList.contains('cam-x')) cerrarCamara(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') cerrarCamara(); });
    const im=m.querySelector('#cam-img'), ld=m.querySelector('.cam-loading');
    im.addEventListener('load',()=>{ im.style.display='block'; ld.style.display='none'; });
    im.addEventListener('error',()=>{ ld.textContent='No se pudo cargar la imagen de la cámara.'; im.style.display='none'; ld.style.display='block'; });
  }
  m.querySelector('#cam-title').textContent='📷 '+nombre;
  const im=m.querySelector('#cam-img'), ld=m.querySelector('.cam-loading');
  im.style.display='none'; ld.style.display='block'; ld.textContent='Cargando imagen…';
  im.src=url+'?t='+Date.now();                       // cache-buster: trae la última foto
  m.querySelector('#cam-link').href=url;
  m.classList.add('open');
};
// Ícono estación pluviométrica (gota en círculo) — color por defecto morado
const iconLluvia=(color='#5e35b1')=>L.divIcon({className:'',iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-14],
  html:`<svg width="32" height="32" viewBox="0 0 32 32" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">
    <circle cx="16" cy="16" r="13" fill="${color}" stroke="#ffffff" stroke-width="2.4"/>
    <path d="M16 7 C12 12.5 10 15.2 10 18 a6 6 0 0 0 12 0 C22 15.2 20 12.5 16 7 Z" fill="#ffffff"/>
  </svg>`});
const C_ANTEC={'1_Critico_emergencia':'#7e1fae','2_Alto_potencial':'#E24B4A','3_MedioAlto_estabilizado':'#EF9F27','4_Medio_no_inmediato':'#FFE13C','5_Bajo_recuperacion':'#2e9e57'};
// Popup de una estación de nivel SIATA (con enlace al geoportal SIATA)
function popupSiata(p){
  return `<div style="min-width:210px;font-size:12.5px;line-height:1.5">
    <b style="color:#0277bd">Estación ${p.codigo} · SIATA</b><br>
    <b>${p.nombre}</b><br>
    <b>Subcuenca:</b> ${p.subcuenca||'—'}<br>
    <b>Vereda:</b> ${p.vereda||'—'} · ${p.municipio||''}<br>
    <b>Coordenadas:</b> ${p.lat}, ${p.lon}
    <a href="${p.url}" target="_blank" rel="noopener" style="display:block;margin-top:8px;text-align:center;background:#0277bd;color:#fff;padding:7px 10px;border-radius:7px;text-decoration:none;font-weight:700">Ver en el geoportal SIATA ↗</a>
  </div>`;
}
// ---- Resaltar la microcuenca (cuencas_municipio) del sensor de nivel al que se le da clic ----
let _mcHi=null;
function _pipGeom(lon,lat,geom){
  const rings = geom.type==='Polygon' ? [geom.coordinates] : geom.type==='MultiPolygon' ? geom.coordinates : [];
  for(const poly of rings){ const ring=poly[0]; let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){ const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>lat)!==(yj>lat)) && (lon < (xj-xi)*(lat-yi)/(yj-yi)+xi)) inside=!inside; }
    if(inside) return true; }
  return false;
}
async function resaltarMicrocuenca(lat,lon){
  let gj=(window.GEO&&window.GEO.cuencas_municipio)||null;
  if(!gj){ try{ gj=await (await fetch('data/cuencas_municipio.geojson',{cache:'force-cache'})).json(); }catch(e){ return; } }
  let feat=null; for(const f of gj.features){ if(f.geometry&&_pipGeom(lon,lat,f.geometry)){ feat=f; break; } }
  if(_mcHi){ map.removeLayer(_mcHi); _mcHi=null; }
  if(!feat) return;
  _mcHi=L.geoJSON(feat,{style:{color:'#0277bd',weight:2.6,fillColor:'#29b6f6',fillOpacity:.20,dashArray:'5 3'}}).addTo(map);
  _mcHi.bringToBack();
  const nom=(feat.properties&&feat.properties.Nombre)||'Microcuenca';
  _mcHi.bindTooltip('Microcuenca: '+nom,{sticky:true,direction:'top'});
}
window.limpiarMicrocuenca=function(){ if(_mcHi){ map.removeLayer(_mcHi); _mcHi=null; } };
const nivelDe=z=>z&&z.startsWith('ALTA')?'ALTA':z&&z.startsWith('MEDIA')?'MEDIA':'BAJA';
// Carga una capa: primero busca los datos incrustados (window.GEO, para abrir por doble clic / file://),
// y si no existen hace fetch http (Live Server / servidor).
async function cargar(u){
  if(window.GEO){ const m=u.match(/([^/]+)\.geojson$/); if(m && GEO[m[1]]) return GEO[m[1]]; }
  const r=await fetch(u); if(!r.ok) throw new Error(u); return r.json();
}
function pop(props,t){let h=`<b>${t||''}</b><br>`;for(const k in props){if(props[k]!==null&&props[k]!=='')h+=`${k}: ${props[k]}<br>`;}return h;}
// --- Popup enriquecido para Puntos de riesgo (Evento/Vereda/Sector/Descripción + foto) ---
function inferEvento(n){ n=(n||'').toLowerCase();
  if(/torrencial|avenida|creciente|qda|quebrad/.test(n)) return 'Avenida torrencial';
  if(/inundaci/.test(n)) return 'Inundación';
  if(/socav|banca/.test(n)) return 'Socavación / pérdida de banca';
  if(/erosi/.test(n)) return 'Erosión';
  if(/reptaci|movim|desliz|inestab|talud|\bmm\b/.test(n)) return 'Movimiento en masa';
  return 'Punto de riesgo';
}
function popupRiesgo(f,idx){ const p=f.properties||{}, c=f.geometry.coordinates;
  const foto=p.foto||('img/puntos/'+(idx+1)+'.jpg');
  return '<div class="pr-pop">'
    +'<div><b>Evento:</b> '+(p.Evento||inferEvento(p.Nombre))+'</div>'
    +'<div><b>Vereda:</b> '+(p.Vereda||'—')+'</div>'
    +'<div><b>Sector:</b> '+(p.Sector||'—')+'</div>'
    +'<div><b>Descripción:</b> '+(p.Descripcion||p.Nombre||'—')+'</div>'
    +'<div class="pr-coord">📍 '+c[1].toFixed(6)+', '+c[0].toFixed(6)+'</div>'
    +'<img class="pr-foto" src="'+foto+'" alt="foto del punto" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">'
    +'<div class="pr-nofoto" style="display:none">📷 Foto pendiente</div>'
    +'</div>';
}

// ---------- Mapa + mapas base ----------
const map=L.map('map').setView([6.408,-75.448],13);
const baseOSM=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19});
const baseSat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'© Esri',maxZoom:19});
const baseTerreno=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'© OpenTopoMap',maxZoom:17,subdomains:'abc'});
const baseClaro=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{attribution:'© CARTO',maxZoom:19,subdomains:'abcd'});
baseOSM.addTo(map);
L.control.layers({'Mapa base':baseOSM,'Satelital':baseSat,'Terreno':baseTerreno,'Mapa claro':baseClaro},null,{position:'topright',collapsed:false}).addTo(map);
// ocultar etiquetas de vereda al alejar (evita amontonamiento)
function vlabels(){const m=document.getElementById('map');if(m)m.classList.toggle('hide-vlabels',map.getZoom()<12);}
map.on('zoomend',vlabels); vlabels();

// ===== Herramientas del mapa =====
// Coordenadas en grados-minutos-segundos
function toDMS(v,pos,neg){
  const dir=v>=0?pos:neg; v=Math.abs(v);
  const d=Math.floor(v); let mf=(v-d)*60, m=Math.floor(mf), s=Math.round((mf-m)*60);
  if(s===60){s=0;m++;} if(m===60){m=0;}
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"${dir}`;
}
// Botón "Mi ubicación" (geolocalización del navegador)
const ctlLoc=L.control({position:'topleft'});
ctlLoc.onAdd=function(){
  const b=L.DomUtil.create('button','geo-tool-btn'); b.title='Mi ubicación';
  b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e6b3f" stroke-width="2.2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22.5" y2="12"/></svg>';
  L.DomEvent.disableClickPropagation(b);
  b.onclick=()=>map.locate({setView:true,maxZoom:16,enableHighAccuracy:true});
  return b;
};
ctlLoc.addTo(map);
let _locLyr;
map.on('locationfound',e=>{ if(_locLyr)map.removeLayer(_locLyr);
  _locLyr=L.layerGroup([
    L.circle(e.latlng,{radius:e.accuracy,color:'#1565c0',weight:1,fillColor:'#42a5f5',fillOpacity:.15}),
    L.circleMarker(e.latlng,{radius:6,color:'#fff',weight:2,fillColor:'#1565c0',fillOpacity:1}).bindPopup('Estás aquí (±'+Math.round(e.accuracy)+' m)')
  ]).addTo(map);
});
map.on('locationerror',()=>alert('No se pudo obtener tu ubicación. Revisa los permisos de geolocalización del navegador.'));
// La herramienta de medición (distancia + área) está en js/medicion.js

// ---------- Capas (orden del menú) ----------
const DEF=[
 {k:'veredas',label:'Límites Veredales_Girardota',sub:'División veredal oficial',icon:'🗺️',color:'#2e7d32',def:true,capas:true,
   build:j=>L.geoJSON(j,{style:{color:'#2e7d32',weight:2,fillColor:'#a5d6a7',fillOpacity:.12},
     onEachFeature:(f,l)=>{const nm=f.properties.Vereda||'—';l.bindTooltip(nm,{sticky:true,direction:'top',className:'vereda-label'});l.bindPopup('<b>Vereda:</b> '+nm);
       l.on('mouseover',e=>e.target.setStyle({weight:3,fillOpacity:.28}));l.on('mouseout',e=>e.target.setStyle({weight:2,fillOpacity:.12}));}})},
 {k:'rio_medellin',label:'Río Medellín',sub:'Cauce receptor',icon:'🌊',color:'#1565c0',def:true,
   build:j=>L.geoJSON(j,{style:{color:'#1565c0',weight:3,opacity:.95}}).bindTooltip('Río Aburrá',{permanent:true,direction:'center',className:'vereda-label'})},
 {k:'cuenca',label:'Microcuenca La Correa',sub:'Delimitación · 856 ha (MDE 2 m)',icon:'⬡',color:'#9e8a1e',def:false,
   build:j=>L.geoJSON(j,{style:{color:'#FFD400',weight:2.5,fill:false}})},
 {k:'microcuenca_abastecedora',label:'Microcuenca abastecedora',sub:'CORANTIOQUIA · 172 ha',icon:'💧',color:'#00897b',def:false,
   build:j=>L.geoJSON(j,{style:{color:'#00bfa5',weight:2,dashArray:'5',fillColor:'#00bfa5',fillOpacity:.1}})},
 {k:'uso_suelo',label:'Uso del suelo',sub:'Cobertura oficial AMVA · 6 clases',icon:'🌱',color:'#4caf50',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#666',weight:.3,fillColor:C_COB[f.properties.Cobertura]||'#ccc',fillOpacity:.55}),onEachFeature:(f,l)=>l.bindPopup(pop({Cobertura:f.properties.Cobertura},'Uso del suelo'))})},
 {k:'red_hidrica',label:'Red hídrica unificada',sub:'Orden Strahler 5 · 58 km',icon:'🏞️',color:'#1976d2',def:false,
   build:j=>L.geoJSON(j,{style:{color:'#0a64dc',weight:1.1,opacity:.85}})},
 {k:'sistema_hidrico',label:'Cauces principales',sub:'La Correa + Potrerito/Cedral',icon:'🌐',color:'#0277bd',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:(f.properties.Tipo&&f.properties.Tipo.indexOf('principal')>=0?'#005ce6':'#00c8c8'),weight:3.2,opacity:.95}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Tipo:f.properties.Tipo,Nombre:f.properties.Nombre_ofi,Long_km:f.properties.Long_km,Rol:f.properties.Rol_SAT},'Cauce'))})},
 {k:'amenaza',label:'Amenaza torrencial',sub:'Stream power × pendiente',icon:'⚠️',color:'#e65100',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#555',weight:.3,fillColor:C_NIVEL[f.properties.Amenaza]||'#ccc',fillOpacity:.45}),onEachFeature:(f,l)=>l.bindPopup(pop(f.properties,'Amenaza'))})},
 {k:'exposicion',label:'Exposición',sub:'Corredor 30/60/100 m',icon:'👥',color:'#f9a825',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#555',weight:.3,fillColor:C_NIVEL[nivelDe(f.properties.Zona)],fillOpacity:.45}),onEachFeature:(f,l)=>l.bindPopup(pop(f.properties,'Exposición'))})},
 {k:'puntos_riesgo',label:'Puntos de riesgo (mapa de calor)',sub:'18 puntos críticos · validados en campo',icon:'🔥',color:'#d32f2f',def:false,
   build:j=>{
     const pts=j.features.map(f=>[f.geometry.coordinates[1],f.geometry.coordinates[0],0.9]);
     const heat=L.heatLayer? L.heatLayer(pts,{radius:34,blur:24,maxZoom:16,minOpacity:.35,
       gradient:{0.2:'#2e9e57',0.45:'#ffe13c',0.65:'#ef9f27',0.85:'#e24b4a',1:'#8b0000'}}) : null;
     let _i=0;
     const marks=L.geoJSON(j,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:6.5,color:'#fff',weight:1.8,fillColor:(f.properties.color||'#b71c1c'),fillOpacity:.95}),
       onEachFeature:(f,l)=>{ const idx=_i++;
         l.bindPopup(popupRiesgo(f,idx),{maxWidth:280});
         l.bindTooltip((f.properties.Evento||'Punto de riesgo')+' · '+(f.properties.Sector||'')); }});
     return heat? L.layerGroup([heat,marks]) : marks;
   }},
 {k:'zona_inundable',label:'Zona inundable',sub:'Mancha de inundación (HAND)',icon:'🌊',color:'#1e88e5',def:false,
   build:j=>L.geoJSON(j,{style:{color:'#1565c0',weight:.5,fillColor:'#42a5f5',fillOpacity:.4}})},
 {k:'riesgo',label:'Riesgo (zonificación)',sub:'Amenaza × exposición',icon:'🔴',color:'#b71c1c',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#333',weight:.4,fillColor:C_RIESGO[f.properties.Riesgo]||'#ccc',fillOpacity:.6}),onEachFeature:(f,l)=>l.bindPopup(pop({Riesgo:f.properties.Riesgo,Area_ha:f.properties.Area_ha},'Riesgo'))})},
 {k:'susceptibilidad',label:'Susceptibilidad',sub:'Multicriterio (validada 82%)',icon:'🌡️',color:'#7b1fa2',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#555',weight:.3,fillColor:C_SUSC[f.properties.Suscept]||'#ccc',fillOpacity:.45}),onEachFeature:(f,l)=>l.bindPopup(pop({Susceptibilidad:f.properties.Suscept,Area_ha:f.properties.Area_ha},'Susceptibilidad'))})},
 {k:'cobertura',label:'Cobertura de sirenas',sub:'Radio audible 400 m',icon:'📶',color:'#00acc1',def:false,
   build:j=>L.geoJSON(j,{style:{color:'#00bcd4',weight:1,fillColor:'#00bcd4',fillOpacity:.18,dashArray:'4'}})},
 {k:'cobertura_sonido',label:'Cobertura acústica (soundshed)',sub:'Nivel sonoro dB',icon:'🔉',color:'#0097a7',def:false,
   build:j=>L.geoJSON(j,{style:f=>({color:'#555',weight:.2,fillColor:C_DB[f.properties.Nivel_dB]||'#ccc',fillOpacity:.5}),onEachFeature:(f,l)=>l.bindPopup(pop({Nivel:f.properties.Nivel_dB,Area_ha:f.properties.Area_ha},'Cobertura acústica'))})},
 {k:'elementos',label:'Elementos expuestos',sub:'61 · validados en campo',icon:'📍',color:'#8B0000',def:false,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:6,fillColor:C_ANTEC[f.properties.Nivel_riesgo]||'#888',color:'#222',weight:1,fillOpacity:.95}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Tipo:f.properties.Tipo_elem,Nivel:f.properties.Nivel_riesgo,Vereda:f.properties.Vereda,Corredor:f.properties.Corredor,Amenaza:f.properties.Amenaza_sitio},'Elemento expuesto'))})},
 {k:'antecedentes',label:'Eventos antecedentes',sub:'Registro de campo',icon:'🕒',color:'#6a1b9a',def:false,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,fillColor:C_ANTEC[f.properties.Nivel_riesgo]||'#888',color:'#fff',weight:1,fillOpacity:.9}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Nombre:f.properties.Nombre,Nivel:f.properties.Nivel_riesgo,Cota_m:f.properties.Z_m},'Evento antecedente'))})},
 {k:'bocinas',label:'Sirenas de alerta',sub:'3 · aguas abajo del sensor',icon:'🔊',color:'#ad1457',def:false,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.marker(ll,{icon:L.divIcon({className:'',html:'🔊',iconSize:[22,22]})}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Sirena:f.properties.Sirena,Sitio:f.properties.Sitio,Rol:f.properties.Rol},'Sirena'))})},
 {k:'puntos_campo',label:'Puntos de campo',sub:'61 · validación KMZ (nivel de riesgo)',icon:'📋',color:'#5d4037',def:false,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,fillColor:C_ANTEC[f.properties.Nivel_riesgo]||'#888',color:'#222',weight:1,fillOpacity:.95}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Nombre:f.properties.Nombre,Categoria:f.properties.Categoria,Nivel:f.properties.Nivel_riesgo},'Punto de campo'))})},
 {k:'puntos_sensor_ahp',label:'Puntos candidatos AHP',sub:'3 · análisis multicriterio (P1 óptimo)',icon:'🎯',color:'#3949ab',def:false,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:7,fillColor:(String(f.properties.Punto||f.properties.Prioridad).indexOf('1')>=0?'#1b5e20':'#3949ab'),color:'#fff',weight:2,fillOpacity:.95}),
     onEachFeature:(f,l)=>l.bindPopup(pop({Punto:f.properties.Punto,Prioridad:f.properties.Prioridad,Cauce:f.properties.Cauce,Score:f.properties.Score,Lead_min:f.properties.Lead_min},'Candidato AHP'))})},
 {k:'siata_nivel',label:'Sensores de nivel',sub:'Estación La Correa (propia) + red SIATA',icon:'🌊',color:'#0277bd',def:false,lazy:true,
   build:j=>{
     // Cámaras SIATA de nivel (se relacionan con cada estación por el nombre)
     const CAMS=[
       {re:/holanda/i, url:'https://siata.gov.co/ultimasFotosCamaras/ultimacam_nivel_molinal_la_holanda.jpg'},
       {re:/limonar/i, url:'https://siata.gov.co/ultimasFotosCamaras/ultimacam_nivel_el_limonar.jpg'}
     ];
     const camaras=[];
     // Estaciones SIATA (azul) → clic abre el geoportal SIATA
     const siata=L.geoJSON(j,{pointToLayer:(f,ll)=>L.marker(ll,{icon:iconNivel('#0277bd')}),
       onEachFeature:(f,l)=>{ const p=f.properties;
         l.bindTooltip((p.codigo?p.codigo+' · ':'')+p.nombre+' (SIATA)',{direction:'top'});
         l.bindPopup(popupSiata(p),{maxWidth:270});
         l.on('click',()=>{ const c=l.getLatLng(); resaltarMicrocuenca(c.lat,c.lng); });   // clic → resalta su microcuenca
         // Ícono de cámara al lado del sensor (solo si el nombre coincide con una cámara SIATA)
         const cam=CAMS.find(c=>c.re.test(p.nombre||''));
         if(cam){ const cm=L.marker(l.getLatLng(),{icon:iconCamara(),zIndexOffset:1100})
             .bindTooltip('📷 Ver cámara SIATA — '+p.nombre,{direction:'top'})
             .on('click',()=>window.abrirCamaraSiata(cam.url,p.nombre));
           camaras.push(cm); }
       }});
     // Estación PROPIA del proyecto (P1) — NO es SIATA: clic abre el panel con la info trabajada
     const s=(window.CONFIG&&CONFIG.SENSOR)||{lat:6.407003,lon:-75.446880,nombre:'Estación de Monitoreo La Correa'};
     const p1=L.marker([s.lat,s.lon],{icon:iconNivel('#1b7a3a'),zIndexOffset:1000})
       .bindTooltip(s.nombre+' · estación propia',{direction:'top'})
       .on('click',()=>{ resaltarMicrocuenca(s.lat,s.lon); if(window.abrirNivelesFlotante) window.abrirNivelesFlotante(); });   // P1 → microcuenca + vista flotante
     return L.layerGroup([siata,...camaras,p1]);
   }},
 {k:'siata_pluvio',label:'Red pluviométrica (SIATA)',sub:'Estaciones de lluvia · red SIATA · Girardota',icon:'🌧️',color:'#5e35b1',def:false,lazy:true,
   build:j=>L.geoJSON(j,{pointToLayer:(f,ll)=>L.marker(ll,{icon:iconLluvia('#5e35b1')}),
     onEachFeature:(f,l)=>{ const p=f.properties;
       l.bindTooltip((p.codigo?p.codigo+' · ':'')+p.nombre+' (SIATA)',{direction:'top'});
       l.bindPopup(popupSiata(p),{maxWidth:270}); }})},
 // --- Capas de referencia municipal (panel "Capas"); se cargan bajo demanda (lazy) ---
 {k:'curvas_nivel',label:'Curvas de Nivel 5 m',sub:'Topografía · 1285–2715 m',icon:'⛰️',color:'#8d6e63',def:false,capas:true,lazy:true,
   build:j=>L.geoJSON(j,{style:f=>({color:(f.properties.Indice?'#6d4c41':'#bcaaa4'),weight:(f.properties.Indice?1.1:.5),opacity:.8}),
     onEachFeature:(f,l)=>l.bindPopup('<b>Cota:</b> '+f.properties.Contour+' m s.n.m.')})},
 {k:'red_hidrica_muni',label:'Red Hídrica Muni',sub:'Drenajes · Girardota',icon:'🏞️',color:'#1976d2',def:false,capas:true,lazy:true,
   build:j=>L.geoJSON(j,{style:{color:'#1e88e5',weight:.7,opacity:.8}})},
 {k:'red_oficial_corantioquia',label:'Red Oficial CORANTIOQUIA',sub:'Red hídrica oficial',icon:'🌊',color:'#00838f',def:false,capas:true,lazy:true,
   build:j=>L.geoJSON(j,{style:{color:'#00acc1',weight:1,opacity:.85}})},
];
// La capa 'puntos_sensor_ahp' usa el archivo data/sensor.geojson (Puntos_Sensor_AHP, 3 candidatos)
DEF.find(d=>d.k==='puntos_sensor_ahp').file='sensor';

// Controlador único de capas: sincroniza el panel "Capas" y el submenú "Productos La Correa".
// Carga bajo demanda: las capas lazy se descargan solo al activarse por primera vez.
const DEFBYK={};
// Capas de monitoreo mutuamente excluyentes: al activar una, se apagan las demás
const MONITOREO_KEYS=['siata_nivel','siata_pluvio'];
window.geoToggle=async function(k,on){
  const d=DEFBYK[k]; if(!d) return;
  if(on && MONITOREO_KEYS.includes(k)){
    MONITOREO_KEYS.forEach(x=>{ if(x!==k){ const dd=DEFBYK[x]; if(dd&&dd.layer&&map.hasLayer(dd.layer)) window.geoToggle(x,false); } });
  }
  if(on && !d.layer && d.build){
    try{ d.layer=d.build(await cargar('data/'+(d.file||d.k)+'.geojson')); }catch(e){ console.warn('no cargó',k,e); return; }
  }
  if(!d.layer) return;
  if(on) d.layer.addTo(map); else map.removeLayer(d.layer);
  document.querySelectorAll('input[data-k="'+k+'"]').forEach(i=>{ if(i.checked!==on) i.checked=on; });
  updateLegend();
};
// Panel "Capas" = SOLO capas de referencia municipal (orden fijo)
const CAPAS_KEYS=['curvas_nivel','veredas','red_hidrica_muni','red_oficial_corantioquia'];
(async function init(){
  // ?capa= admite una o varias capas separadas por coma (p. ej. ?capa=puntos_sensor_ahp,bocinas)
  const wantCapa=(new URLSearchParams(location.search).get('capa')||'').split(',').map(s=>s.trim()).filter(Boolean);
  // construir todas las capas no-lazy (productos + base); las lazy se cargan al activarse
  for(const d of DEF){
    DEFBYK[d.k]=d;
    if(!d.lazy){
      try{ d.layer=d.build(await cargar('data/'+(d.file||d.k)+'.geojson')); }catch(e){ console.warn('no cargó',d.k); continue; }
      if(d.def||wantCapa.includes(d.k)) d.layer.addTo(map);
    }
  }
  // capas lazy solicitadas por ?capa= (se cargan bajo demanda)
  for(const k of wantCapa){ const d=DEFBYK[k]; if(d&&d.lazy&&!d.layer) window.geoToggle(k,true); }
  // Refresco limpio: una vez activadas, se quita ?capa= de la URL para que un F5 NO
  // vuelva a activar los sensores/capas del menú (el geoportal inicia en su vista por defecto).
  if(wantCapa.length){ try{ history.replaceState(null,'',location.pathname); }catch(e){} }
  // poblar el panel "Capas" solo con las capas de referencia
  const list=document.getElementById('cp-list');
  CAPAS_KEYS.forEach(k=>{
    const d=DEFBYK[k]; if(!d) return;
    const on=!!(d.layer&&map.hasLayer(d.layer));
    const row=document.createElement('div');row.className='capa-row';
    row.innerHTML=`<div class="capa-ic" style="background:${d.color}">${d.icon}</div>
      <div class="nm">${d.label}<small>${d.sub}</small></div>
      <label class="sw"><input type="checkbox" data-k="${d.k}" ${on?'checked':''}><span class="sl"></span></label>`;
    row.querySelector('input').addEventListener('change',e=>window.geoToggle(d.k,e.target.checked));
    list.appendChild(row);
  });
  const cu=DEFBYK['cuenca']; if(cu&&cu.layer){try{map.fitBounds(cu.layer.getBounds(),{padding:[20,20]});}catch(e){}}
  leyenda.addTo(map);
  // Barra inferior CENTRADA: coordenadas (siguen el puntero) + escala (según zoom), una al lado de la otra
  const bottomBar=L.DomUtil.create('div','map-bottombar');
  bottomBar.innerHTML='<span class="geo-coords" id="geo-coords">mueve el cursor…</span><span id="scale-holder"></span>';
  map.getContainer().appendChild(bottomBar);
  const coordEl=bottomBar.querySelector('#geo-coords');
  map.on('mousemove',e=>{ coordEl.innerHTML=toDMS(e.latlng.lat,'N','S')+' &nbsp; '+toDMS(e.latlng.lng,'E','W'); });
  map.on('mouseout',()=>{ coordEl.innerHTML='mueve el cursor…'; });
  const scaleCtl=L.control.scale({metric:true,imperial:false,position:'bottomleft',maxWidth:150});
  scaleCtl.addTo(map);
  bottomBar.querySelector('#scale-holder').appendChild(scaleCtl._container);  // mover la escala a la barra centrada
  if(typeof initCorrea==='function') initCorrea();   // poblar submenú La Correa
})();
document.getElementById('capas-btn').onclick=()=>document.getElementById('capas-panel').classList.add('open');
document.getElementById('cp-close').onclick=()=>document.getElementById('capas-panel').classList.remove('open');

// ---------- Sensor en tiempo real ----------
// P1 NO se añade al mapa por defecto: aparece al activar la cuenca La Correa
const sensorMarker=L.marker([CONFIG.SENSOR.lat,CONFIG.SENSOR.lon],{icon:iconNivel('#2e9e57'),zIndexOffset:1000})
  .bindTooltip('P1',{permanent:true,direction:'right',offset:[14,0],className:'vereda-label'})
  .bindPopup('<b>'+CONFIG.SENSOR.nombre+'</b><br>Estación de nivel · punto óptimo (P1)')
  .on('click',()=>{ if(window.abrirNivelesFlotante) window.abrirNivelesFlotante(); }); // clic en P1 → vista flotante "Niveles de Riesgo"

// ----- Íconos de los sensores de la estación P1 (activables desde el navbar) -----
const SENS_IC={
 nivel:'<svg width="15" height="15" viewBox="0 0 24 24"><path d="M2 9q3-3 6 0t6 0 6 0" fill="none" stroke="#1565c0" stroke-width="2.2" stroke-linecap="round"/><path d="M2 15q3-3 6 0t6 0 6 0" fill="none" stroke="#1565c0" stroke-width="2.2" stroke-linecap="round"/></svg>',
 lluvia:'<svg width="16" height="16" viewBox="0 0 24 24"><path d="M7 13.5a4 4 0 0 1 .3-8 5 5 0 0 1 9.4 1.3A3.4 3.4 0 0 1 16.5 13.5Z" fill="#90a4ae"/><line x1="9" y1="15.5" x2="8" y2="19.5" stroke="#1e88e5" stroke-width="2" stroke-linecap="round"/><line x1="12.5" y1="15.5" x2="11.5" y2="19.5" stroke="#1e88e5" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="15.5" x2="15" y2="19.5" stroke="#1e88e5" stroke-width="2" stroke-linecap="round"/></svg>',
 temp:'<svg width="15" height="15" viewBox="0 0 24 24"><path d="M13 14.8V6a2 2 0 0 0-4 0v8.8a3.5 3.5 0 1 0 4 0Z" fill="#fff" stroke="#c0392b" stroke-width="2"/><circle cx="11" cy="17.5" r="2" fill="#c0392b"/></svg>',
 humedad:'<svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 3C8 8 6.5 11.5 6.5 14a5.5 5.5 0 0 0 11 0c0-2.5-1.5-6-5.5-11Z" fill="#1e88e5"/></svg>'
};
const SENS_DX={nivel:-39,lluvia:-13,temp:13,humedad:39};       // posición en fila sobre P1
// Ventana FLOTANTE LATERAL "Niveles de Riesgo" (~1/3 de la pantalla, sobre un costado) — reusa niveles.html en vivo.
// Se abre SOLO al hacer clic en el ícono de nivel; el toggle del menú solo enciende/apaga el ícono.
window.abrirNivelesFlotante=function(){
  let m=document.getElementById('niv-modal');
  if(!m){
    m=document.createElement('div'); m.id='niv-modal';
    m.innerHTML='<div class="niv-box"><button class="niv-x" title="Cerrar">✕</button>'
      +'<iframe title="Registros de lectura — Nivel de agua" src="niveles.html?embed=1&v=28"></iframe></div>';
    document.body.appendChild(m);
    m.querySelector('.niv-x').addEventListener('click',()=>window.cerrarNivelesFlotante());
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') window.cerrarNivelesFlotante(); });
    // Cerrar al hacer clic FUERA de la ventana (otro ícono, el mapa o el menú). El clic que la ABRE
    // es de la estación propia P1 y actualiza _nivOpenTs justo antes, por eso no la cierra.
    document.addEventListener('click', function(e){
      if(!m.classList.contains('open')) return;
      if(m.contains(e.target)) return;                                      // dentro de la ventana / ✕
      if(window._nivOpenTs && (Date.now()-window._nivOpenTs)<350) return;   // el clic que la abrió / reclic en P1
      window.cerrarNivelesFlotante();
    });
  }
  if(window.cerrarLluviaFlotante) window.cerrarLluviaFlotante();   // solo una ventana flotante a la vez
  if(window.cerrarClimaFlotante)  window.cerrarClimaFlotante();
  m.classList.add('open');
  window._nivOpenTs=Date.now();
};
window.cerrarNivelesFlotante=function(){ const m=document.getElementById('niv-modal'); if(m) m.classList.remove('open'); };

// Ventana FLOTANTE LATERAL "Registros de lectura — Lluvia" (gemela de la de nivel) — reusa lluvia.html en vivo.
// Se abre al hacer clic en el ícono de lluvia (o al activar el sensor de lluvia).
window.abrirLluviaFlotante=function(){
  let m=document.getElementById('lluvia-modal');
  if(!m){
    m=document.createElement('div'); m.id='lluvia-modal';
    m.innerHTML='<div class="niv-box"><button class="niv-x" title="Cerrar">✕</button>'
      +'<iframe title="Registros de lectura — Lluvia" src="lluvia.html?embed=1&v=8"></iframe></div>';
    document.body.appendChild(m);
    m.querySelector('.niv-x').addEventListener('click',()=>window.cerrarLluviaFlotante());
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') window.cerrarLluviaFlotante(); });
    document.addEventListener('click', function(e){
      if(!m.classList.contains('open')) return;
      if(m.contains(e.target)) return;
      if(window._lluOpenTs && (Date.now()-window._lluOpenTs)<350) return;   // el clic que la abrió
      window.cerrarLluviaFlotante();
    });
  }
  if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante();   // solo una ventana flotante a la vez
  if(window.cerrarClimaFlotante)   window.cerrarClimaFlotante();
  m.classList.add('open');
  window._lluOpenTs=Date.now();
};
window.cerrarLluviaFlotante=function(){ const m=document.getElementById('lluvia-modal'); if(m) m.classList.remove('open'); };

// Ventana FLOTANTE LATERAL "Registros de lectura — Temperatura/Humedad" (gemela de nivel/lluvia).
// Una sola ventana para ambas variables numéricas; el iframe se recarga según la variable pedida.
window.abrirClimaFlotante=function(varname){
  varname = (varname==='humedad')?'humedad':'temp';
  let m=document.getElementById('clima-modal');
  if(!m){
    m=document.createElement('div'); m.id='clima-modal';
    m.innerHTML='<div class="niv-box"><button class="niv-x" title="Cerrar">✕</button>'
      +'<iframe title="Registros de lectura — Clima" src="about:blank"></iframe></div>';
    document.body.appendChild(m);
    m.querySelector('.niv-x').addEventListener('click',()=>window.cerrarClimaFlotante());
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') window.cerrarClimaFlotante(); });
    document.addEventListener('click', function(e){
      if(!m.classList.contains('open')) return;
      if(m.contains(e.target)) return;
      if(window._climaOpenTs && (Date.now()-window._climaOpenTs)<350) return;
      window.cerrarClimaFlotante();
    });
  }
  const ifr=m.querySelector('iframe');
  if(ifr.getAttribute('data-var')!==varname){ ifr.setAttribute('data-var',varname);
    ifr.setAttribute('src','sensor_clima.html?embed=1&var='+varname+'&v=10'); }
  if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante();
  if(window.cerrarLluviaFlotante)  window.cerrarLluviaFlotante();
  m.classList.add('open');
  window._climaOpenTs=Date.now();
};
window.cerrarClimaFlotante=function(){ const m=document.getElementById('clima-modal'); if(m) m.classList.remove('open'); };
const sensorIcons={};
window.setSensorIcon=function(key,on){
  if(!(key in SENS_IC)) return;
  if(on){
    if(!sensorIcons[key]){
      const ic=L.divIcon({className:'',iconSize:[24,24],iconAnchor:[12-SENS_DX[key],58],
        html:`<div title="Ver lectura de ${key}" style="cursor:pointer;font-size:14px;background:#fff;border:1.6px solid #2e8b57;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.35)">${SENS_IC[key]}</div>`});
      sensorIcons[key]=L.marker([CONFIG.SENSOR.lat,CONFIG.SENSOR.lon],{icon:ic,interactive:true,zIndexOffset:1100,bubblingMouseEvents:false}).addTo(map);
      sensorIcons[key].on('click',function(e){ if(e&&e.originalEvent&&e.originalEvent.stopPropagation)e.originalEvent.stopPropagation();
        if(key==='nivel' && window.abrirNivelesFlotante){ window.abrirNivelesFlotante(); return; }   // nivel → vista flotante completa
        if(key==='lluvia' && window.abrirLluviaFlotante){ window.abrirLluviaFlotante(); return; }    // lluvia → vista flotante de registros
        if((key==='temp'||key==='humedad') && window.abrirClimaFlotante){ window.abrirClimaFlotante(key); return; }  // temp/humedad → serie de tiempo
        if(window.mostrarPanelEstacion) window.mostrarPanelEstacion(true);
        abrirPanelSensor(key); });
    }
  }else if(sensorIcons[key]){ map.removeLayer(sensorIcons[key]); delete sensorIcons[key]; }
  // Resalta la delimitación de la microcuenca La Correa mientras haya sensores de la estación activos.
  if(Object.keys(sensorIcons).length) resaltarMicrocuenca(CONFIG.SENSOR.lat,CONFIG.SENSOR.lon);
  else if(window.limpiarMicrocuenca) window.limpiarMicrocuenca();
};
// Los 4 íconos de sensor inician APAGADOS; se activan desde los interruptores del navbar
// ("Estación de Monitoreo La Correa"). No se fuerzan al cargar (evita que queden activos al refrescar).
['nivel','lluvia','temp','humedad'].forEach(k=>window.setSensorIcon(k,false));
// Enlace del menú "Niveles de riesgo — Estación P1" desde otra página: llega con ?niveles=1
// y abre la ventana flotante sola (una vez cargado todo el navbar).
if(/[?&]niveles=1/.test(location.search)){
  window.addEventListener('load',()=>{ if(window.abrirNivelesFlotante) window.abrirNivelesFlotante(); });
}
// Igual para la lluvia: llega con ?lluvia=1 y abre su ventana flotante sola.
if(/[?&]lluvia=1/.test(location.search)){
  window.addEventListener('load',()=>{ if(window.abrirLluviaFlotante) window.abrirLluviaFlotante(); });
}
// Temperatura/humedad: llega con ?clima=temp o ?clima=humedad y abre su ventana flotante sola.
{ const _clm=(new URLSearchParams(location.search).get('clima')||'').toLowerCase();
  if(_clm==='temp'||_clm==='humedad'){ window.addEventListener('load',()=>{ if(window.abrirClimaFlotante) window.abrirClimaFlotante(_clm); }); } }

// ===== Panel de detalle por sensor (clic en el ícono activo sobre P1) =====
const SENSOR_INFO={
  nivel:  {campo:'nivel_agua',     label:'Nivel de la quebrada', unidad:'cm', color:'#1565c0', tipo:'Ultrasónico JSN-SR04T (sin contacto)'},
  lluvia: {campo:'esta_lloviendo', label:'Sensor de lluvia',     unidad:'',   color:'#1e88e5', bool:true, tipo:'Detector de lluvia YL-83'},
  temp:   {campo:'temperatura',    label:'Temperatura',          unidad:'°C', color:'#c0392b', tipo:'SHT30'},
  humedad:{campo:'humedad',        label:'Humedad',              unidad:'%',  color:'#00897b', tipo:'SHT30'}
};
let _medCache=null,_medTime=0,_detChart=null,_corteChart=null,_serieInfo=null,_serieLista=null;
function fmtNum(v){ v=parseFloat(v); return isNaN(v)?'—':v.toFixed(2); }
// Niveles de alerta tipo SIATA en términos de NIVEL DE AGUA (= NIVEL_REF - lectura del sensor).
// El sub-panel trabaja con el nivel ya convertido (sube con el agua), así que los "tope" van
// en orden ASCENDENTE (N1 = nivel bajo = seguro) y se compara con ">=" (a MAYOR nivel, más grave).
function nivelesN(){ const U=(CONFIG&&CONFIG.UMBRALES)||{preventivo:100,prevencion:120,critico:140};
  const REF=(CONFIG&&CONFIG.NIVEL_REF)||170;
  return [
    {n:'N1',c:'#2e9e57',tope:0,             tit:'Normal'},
    {n:'N2',c:'#EAB308',tope:REF-U.critico,    tit:'Prevención'},
    {n:'N3',c:'#EF9F27',tope:REF-U.prevencion, tit:'Precaución'},
    {n:'N4',c:'#c0392b',tope:REF-U.preventivo, tit:'Crítica'}
  ]; }
function nivelActual(cm){ const N=nivelesN(); let r=0; for(let i=0;i<N.length;i++){ if(cm>=N[i].tope) r=i; } return r; }
// Dibuja la sección transversal (corte del cauce) con la lámina de agua actual
function renderCorte(nivelCm){
  const D=window.CORTE_P1; const cv=document.getElementById('sd-corte-chart'); if(!D||!cv) return;
  const perf=D.perfil.filter(p=>p.z!=null);
  const dd=perf.map(p=>p.d), zz=perf.map(p=>p.z);
  const zmin=Math.min.apply(null,zz), zmax=Math.max.apply(null,zz);
  const cm=parseFloat(nivelCm); const dep=isNaN(cm)?0:cm/100;   // lámina en metros
  const wElev=D.z_min+dep;                                       // cota de la superficie del agua
  const water=zz.map(z=> z<wElev ? wElev : z);                   // techo del agua dentro del cauce
  if(_corteChart) _corteChart.destroy();
  if(window.Chart) _corteChart=new Chart(cv.getContext('2d'),{type:'line',
    data:{labels:dd,datasets:[
      {label:'Terreno',data:zz,borderColor:'#8d8578',backgroundColor:'rgba(150,142,128,.35)',
        fill:'start',tension:.25,pointRadius:0,borderWidth:1.4,order:2},
      {label:'Agua',data:water,borderColor:'rgba(33,150,243,.9)',
        backgroundColor:'rgba(33,150,243,.45)',fill:{target:0,above:'rgba(33,150,243,.45)'},
        pointRadius:0,borderWidth:1,tension:.1,order:1}
    ]},
    options:{plugins:{legend:{display:false},
        tooltip:{callbacks:{title:i=>'d = '+i[0].label+' m',label:it=>it.dataset.label+': '+it.parsed.y.toFixed(2)+' m'}}},
      scales:{x:{title:{display:true,text:'Distancia (m)'},ticks:{maxTicksLimit:7}},
        y:{min:Math.floor(zmin-0.6),max:Math.ceil(zmax+0.4),title:{display:true,text:'Cota (m s.n.m.)'}}},
      responsive:true,maintainAspectRatio:false}});
  // Barra vertical N1–N4 + marcador del nivel actual
  const N=nivelesN(), act=nivelActual(isNaN(cm)?0:cm);
  document.getElementById('sd-nbar').innerHTML =
    N.slice().reverse().map((x,ri)=>{const i=N.length-1-ri;
      return '<div class="sd-nseg'+(i===act?' on':'')+'" style="background:'+x.c+'" title="'+x.tit+'">'+x.n+'</div>';}).join('');
  document.getElementById('sd-nleg').innerHTML =
    'Lámina actual: <b>'+(isNaN(cm)?'—':cm.toFixed(1)+' cm')+'</b> · nivel <b style="color:'+N[act].c+'">'+N[act].n+' — '+N[act].tit+'</b>';
}
// ---- Contenido de las pestañas de la estación (estilo SIATA) ----
const _kv=(k,v)=>`<div class="sd-kv"><span>${k}:</span><b>${v}</b></div>`;
function _tabsHTML(){
  const T=[['series','Lectura'],['niveles','Niveles de riesgo'],['descripcion','Descripción'],
           ['geomorfologia','Geomorfología'],['coberturas','Coberturas'],['perfil','Perfil'],['galeria','Galería']];
  return T.map((t,i)=>`<button data-t="${t[0]}"${i===0?' class="on"':''}>${t[1]}</button>`).join('');
}
function _descripcionMeta(){
  const s=(window.CONFIG&&CONFIG.SENSOR)||{lat:6.407003,lon:-75.446880,nombre:'Estación de Monitoreo La Correa'};
  const D=window.CORTE_P1||{}; const alt=D.z_p1?D.z_p1.toFixed(0)+' m s.n.m.':'≈ 1552 m s.n.m.';
  return _kv('Código','P1')+_kv('Estación',s.nombre)
    +_kv('Tipo','Hidrometeorológica (nivel · lluvia · temp · humedad)')
    +_kv('Municipio','Girardota')+_kv('Vereda / sector','San Andrés — corredor La Correa')
    +_kv('Subcuenca','Q. La Correa')+_kv('Latitud',s.lat)+_kv('Longitud',s.lon)+_kv('Altitud (cauce)',alt);
}
function _geomorfologia(){
  const D=window.CORTE_P1||{};
  return _kv('Sección','Cauce en "V" · MDT 2 m')
    +_kv('Thalweg (fondo)',(D.z_min?D.z_min.toFixed(1):'1551,7')+' m s.n.m.')
    +_kv('Ancho modelado',(D.ancho_total||50)+' m')
    +_kv('Índice de Melton','0,47 · debris flood (torrencial)')
    +_kv('Pendiente del cauce','14,6 %')+_kv('Densidad de drenaje','7,12 km/km²')
    +_kv('Orden de Strahler','5')+_kv('Tiempo de concentración','≈ 43 min (Kirpich)')
    +_kv('Caudal de diseño (Tr100)','≈ 280 m³/s · Log-Pearson III');
}
function _coberturas(){
  return _kv('Vegetación (NDVI Sentinel-2)','media 0,68 · 82 % vegetación densa')
    +_kv('Urbano / suelo desnudo','3,9 %')
    +_kv('Suelo (OpenLandMap)','99 % Clay Loam → grupo hidrológico C')
    +_kv('Escorrentía','alta (grupo C)')+_kv('Uso del suelo','coberturas AMVA (6 clases)');
}
function sdTab(t){
  const p=document.getElementById('sensor-detalle'); if(!p) return;
  p.querySelectorAll('.sd-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  p.querySelectorAll('.sd-tab').forEach(d=>d.style.display=(d.dataset.tab===t)?'block':'none');
  if(t==='series' && _detChart) setTimeout(()=>_detChart.resize(),30);
  if(t==='perfil' && _corteChart) setTimeout(()=>_corteChart.resize(),30);
}
function panelDetalle(){
  let p=document.getElementById('sensor-detalle');
  if(!p){ p=document.createElement('div'); p.id='sensor-detalle';
    p.innerHTML='<div class="sd-h"><div class="sd-h-tit"><b>Registros de lectura</b><span>SENSORES EST. LA CORREA</span></div>'
      +'<span class="sd-cx cx-wait">● Verificando…</span>'
      +'<svg class="sd-h-ico" viewBox="0 0 64 48" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><path d="M16 24 L32 11 L48 24"/><path d="M21 24 V37 H43 V24"/><path d="M9 43 q4 -4 8 0 t8 0 t8 0 t8 0 t8 0" stroke-width="2.6"/></svg>'
      +'<span class="sd-x" title="Cerrar">✕</span></div>'
      +'<div class="sd-tabs">'+_tabsHTML()+'</div>'
      +'<div class="sd-body">'
      +  '<div class="sd-tab" data-tab="series"><div class="sd-sub"></div><div class="sd-valor"></div>'
      +    '<div class="sd-serie-head"><span class="sd-serie-tit">Serie de tiempo</span>'
      +      '<select id="sd-win" title="Ventana de tiempo"><option value="3">3 horas</option><option value="6">6 horas</option><option value="12">12 horas</option><option value="24">24 horas</option><option value="36">36 horas</option><option value="72" selected>72 horas</option></select></div>'
      +    '<div class="sd-chart-wrap"><canvas id="sd-chart"></canvas></div>'
      +    '<div class="sd-resumen" id="sd-resumen"></div></div>'
      +  '<div class="sd-tab" data-tab="niveles" style="display:none"><div class="sd-serie-tit">Niveles de riesgo (por lámina)</div>'
      +    '<div class="sd-niv-cur" id="sd-niv-cur"></div><div id="sd-niv-list"></div>'
      +    '<div class="sd-note2">Umbrales derivados de CONFIG.UMBRALES · calibración oficial pendiente.</div></div>'
      +  '<div class="sd-tab" data-tab="descripcion" style="display:none"><div class="sd-serie-tit">Descripción de la estación</div>'
      +    _descripcionMeta()+'<div class="sd-serie-tit" style="margin-top:8px">Últimas lecturas</div><div id="sd-lect"></div></div>'
      +  '<div class="sd-tab" data-tab="geomorfologia" style="display:none"><div class="sd-serie-tit">Geomorfología del cauce y la cuenca</div>'+_geomorfologia()+'</div>'
      +  '<div class="sd-tab" data-tab="coberturas" style="display:none"><div class="sd-serie-tit">Coberturas de la cuenca</div>'+_coberturas()+'</div>'
      +  '<div class="sd-tab" data-tab="perfil" style="display:none"><div class="sd-serie-tit">Sección transversal en P1 · MDT 2 m</div>'
      +    '<div class="sd-corte-row"><div class="sd-corte-wrap"><canvas id="sd-corte-chart"></canvas></div><div class="sd-nbar" id="sd-nbar"></div></div>'
      +    '<div class="sd-nleg" id="sd-nleg"></div></div>'
      +  '<div class="sd-tab sd-gal" data-tab="galeria" style="display:none"><div class="sd-serie-tit">Galería</div>'
      +    '<img src="docs/06_SAT_sensor_sirenas.png" onclick="window.open(this.src)" alt="Productos SAT: estación + sirenas">'
      +    '<img src="docs/01_sistema_hidrico.png" onclick="window.open(this.src)" alt="Sistema hídrico"></div>'
      +'</div>'
      +'<div class="sd-note">Estación P1 · lecturas de la API</div>';
    document.body.appendChild(p);
    p.querySelector('.sd-x').addEventListener('click',()=>{ p.style.display='none'; });
    p.querySelectorAll('.sd-tabs button').forEach(b=>b.addEventListener('click',()=>sdTab(b.dataset.t)));
    p.querySelector('#sd-win').addEventListener('change',()=>{ if(_serieInfo&&_serieLista){ const nc=_pintarSerie(_serieInfo,_serieLista); renderNiveles(nc); renderCorte(nc); } });
  }
  return p;
}
function renderNiveles(cm){
  const N=nivelesN(), act=nivelActual(isNaN(cm)?0:cm);
  const cur=document.getElementById('sd-niv-cur');
  if(cur) cur.innerHTML='Lámina actual: <b>'+(isNaN(cm)?'—':cm.toFixed(1)+' cm')+'</b> · <b style="color:'+N[act].c+'">'+N[act].n+' — '+N[act].tit+'</b>';
  const rango=['< '+N[1].tope+' cm', N[1].tope+'–'+N[2].tope+' cm', N[2].tope+'–'+N[3].tope+' cm', '≥ '+N[3].tope+' cm'];
  const desc=['No se registran cambios asociados a crecientes.','Aumento del nivel; primer estado de alerta ante posibles crecientes.',
    'Afectaciones menores a calles y estructuras cercanas al canal.','Inundación extensiva; evacuación de la población en la zona de influencia.'];
  const list=document.getElementById('sd-niv-list');
  if(list) list.innerHTML=N.map((x,i)=>`<div class="sd-niv-item${i===act?' on':''}"><span class="sd-niv-badge" style="background:${x.c}">${x.n}</span>`
    +`<div><b>${x.tit}</b> <span style="color:#999">(${rango[i]})</span><br><span style="font-size:10.5px;color:#666">${desc[i]}</span></div></div>`).join('');
}
function renderLecturas(lista, info){
  const el=document.getElementById('sd-lect'); if(!el) return;
  const last=lista.length?lista[lista.length-1]:null;
  const t=last&&last.fecha_hora?String(last.fecha_hora).replace('T',' ').slice(0,16):'—';
  if(info.bool){
    const n=lista.length, si=lista.filter(m=>m[info.campo]).length;
    el.innerHTML=_kv('Última',(last&&last[info.campo]?'Lloviendo':'Sin lluvia')+' · '+t)
      +_kv('% con lluvia',(n?Math.round(si/n*100):0)+' %')+_kv('N.º lecturas',n); return;
  }
  const vals=lista.map(m=>parseFloat(m[info.campo])).filter(v=>!isNaN(v));
  const max=vals.length?Math.max.apply(null,vals):NaN, min=vals.length?Math.min.apply(null,vals):NaN,
        prom=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:NaN;
  const u=info.unidad?' '+info.unidad:'';
  el.innerHTML=_kv('Última',fmtNum(last&&last[info.campo])+u+' · '+t)+_kv('Máximo',fmtNum(max)+u)
    +_kv('Mínimo',fmtNum(min)+u)+_kv('Promedio',fmtNum(prom)+u)+_kv('N.º lecturas',vals.length);
}
// Pinta la serie SIATA-like: filtra por la ventana de tiempo elegida, resalta el máximo
// y calcula el panel Resumen (tipo, resolución temporal, % datos transmitidos, promedio).
// Devuelve el nivel de agua (cm) de la última lectura de la ventana.
function _pintarSerie(info, lista){
  const p=document.getElementById('sensor-detalle'); if(!p) return NaN;
  _serieInfo=info; _serieLista=lista;
  const sel=p.querySelector('#sd-win'); const win=sel?parseFloat(sel.value):72;   // horas
  const parse=s=>new Date(String(s).replace(' ','T'));
  const conF=lista.filter(m=>m.fecha_hora && m.fecha_hora!=='None' && !isNaN(parse(m.fecha_hora).getTime())); if(!conF.length) return NaN;
  const tUlt=parse(conF[conF.length-1].fecha_hora).getTime();
  const desde=tUlt - win*3600000;
  let ven=conF.filter(m=>{const t=parse(m.fecha_hora).getTime(); return !isNaN(t)&&t>=desde;});
  if(ven.length<2) ven=conF.slice(-40);                          // fallback si la ventana no alcanza
  const fmtLab = win>=720 ? (d=>('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2))
              : win>=48  ? (d=>('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+'h')
              :            (d=>('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2));
  const labels=ven.map(m=>fmtLab(parse(m.fecha_hora)));
  const data=ven.map(m=>info.bool ? (m[info.campo]?1:0) : parseFloat(m[info.campo]));
  const nums=data.filter(v=>!isNaN(v));
  const maxV=nums.length?Math.max.apply(null,nums):NaN;
  const maxI=data.findIndex(v=>v===maxV);
  const prom=nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:NaN;
  const ptR=data.map((_,i)=>i===maxI?5:1.3);
  const ptC=data.map((_,i)=>i===maxI?'#c0392b':info.color);
  // resolución temporal (mediana de intervalos) + % de datos transmitidos (detecta huecos)
  const ts=ven.map(m=>parse(m.fecha_hora).getTime()).filter(t=>!isNaN(t)).sort((a,b)=>a-b);
  let medGap=NaN;
  if(ts.length>2){ const g=[]; for(let i=1;i<ts.length;i++) g.push(ts[i]-ts[i-1]); g.sort((a,b)=>a-b); medGap=g[Math.floor(g.length/2)]; }
  const resTxt = isNaN(medGap)||medGap<=0 ? '—' : (medGap>=60000?('≈ '+Math.round(medGap/60000)+' min'):('≈ '+Math.round(medGap/1000)+' s'));
  let pct=100;
  if(!isNaN(medGap)&&medGap>0&&ts.length>1){ const esp=Math.round((ts[ts.length-1]-ts[0])/medGap)+1; if(esp>0) pct=Math.min(100,Math.round(ven.length/esp*100)); }
  const u=info.unidad?(' '+info.unidad):'';
  const cv=p.querySelector('#sd-chart'); if(_detChart) _detChart.destroy();
  if(window.Chart) _detChart=new Chart(cv.getContext('2d'),{type:'line',
    data:{labels:labels,datasets:[{label:info.label,data:data,borderColor:info.color,
      backgroundColor:'rgba(46,139,87,.12)',fill:true,tension:.3,pointRadius:ptR,
      pointBackgroundColor:ptC,pointBorderColor:ptC,stepped:!!info.bool}]},
    options:{plugins:{legend:{display:false},
      tooltip:{callbacks:{label:it=>info.label+': '+(info.bool?(it.parsed.y?'Sí':'No'):fmtNum(it.parsed.y)+u)}}},
      scales:{x:{ticks:{maxTicksLimit:6,autoSkip:true}},y:{beginAtZero:!!info.bool,
        ticks:info.bool?{stepSize:1,callback:v=>v?'Sí':'No'}:{}}},responsive:true,maintainAspectRatio:false}});
  // valor grande actual
  const last=ven.length?ven[ven.length-1]:{}; const actual=last[info.campo];
  const sv=p.querySelector('.sd-valor');
  if(sv) sv.innerHTML = info.bool ? (actual?'🌧️ Lloviendo':'☀️ Sin lluvia')
    : (fmtNum(actual)+' <span style="font-size:14px;font-weight:600">'+(info.unidad||'')+'</span>');
  // panel Resumen (estilo SIATA)
  const res=p.querySelector('#sd-resumen');
  if(res){
    let html='<div class="sd-serie-tit">Resumen</div>'
      +_kv('Estación','P1 · '+((CONFIG.SENSOR&&CONFIG.SENSOR.nombre)||'La Correa'))
      +_kv('Tipo de sensor',info.tipo||info.label)
      +_kv('Resolución temporal',resTxt)
      +_kv('Datos transmitidos',pct+' %');
    if(info.bool){ const si=ven.filter(m=>m[info.campo]).length;
      html+=_kv('% del periodo con lluvia',(ven.length?Math.round(si/ven.length*100):0)+' %'); }
    else { html+=_kv('Máximo',fmtNum(maxV)+u)+_kv(info.campo==='nivel_agua'?'Nivel medio':'Promedio',fmtNum(prom)+u); }
    html+=_kv('N.º de lecturas',ven.length)
      +'<div class="sd-note2">*Calidad de datos sin verificar exhaustivamente.</div>';
    res.innerHTML=html;
  }
  return parseFloat(last.nivel_agua);
}
async function abrirPanelSensor(key){
  const info=SENSOR_INFO[key]; if(!info) return;
  const p=panelDetalle(); p.style.display='block';
  if(window.CONEX) pintarConexion(window.CONEX);   // refleja el estado de conexión actual al abrir
  // Pestañas propias del NIVEL del agua (no aplican a lluvia/temperatura/humedad): se ocultan.
  const soloNivel=['niveles','perfil','galeria'];
  p.querySelectorAll('.sd-tabs button').forEach(b=>{ b.style.display=(key!=='nivel'&&soloNivel.includes(b.dataset.t))?'none':''; });
  p.querySelectorAll('.sd-tab').forEach(d=>{ if(key!=='nivel'&&soloNivel.includes(d.dataset.tab)) d.style.display='none'; });
  sdTab('series');
  p.querySelector('.sd-sub').textContent=info.label+(info.unidad?' ('+info.unidad+')':'');
  p.querySelector('.sd-valor').textContent='cargando…';
  let lista=[];
  try{
    if(!_medCache || (Date.now()-_medTime)>20000){
      const r=await fetch(CONFIG.API_BASE+'/mediciones',{cache:'no-store'}); if(!r.ok) throw 0;
      _medCache=await r.json(); _medTime=Date.now();
    }
    lista=Array.isArray(_medCache)?_medCache.slice():[];
  }catch(e){ p.querySelector('.sd-valor').textContent='Sin datos (API no disponible)'; return; }
  lista=lista.filter(m=>m.fecha_hora);                       // descartar registros de prueba sin fecha
  lista.sort((a,b)=>(a.id_medicion||0)-(b.id_medicion||0));   // orden cronológico por id
  // El sensor entrega DISTANCIA; convertimos a NIVEL DE AGUA (= NIVEL_REF - lectura) una sola vez,
  // así toda la pestaña (serie, resumen, perfil, niveles) trabaja con el nivel que sube con el agua.
  const _REFd=(CONFIG&&CONFIG.NIVEL_REF)||170;
  lista=lista.map(m=>{ const raw=parseFloat(m.nivel_agua); return isNaN(raw)?m:Object.assign({},m,{nivel_agua:+(_REFd-raw).toFixed(2)}); });
  const nivelCm=_pintarSerie(info, lista);                    // serie por ventana de tiempo + máximo + resumen
  renderLecturas(lista, info);
  renderNiveles(nivelCm);
  renderCorte(nivelCm);
}
const hist={labels:[],data:[]};let chart;
function initChart(){const ctx=document.getElementById('sensor-chart');if(!ctx||!window.Chart)return;
  chart=new Chart(ctx,{type:'line',data:{labels:hist.labels,datasets:[{label:'Nivel',data:hist.data,borderColor:'#2e8b57',backgroundColor:'rgba(46,139,87,.15)',fill:true,tension:.3,pointRadius:2}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}},responsive:true,maintainAspectRatio:false}});}
function setEstado(t){const b=document.getElementById('estado-badge');t=t||'SIN DATO';b.textContent=t;b.className='estado-'+t.toUpperCase().replace(/\s/g,'');}
// Deriva estado y color del nivel medido (cm) contra CONFIG.UMBRALES
// El sensor mide DISTANCIA hasta el agua: a MENOR lectura, MAYOR peligro (agua más cerca
// del sensor). Por eso el umbral "preventivo" (el número más chico) dispara la alerta
// más grave, y "critico" (el más grande) la más leve — es intencional, no un error.
function estadoPorNivel(nv){const U=(CONFIG&&CONFIG.UMBRALES)||{preventivo:100,prevencion:120,critico:140};
  if(isNaN(nv)) return {txt:'SIN DATO',col:'#888'};
  if(nv<=U.preventivo) return {txt:'CRÍTICA',   col:'#c0392b'};
  if(nv<=U.prevencion) return {txt:'PRECAUCIÓN',col:'#e67e22'};
  if(nv<=U.critico)    return {txt:'PREVENCIÓN',col:'#EAB308'};
  return {txt:'NORMAL',col:'#2e9e57'};}
function fila(id,v){const e=document.getElementById(id);if(e)e.textContent=(v!==undefined&&v!==null)?v:'—';}

// ===== Estado de CONEXIÓN real del sensor (muestra la verdad) =====
// Regla robusta e independiente de la zona horaria: el sensor está CONECTADO
// solo si están llegando lecturas nuevas (id_medicion crece) dentro de la ventana.
// Si el id no cambia => dato estático => DESCONECTADO. Un dato claramente viejo
// (>6 h) se marca desconectado de inmediato, sin esperar.
function _parseFechaLocal(s){ if(!s) return NaN; s=String(s).trim().replace(' ','T').replace(/\.\d+$/,''); return new Date(s).getTime(); }
function _relTiempo(ms){ if(!isFinite(ms)) return ''; let s=Math.round(Math.abs(ms)/1000);
  if(s<60) return 'hace '+s+' s'; let m=Math.round(s/60); if(m<60) return 'hace '+m+' min';
  let h=Math.round(m/60); if(h<24) return 'hace '+h+' h'; let d=Math.round(h/24); return 'hace '+d+(d===1?' día':' días'); }
function _fechaCorta(s){ const t=_parseFechaLocal(s); if(isNaN(t)) return String(s||'—');
  const d=new Date(t); const p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes()); }
function evaluarConexion(d,C){
  const now=Date.now(), maxMs=((CONFIG&&CONFIG.CONEXION_MAX_MIN)||15)*60000;
  const id=+((d&&d.id_medicion)||0), edad=now-_parseFechaLocal(d&&d[C.fecha]);
  const T=window._cxTrack||(window._cxTrack={lastId:null,lastNew:0,started:now});
  if(T.lastId===null){ T.lastId=id; }                       // primer sondeo: fija línea base
  else if(id>T.lastId){ T.lastId=id; T.lastNew=now; }       // llegó lectura nueva
  let ok;
  if(T.lastNew>0){ ok=(now-T.lastNew)<=maxMs; }             // hay historial: ¿siguen llegando?
  else if(isFinite(edad)&&edad>6*3600000){ ok=false; }      // dato claramente viejo => desconectado ya
  else if((now-T.started)<25000){ ok=null; }                // aún verificando (2–3 sondeos)
  else{ ok=false; }                                          // id estático >25 s => desconectado
  return { ok, edad, fecha:(d&&d[C.fecha])||'' };
}
function pintarConexion(cx){
  window.CONEX=cx;
  const txt = cx.ok===true?'Conectado' : cx.ok===false?'Desconectado' : 'Verificando…';
  const dot = cx.ok===true?'🟢' : cx.ok===false?'🔴' : '⚪';
  const cls = cx.ok===true?'cx-on' : cx.ok===false?'cx-off' : 'cx-wait';
  const b=document.getElementById('conexion-badge');
  if(b){ b.textContent=dot+' '+txt; b.className='cx-badge '+cls;
    b.title=cx.fecha?('Última lectura: '+_fechaCorta(cx.fecha)+(isFinite(cx.edad)?' ('+_relTiempo(cx.edad)+')':'')):''; }
  const ps=document.getElementById('panel-sensor'); if(ps) ps.classList.toggle('disc', cx.ok===false);
  const sc=document.querySelector('#sensor-detalle .sd-cx');
  if(sc){ sc.textContent='● '+txt; sc.className='sd-cx '+cls; }
}
// Fetch con timeout: aborta si el servidor tarda demasiado (evita peticiones colgadas
// en GitHub Pages cuando Render está en arranque en frío). El timeout (9 s) es menor que
// REFRESH_MS (10 s), así nunca se solapan dos peticiones.
function _fetchT(url,ms){ const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms||9000);
  return fetch(url,{cache:'no-store',signal:c.signal}).finally(()=>clearTimeout(t)); }
let _leyendo=false, _fallosConx=0;
async function leerSensor(){const C=CONFIG.CAMPOS;
  if(_leyendo) return;                         // no solapar peticiones (arranque en frío de Render)
  _leyendo=true;
  try{
  // Conexión con la API por /mapa (GeoJSON con todas las mediciones del punto P1)
  const r=await _fetchT(CONFIG.API_BASE+(CONFIG.ENDPOINT_MAPA||'/mapa'),9000);if(!r.ok)throw new Error('HTTP '+r.status);
  const gj=await r.json(); _fallosConx=0; let d={};
  if(gj&&gj.features){ let f=gj.features.map(x=>x.properties||{}).filter(m=>m[C.fecha]);
    f.sort((a,b)=>(b.id_medicion||0)-(a.id_medicion||0)); d=f[0]||{}; }   // más reciente primero
  else if(Array.isArray(gj)) d=gj[0]||{}; else d=gj||{};
  // Nivel de agua mostrado = NIVEL_REF - lectura del sensor (sube cuando la distancia baja)
  const _REF=(CONFIG&&CONFIG.NIVEL_REF)||170; const _nivAgua=_REF-parseFloat(d[C.nivel]);
  fila('v-nivel', isNaN(_nivAgua)?'—':_nivAgua.toFixed(2));fila('v-temp',d[C.temp]);fila('v-humedad',d[C.humedad]);
  fila('v-lluvia',d[C.lluvia]===true?'Sí':d[C.lluvia]===false?'No':d[C.lluvia]);
  // Estado derivado del NIVEL real vs umbrales (el campo estado_alerta del prototipo es inconsistente)
  const est=estadoPorNivel(parseFloat(d[C.nivel]));
  setEstado(est.txt);
  // Estado de conexión REAL (basado en si siguen llegando lecturas nuevas)
  const cx=evaluarConexion(d,C); pintarConexion(cx);
  const antig=isFinite(cx.edad)?' · '+_relTiempo(cx.edad):'';
  document.getElementById('sensor-update').textContent='Última lectura: '+(d[C.fecha]?_fechaCorta(d[C.fecha]):new Date().toLocaleString())+antig;
  sensorMarker.setIcon(iconNivel(est.col));
  // Conectar el marcador P1 con la lectura: popup con los datos en vivo
  const fmt=v=>(v!==undefined&&v!==null&&v!=='')?v:'—';
  const cxTxt=cx.ok===true?'Conectado':cx.ok===false?'Desconectado':'Verificando…';
  const cxCol=cx.ok===true?'#2e9e57':cx.ok===false?'#c0392b':'#9a9a92';
  sensorMarker.setPopupContent(
    '<div style="min-width:190px;font-size:12.5px">'
    +'<b>📡 '+CONFIG.SENSOR.nombre+'</b>'
    +'<div style="margin:4px 0;font-weight:700;color:'+cxCol+'">'+(cx.ok===true?'🟢':cx.ok===false?'🔴':'⚪')+' '+cxTxt+'</div>'
    +'<div style="margin:5px 0;font-weight:700;color:'+est.col+'">● '+est.txt+'</div>'
    +'<div><b>Nivel del agua:</b> '+(isNaN(_nivAgua)?'—':_nivAgua.toFixed(2))+' cm</div>'
    +'<div><b>Temperatura:</b> '+fmt(d[C.temp])+' °C</div>'
    +'<div><b>Humedad:</b> '+fmt(d[C.humedad])+' %</div>'
    +'<div><b>¿Lloviendo?:</b> '+(d[C.lluvia]===true?'Sí':d[C.lluvia]===false?'No':fmt(d[C.lluvia]))+'</div>'
    +'<div style="font-size:11px;color:#666;margin-top:5px">Última lectura: '+fmt(d[C.fecha])+'</div>'
    +'</div>');
  if(!isNaN(_nivAgua)){hist.labels.push(new Date().toLocaleTimeString());hist.data.push(_nivAgua);if(hist.data.length>20){hist.labels.shift();hist.data.shift();}if(chart)chart.update();}
  // En vivo: si el panel del sensor (estilo SIATA) está abierto, agrega la lectura nueva a su serie.
  const sd=document.getElementById('sensor-detalle');
  if(sd && sd.style.display!=='none' && _serieInfo && _serieLista && _serieLista.length && d[C.fecha]){
    const prev=_serieLista[_serieLista.length-1];
    const esNueva = (d.id_medicion||0)>(prev.id_medicion||0) || String(d[C.fecha])!==String(prev[C.fecha]);
    if(esNueva){ const raw=parseFloat(d.nivel_agua); const dConv=isNaN(raw)?d:Object.assign({},d,{nivel_agua:+(((CONFIG&&CONFIG.NIVEL_REF)||170)-raw).toFixed(2)}); _serieLista.push(dConv);
      const nc=_pintarSerie(_serieInfo,_serieLista); renderNiveles(nc); renderCorte(nc); }
  }
 }catch(e){
   _fallosConx++;
   const arranque=_fallosConx<=3;   // ventana de arranque en frío (~30 s): "Conectando…" antes de "Desconectado"
   setEstado('SIN DATO');
   pintarConexion({ok: arranque?null:false, edad:Infinity, fecha:''});
   document.getElementById('sensor-update').textContent = arranque
     ? 'Conectando con el servidor… (puede tardar en activarse tras inactividad)'
     : 'API no disponible (revisa endpoint/CORS). '+e.message;
   try{ sensorMarker.setPopupContent('<b>📡 '+CONFIG.SENSOR.nombre+'</b><br>'+(arranque?'Conectando…':'Sin datos (API no disponible)')); }catch(_){}
 } finally { _leyendo=false; }
}
// El panel "Estación de monitoreo" (#panel-sensor) permanece SIEMPRE visible mientras
// se trabaja con los sensores de La Correa. NO se oculta al hacer clic en el mapa ni al
// activar/desactivar sensores: SOLO se oculta cuando el usuario entra a otra sección del
// menú (Conocimiento del riesgo o Manejo de desastres) — esa lógica vive en navbar.js.
window.mostrarPanelEstacion=function(on){ const p=document.getElementById('panel-sensor'); if(p) p.style.display=on?'block':'none'; };
// Contexto "sensores de La Correa": la estación, la capa de sensores de nivel o la ventana de niveles.
window.enContextoCorrea=function(){ const s=window._initSearch||location.search; return /siata_nivel/.test(s) || /[?&](niveles|lluvia)=1/.test(s) || /[?&]clima=(temp|humedad)/.test(s); };
window.addEventListener('load',()=>{
  // Visible de entrada si venimos en contexto de sensores de La Correa; si no, oculto hasta activarlo.
  window.mostrarPanelEstacion(!!window.enContextoCorrea());
  initChart(); leerSensor(); setInterval(leerSensor,CONFIG.REFRESH_MS);
});

// ---------- Leyenda dinámica (según capas activas) ----------
const SW=c=>`<i style="background:${c}"></i>`;
const LN=c=>`<i style="background:${c};height:3px;border-radius:1px"></i>`;
const legendSpec={
 amenaza:()=>'<h4>Amenaza</h4>'+['ALTA','MEDIA','BAJA'].map(k=>`<div>${SW(C_NIVEL[k])}${k}</div>`).join(''),
 exposicion:()=>'<h4>Exposición</h4>'+[['≤30 m','ALTA'],['30–60 m','MEDIA'],['60–100 m','BAJA']].map(([t,k])=>`<div>${SW(C_NIVEL[k])}${t}</div>`).join(''),
 riesgo:()=>'<h4>Riesgo</h4>'+['ALTO','MEDIO','BAJO'].map(k=>`<div>${SW(C_RIESGO[k])}${k}</div>`).join(''),
 susceptibilidad:()=>'<h4>Susceptibilidad</h4>'+['Muy alta','Alta','Media','Baja','Muy baja'].map(k=>`<div>${SW(C_SUSC[k])}${k}</div>`).join(''),
 cobertura_sonido:()=>'<h4>Cobertura acústica</h4>'+Object.keys(C_DB).map(k=>`<div>${SW(C_DB[k])}${k}</div>`).join(''),
 elementos:()=>'<h4>Elementos (nivel campo)</h4>'+[['1_Critico_emergencia','Crítico'],['2_Alto_potencial','Alto'],['3_MedioAlto_estabilizado','Medio-alto'],['4_Medio_no_inmediato','Medio'],['5_Bajo_recuperacion','Bajo']].map(([k,t])=>`<div>${SW(C_ANTEC[k])}${t}</div>`).join(''),
 antecedentes:()=>'<h4>Eventos antecedentes</h4>'+[['1_Critico_emergencia','Crítico'],['2_Alto_potencial','Alto'],['5_Bajo_recuperacion','Bajo']].map(([k,t])=>`<div>${SW(C_ANTEC[k])}${t}…</div>`).join(''),
 sensor:()=>'<h4>Estación monitoreo</h4>'+`<div>${SW(C_SENSOR.P1)}P1 · punto óptimo</div>`,
 sistema_hidrico:()=>'<h4>Cauces</h4>'+`<div>${LN('#005ce6')}Principal (La Correa)</div><div>${LN('#00c8c8')}Secundario (Potrerito)</div>`,
 bocinas:()=>'<h4>Sirenas</h4><div>🔊 Sirena de alerta</div>',
 cobertura:()=>'<h4>Cobertura sirenas</h4>'+`<div>${SW('#00bcd4')}Radio audible 400 m</div>`,
 cuenca:()=>`<div>${LN('#FFD400')}Microcuenca La Correa</div>`,
 red_hidrica:()=>`<div>${LN('#0a64dc')}Red hídrica</div>`,
 rio_medellin:()=>`<div>${LN('#1565c0')}Río Medellín</div>`,
 microcuenca_abastecedora:()=>`<div>${SW('#00bfa5')}Microcuenca abastecedora</div>`,
 puntos_riesgo:()=>'<h4>Puntos de riesgo</h4>'+[['Avenida torrencial','#c832b4'],['Inundación','#32c8f0'],['Movimiento en masa','#f03c3c'],['Socavación / hundimiento','#e1fa32'],['Estructural','#2dc83c']].map(([t,c])=>`<div>${SW(c)}${t}</div>`).join('')+`<div style="margin-top:5px;font-size:10px;color:#777">Mapa de calor = densidad</div>`,
 zona_inundable:()=>`<div>${SW('#42a5f5')}Zona inundable</div>`,
 puntos_campo:()=>'<h4>Puntos de campo</h4>'+[['1_Critico_emergencia','Crítico'],['2_Alto_potencial','Alto'],['3_MedioAlto_estabilizado','Medio-alto'],['4_Medio_no_inmediato','Medio'],['5_Bajo_recuperacion','Bajo']].map(([k,t])=>`<div>${SW(C_ANTEC[k])}${t}</div>`).join(''),
 puntos_sensor_ahp:()=>'<h4>Candidatos AHP</h4>'+`<div>${SW('#1b5e20')}P1 · óptimo</div><div>${SW('#3949ab')}P2 · P3 (análisis)</div>`,
 uso_suelo:()=>'<h4>Uso del suelo</h4>'+Object.keys(C_COB).map(k=>`<div>${SW(C_COB[k])}${k}</div>`).join(''),
 veredas:()=>`<div>${SW('#a5d6a7')}Límites veredales</div>`,
 curvas_nivel:()=>'<h4>Curvas de nivel</h4>'+`<div>${LN('#6d4c41')}Índice</div><div>${LN('#bcaaa4')}Intermedia (5 m)</div>`,
 red_hidrica_muni:()=>`<div>${LN('#1e88e5')}Red hídrica municipal</div>`,
 red_oficial_corantioquia:()=>`<div>${LN('#00acc1')}Red oficial CORANTIOQUIA</div>`,
};
let legendDiv;
function updateLegend(){ if(!legendDiv)return;
  const blocks=DEF.filter(d=>d.layer&&map.hasLayer(d.layer)&&legendSpec[d.k]).map(d=>legendSpec[d.k]());
  legendDiv.innerHTML='<div class="leg-title">Leyenda</div>'+(blocks.length?blocks.join(''):'<div style="color:#888;font-size:11px">Activa una capa</div>');
}
const leyenda=L.control({position:'bottomleft'});
leyenda.onAdd=function(){legendDiv=L.DomUtil.create('div','leyenda');legendDiv.style.maxHeight='48vh';legendDiv.style.overflowY='auto';L.DomEvent.disableScrollPropagation(legendDiv);updateLegend();return legendDiv;};

// ---------- Cuencas del municipio (menú Conocimiento del riesgo) ----------
const cuencaLayers={}; let cuencasData=null, redSubData=null;
const colorCuenca=i=>`hsl(${Math.round(i*137.508)%360},62%,52%)`;
window.setCuenca=function(nombre,on,color){
  if(on){
    if(!cuencaLayers[nombre]){
      const g=L.layerGroup();
      if(cuencasData) L.geoJSON(cuencasData,{filter:f=>(f.properties.Nombre||'(sin nombre oficial)')===nombre,
        style:{color:'#2b2b2b',weight:1.2,fillColor:color||'#3a9e63',fillOpacity:.38},
        onEachFeature:(f,l)=>l.bindPopup('<b>Subcuenca:</b> '+nombre+(f.properties.Area_ha?'<br>Área: '+Math.round(f.properties.Area_ha)+' ha':''))}).addTo(g);
      if(redSubData) L.geoJSON(redSubData,{filter:f=>(f.properties.Nombre||'(sin nombre oficial)')===nombre,
        style:{color:'#0a4fb0',weight:1,opacity:.9}}).addTo(g);
      cuencaLayers[nombre]=g;
    }
    cuencaLayers[nombre].addTo(map);
    // zoom a la cuenca recién activada
    try{ const b=cuencaLayers[nombre].getBounds&&cuencaLayers[nombre].getBounds();
      if(b&&b.isValid()) map.fitBounds(b,{padding:[30,30]});
      else { let bb=null; cuencaLayers[nombre].eachLayer(l=>{ if(l.getBounds){const lb=l.getBounds(); if(lb.isValid()) bb=bb?bb.extend(lb):lb;} });
        if(bb&&bb.isValid()) map.fitBounds(bb,{padding:[30,30]}); }
    }catch(e){}
  } else if(cuencaLayers[nombre]) map.removeLayer(cuencaLayers[nombre]);
  if(nombre==='Quebrada El Salado' && !on){            // limpiar capas de El Salado al desactivar (productos en flyout)
    ['amenaza','exposicion','riesgo'].forEach(k=>{ if(saladoLyr[k]) map.removeLayer(saladoLyr[k]); });
  }
  if(nombre==='Quebrada de la Correa'){                // productos INICIAN INACTIVOS; el usuario los activa en el flyout
    try{ on?sensorMarker.addTo(map):map.removeLayer(sensorMarker); }catch(e){}
    if(!on) CORREA_KEYS.forEach(k=>window.geoToggle(k,false));   // al desactivar, apagar todos los productos
  }
};

// ---- Flyout lateral de productos (cuencas con submenú: La Correa, El Salado) ----
async function saladoToggle(key,on){ try{ const lyr=await saladoLayer(key); on?lyr.addTo(map):map.removeLayer(lyr); }catch(e){} }
function itemsCorrea(){ return CORREA_KEYS.map(k=>{ const d=DEFBYK[k]; if(!d) return null;
  return {label:d.label,color:d.color,on:!!(d.layer&&map.hasLayer(d.layer)),toggle:v=>window.geoToggle(k,v)}; }).filter(Boolean); }
function itemsSalado(){ const C={amenaza:'#E24B4A',exposicion:'#f9a825',riesgo:'#c80000'},
    T={amenaza:'⚠️ Amenaza',exposicion:'👥 Exposición',riesgo:'🔴 Riesgo'};
  return ['amenaza','exposicion','riesgo'].map(k=>({label:T[k],color:C[k],
    on:!!(saladoLyr[k]&&map.hasLayer(saladoLyr[k])),toggle:v=>saladoToggle(k,v)})); }
let _flyAnchor=null,_flyTimer=null;
function cerrarFlyout(){ const f=document.getElementById('cuenca-flyout'); if(f) f.style.display='none';
  document.querySelectorAll('.nav-item.fly-open').forEach(n=>n.classList.remove('fly-open')); // dejar que el menú se cierre
  _flyAnchor=null; }
function _programarCierre(){ clearTimeout(_flyTimer); _flyTimer=setTimeout(cerrarFlyout,260); }
function _cancelarCierre(){ clearTimeout(_flyTimer); }
function abrirFlyout(anchor,titulo,items){
  let f=document.getElementById('cuenca-flyout');
  if(!f){ f=document.createElement('div'); f.id='cuenca-flyout'; document.body.appendChild(f);
    f.addEventListener('click',e=>e.stopPropagation());
    f.addEventListener('mouseenter',_cancelarCierre);   // mantener abierto mientras se usa
    f.addEventListener('mouseleave',_programarCierre); }
  // cerrar el flyout al hacer clic fuera del menú y fuera del flyout (una sola vez)
  if(!window._flyDocWired){ window._flyDocWired=true;
    document.addEventListener('click',function(e){
      const fl=document.getElementById('cuenca-flyout');
      if(!fl || fl.style.display==='none') return;
      if(fl.contains(e.target)) return;
      if(e.target.closest && e.target.closest('.nav-item')) return;
      cerrarFlyout();
    }); }
  // cerrar el flyout cuando se cierra el menú principal (al salir del desplegable)
  const dd=anchor.closest('.dropdown');
  if(dd && !dd._flyWired){ dd._flyWired=true;
    dd.addEventListener('mouseleave',_programarCierre);
    dd.addEventListener('mouseenter',_cancelarCierre); }
  _cancelarCierre();
  f.innerHTML='<div class="cf-h"><span>'+titulo+'</span><span class="cf-x" title="Cerrar">✕</span></div><div class="cf-body"></div>';
  const body=f.querySelector('.cf-body');
  items.forEach(it=>{ const row=document.createElement('div'); row.className='cf-it';
    row.innerHTML='<span class="sat-swatch" style="background:'+it.color+'"></span><span class="sat-tx">'+it.label+'</span>'
      +'<label class="sat-sw"><input type="checkbox" '+(it.on?'checked':'')+'><span class="sat-kn"></span></label>';
    const inp=row.querySelector('input');
    inp.addEventListener('change',e=>{ e.stopPropagation(); it.toggle(inp.checked); });
    row.querySelector('.sat-sw').addEventListener('click',e=>e.stopPropagation());
    body.appendChild(row); });
  f.querySelector('.cf-x').addEventListener('click',cerrarFlyout);
  f.style.display='block';
  const r=anchor.getBoundingClientRect();
  f.style.left=(r.right+4)+'px';
  f.style.top=Math.max(8,Math.min(r.top,window.innerHeight-f.offsetHeight-10))+'px';
  // mantener abierto el menú "Conocimiento" mientras el flyout esté visible (se cierran juntos)
  document.querySelectorAll('.nav-item.fly-open').forEach(n=>n.classList.remove('fly-open'));
  const nav=anchor.closest('.nav-item'); if(nav) nav.classList.add('fly-open');
  _flyAnchor=anchor;
}
function flyoutDe(nm){ return nm==='Quebrada de la Correa'?{t:'Productos · La Correa',it:itemsCorrea}
  : nm==='Quebrada El Salado'?{t:'Productos · El Salado',it:itemsSalado} : null; }
async function initCuencas(){
  const ul=document.getElementById('nav-cuencas'); if(!ul) return;
  try{ cuencasData=await cargar('data/cuencas_municipio.geojson'); }
  catch(e){ ul.innerHTML='<li style="padding:9px 18px;color:#fbb;font-size:11px">No se pudo cargar</li>'; return; }
  try{ redSubData=await cargar('data/red_subcuencas.geojson'); }catch(e){ redSubData=null; }
  const nombres=[...new Set(cuencasData.features.map(f=>f.properties.Nombre||'(sin nombre oficial)'))].sort();
  ul.innerHTML='';
  nombres.forEach((nm,i)=>{
    const col=colorCuenca(i);
    const fly=flyoutDe(nm);   // El Salado / La Correa tienen submenú de productos
    const li=document.createElement('li'); li.className='sat-it';
    li.innerHTML=`<span class="sat-swatch" style="background:${col}"></span><span class="sat-tx">${nm}</span>`
      + (fly?`<span class="cu-fly" title="Ver productos">▸</span>`:'')
      + `<label class="sat-sw" title="Activar ${nm}"><input type="checkbox"><span class="sat-kn"></span></label>`;
    const inp=li.querySelector('input');
    inp.addEventListener('change',e=>{ e.stopPropagation(); window.setCuenca(nm,inp.checked,col);
      if(fly){ if(inp.checked) abrirFlyout(li,fly.t,fly.it()); else cerrarFlyout(); } });
    li.querySelector('.sat-sw').addEventListener('click',e=>e.stopPropagation());
    if(fly){ const c=li.querySelector('.cu-fly'); c.addEventListener('click',e=>{ e.stopPropagation();
      if(_flyAnchor===li) cerrarFlyout(); else abrirFlyout(li,fly.t,fly.it()); }); }
    ul.appendChild(li);
  });
  ul.addEventListener('scroll',cerrarFlyout);
}
if(document.readyState==='loading') addEventListener('DOMContentLoaded',initCuencas); else initCuencas();

// ---------- Uso del suelo por clase (menú Conocimiento del riesgo) ----------
let usoData=null; const usoLayers={};
window.setUso=function(clase,on){
  if(on){
    if(!usoLayers[clase] && usoData){
      usoLayers[clase]=L.geoJSON(usoData,{filter:f=>f.properties.Cobertura===clase,
        style:{color:'#555',weight:.3,fillColor:C_COB[clase]||'#ccc',fillOpacity:.6},
        onEachFeature:(f,l)=>l.bindPopup('<b>Uso del suelo:</b> '+clase)});
    }
    if(usoLayers[clase]) usoLayers[clase].addTo(map);
  } else if(usoLayers[clase]) map.removeLayer(usoLayers[clase]);
};
async function initUso(){
  const ul=document.getElementById('nav-uso'); if(!ul) return;
  try{ usoData=await cargar('data/uso_suelo.geojson'); }
  catch(e){ ul.innerHTML='<li style="padding:9px 18px;color:#fbb;font-size:11px">No se pudo cargar</li>'; return; }
  const clases=[...new Set(usoData.features.map(f=>f.properties.Cobertura))].sort();
  ul.innerHTML='';
  clases.forEach(cl=>{
    const col=C_COB[cl]||'#999';
    const li=document.createElement('li'); li.className='sat-it';
    li.innerHTML=`<span class="sat-swatch" style="background:${col}"></span><span class="sat-tx">${cl}</span>`
      + `<label class="sat-sw" title="Activar ${cl}"><input type="checkbox"><span class="sat-kn"></span></label>`;
    const inp=li.querySelector('input');
    inp.addEventListener('change',e=>{ e.stopPropagation(); window.setUso(cl,inp.checked); });
    li.querySelector('.sat-sw').addEventListener('click',e=>e.stopPropagation());
    ul.appendChild(li);
  });
}
if(document.readyState==='loading') addEventListener('DOMContentLoaded',initUso); else initUso();

// ---------- Submenú "Productos de la Quebrada La Correa" (foco del proyecto) ----------
// Reúne todas las capas-producto de La Correa; cada toggle usa el controlador único geoToggle
// (sincronizado con el panel de Capas). Se llena desde DEFBYK cuando las capas ya cargaron.
const CORREA_KEYS=['microcuenca_abastecedora','zona_inundable','exposicion','riesgo','puntos_campo',
  'susceptibilidad','elementos','puntos_sensor_ahp','bocinas','sistema_hidrico','amenaza','cobertura'];
function initCorrea(){
  const ul=document.getElementById('nav-correa'); if(!ul) return;
  ul.innerHTML='';
  CORREA_KEYS.forEach(k=>{
    const d=DEFBYK[k]; if(!d) return;
    const on=d.layer&&map.hasLayer(d.layer);
    const li=document.createElement('li'); li.className='sat-it';
    li.innerHTML=`<span class="sat-swatch" style="background:${d.color}"></span><span class="sat-tx">${d.label}</span>`
      +`<label class="sat-sw" title="Activar ${d.label}"><input type="checkbox" data-k="${d.k}" ${on?'checked':''}><span class="sat-kn"></span></label>`;
    const inp=li.querySelector('input');
    inp.addEventListener('change',e=>{ e.stopPropagation(); window.geoToggle(d.k,inp.checked); });
    li.querySelector('.sat-sw').addEventListener('click',e=>e.stopPropagation());
    ul.appendChild(li);
  });
}

// ---------- Submenú de resultados: Quebrada El Salado (análisis F0–F9) ----------
const C_R3={ALTA:'#E24B4A',MEDIA:'#EF9F27',BAJA:'#FFE13C'};
const C_RG={ALTO:'#c80000',MEDIO:'#EF9F27',BAJO:'#FFE13C'};
const saladoLyr={};
async function saladoLayer(key){
  if(saladoLyr[key]) return saladoLyr[key];
  const j=await cargar('data/salado_'+key+'.geojson'); let lyr;
  if(key==='amenaza') lyr=L.geoJSON(j,{style:f=>({color:'#555',weight:.3,fillColor:C_R3[f.properties.Amenaza]||'#ccc',fillOpacity:.5}),onEachFeature:(f,l)=>l.bindPopup('<b>Amenaza:</b> '+f.properties.Amenaza)});
  else if(key==='exposicion') lyr=L.geoJSON(j,{style:f=>({color:'#555',weight:.3,fillColor:C_R3[nivelDe(f.properties.Zona)]||'#ccc',fillOpacity:.45}),onEachFeature:(f,l)=>l.bindPopup('<b>Exposición:</b> '+f.properties.Zona)});
  else lyr=L.geoJSON(j,{style:f=>({color:'#333',weight:.4,fillColor:C_RG[f.properties.Riesgo]||'#ccc',fillOpacity:.55}),onEachFeature:(f,l)=>l.bindPopup('<b>Riesgo:</b> '+f.properties.Riesgo)});
  saladoLyr[key]=lyr; return lyr;
}
if(!document.getElementById('salado-css')){const st=document.createElement('style');st.id='salado-css';
  st.textContent=`#salado-panel{position:absolute;top:120px;left:12px;z-index:1200;width:270px;background:#fff;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.28);font-size:12px;overflow:hidden;display:none}
  #salado-panel .sp-h{background:#1e6b3f;color:#fff;font-weight:700;padding:9px 12px;font-size:13px}
  #salado-panel .sp-sub{padding:7px 12px;color:#444;border-bottom:1px solid #eee;line-height:1.35}
  #salado-panel .sp-it{display:block;padding:8px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer}
  #salado-panel .sp-it input{vertical-align:middle;margin-right:6px}
  #salado-panel .sp-note{padding:7px 12px;color:#888;font-size:10.5px;line-height:1.3}`;
  document.head.appendChild(st);}
function saladoPanel(show){
  let p=document.getElementById('salado-panel');
  if(show){
    if(!p){p=document.createElement('div');p.id='salado-panel';
      p.innerHTML=`<div class="sp-h">Quebrada El Salado — F0–F9</div>
        <div class="sp-sub">Cuenca oficial POMCA · 2.530 ha · Melton 0,247 · Tc 65 min · Q<sub>Tr100</sub>≈488 m³/s* (SCS-CN + GEV)</div>
        <label class="sp-it"><input type="checkbox" data-s="amenaza"><b style="color:#E24B4A">⚠️ Amenaza</b> — ALTA 34 · MEDIA 365 · BAJA 13 ha</label>
        <label class="sp-it"><input type="checkbox" data-s="exposicion"><b style="color:#f9a825">👥 Exposición</b> — 4.298 construcciones · ~8.331 hab</label>
        <label class="sp-it"><input type="checkbox" data-s="riesgo"><b style="color:#c80000">🔴 Riesgo</b> — ALTO 31 · MEDIO 56 · BAJO 121 ha</label>
        <div class="sp-note">* Lluvia diseño GEV CHIRPS (Tr100=80 mm) + SCS-CN grupo C; coincide con transferencia regional (489). Construcciones: Google Open Buildings. Modelado sin datos de campo.</div>`;
      document.body.appendChild(p);
      p.querySelectorAll('input[data-s]').forEach(inp=>inp.addEventListener('change',async()=>{
        const lyr=await saladoLayer(inp.dataset.s); inp.checked?lyr.addTo(map):map.removeLayer(lyr);}));
    }
    p.style.display='block';
  } else if(p){ p.style.display='none';
    Object.values(saladoLyr).forEach(l=>map.removeLayer(l));
    p.querySelectorAll('input[data-s]').forEach(i=>i.checked=false);
  }
}
