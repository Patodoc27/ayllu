/* AYLLU — núcleo: sesión, router, chrome de la app (topbar + navbar).
   ES2017 (nada de ?. ?? .at() Object.fromEntries). */
(function(){
'use strict';

var SESION = {
  usuario: null,        // { nombre, rol }
  hijoActual: 0,        // índice en DEMO.hijos
  noLeidas: 0
};

var ROLES = {
  padre:      { nombre: 'Padre/Madre', nav: ['inicio','boletin','asistencia','avisos','mensajes','mas'] },
  estudiante: { nombre: 'Estudiante',  nav: ['inicio','boletin','asistencia','materiales','agenda','mas'] },
  docente:    { nombre: 'Docente',     nav: ['misCursos','asistencia','materiales','comunicados','vida','mas'] },
  preceptor:  { nombre: 'Preceptor',   nav: ['resumen','asistencia','docentes','seguimiento','comunicados','mas'] },
  director:   { nombre: 'Director/a',  nav: ['resumen','faltas','docentes','riesgo','comunicados','mas'] },
  admin:      { nombre: 'Secretaría',  nav: ['resumen','comunicados','usuarios','estadisticas','mas'] }
};

var NAV_LABELS = {
  inicio:      { t: 'Inicio',      ic: 'home' },
  boletin:     { t: 'Boletín',     ic: 'boletin' },
  asistencia:  { t: 'Asistencia',  ic: 'asistencia' },
  avisos:      { t: 'Avisos',      ic: 'aviso' },
  mensajes:    { t: 'Mensajes',    ic: 'mensaje' },
  agenda:      { t: 'Agenda',      ic: 'agenda' },
  mas:         { t: 'Más',         ic: 'mas' },
  misCursos:   { t: 'Mis cursos',  ic: 'cursos' },
  comunicados: { t: 'Comunicados', ic: 'comunicado' },
  vida:        { t: 'Vida escolar',ic: 'estrella' },
  alertas:     { t: 'Alertas',     ic: 'alerta' },
  llamados:    { t: 'Llamados',    ic: 'lapiz' },
  resumen:     { t: 'Resumen',     ic: 'home' },
  usuarios:    { t: 'Usuarios',    ic: 'usuarios' },
  estadisticas:{ t: 'Estadísticas',ic: 'chart' },
  materiales:  { t: 'Materiales',  ic: 'archivo' },
  faltas:      { t: 'Faltas',      ic: 'asistencia' },
  riesgo:      { t: 'En riesgo',   ic: 'alerta' },
  docentes:    { t: 'Docentes',    ic: 'usuarios' },
  seguimiento: { t: 'Seguimiento', ic: 'alerta' }
};

/* ---------- Utilidades ---------- */
function el(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function hijo(){ return DEMO.hijos[SESION.hijoActual]; }

function guardarSesion(){
  try{ localStorage.setItem('ayllu_sesion', JSON.stringify(SESION.usuario)); }catch(e){}
}
function restaurarSesion(){
  try{
    var u = JSON.parse(localStorage.getItem('ayllu_sesion')||'null');
    if(u && u.rol){ SESION.usuario = u; return true; }
  }catch(e){}
  return false;
}
function cerrarSesion(){
  try{ localStorage.removeItem('ayllu_sesion'); }catch(e){}
  SESION.usuario = null;
  location.hash = '';
  mostrarLogin();
}

/* ---------- Login ---------- */
var loginPaso = 1;
function mostrarLogin(){
  el('app').innerHTML =
    '<div class="login">' +
      '<div class="marca">' +
        '<img class="logo-login" src="assets/logo-marca.png" alt="AYLLU">' +
        '<h1>' + esc(CONFIG.ESCUELA.nombre) + ' <span>AYLLU</span></h1>' +
        '<p>' + esc(CONFIG.ESCUELA.lema) + '</p>' +
      '</div>' +
      '<div class="caja" id="caja-login"></div>' +
    '</div>';
  pasoEmail();
}

function pasoEmail(){
  loginPaso = 1;
  el('caja-login').innerHTML =
    '<div class="campo"><label for="email">E-mail registrado en la escuela</label>' +
    '<input id="email" type="email" placeholder="tucorreo@mail.com" autocomplete="email"></div>' +
    '<button class="btn magenta ancho" id="btn-continuar">Continuar</button>' +
    '<p class="nota">El acceso es solo por invitación. La escuela envía un código a tu e-mail.</p>' +
    demoBloque();
  el('btn-continuar').onclick = function(){
    var m = el('email').value.trim();
    if(!m || m.indexOf('@')<0){ el('email').focus(); return; }
    pasoCodigo(m);
  };
  el('email').addEventListener('keydown', function(e){ if(e.key==='Enter') el('btn-continuar').click(); });
}

function demoBloque(){
  if(CONFIG.SUPABASE_URL) return '';
  return '<p class="nota" style="margin-top:16px"><b>Modo demo</b> — entrá directo como:</p>' +
    '<div class="roles-demo">' +
      '<button data-rol="padre">Padre</button>' +
      '<button data-rol="estudiante">Estudiante</button>' +
      '<button data-rol="docente">Docente</button>' +
      '<button data-rol="preceptor">Preceptor</button>' +
      '<button data-rol="director">Director/a</button>' +
      '<button data-rol="admin">Secretaría</button>' +
    '</div>';
}

function pasoCodigo(email){
  loginPaso = 2;
  var demoCodigo = '1234';
  el('caja-login').innerHTML =
    '<p class="nota" style="margin-top:0">Enviamos un código de 4 dígitos a<br><b>' + esc(email) + '</b></p>' +
    '<div class="codigo">' +
      '<input maxlength="1" inputmode="numeric" data-i="0">' +
      '<input maxlength="1" inputmode="numeric" data-i="1">' +
      '<input maxlength="1" inputmode="numeric" data-i="2">' +
      '<input maxlength="1" inputmode="numeric" data-i="3">' +
    '</div>' +
    '<button class="btn magenta ancho" id="btn-verificar">Verificar</button>' +
    '<p class="nota">¿No llegó? Revisá spam o pedí reenvío a la escuela.' +
      (CONFIG.SUPABASE_URL ? '' : '<br><b>Demo:</b> el código es ' + demoCodigo) +
    '</p>' +
    demoBloque();
  var inputs = el('caja-login').querySelectorAll('.codigo input');
  inputs[0].focus();
  for(var k=0;k<inputs.length;k++){
    (function(inp,idx){
      inp.addEventListener('input', function(){
        inp.value = inp.value.replace(/[^0-9]/g,'').slice(0,1);
        if(inp.value && idx<3) inputs[idx+1].focus();
      });
      inp.addEventListener('keydown', function(e){
        if(e.key==='Backspace' && !inp.value && idx>0) inputs[idx-1].focus();
      });
    })(inputs[k],k);
  }
  el('btn-verificar').onclick = function(){
    var c=''; for(var j=0;j<inputs.length;j++) c+=inputs[j].value;
    if(CONFIG.SUPABASE_URL){
      // TODO: verificar OTP contra Supabase Auth
      entrar({ nombre: email.split('@')[0], rol: 'padre' });
    } else if(c===demoCodigo){
      entrar({ nombre: 'Laura', rol: 'padre' });
    } else {
      el('caja-login').querySelector('.codigo').style.animation='none';
      alert('Código incorrecto. En demo usá ' + demoCodigo);
    }
  };
}

function entrar(usuario){
  SESION.usuario = usuario;
  SESION.noLeidas = DEMO.notificaciones.filter(function(n){return !n.leida;}).length;
  guardarSesion();
  location.hash = '#/' + ROLES[usuario.rol].nav[0];
  pintar();
}

/* ---------- Router ---------- */
function ruta(){
  var h = location.hash.replace(/^#\/?/, '');
  var rol = SESION.usuario ? SESION.usuario.rol : 'padre';
  var nav = ROLES[rol].nav;
  if(!VISTAS[rol+'.'+h]) h = nav[0];
  return h;
}

function pintar(){
  if(!SESION.usuario){ mostrarLogin(); return; }
  var rol = SESION.usuario.rol;
  var h = ruta();

  var navHtml = '';
  ROLES[rol].nav.forEach(function(id){
    var n = NAV_LABELS[id];
    navHtml += '<a href="#/' + id + '"' + (id===h ? ' class="activo"' : '') + '>' +
      '<span style="position:relative">' + icono(n.ic) + '</span>' + n.t + '</a>';
  });

  el('app').innerHTML =
    '<div class="app">' +
      '<header class="topbar">' +
        '<img src="assets/logo-marca.png" alt="" style="width:40px;height:40px;object-fit:contain">' +
        '<div class="escuela"><div class="nombre">' + esc(CONFIG.ESCUELA.nombre) + '</div>' +
        '<div class="usuario">' + esc(SESION.usuario.nombre) + ' · ' + ROLES[rol].nombre + '</div></div>' +
        '<button class="campana" id="btn-campana" aria-label="Notificaciones">' + icono('campana') +
          (SESION.noLeidas ? '<span class="badge">' + SESION.noLeidas + '</span>' : '') +
        '</button>' +
      '</header>' +
      '<main class="vista" id="vista"></main>' +
      '<nav class="navbar"><div class="navbar-inner">' + navHtml + '</div></nav>' +
    '</div>';

  el('btn-campana').onclick = mostrarNotificaciones;

  var fn = VISTAS[rol + '.' + h] || VISTAS[rol + '.' + ROLES[rol].nav[0]];
  el('vista').innerHTML = '';
  fn(el('vista'));
}

function mostrarNotificaciones(){
  var html = '<div class="titulo-seccion"><h2>Notificaciones</h2></div>';
  DEMO.notificaciones.forEach(function(n){
    html += '<div class="tarjeta" style="display:flex;gap:12px;align-items:flex-start;' + (n.leida?'opacity:.75':'') + '">' +
      '<div class="estado" style="background:' + (n.tipo==='asistencia'?'var(--naranja)':n.tipo==='nota'?'var(--magenta)':'var(--negro)') + '">' +
        icono(n.tipo==='asistencia'?'asistencia':n.tipo==='nota'?'boletin':'comunicado') + '</div>' +
      '<div style="flex:1"><div style="font-size:.88rem">' + esc(n.texto) + '</div>' +
      '<div class="fecha">' + esc(n.fecha) + '</div></div></div>';
  });
  el('vista').innerHTML = html;
  SESION.noLeidas = 0;
  var bd = document.querySelector('#btn-campana .badge');
  if(bd) bd.parentNode.removeChild(bd);
}

/* ---------- Selector de hijo ---------- */
function selectorHijo(){
  var h = hijo();
  return '<div class="selector-contexto">' +
    '<div class="avatar">' + esc(h.avatar) + '</div>' +
    '<div class="nombre">' + esc(h.nombre) + '<div style="font-size:.74rem;color:var(--gris-2);font-weight:500">' + esc(h.curso) + '</div></div>' +
    '<button class="cambiar" id="cambiar-hijo">Cambiar</button></div>';
}
function engancharSelectorHijo(){
  var b = el('cambiar-hijo');
  if(b) b.onclick = function(){
    SESION.hijoActual = (SESION.hijoActual + 1) % DEMO.hijos.length;
    pintar();
  };
}

/* ---------- Arranque ---------- */
document.addEventListener('click', function(e){
  var b = e.target.closest ? e.target.closest('[data-rol]') : null;
  if(b) entrar({ nombre: 'Demo ' + b.getAttribute('data-rol'), rol: b.getAttribute('data-rol') });
});
window.addEventListener('hashchange', pintar);

window.AYLLU = {
  SESION: SESION, DEMO: DEMO, el: el, esc: esc,
  hijo: hijo, selectorHijo: selectorHijo, engancharSelectorHijo: engancharSelectorHijo,
  icono: icono, pintar: pintar, cerrarSesion: cerrarSesion
};

if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

/* ?demo=padre|docente|preceptor|estudiante|admin entra directo (solo sin Supabase) */
var demoRol = (location.search.match(/[?&]demo=(\w+)/)||[])[1];
if(demoRol && ROLES[demoRol] && !CONFIG.SUPABASE_URL){
  entrar({ nombre:'Demo '+demoRol, rol:demoRol });
} else if(restaurarSesion()) pintar(); else mostrarLogin();
})();
