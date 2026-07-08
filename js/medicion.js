// =====================================================================
//  Herramienta de medición (distancia y área) — estilo geoportal
//  Distancia = polilínea · Área = polígono (figuras). Clic = punto,
//  doble clic = terminar. Botones separados + "Borrar".
// =====================================================================
(function(){
  function init(){
    if(typeof map==='undefined' || !map){ return setTimeout(init,200); }
    var mode=null, pts=[], finished=false;
    var layer=L.layerGroup().addTo(map);

    var RULER='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 17 L17 3 L21 7 L7 21 Z"/><path d="M7.5 12.5l2 2M11 9l2 2M14.5 5.5l2 2"/></svg>';
    var POLY='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="4,8 13,4 21,11 16,20 6,18"/></svg>';

    // ---------- Panel ----------
    var panel=document.createElement('div'); panel.id='medicion-panel'; panel.style.display='none';
    panel.innerHTML=
      '<div class="med-h"><span>📐 Medición</span><span class="med-x" title="Cerrar">✕</span></div>'+
      '<div class="med-tools">'+
        '<button class="med-btn" data-mode="dist" title="Medir distancia">'+RULER+'<small>Distancia</small></button>'+
        '<button class="med-btn" data-mode="area" title="Medir área">'+POLY+'<small>Área</small></button>'+
      '</div>'+
      '<div class="med-hint">Clic = agregar punto · doble clic o «Terminar» = cerrar la medición</div>'+
      '<div class="med-res"><b>Resultado de la medición</b><div class="med-out">Selecciona una herramienta…</div></div>'+
      '<div style="display:flex;gap:8px;margin:6px 12px 12px">'+
        '<button class="med-finish" style="flex:1;padding:7px;background:#2e8b57;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">✔ Terminar</button>'+
        '<button class="med-clear" style="flex:1;margin:0;width:auto;padding:7px;background:#e74c3c;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">Borrar</button>'+
      '</div>';
    document.body.appendChild(panel);
    var out=panel.querySelector('.med-out');

    // ---------- Botón en la barra ----------
    var ctl=L.control({position:'topleft'});
    ctl.onAdd=function(){
      var b=L.DomUtil.create('button','geo-tool-btn'); b.title='Medición'; b.innerHTML=RULER;
      L.DomEvent.disableClickPropagation(b);
      L.DomEvent.on(b,'click',function(){ panel.style.display=(panel.style.display==='none')?'block':'none'; });
      return b;
    };
    ctl.addTo(map);

    // ---------- Cálculos ----------
    function fmtDist(m){ return m>=1000 ? (m/1000).toFixed(2)+' km ('+Math.round(m).toLocaleString()+' m)' : Math.round(m)+' m'; }
    function fmtArea(a){ var ha=a/1e4; return ha>=1 ? ha.toFixed(2)+' ha ('+Math.round(a).toLocaleString()+' m²)' : Math.round(a).toLocaleString()+' m² ('+ha.toFixed(3)+' ha)'; }
    function geoArea(ll){ var R=6378137,a=0,n=ll.length; if(n<3) return 0;
      for(var i=0;i<n;i++){ var p1=ll[i],p2=ll[(i+1)%n];
        a+=(p2.lng-p1.lng)*Math.PI/180*(2+Math.sin(p1.lat*Math.PI/180)+Math.sin(p2.lat*Math.PI/180)); }
      return Math.abs(a*R*R/2); }
    function totalDist(ll){ var d=0; for(var i=1;i<ll.length;i++) d+=ll[i-1].distanceTo(ll[i]); return d; }

    // ---------- Dibujo ----------
    function redraw(cursor){
      layer.clearLayers();
      if(!pts.length){ return; }
      var path=(cursor && !finished) ? pts.concat([cursor]) : pts.slice();
      var dashed=(cursor && !finished)?'5':null;
      if(mode==='area' && path.length>=3){
        L.polygon(path,{color:'#1e6b3f',weight:2,fillColor:'#2e8b57',fillOpacity:.2,dashArray:dashed}).addTo(layer);
      } else {
        L.polyline(path,{color:'#1e6b3f',weight:2.6,dashArray:dashed}).addTo(layer);
      }
      pts.forEach(function(p){ L.circleMarker(p,{radius:4,color:'#fff',weight:2,fillColor:'#1e6b3f',fillOpacity:1}).addTo(layer); });
      updateOut(cursor);
    }
    function updateOut(cursor){
      var path=(cursor && !finished) ? pts.concat([cursor]) : pts.slice();
      if(mode==='dist'){
        out.innerHTML='<b>Distancia:</b> '+fmtDist(totalDist(path))+'<br><span class="med-sub">'+path.length+' punto(s)</span>';
      } else if(mode==='area'){
        var per=totalDist(path)+(path.length>=3 ? path[path.length-1].distanceTo(path[0]) : 0);
        out.innerHTML='<b>Área:</b> '+(path.length>=3?fmtArea(geoArea(path)):'—')+'<br><b>Perímetro:</b> '+fmtDist(per);
      }
    }

    // ---------- Modos ----------
    function setMode(m){
      clearMeasure(); mode=m; finished=false;
      panel.querySelectorAll('.med-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.mode===m); });
      map.getContainer().style.cursor='crosshair';
      map.doubleClickZoom.disable();
      out.innerHTML='Haz clic en el mapa para empezar…';
    }
    function clearMeasure(){ pts=[]; finished=false; layer.clearLayers(); _lastT=0; _lastPx=null; }
    function clearAll(){
      clearMeasure(); mode=null;
      map.getContainer().style.cursor=''; map.doubleClickZoom.enable();
      panel.querySelectorAll('.med-btn').forEach(function(b){ b.classList.remove('active'); });
      out.innerHTML='Selecciona una herramienta…';
    }

    // ---------- Eventos del mapa (a nivel del contenedor, en fase de CAPTURA) ----------
    // Se capturan en el contenedor para que la medición funcione INCLUSO sobre las capas
    // vectoriales (veredas, microcuenca, red hídrica, etc.). En Leaflet, un clic sobre un
    // polígono/línea interactivo con popup NO dispara el 'click' del mapa; por eso, sobre
    // esas zonas, "los botones no medían". Al capturar aquí y detener la propagación,
    // el clic siempre agrega punto y no abre el popup mientras se está midiendo.
    var mapEl=map.getContainer();
    var _lastT=0, _lastPx=null;
    function _enPanel(t){ return t && t.closest && (t.closest('#medicion-panel') || t.closest('.leaflet-control')); }
    function finalizar(){                        // cierra la medición conservando la figura
      if(mode && !finished && pts.length){ finished=true; redraw(); mapEl.style.cursor=''; }
    }
    mapEl.addEventListener('click',function(e){
      if(!mode||finished) return;               // solo interviene mientras se mide
      if(_enPanel(e.target)) return;            // no capturar clics del panel/controles
      e.stopPropagation();                       // evita abrir popups de las capas
      var px=map.mouseEventToContainerPoint(e);
      var now=e.timeStamp||performance.now();
      // Detección MANUAL de doble clic, TOLERANTE al "jitter" del ratón: dos clics seguidos
      // (<450 ms) y cerca entre sí (<24 px) cierran la medición SIN duplicar el punto.
      // No se depende del 'dblclick' nativo: en Windows no se dispara si los dos clics se
      // separan más de ~4 px, que es lo normal en un doble clic humano (por eso "no cerraba").
      if(_lastPx && (now-_lastT)<450 && px.distanceTo(_lastPx)<24){
        _lastT=0; _lastPx=null; finalizar(); return;
      }
      pts.push(map.mouseEventToLatLng(e)); redraw();
      _lastT=now; _lastPx=px;
    },true);
    // El doble clic nativo se neutraliza mientras se mide (el cierre lo maneja la detección manual
    // o el botón «Terminar»); así evitamos el zoom o comportamientos inconsistentes entre navegadores.
    mapEl.addEventListener('dblclick',function(e){
      if(!mode) return;
      if(_enPanel(e.target)) return;
      e.stopPropagation(); e.preventDefault();
      finalizar();
    },true);
    mapEl.addEventListener('mousemove',function(e){
      if(!mode||finished||!pts.length) return;
      redraw(map.mouseEventToLatLng(e));         // línea/goma elástica de previsualización
    });

    // ---------- Botones del panel ----------
    panel.querySelectorAll('.med-btn').forEach(function(b){ b.addEventListener('click',function(){ setMode(b.dataset.mode); }); });
    panel.querySelector('.med-finish').addEventListener('click',finalizar);
    panel.querySelector('.med-clear').addEventListener('click',clearAll);
    panel.querySelector('.med-x').addEventListener('click',function(){ clearAll(); panel.style.display='none'; });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
