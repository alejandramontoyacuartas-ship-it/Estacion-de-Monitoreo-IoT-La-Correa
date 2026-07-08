// ===== Menú de navegación compartido (estilo DAGRD) =====
// Organiza las vistas del geoportal en las categorías de gestión del riesgo.
// "Productos del SAT" despliega los sensores de la estación P1 (con interruptor + ícono).
(function(){
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Sensores de la estación de monitoreo P1 (cada uno con ícono y fila del panel)
  const SENS = [
    {k:'nivel',   t:'Nivel de la quebrada', row:'v-nivel',
     ic:'<svg width="17" height="17" viewBox="0 0 24 24"><path d="M2 9q3-3 6 0t6 0 6 0" fill="none" stroke="#7fd4ff" stroke-width="2.4" stroke-linecap="round"/><path d="M2 15q3-3 6 0t6 0 6 0" fill="none" stroke="#7fd4ff" stroke-width="2.4" stroke-linecap="round"/></svg>'},
    {k:'lluvia',  t:'Sensor de lluvia', row:'v-lluvia',
     ic:'<svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 13.5a4 4 0 0 1 .3-8 5 5 0 0 1 9.4 1.3A3.4 3.4 0 0 1 16.5 13.5Z" fill="#cfd8dc"/><line x1="9" y1="15.5" x2="8" y2="19.5" stroke="#7fd4ff" stroke-width="2" stroke-linecap="round"/><line x1="12.5" y1="15.5" x2="11.5" y2="19.5" stroke="#7fd4ff" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="15.5" x2="15" y2="19.5" stroke="#7fd4ff" stroke-width="2" stroke-linecap="round"/></svg>'},
    {k:'temp',    t:'Temperatura', row:'v-temp',
     ic:'<svg width="17" height="17" viewBox="0 0 24 24"><path d="M13 14.8V6a2 2 0 0 0-4 0v8.8a3.5 3.5 0 1 0 4 0Z" fill="#fff" stroke="#ff8a80" stroke-width="2"/><circle cx="11" cy="17.5" r="2" fill="#ff8a80"/></svg>'},
    {k:'humedad', t:'Humedad', row:'v-humedad',
     ic:'<svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 3C8 8 6.5 11.5 6.5 14a5.5 5.5 0 0 0 11 0c0-2.5-1.5-6-5.5-11Z" fill="#7fd4ff"/></svg>'},
  ];

  const NAV = [
    {label:'Conocimiento del riesgo', items:[
      {t:'Puntos de riesgo',        h:'puntos_riesgo.html'},
      {t:'Hidrología — subcuencas', h:'index.html', cuencas:true},
      {t:'Uso del suelo',           h:'index.html', uso:true},
      {t:'Inspecciones técnicas de campo — Interinstitucionales', h:'interinstitucionales.html'},
      {t:'Escenarios de Riesgo y Cambio Climático', sub:[
        {t:'Escenarios de Riesgos', h:'escenarios.html'},
        {t:'Cambio Climático',      h:'cambio_climatico.html'},
      ]},
    ]},
    {label:'Reducción del riesgo', items:[
      {t:'Monitoreo y Alertas', grupo:true, items:[
        {t:'Estaciones de monitoreo', sub:[
          {t:'Sensores de nivel',   h:'index.html?capa=siata_nivel,red_hidrica_muni'},
          {t:'Red pluviométrica',    h:'index.html?capa=siata_pluvio'},
          {t:'Red sismológica',      h:'https://geoportal.siata.gov.co/', ext:true},
        ]},
        {t:'Estación de Monitoreo La Correa', estacion:true, extra:[
          {t:'Cobertura de alertas', h:'index.html?capa=cobertura'},
        ]},
        {t:'Tablero de lectura', h:'dashboard.html'},
      ]},
      {t:'Obras de mitigación', h:'#'},
    ]},
    {label:'Manejo de desastres', items:[
      {t:'Emergencias atendidas', h:'emergencias_cbvg.html'},
      {t:'Cuerpo de Bomberos Voluntarios de Girardota (CBVG)', h:'emergencias_cbvg.html'},
    ]},
  ];
  const esta = h => h && h.split('?')[0].toLowerCase() === page;
  const active = cat => cat.items.some(it => esta(it.h)
    || (it.sub   && it.sub.some(s => esta(s.h)))
    || (it.items && it.items.some(s => esta(s.h))));

  const css = `<style>
    .sat-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#fff;font-size:13px;font-weight:700;padding:11px 20px;cursor:pointer;border-top:1px solid rgba(255,255,255,.08);user-select:none}
    .sat-head:hover{background:#3a9e63}
    .sat-caret{font-size:11px;opacity:.85;transition:transform .2s}
    .sat-grp.open > .sat-head .sat-caret{transform:rotate(180deg)}
    .sat-sensores{list-style:none;margin:0;padding:0;background:#1f5e3a;display:none}
    .sat-grp.open > .sat-sensores{display:block}
    /* Subnivel anidado (Estación de Monitoreo La Correa) */
    .sat-head2{padding-left:30px;background:#27764a;font-size:12.5px}
    .sat-sub > .sat-sensores{background:#21532f}
    .sat-sub .sat-it{padding-left:40px}
    .sat-note{padding:8px 18px 8px 40px;color:#cfeede;font-size:10.5px;line-height:1.4;border-top:1px solid rgba(255,255,255,.06)}
    .sat-link{flex:1;color:#eafff0;text-decoration:none}
    .sat-link:hover{text-decoration:underline}
    #nav-cuencas,#nav-correa{max-height:320px;overflow-y:auto}
    .sat-it .sat-swatch{width:13px;height:13px;border-radius:3px;border:1px solid rgba(255,255,255,.5);flex:none}
    .sat-it{display:flex;align-items:center;gap:9px;padding:9px 18px 9px 28px;color:#eafff0;font-size:12.5px;font-weight:600;border-top:1px solid rgba(255,255,255,.06)}
    .sat-it:hover{background:#27764a}
    .sat-ic{width:18px;text-align:center;font-size:14px}
    .sat-tx{flex:1;white-space:nowrap}
    .sat-sw{position:relative;width:34px;height:18px;flex:none;cursor:pointer}
    .sat-sw input{opacity:0;width:0;height:0;position:absolute;margin:0}
    .sat-kn{position:absolute;inset:0;background:#6b6b6b;border-radius:10px;transition:.2s}
    .sat-kn:before{content:"";position:absolute;width:14px;height:14px;left:2px;top:2px;background:#fff;border-radius:50%;transition:.2s}
    .sat-sw input:checked + .sat-kn{background:#7CFC9B}
    .sat-sw input:checked + .sat-kn:before{transform:translateX(16px)}
  </style>`;

  let html = css + '<nav class="navbar"><a class="nav-brand" href="index.html"><img src="img/escudo_girardota.png" alt="Girardota" class="brand-escudo"><span>SAT · La Correa<small>Alcaldía de Girardota</small></span></a><ul class="nav-menu">';
  NAV.forEach(cat=>{
    html += `<li class="nav-item${active(cat)?' active':''}"><span class="nav-link" tabindex="0">${cat.label} ▾</span><ul class="dropdown">`;
    cat.items.forEach(it=>{
      if(it.correa){
        // Oculto por defecto: se revela al activar la subcuenca "Quebrada de la Correa"
        html += `<li class="sat-grp" id="grp-correa" style="display:none"><div class="sat-head">${it.t}<span class="sat-caret">▾</span></div>`
              + `<ul class="sat-sensores" id="nav-correa"><li style="padding:9px 18px;color:#cfeede;font-size:11px">Productos La Correa — abre con Live Server (http)…</li></ul></li>`;
      } else if(it.cuencas){
        html += `<li class="sat-grp"><div class="sat-head">${it.t}<span class="sat-caret">▾</span></div>`
              + `<ul class="sat-sensores" id="nav-cuencas"><li style="padding:9px 18px;color:#cfeede;font-size:11px">Subcuencas del municipio — abre con Live Server (http)…</li></ul></li>`;
      } else if(it.uso){
        html += `<li class="sat-grp"><div class="sat-head">${it.t}<span class="sat-caret">▾</span></div>`
              + `<ul class="sat-sensores" id="nav-uso"><li style="padding:9px 18px;color:#cfeede;font-size:11px">Coberturas — abre con Live Server (http)…</li></ul></li>`;
      } else if(it.estacion){
        // Estación de monitoreo Quebrada La Correa: descripción + sensores (P1)
        html += `<li class="sat-grp"><div class="sat-head est-panel-head"><span class="sat-ic">📡</span><span style="flex:1">${it.t}</span><span class="sat-caret">▾</span></div><ul class="sat-sensores">`
              +   `<li class="sat-note">Estación P1 — mide nivel, lluvia, temperatura y humedad de la quebrada. Activa cada sensor para ver su ícono sobre P1.</li>`;
        SENS.forEach(s=>{
          html += `<li class="sat-it"><span class="sat-ic">${s.ic}</span><span class="sat-tx">${s.t}</span>`
                + `<label class="sat-sw" title="Activar/ocultar ${s.t}"><input type="checkbox" data-row="${s.row}" data-key="${s.k}"><span class="sat-kn"></span></label></li>`;
        });
        html += `</ul></li>`;
      } else if(it.grupo){
        // Submenú anidado con ítems especiales (p. ej. "Monitoreo y Alertas": SIATA + Estación + Tablero)
        html += `<li class="sat-grp"><div class="sat-head">${it.t}<span class="sat-caret">▾</span></div><ul class="sat-sensores">`;
        it.items.forEach(s=>{
          if(s.estacion){
            html += `<li class="sat-grp sat-sub"><div class="sat-head sat-head2 est-panel-head"><span class="sat-ic">📡</span><span style="flex:1">${s.t}</span><span class="sat-caret">▾</span></div><ul class="sat-sensores">`
                  +   `<li class="sat-note">Estación P1 — mide nivel, lluvia, temperatura y humedad de la quebrada. Activa cada sensor para ver su ícono sobre P1.</li>`;
            SENS.forEach(se=>{
              html += `<li class="sat-it"><span class="sat-ic">${se.ic}</span><span class="sat-tx">${se.t}</span>`
                    + `<label class="sat-sw" title="Activar/ocultar ${se.t}"><input type="checkbox" data-row="${se.row}" data-key="${se.k}"><span class="sat-kn"></span></label></li>`;
            });
            (s.extra||[]).forEach(x=>{
              html += `<li class="sat-it"><a class="sat-link" href="${x.h||'#'}"${x.ext?' target="_blank" rel="noopener"':''}>${x.t}${x.ext?' ↗':''}</a></li>`;
            });
            html += `</ul></li>`;
          } else if(s.sub){
            // Submenú anidado de enlaces (p. ej. Estaciones SIATA)
            html += `<li class="sat-grp sat-sub"><div class="sat-head sat-head2">${s.t}<span class="sat-caret">▾</span></div><ul class="sat-sensores">`;
            s.sub.forEach(x=>{
              html += `<li class="sat-it"><a class="sat-link" href="${x.h||'#'}"${x.ext?' target="_blank" rel="noopener"':''}>${x.t}${x.ext?' ↗':''}</a></li>`;
            });
            html += `</ul></li>`;
          } else {
            html += `<li class="sat-it"><a class="sat-link" href="${s.h||'#'}"${s.ext?' target="_blank" rel="noopener"':''}>${s.t}${s.ext?' ↗':''}</a></li>`;
          }
        });
        html += `</ul></li>`;
      } else if(it.sub){
        // Submenú de enlaces (p. ej. "Otras acciones")
        html += `<li class="sat-grp"><div class="sat-head">${it.t}<span class="sat-caret">▾</span></div><ul class="sat-sensores">`;
        it.sub.forEach(s=>{
          html += `<li class="sat-it"><a class="sat-link" href="${s.h||'#'}"${s.ext?' target="_blank" rel="noopener"':''}>${s.t}</a></li>`;
        });
        html += `</ul></li>`;
      } else {
        html += `<li><a href="${it.h}"${it.ext?' target="_blank" rel="noopener"':''}>${it.t}${it.ext?' ↗':''}</a></li>`;
      }
    });
    html += '</ul></li>';
  });
  html += '</ul></nav>';

  function aplicar(inp){
    // Las filas de datos del panel "Estación de monitoreo" siempre quedan visibles;
    // el interruptor controla SOLO el ícono del sensor sobre la estación P1 en el mapa.
    // Por defecto los iconos están apagados y aparecen cuando el usuario los activa.
    if(window.setSensorIcon) window.setSensorIcon(inp.dataset.key, inp.checked);
  }
  function wire(){
    // Red hídrica municipal = capa de CONTEXTO del nivel. Solo visible con "Sensores de nivel"
    // o con el sensor "Nivel de la quebrada" activo; al elegir cualquier otra opción se apaga.
    function redHidrica(on){ if(window.geoToggle){ try{ window.geoToggle('red_hidrica_muni', on); }catch(e){} } }
    // acordeón: cada grupo se despliega/colapsa al hacer clic en su encabezado
    document.querySelectorAll('.sat-grp .sat-head').forEach(h=>{
      h.addEventListener('click', e=>{ e.stopPropagation(); h.parentElement.classList.toggle('open'); });
    });
    document.querySelectorAll('.sat-sw input[data-key]').forEach(inp=>{
      inp.addEventListener('change', e=>{ e.stopPropagation();
        // Si NO estamos en el mapa (p. ej. Tablero de lectura), volver al geoportal donde el sensor funciona.
        if(typeof window.setSensorIcon!=='function'){ const k=inp.dataset.key;
          location.href = k==='nivel'?'index.html?niveles=1' : k==='lluvia'?'index.html?lluvia=1' : (k==='temp'||k==='humedad')?'index.html?clima='+k : 'index.html'; return; }
        aplicar(inp);
        // Al ACTIVAR cualquier sensor se muestra su lectura: el nivel abre la ventana flotante lateral;
        // lluvia/temperatura/humedad abren su panel compacto. Al DESACTIVAR el nivel, se cierra su ventana.
        if(inp.dataset.key==='nivel'){
          // Activar solo enciende el ícono + la red hídrica; la VENTANA se abre al hacer clic en el ícono de nivel.
          if(inp.checked){ redHidrica(true); }
          else { if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante(); redHidrica(false); }
        } else if(inp.dataset.key==='lluvia'){
          // La lluvia abre su propia ventana flotante de registros al activarse (y la cierra al apagarse).
          redHidrica(false);
          if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante();
          if(inp.checked){ if(window.abrirLluviaFlotante) window.abrirLluviaFlotante(); }
          else { if(window.cerrarLluviaFlotante) window.cerrarLluviaFlotante(); }
        } else {
          // temperatura / humedad → ventana flotante con serie de tiempo (selector de periodo)
          redHidrica(false);
          if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante();
          if(window.cerrarLluviaFlotante) window.cerrarLluviaFlotante();
          if(inp.checked){ if(window.abrirClimaFlotante) window.abrirClimaFlotante(inp.dataset.key); }
          else { if(window.cerrarClimaFlotante) window.cerrarClimaFlotante(); }
        }
      });
      inp.parentElement.addEventListener('click', e=>e.stopPropagation());
      aplicar(inp); // estado inicial (todos activos => íconos visibles)
    });
    // Enlace "Niveles de riesgo — Estación P1": en el visor abre la ventana FLOTANTE
    // (no navega); en otras páginas navega a index.html?niveles=1 y allí se abre sola.
    document.querySelectorAll('a[href="index.html?niveles=1"]').forEach(a=>{
      a.addEventListener('click', e=>{ if(window.abrirNivelesFlotante){ e.preventDefault(); window.abrirNivelesFlotante(); } });
    });
    // Al elegir una opción-hoja del menú: cierra la ventana flotante de lectura y apaga la red hídrica
    // municipal. Excepciones: "Niveles de riesgo — Estación P1" (la ABRE) y "Sensores de nivel" (mantiene la red).
    document.querySelectorAll('.navbar a').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/niveles=1/.test(href)) return;                               // ese enlace abre la ventana; no la cierres
      a.addEventListener('click', ()=>{
        if(!/capa=siata_nivel/.test(href)){ redHidrica(false); if(window.limpiarMicrocuenca) window.limpiarMicrocuenca(); }  // "Sensores de nivel" mantiene la red hídrica y el resaltado
        if(window.cerrarNivelesFlotante) window.cerrarNivelesFlotante();
      });
    });
    // Botón "Regresa al geoportal" en el encabezado de las páginas analíticas (estilo verde "Limpiar",
    // más visible). Cubre .header (banner verde) y .esc-head (escenarios / cambio climático).
    // No aparece en el visor del mapa (usa #header, no .header).
    const hdr=document.querySelector('.header, .esc-head');
    if(hdr && !hdr.querySelector('.btn-volver-geo')){
      hdr.style.position='relative';
      const a=document.createElement('a');
      a.className='btn-volver-geo'; a.href='index.html'; a.textContent='← Regresa al geoportal';
      a.style.cssText='position:absolute;top:14px;right:18px;z-index:3;background:#8ccf4d;color:#1e3d2f;'
        +'font-weight:800;font-size:13.5px;text-decoration:none;padding:10px 18px;border-radius:10px;'
        +'box-shadow:0 3px 10px rgba(0,0,0,.28);white-space:nowrap';
      a.addEventListener('mouseover',()=>{a.style.background='#79b85d';});
      a.addEventListener('mouseout',()=>{a.style.background='#8ccf4d';});
      hdr.appendChild(a);
    }
    // Panel "Estación de monitoreo" (#panel-sensor del visor): aparece al hacer clic en
    // "Estación de Monitoreo La Correa"; se oculta al pasar a Conocimiento o Manejo.
    document.querySelectorAll('.est-panel-head').forEach(h=>{
      h.addEventListener('click', ()=>{ if(window.mostrarPanelEstacion) window.mostrarPanelEstacion(true); });
    });
    document.querySelectorAll('.nav-menu > .nav-item').forEach(li=>{
      const lk=li.querySelector(':scope > .nav-link'); if(!lk) return;
      if(/Conocimiento|Manejo/i.test(lk.textContent)){
        // El panel de la estación SOLO se oculta cuando el usuario hace CLIC en otra
        // sección del menú (no al pasar el mouse por encima), para que permanezca
        // visible mientras se trabaja con los sensores de La Correa.
        lk.addEventListener('click', ()=>{ if(window.mostrarPanelEstacion) window.mostrarPanelEstacion(false); });
      }
      // Al salir con el mouse del menú, quita el foco para que el desplegable se cierre
      // (si no, un interruptor/enlace con foco lo mantiene abierto tapando el contenido).
      li.addEventListener('mouseleave', ()=>{ const el=document.activeElement; if(el&&li.contains(el)&&el.blur) el.blur(); });
    });
    // Cerrar el menú al hacer clic FUERA de la barra (para que no tape el Tablero de lectura ni el mapa).
    if(!window._navCloseOutside){ window._navCloseOutside=true;
      document.addEventListener('click', e=>{
        if(e.target.closest && e.target.closest('.navbar')) return;   // clic dentro del menú: no cerrar
        const el=document.activeElement; if(el&&el.blur&&el.closest&&el.closest('.navbar')) el.blur();
        document.querySelectorAll('.navbar .fly-open').forEach(x=>x.classList.remove('fly-open'));
      });
    }
  }
  function inject(){ const r=document.getElementById('navbar-root'); if(r){ r.outerHTML=html; wire(); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject); else inject();
})();
