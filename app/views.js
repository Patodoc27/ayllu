/* AYLLU — vistas por rol. Cada vista recibe el <main> y dibuja.
   Clave: 'rol.seccion'. ES2017-safe. */
var VISTAS = {};
(function(){
'use strict';
var V = function(){ return window.AYLLU; };
var esc = function(s){ return V().esc(s); };
var icono = function(n){ return V().icono(n); };
var D = function(){ return V().DEMO; };

function tarjetaComunicado(c){
  var cat = {urgente:'negra', charla:'magenta', evento:'naranja', autorizacion:'naranja', general:'gris'};
  var html = '<div class="tarjeta">' +
    '<span class="etiqueta ' + (cat[c.categoria]||'gris') + '">' + esc(c.categoria) + '</span>' +
    '<h3>' + esc(c.titulo) + '</h3><p>' + esc(c.cuerpo) + '</p>' +
    '<div class="fecha">' + esc(c.fecha) + '</div>';
  if(c.requiereRespuesta){
    if(c.respondido){
      html += '<div class="alertita info" style="margin-bottom:0">Respondido — gracias.</div>';
    } else {
      html += '<div class="acciones">';
      (c.opciones||['Sí','No']).forEach(function(o){
        html += '<button class="btn ' + (o.toLowerCase().indexOf('no')===0||o.toLowerCase().indexOf('no ')>-1 ? 'gris' : 'naranja') + ' chico">' + esc(o) + '</button>';
      });
      html += '</div>';
    }
  }
  html += '</div>';
  return html;
}

/* ============================== PADRE / ESTUDIANTE ============================== */

VISTAS['padre.inicio'] = function(m){
  var pend = D().comunicados.filter(function(c){ return c.requiereRespuesta && !c.respondido; }).length;
  m.innerHTML =
    V().selectorHijo() +
    (pend ? '<button class="pendientes" style="width:100%;text-align:left">' +
      '<span class="num">' + pend + '</span><span class="texto">Pendientes por responder</span>' + icono('flecha') + '</button>' : '') +
    '<div class="titulo-seccion"><h2>Comunicados</h2><a href="#/mas">Ver todos</a></div>' +
    D().comunicados.map(tarjetaComunicado).join('') +
    '<div class="titulo-seccion"><h2>Próximos eventos</h2><a href="#/agenda">Agenda</a></div>' +
    D().eventos.map(function(e){
      return '<div class="tarjeta" style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:46px;height:46px;border-radius:12px;background:var(--magenta-suave);color:var(--magenta);display:flex;align-items:center;justify-content:center">' + icono(e.fotos?'foto':'agenda') + '</div>' +
        '<div style="flex:1"><div style="font-weight:600;font-size:.9rem">' + esc(e.titulo) + '</div>' +
        '<div class="fecha">' + esc(e.fecha) + (e.hora?' · '+e.hora:'') + (e.fotos?' · '+e.fotos+' fotos':'') + '</div></div>' +
        icono('flecha') + '</div>';
    }).join('');
  V().engancharSelectorHijo();
};

function filaNota(it){
  var mala = it.nota!=null && it.nota>0 && it.nota<6;
  var chip = it.nota==null ? '<span class="estado J" style="font-size:.7rem">—</span>'
    : it.nota===0 ? '<span class="estado J" style="font-size:.85rem">PD</span>'
    : '<span class="estado ' + (mala?'M':'P') + '" style="font-size:.85rem">' + it.nota + '</span>';
  return '<div class="fila' + (mala?' nota-baja':'') + '"><div class="texto">' +
    '<div class="titulo">' + esc(it.act) + '</div>' +
    '<div class="sub">' + esc(it.tipo) + ' · entrega ' + esc(it.entrega) + '</div>' +
    (mala ? '<span class="aviso-nota">nota baja — hablar con el docente</span>' : '') + '</div>' + chip + '</div>';
}

/* Boletín: se elige trimestre → se abren las carpetas de materias → se toca una → sus notas */
function boletinCarpetas(t){
  var out = '';
  var hay = false;
  D().notas.forEach(function(n){
    var tri = n.tri[t] || {items:[]};
    var count = tri.items.length;
    var triBadge = tri.pendiente ? '<span class="etiqueta naranja">pendiente</span>'
      : tri.trimestre!=null ? '<span class="etiqueta ' + (tri.trimestre>=6?'magenta':'negra') + '">' + tri.trimestre + '</span>'
      : '';
    out += '<div class="carpeta' + (count?'':' vacia') + '" data-mat="' + esc(n.materia) + '">' +
      '<div class="carpeta-cabeza">' +
        '<span class="ic-carpeta">' + icono('archivo') + '</span>' +
        '<span class="carpeta-titulo">' + esc(n.materia) + '</span>' +
        '<span class="carpeta-info">' + (count ? count + ' actividad' + (count>1?'es':'') : 'sin actividades') + '</span>' +
        triBadge + icono('flecha') +
      '</div><div class="carpeta-cuerpo">' +
        tri.items.map(filaNota).join('') +
        (tri.trimestre!=null ? '<div style="padding:8px 4px 2px"><span class="etiqueta ' + (tri.trimestre>=6?'magenta':'negra') + '">Trimestre: ' + tri.trimestre + '</span></div>' : '') +
      '</div></div>';
    if(count) hay = true;
  });
  if(!hay) out += '<div class="vacio">Todavía no hay actividades cargadas en este trimestre.</div>';
  return out;
}

window.boletinSel = function(t){
  document.querySelectorAll('.chip-tri').forEach(function(c){ c.classList.toggle('activo', c.getAttribute('data-t')==String(t)); });
  var el = document.getElementById('carpetas');
  el.innerHTML = boletinCarpetas(t);
  el.style.display = 'block';
  el.querySelectorAll('.carpeta').forEach(function(c){
    c.querySelector('.carpeta-cabeza').onclick = function(){ c.classList.toggle('abierta'); };
  });
};

VISTAS['padre.boletin'] = function(m){
  var h = V().hijo();
  m.innerHTML = V().selectorHijo() +
    '<div class="titulo-seccion"><h2>Boletín · ' + esc(h.curso) + '</h2></div>' +
    '<div class="selector-tri">' +
      [1,2,3].map(function(t){ return '<button class="chip chip-tri" data-t="' + t + '" onclick="boletinSel(' + t + ')">' + t + '° trimestre</button>'; }).join('') +
    '</div>' +
    '<p class="nota" id="boletin-pista">Elegí el trimestre y tocá una materia para ver sus notas.</p>' +
    '<div id="carpetas" style="display:none"></div>';
  V().engancharSelectorHijo();
};

VISTAS['padre.asistencia'] = function(m){
  var h = V().hijo();
  var faltas = D().asistenciaMes.filter(function(d){return d.e==='A';}).length;
  var tardes = D().asistenciaMes.filter(function(d){return d.e==='T';}).length;
  var celdas = '';
  for(var i=0;i<3;i++) celdas += '<div class="dia vacio"></div>'; // mes empieza miércoles (demo)
  D().asistenciaMes.forEach(function(d){
    celdas += '<div class="dia ' + d.e + '">' + d.dia + '</div>';
  });
  m.innerHTML = V().selectorHijo() +
    (faltas ? '<div class="alertita aviso">' + icono('alerta') + '<div><b>' + faltas + ' falta' + (faltas>1?'s':'') + '</b> este mes y ' + tardes + ' llegada' + (tardes>1?'s':'') + ' tarde. La escuela ya fue notificada a tu celular.</div></div>' : '') +
    '<div class="tarjeta"><div class="titulo-seccion" style="margin-top:0"><h2>Octubre · ' + esc(h.nombre.split(' ')[0]) + '</h2></div>' +
    '<div class="cal">' + celdas +
      '<div class="leyenda"><span><i style="background:#1E9E5A"></i>presente</span><span><i style="background:var(--naranja)"></i>ausente</span><span><i style="background:var(--magenta)"></i>tarde</span></div>' +
    '</div></div>' +
    '<button class="btn contorno ancho">Justificar una falta</button>';
  V().engancharSelectorHijo();
};

VISTAS['padre.avisos'] = function(m){
  m.innerHTML = V().selectorHijo() +
    '<div class="titulo-seccion"><h2>Llamados de atención</h2></div>' +
    D().incidentes.map(function(i){
      return '<div class="tarjeta">' +
        '<span class="etiqueta ' + (i.gravedad==='leve'?'naranja':'negra') + '">' + esc(i.tipo) + ' · ' + esc(i.gravedad) + '</span>' +
        '<p>' + esc(i.texto) + '</p><div class="fecha">' + esc(i.fecha) + '</div>' +
        '<div class="acciones">' +
          (i.firmado
            ? '<span class="etiqueta magenta">Firmado ✓</span>'
            : '<button class="btn magenta chico">Firmar que tomé conocimiento</button>') +
        '</div></div>';
    }).join('') +
    '<div class="alertita info">Cuando la escuela registre un llamado de atención te llega una notificación al celular.</div>';
  V().engancharSelectorHijo();
};

VISTAS['padre.mensajes'] = function(m){
  m.innerHTML = V().selectorHijo() +
    '<div class="titulo-seccion"><h2>Mensajes a la escuela</h2>' +
    '<a href="#/mensajes" class="btn magenta chico">Nuevo</a></div>' +
    '<div style="margin:8px 0">' +
      ['Secretaría','Pedagógico','Preceptor','Docente'].map(function(s){ return '<span class="chip">' + esc(s) + '</span>'; }).join('') +
    '</div>' +
    D().conversaciones.map(function(c){
      return '<div class="tarjeta"><div style="display:flex;justify-content:space-between;align-items:center">' +
        '<span class="etiqueta magenta">' + esc(c.sector) + '</span>' +
        '<span class="etiqueta ' + (c.estado==='resuelto'?'gris':'naranja') + '">' + esc(c.estado) + '</span></div>' +
        '<h3 style="margin-top:8px">' + esc(c.asunto) + '</h3>' +
        '<p>' + esc(c.ultimo) + '</p><div class="fecha">' + esc(c.fecha) + '</div></div>';
    }).join('');
  V().engancharSelectorHijo();
};

VISTAS['padre.mas'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Más</h2></div>' +
    '<div class="grilla-apps">' +
      appIcon('agenda','Agenda','var(--magenta)') +
      appIcon('foto','Galería','var(--naranja)') +
      appIcon('salud','Ficha médica','var(--negro)') +
      appIcon('reloj','Horarios','var(--magenta)') +
      appIcon('salida','Hora de salida','var(--naranja)') +
      appIcon('campana','Notificaciones','var(--negro)') +
    '</div>' +
    '<div class="tarjeta"><div class="fila"><div class="texto"><div class="titulo">Preferencias de notificaciones</div><div class="sub">Elegí qué avisos recibir al celular</div></div>' + icono('flecha') + '</div>' +
    '<div class="fila"><div class="texto"><div class="titulo">Datos del alumno</div><div class="sub">Contacto, salud, autorizados</div></div>' + icono('flecha') + '</div></div>' +
    '<button class="btn gris ancho" id="btn-salir">Cerrar sesión</button>';
  V().el('btn-salir').onclick = V().cerrarSesion;
};

function appIcon(ic, t, color){
  return '<button class="appicon"><span class="ic" style="background:' + color + '">' + icono(ic) + '</span>' + esc(t) + '</button>';
}

/* el estudiante reutiliza las vistas del padre (sin opciones de firma en el futuro) */
['inicio','boletin','asistencia','avisos','mas'].forEach(function(v){
  VISTAS['estudiante.' + v] = VISTAS['padre.' + v];
});
VISTAS['estudiante.agenda'] = function(m){
  var diasEntrega = {};
  D().entregas.forEach(function(e){ diasEntrega[e.dia] = e; });
  var celdas = '';
  for(var i=0;i<6;i++) celdas += '<div class="dia vacio"></div>'; // noviembre empieza sábado (demo)
  for(var d=1;d<=30;d++){
    celdas += '<div class="dia' + (diasEntrega[d]?' entrega':'') + '">' + d + (diasEntrega[d]?'<span class="punto-ent"></span>':'') + '</div>';
  }
  m.innerHTML = '<div class="titulo-seccion"><h2>Agenda</h2></div>' +
    '<div class="tarjeta"><div class="titulo-seccion" style="margin-top:0"><h2>Noviembre</h2></div>' +
    '<div class="cal">' + celdas +
      '<div class="leyenda"><span><i style="background:var(--naranja)"></i>entrega o evaluación</span></div></div></div>' +
    '<div class="titulo-seccion"><h2>Próximas entregas</h2></div>' +
    D().entregas.map(function(e){
      return '<div class="tarjeta" style="display:flex;gap:14px;align-items:center">' +
        '<div class="dia-entrega"><b>' + e.dia + '</b><span>nov</span></div>' +
        '<div style="flex:1"><div style="font-weight:600;font-size:.9rem">' + esc(e.titulo) + '</div>' +
        '<div class="fecha">' + esc(e.materia) + ' · ' + esc(e.tipo) + '</div></div></div>';
    }).join('') +
    '<div class="titulo-seccion"><h2>Eventos del colegio</h2></div>' +
    D().eventos.map(function(e){
      return '<div class="tarjeta"><span class="etiqueta naranja">' + esc(e.categoria) + '</span>' +
        '<h3>' + esc(e.titulo) + '</h3><div class="fecha">' + esc(e.fecha) + (e.hora?' · '+e.hora:'') + '</div></div>';
    }).join('');
};

/* ============================== DOCENTE ============================== */

VISTAS['docente.misCursos'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Mis materias</h2><a href="#/cargar" class="btn magenta chico">Nueva actividad</a></div>' +
    D().cursosDocente.map(function(c){
      var faltan = c.alumnos - c.cargadas;
      return '<div class="tarjeta" style="display:flex;align-items:center;gap:14px">' +
        '<div style="width:46px;height:46px;border-radius:12px;background:var(--magenta);color:#fff;display:flex;align-items:center;justify-content:center">' + icono('boletin') + '</div>' +
        '<div style="flex:1"><div style="font-weight:700">' + esc(c.materia) + ' · ' + esc(c.curso) + '</div>' +
        '<div class="fecha">' + c.cargadas + '/' + c.alumnos + ' notas cargadas' + (faltan?' — faltan '+faltan:'') + '</div></div>' +
        (faltan ? '<span class="badge" style="position:static">' + faltan + '</span>' : icono('flecha')) + '</div>';
    }).join('') +
    '<div class="alertita info">Solo vos podés cargar y editar las notas de tus materias. Familias y estudiantes las ven al instante.</div>';
};

/* Cargar actividad: el docente elige tipo, tema, número si corresponde y fecha de entrega.
   Al guardar → la notificación llega a la familia y la fecha se marca en la agenda del alumno. */
VISTAS['docente.cargar'] = function(m){
  var TIPOS = ['Trabajo práctico','Evaluación escrita','Presentación en grupo','Cuestionario','Exposición oral','Otro'];
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Nueva actividad</h2><a href="#/misCursos" style="font-size:.8rem">Volver</a></div>' +
    '<div class="tarjeta">' +
      '<div class="campo"><label>Curso y materia</label>' +
        '<select id="ca-curso">' +
          D().cursosDocente.map(function(c){ return '<option>' + esc(c.materia) + ' · ' + esc(c.curso) + '</option>'; }).join('') +
        '</select></div>' +
      '<div class="campo"><label>Tipo de actividad</label>' +
        '<div id="ca-tipos">' + TIPOS.map(function(t,i){ return '<span class="chip chip-tipo' + (i===0?' activo':'') + '" data-t="' + esc(t) + '">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
      '<div class="campo"><label>Número <span style="font-weight:400;color:var(--gris-2)">(solo si corresponde)</span></label>' +
        '<input id="ca-num" type="number" min="0" inputmode="numeric" placeholder="Ej. 3"></div>' +
      '<div class="campo"><label>Tema o consigna</label>' +
        '<input id="ca-tema" placeholder="Ej. Funciones lineales"></div>' +
      '<div class="campo"><label>Fecha de entrega o evaluación</label>' +
        '<input id="ca-fecha" type="date"></div>' +
      '<button class="btn naranja ancho" id="ca-guardar">Publicar actividad</button>' +
      '<p class="nota">Al publicar: les llega notificación a las familias y la fecha se marca en la agenda de cada alumno.</p>' +
    '</div>';
  m.querySelectorAll('.chip-tipo').forEach(function(c){
    c.onclick = function(){
      m.querySelectorAll('.chip-tipo').forEach(function(x){ x.classList.remove('activo'); });
      c.classList.add('activo');
    };
  });
  el('ca-guardar').onclick = function(){
    var tema = el('ca-tema').value.trim();
    var fecha = el('ca-fecha').value;
    if(!tema){ el('ca-tema').focus(); return; }
    if(!fecha){ el('ca-fecha').focus(); return; }
    alert('Demo: actividad publicada. Familias notificadas y fecha marcada en la agenda del curso.');
    location.hash = '#/misCursos';
  };
};

VISTAS['docente.asistencia'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Asistencia de mi hora</h2></div>' +
    '<div class="alertita info">El registro oficial de asistencia lo hace el preceptor. Acá podés marcar presentes en tu clase (opcional).</div>' +
    listaAsistencia(false);
};

VISTAS['docente.comunicados'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Comunicados</h2><a class="btn magenta chico">Nuevo a mis cursos</a></div>' +
    D().comunicados.map(tarjetaComunicado).join('');
};

function filaMaterial(x, editable){
  return '<div class="fila"><div class="avatar" style="background:var(--naranja-suave);color:var(--naranja-oscuro)">' + icono('archivo') + '</div>' +
    '<div class="texto"><div class="titulo">' + esc(x.titulo) + '</div>' +
    '<div class="sub">' + esc(x.materia) + ' · ' + esc(x.tipo) + ' · ' + esc(x.peso) + ' · ' + esc(x.fecha) + '</div></div>' +
    (editable
      ? '<a class="btn gris chico">Quitar</a>'
      : '<a class="btn magenta chico" onclick="alert(\'Demo: acá descarga el archivo.\')">Descargar</a>') +
    '</div>';
}

VISTAS['estudiante.materiales'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Materiales</h2></div>' +
    '<div class="alertita info">Todo lo que suben tus docentes: guías, consignas y fotocopias. Se descargan desde el celu o la compu.</div>' +
    '<div class="tarjeta">' + D().materiales.map(function(x){ return filaMaterial(x,false); }).join('') + '</div>';
};

VISTAS['padre.materiales'] = VISTAS['estudiante.materiales'];

VISTAS['docente.materiales'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Materiales del curso</h2><a class="btn magenta chico">Subir archivo</a></div>' +
    '<div class="alertita info">Subís una vez y queda disponible para todo el curso: los estudiantes lo descargan desde cualquier dispositivo.</div>' +
    '<div class="tarjeta">' + D().materiales.map(function(x){ return filaMaterial(x,true); }).join('') + '</div>';
};

VISTAS['docente.vida'] = VISTAS['estudiante.agenda'];
VISTAS['docente.mas'] = VISTAS['padre.mas'];

/* ============================== PRECEPTOR ============================== */

function listaAsistencia(editable){
  var html = '<div class="tarjeta"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
    '<h3>3° A · Hoy</h3><span class="etiqueta naranja">' + D().listaCurso.filter(function(a){return a.estado!=='P';}).length + ' novedades</span></div>';
  D().listaCurso.forEach(function(a){
    html += '<div class="fila"><div class="texto"><div class="titulo">' + esc(a.nombre) + '</div></div>' +
      '<div class="estado ' + a.estado + '" data-id="' + a.id + '">' + a.estado + '</div></div>';
  });
  html += '</div>';
  if(editable){
    html += '<div style="display:flex;gap:8px;margin-bottom:10px">' +
      '<button class="btn naranja" style="flex:1">Guardar asistencia</button>' +
      '<button class="btn gris">Copiar ayer</button></div>' +
      '<p class="nota">Al guardar, los padres de ausentes y tardes reciben notificación al instante.</p>';
  }
  return html;
}

VISTAS['preceptor.asistencia'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Tomar asistencia</h2></div>' +
    '<div style="margin:4px 0 10px">' + ['1° A','1° B','3° A'].map(function(c,i){ return '<span class="chip' + (i===2?' activo':'') + '">' + c + '</span>'; }).join('') + '</div>' +
    listaAsistencia(true) +
    '<div class="titulo-seccion"><h2>Llegadas tarde</h2></div>' +
    '<button class="btn contorno ancho">Registrar llegada tarde con hora</button>';
};

VISTAS['preceptor.alertas'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Alerta de estudiantes</h2></div>' +
    '<div class="alertita info">Solo señales que piden acción: faltas repetidas, tardes y pendientes. Nada más.</div>' +
    D().alertasPreceptor.map(function(a){
      var ic = a.tipo==='faltas'?'asistencia':a.tipo==='tarde'?'reloj':'boletin';
      var col = a.tipo==='faltas'?'var(--naranja)':a.tipo==='tarde'?'var(--magenta)':'var(--negro)';
      return '<div class="tarjeta" style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:42px;height:42px;border-radius:12px;background:' + col + ';color:#fff;display:flex;align-items:center;justify-content:center">' + icono(ic) + '</div>' +
        '<div style="flex:1"><div style="font-weight:600">' + esc(a.nombre) + '</div>' +
        '<div class="fecha">' + esc(a.curso) + ' · ' + esc(a.detalle) + '</div></div>' + icono('flecha') + '</div>';
    }).join('');
};

VISTAS['preceptor.llamados'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Llamados de atención</h2><a class="btn magenta chico">Registrar</a></div>' +
    D().incidentes.map(function(i){
      return '<div class="tarjeta"><span class="etiqueta ' + (i.gravedad==='leve'?'naranja':'negra') + '">' + esc(i.tipo) + ' · ' + esc(i.gravedad) + '</span>' +
        '<p>' + esc(i.texto) + '</p><div class="fecha">' + esc(i.fecha) + ' · ' + (i.firmado?'firmado por la familia':'sin firma') + '</div></div>';
    }).join('');
};

VISTAS['preceptor.comunicados'] = VISTAS['docente.comunicados'];
VISTAS['preceptor.mas'] = VISTAS['padre.mas'];

/* ============================== SECRETARÍA / ADMIN ============================== */

VISTAS['admin.resumen'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Hoy en el colegio</h2></div>' +
    '<div class="cols">' +
    kpi('Presentes', '92%', 'var(--magenta)') +
    kpi('Ausentes hoy', '14', 'var(--naranja)') +
    kpi('Llegadas tarde', '6', 'var(--negro)') +
    kpi('Pendientes de respuesta', '23', 'var(--naranja)') +
    '</div>' +
    '<div class="titulo-seccion"><h2>Últimos comunicados</h2><a href="#/comunicados">Todos</a></div>' +
    D().comunicados.slice(0,2).map(tarjetaComunicado).join('');
};

function kpi(t, v, color){
  return '<div class="tarjeta" style="border-left:5px solid ' + color + '">' +
    '<div style="font-size:1.6rem;font-weight:800">' + v + '</div>' +
    '<div style="font-size:.78rem;color:var(--gris-2);font-weight:600">' + esc(t) + '</div></div>';
}

VISTAS['admin.comunicados'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Comunicados</h2><a class="btn magenta chico">Nuevo comunicado</a></div>' +
    '<div class="alertita info">Al publicar, cada familia recibe push + e-mail. Podés ver quién leyó y quién respondió.</div>' +
    D().comunicados.map(function(c){
      return tarjetaComunicado(c).replace('</div>$','');
    }).join('');
};

VISTAS['admin.usuarios'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Usuarios</h2><a class="btn magenta chico">Invitar</a></div>' +
    '<div class="alertita info">Las familias entran solo por invitación: e-mail + código de 4 dígitos.</div>' +
    D().usuariosAdmin.map(function(u){
      var col = {docente:'var(--magenta)', preceptor:'var(--naranja)', padre:'var(--negro)', estudiante:'var(--gris-2)'}[u.rol];
      return '<div class="tarjeta" style="display:flex;align-items:center;gap:12px">' +
        '<div class="estado" style="background:' + col + '">' + esc(u.nombre.charAt(0)) + '</div>' +
        '<div style="flex:1"><div style="font-weight:600">' + esc(u.nombre) + '</div>' +
        '<div class="fecha">' + esc(u.rol) + ' · ' + esc(u.detalle) + '</div></div>' + icono('flecha') + '</div>';
    }).join('');
};

function barraTrimestre(nombre, aprob, desap, pd){
  var tot = aprob+desap+pd;
  var pct = function(x){ return Math.round(x*100/tot); };
  return '<div class="tarjeta"><div style="display:flex;justify-content:space-between;align-items:baseline">' +
    '<h3>' + nombre + '</h3><span style="font-size:.78rem;color:var(--gris-2)">' + tot + ' alumnos</span></div>' +
    '<div class="barra-aprob">' +
      '<div class="ok" style="width:' + pct(aprob) + '%"></div>' +
      '<div class="mal" style="width:' + pct(desap) + '%"></div>' +
      '<div class="pd" style="width:' + pct(pd) + '%"></div></div>' +
    '<div class="barra-ley"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--verde);margin-right:4px"></i>aprueban ' + pct(aprob) + '%</span>' +
    '<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--rojo);margin-right:4px"></i>desaprueban ' + pct(desap) + '%</span>' +
    '<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--naranja);margin-right:4px"></i>pendientes ' + pct(pd) + '%</span></div></div>';
}

VISTAS['admin.estadisticas'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Rendimiento por trimestre</h2></div>' +
    barraTrimestre('1er trimestre', 78, 12, 10) +
    '<div class="tarjeta" style="display:flex;justify-content:space-between;align-items:center;opacity:.7">' +
      '<h3>2do trimestre</h3><span class="etiqueta gris">en curso</span></div>' +
    '<div class="titulo-seccion"><h2>Engagement de familias</h2></div>' +
    '<div class="cols">' +
    kpi('Lectura de comunicados', '87%', 'var(--magenta)') +
    kpi('Respuestas a autorizaciones', '74%', 'var(--naranja)') +
    kpi('Familias activas esta semana', '91%', 'var(--negro)') +
    kpi('Sin entrar en 30 días', '12', 'var(--naranja)') +
    '</div>' +
    '<div class="alertita aviso">' + icono('alerta') + '<div>12 familias no entran hace un mes — posible señal de desconexión temprana.</div></div>';
};

VISTAS['admin.mas'] = VISTAS['padre.mas'];
})();
