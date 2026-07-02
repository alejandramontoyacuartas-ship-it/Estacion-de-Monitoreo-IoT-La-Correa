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
          {t:'Sensores de nivel',   h:'index.html?capa=siata_nivel'},
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
      {t:'Emergencias atendidas', h:'index.html?capa=antecedentes'},
      {t:'Cuerpo de Bomberos Voluntarios de Girardota (CBVG)', h:'#'},
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
        html += `<li class="sat-grp"><div class="sat-head"><span class="sat-ic">📡</span><span style="flex:1">${it.t}</span><span class="sat-caret">▾</span></div><ul class="sat-sensores">`
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
            html += `<li class="sat-grp sat-sub"><div class="sat-head sat-head2"><span class="sat-ic">📡</span><span style="flex:1">${s.t}</span><span class="sat-caret">▾</span></div><ul class="sat-sensores">`
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
    // acordeón: cada grupo se despliega/colapsa al hacer clic en su encabezado
    document.querySelectorAll('.sat-grp .sat-head').forEach(h=>{
      h.addEventListener('click', e=>{ e.stopPropagation(); h.parentElement.classList.toggle('open'); });
    });
    document.querySelectorAll('.sat-sw input[data-key]').forEach(inp=>{
      inp.addEventListener('change', e=>{ e.stopPropagation(); aplicar(inp); });
      inp.parentElement.addEventListener('click', e=>e.stopPropagation());
      aplicar(inp); // estado inicial (todos activos => íconos visibles)
    });
  }
  function inject(){ const r=document.getElementById('navbar-root'); if(r){ r.outerHTML=html; wire(); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject); else inject();
})();
