/* AYLLU — vistas por rol. Cada vista recibe el <main> y dibuja.
   Clave: 'rol.seccion'. ES2017-safe. */
var VISTAS = {};
(function(){
'use strict';
var V = function(){ return window.AYLLU; };
var esc = function(s){ return V().esc(s); };
var icono = function(n){ return V().icono(n); };
var D = function(){ return V().DEMO; };

/* Cada rol ve solo los comunicados dirigidos a su grupo (o a todos) */
var AUDIENCIAS_ROL = {
  padre:      ['familias','todos'],
  estudiante: ['estudiantes','todos'],
  docente:    ['docentes','todos'],
  preceptor:  ['preceptores','docentes','todos'],
  director:   null,   /* dirección y secretaría ven todo */
  admin:      null
};
function comunicadosPara(rol){
  var ok = AUDIENCIAS_ROL[rol];
  if(!ok) return D().comunicados;
  return D().comunicados.filter(function(c){ return ok.indexOf(c.audiencia||'todos') > -1; });
}
function etiquetaAudiencia(a){
  return {familias:'para familias', estudiantes:'para estudiantes', docentes:'para docentes', preceptores:'para preceptores', todos:'para todos'}[a||'todos'];
}

function tarjetaComunicado(c){
  var cat = {urgente:'negra', charla:'magenta', evento:'naranja', autorizacion:'naranja', general:'gris'};
  var html = '<div class="tarjeta">' +
    '<span class="etiqueta ' + (cat[c.categoria]||'gris') + '">' + esc(c.categoria) + '</span> ' +
    '<span class="etiqueta gris" style="font-size:.62rem">' + etiquetaAudiencia(c.audiencia) + '</span>' +
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
    comunicadosPara('padre').map(tarjetaComunicado).join('') +
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
    '</div>' + chip + '</div>';
}

/* Boletín: se elige trimestre → se abren las carpetas de materias → se toca una → sus notas */
function boletinCarpetas(t){
  var out = '';
  var hay = false;
  D().notas.forEach(function(n){
    var tri = n.tri[t] || {items:[]};
    var count = tri.items.length;
    var mala = tri.items.some(function(it){ return it.nota!=null && it.nota>0 && it.nota<6; });
    var triBadge = tri.pendiente ? '<span class="etiqueta naranja">pendiente</span>'
      : tri.trimestre!=null ? '<span class="etiqueta ' + (tri.trimestre>=6?'magenta':'negra') + '">' + tri.trimestre + '</span>'
      : '';
    out += '<div class="carpeta' + (mala?' mala':'') + (count?'':' vacia') + '" data-mat="' + esc(n.materia) + '">' +
      '<div class="carpeta-cabeza">' +
        '<span class="ic-carpeta">' + icono('archivo') + '</span>' +
        '<span class="carpeta-titulo">' + esc(n.materia) + '</span>' +
        '<span class="carpeta-info">' + (count ? count + ' actividad' + (count>1?'es':'') : 'sin actividades') + '</span>' +
        (mala ? '<span class="etiqueta" style="background:var(--rojo);color:#fff">en riesgo</span>' : '') +
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

/* Planilla del curso: el docente edita la nota y se guarda al instante.
   La familia/estudiante la ve en su boletín sin recargar (en la versión real: Realtime). */
window.guardarNota = function(aId, colId, input){
  var v = input.value.trim();
  var nota = v === '' ? null : Number(v);
  if(nota !== null && (isNaN(nota) || nota < 0 || nota > 10)){ input.value=''; return; }
  D().planilla.notas[aId][colId] = nota;
  var col = D().planilla.columnas.filter(function(c){ return c.id===colId; })[0];
  var mat = D().notas.filter(function(n){ return n.materia===D().planilla.materia; })[0];
  if(mat && aId==='a5'){ // Martina = alumna del demo familia
    var tri = mat.tri[D().planilla.trimestre];
    var it = tri.items.filter(function(x){ return x.act===col.titulo; })[0];
    if(it){ it.nota = nota; } else { tri.items.push({act:col.titulo, tipo:col.tipo, nota:nota, entrega:col.entrega}); }
  }
  var st = document.getElementById('guardado-vivo');
  if(st){ st.textContent = 'Guardado ' + new Date().toLocaleTimeString() + ' · la familia ya ve esta nota'; st.classList.add('flash'); setTimeout(function(){ st.classList.remove('flash'); }, 1200); }
  input.classList.add('guardada'); setTimeout(function(){ input.classList.remove('guardada'); }, 900);
};

VISTAS['docente.planilla'] = function(m){
  var p = D().planilla;
  var head = '<tr><th>Alumno</th>' + p.columnas.map(function(c){
    return '<th><div>' + esc(c.titulo) + '</div><span>' + esc(c.tipo) + ' · ' + esc(c.entrega) + '</span></th>';
  }).join('') + '</tr>';
  var filas = D().listaCurso.map(function(a){
    var ns = p.notas[a.id] || {};
    return '<tr><td class="al">' + esc(a.nombre) + '</td>' +
      p.columnas.map(function(c){
        var v = ns[c.id];
        return '<td><input class="celda-nota' + (v!==null && v!==undefined && v<6 && v>0 ? ' baja':'') + '"' +
          ' data-a="' + a.id + '" data-c="' + c.id + '" value="' + (v===null||v===undefined?'':v) + '"' +
          ' inputmode="numeric" placeholder="—"></td>';
      }).join('') + '</tr>';
  }).join('');
  m.innerHTML =
    '<div class="titulo-seccion"><h2>' + esc(p.materia) + ' · ' + esc(p.curso) + '</h2>' +
      '<a href="#/cargar" class="btn magenta chico">Nueva actividad</a></div>' +
    '<div class="alertita info"><b>Carga en tiempo real:</b> escribís la nota y se guarda sola. Ese momento ya la ve el estudiante y su familia en el boletín.</div>' +
    '<div class="tarjeta" style="padding:0;overflow-x:auto">' +
      '<table class="planilla"><thead>' + head + '</thead><tbody>' + filas + '</tbody></table></div>' +
    '<div class="guardado-vivo" id="guardado-vivo">Listo para cargar · ' + p.trimestre + '° trimestre</div>';
  m.querySelectorAll('.celda-nota').forEach(function(inp){
    inp.addEventListener('change', function(){ guardarNota(inp.getAttribute('data-a'), inp.getAttribute('data-c'), inp); });
  });
};

VISTAS['docente.misCursos'] = function(m){
  var r = D().docenteResumen;
  var totalPend = D().cursosDocente.reduce(function(s,c){ return s + (c.alumnos - c.cargadas); }, 0);
  var kpis =
    '<div class="kpis">' +
      '<div class="kpi"><b>' + r.clasesHoy.length + '</b><span>clases hoy</span></div>' +
      '<div class="kpi' + (totalPend?' warn':'') + '"><b>' + totalPend + '</b><span>notas por cargar</span></div>' +
      '<div class="kpi"><b>' + r.actividades + '</b><span>actividades activas</span></div>' +
      '<div class="kpi"><b>' + r.materiales + '</b><span>materiales</span></div>' +
    '</div>';
  var clases =
    '<div class="tarjeta"><h3 style="margin-top:0">Tus clases de hoy</h3>' +
    r.clasesHoy.map(function(c){
      return '<div class="fila"><div><div style="font-weight:700">' + esc(c.curso) + ' · ' + esc(c.materia) + '</div>' +
        '<div class="fecha">' + esc(c.h) + ' h · Aula ' + esc(c.aula) + '</div></div>' +
        '<a class="btn neutro chico" href="#/planilla">Planilla</a></div>';
    }).join('') + '</div>';
  var acciones =
    '<div class="grupo">' +
      '<a class="appicon" href="#/planilla"><span class="ic" style="background:var(--magenta)">' + icono('boletin') + '</span><span>Planilla de notas</span></a>' +
      '<a class="appicon" href="#/cargar"><span class="ic" style="background:var(--naranja)">' + icono('lapiz') + '</span><span>Nueva actividad</span></a>' +
      '<a class="appicon" href="#/materiales"><span class="ic" style="background:var(--negro)">' + icono('archivo') + '</span><span>Materiales</span></a>' +
      '<a class="appicon" href="#/comunicados"><span class="ic" style="background:var(--magenta)">' + icono('campana') + '</span><span>Comunicados</span></a>' +
    '</div>';
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Mis materias</h2><a href="#/cargar" class="btn magenta chico">Nueva actividad</a></div>' +
    kpis + clases + acciones +
    '<h3 style="margin:16px 0 0">Carga de notas</h3>' +
    D().cursosDocente.map(function(c){
      var faltan = c.alumnos - c.cargadas;
      return '<a class="tarjeta link" href="#/planilla" style="display:flex;align-items:center;gap:14px">' +
        '<div style="width:46px;height:46px;border-radius:12px;background:var(--magenta);color:#fff;display:flex;align-items:center;justify-content:center">' + icono('boletin') + '</div>' +
        '<div style="flex:1"><div style="font-weight:700">' + esc(c.materia) + ' · ' + esc(c.curso) + '</div>' +
        '<div class="fecha">' + c.cargadas + '/' + c.alumnos + ' notas cargadas' + (faltan?' — faltan '+faltan:'') + '</div></div>' +
        (faltan ? '<span class="badge" style="position:static">' + faltan + '</span>' : icono('flecha')) + '</a>';
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
  m.innerHTML = '<div class="titulo-seccion"><h2>Comunicados</h2><a href="#/nuevoComunicado" class="btn magenta chico">Nuevo</a></div>' +
    comunicadosPara('docente').map(tarjetaComunicado).join('');
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

/* Panel del preceptor: su jornada de un vistazo — qué ya hizo y qué le falta */
VISTAS['preceptor.resumen'] = function(m){
  var pendientes = D().cursosPreceptor.filter(function(c){ return !c.tomada; });
  var docPend = D().docentesHoy.filter(function(d){ return !d.marcado && false; }); // demo: ya marcados
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Mi jornada</h2></div>' +
    (pendientes.length
      ? '<button class="pendientes" style="width:100%;text-align:left" onclick="location.hash=\'#/asistencia\'">' +
        '<span class="num">' + pendientes.length + '</span><span class="texto">Asistencia pendiente: ' + pendientes.map(function(c){return esc(c.curso);}).join(', ') + '</span>' + icono('flecha') + '</button>'
      : '<div class="alertita" style="background:var(--verde-suave);color:var(--verde)">' + icono('asistencia') + '<div>Asistencia del día completa en tus cursos.</div></div>') +
    '<div class="titulo-seccion"><h2>Mis cursos</h2></div>' +
    '<div class="tarjeta">' +
      D().cursosPreceptor.map(function(c){
        return '<div class="fila"><div class="avatar" style="background:' + (c.tomada?'var(--verde-suave);color:var(--verde)':'var(--naranja-suave);color:var(--naranja-oscuro)') + '">' + icono('asistencia') + '</div>' +
          '<div class="texto"><div class="titulo">' + esc(c.curso) + '</div>' +
          '<div class="sub">' + (c.tomada ? 'asistencia tomada' + (c.ausentes?' · '+c.ausentes+' ausente'+(c.ausentes>1?'s':'')+(c.tardes?' · '+c.tardes+' tarde':'') : '') : 'todavía sin tomar') + '</div></div>' +
          (c.tomada ? '<span class="estado P">ok</span>' : '<a href="#/asistencia" class="btn naranja chico">Tomar</a>') + '</div>';
      }).join('') +
    '</div>' +
    '<div class="titulo-seccion"><h2>Acciones rápidas</h2></div>' +
    '<div class="grilla-apps">' +
      '<a class="appicon" href="#/docentes"><span class="ic" style="background:var(--magenta)">' + icono('usuarios') + '</span>Asistencia docente</a>' +
      '<a class="appicon" href="#/seguimiento"><span class="ic" style="background:var(--naranja)">' + icono('lapiz') + '</span>Registrar llamado</a>' +
      '<a class="appicon" href="#/asistencia"><span class="ic" style="background:var(--negro)">' + icono('reloj') + '</span>Llegada tarde</a>' +
    '</div>';
};

/* Seguimiento: alertas de alumnos + registro de llamados, en una sola vista */
VISTAS['preceptor.seguimiento'] = function(m){
  m.innerHTML = '<div class="titulo-seccion"><h2>Seguimiento</h2><a class="btn magenta chico" onclick="alert(\'Demo: formulario de llamado de atención — tipo, gravedad, texto, aviso a la familia.\')">Registrar llamado</a></div>' +
    '<div class="alertita info">Señales que piden acción: faltas repetidas, tardes, pendientes. Registrás el llamado y la familia recibe notificación.</div>' +
    D().alertasPreceptor.map(function(a){
      var ic = a.tipo==='faltas'?'asistencia':a.tipo==='tarde'?'reloj':'boletin';
      var col = a.tipo==='faltas'?'var(--naranja)':a.tipo==='tarde'?'var(--magenta)':'var(--negro)';
      return '<div class="tarjeta" style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:42px;height:42px;border-radius:12px;background:' + col + ';color:#fff;display:flex;align-items:center;justify-content:center">' + icono(ic) + '</div>' +
        '<div style="flex:1"><div style="font-weight:600">' + esc(a.nombre) + '</div>' +
        '<div class="fecha">' + esc(a.curso) + ' · ' + esc(a.detalle) + '</div></div>' + icono('flecha') + '</div>';
    }).join('') +
    '<div class="titulo-seccion"><h2>Llamados registrados</h2></div>' +
    D().incidentes.map(function(i){
      return '<div class="tarjeta"><span class="etiqueta ' + (i.gravedad==='leve'?'naranja':'negra') + '">' + esc(i.tipo) + ' · ' + esc(i.gravedad) + '</span>' +
        '<p>' + esc(i.texto) + '</p><div class="fecha">' + esc(i.fecha) + ' · ' + (i.firmado?'firmado por la familia':'sin firma') + '</div></div>';
    }).join('');
};

/* Asistencia docente: el preceptor marca presente / licencia / ausente.
   Estados: P verde (en el aula), L magenta (licencia avisada), A rojo (ausente sin aviso). */
function filaDocente(dt, i, editable){
  var estados = [['P','presente'],['L','licencia'],['A','ausente']];
  var color = dt.estado==='P' ? 'var(--verde-suave)' : dt.estado==='L' ? 'var(--magenta-suave)' : 'var(--rojo-suave)';
  var colorTxt = dt.estado==='P' ? 'var(--verde)' : dt.estado==='L' ? 'var(--magenta)' : 'var(--rojo)';
  var marcas = estados.map(function(par){
    var on = dt.estado===par[0];
    return '<button class="marca-doc ' + par[0] + (on?' on':'') + '"' +
      (editable ? ' onclick="marcarDocente(' + i + ',\'' + par[0] + '\')"' : ' disabled') + '>' + par[0] + '</button>';
  }).join('');
  return '<div class="fila"><div class="avatar" style="background:' + color + ';color:' + colorTxt + '">' + esc(dt.nombre.charAt(0)) + '</div>' +
    '<div class="texto"><div class="titulo">' + esc(dt.nombre) + ' · ' + esc(dt.materia) + '</div>' +
    '<div class="sub">' + esc(dt.cursos) + (dt.detalle ? ' · ' + esc(dt.detalle) : '') + '</div></div>' +
    '<div class="estados-doc">' + marcas + '</div></div>';
}

window.marcarDocente = function(i, e){
  D().docentesHoy[i].estado = e;
  pintar();
};

VISTAS['preceptor.docentes'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Asistencia docente · hoy</h2></div>' +
    '<div class="alertita info">Marcás vos: P = está en el aula, L = pidió licencia, A = ausente sin aviso. Dirección lo ve al instante.</div>' +
    '<div class="tarjeta">' +
      D().docentesHoy.map(function(dt,i){ return filaDocente(dt,i,true); }).join('') +
    '</div>';
};

/* Formulario de comunicado compartido: el staff elige a quién va dirigido */
function formComunicado(m, rol){
  var AUD = ['todos','familias','estudiantes','docentes','preceptores'];
  var volver = {docente:'#/comunicados',preceptor:'#/comunicados',director:'#/comunicados',admin:'#/comunicados'}[rol];
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Nuevo comunicado</h2><a href="' + volver + '" style="font-size:.8rem">Volver</a></div>' +
    '<div class="tarjeta">' +
      '<div class="campo"><label>¿A quién va dirigido?</label>' +
        '<div id="nc-aud">' + AUD.map(function(a,i){ return '<span class="chip chip-aud' + (i===0?' activo':'') + '" data-a="' + a + '">' + (a==='todos'?'Todos':'Solo ' + a) + '</span>'; }).join('') + '</div></div>' +
      '<div class="campo"><label>Categoría</label>' +
        '<select id="nc-cat"><option value="general">General</option><option value="urgente">Urgente</option><option value="evento">Evento</option><option value="charla">Charla</option><option value="autorizacion">Autorización</option></select></div>' +
      '<div class="campo"><label>Título</label><input id="nc-tit" placeholder="Ej. Reunión de familias de 3° año"></div>' +
      '<div class="campo"><label>Mensaje</label><textarea id="nc-cuerpo" rows="4" placeholder="Escribí el comunicado..."></textarea></div>' +
      '<label style="display:flex;gap:10px;align-items:center;margin:6px 0 14px;cursor:pointer">' +
        '<input type="checkbox" id="nc-resp"> Requiere respuesta de la familia (confirmar, autorizar, firmar)</label>' +
      '<button class="btn naranja ancho" id="nc-publicar">Publicar comunicado</button>' +
      '<p class="nota">Al publicar, el grupo elegido recibe notificación push + e-mail al instante.</p>' +
    '</div>';
  m.querySelectorAll('.chip-aud').forEach(function(c){
    c.onclick = function(){ m.querySelectorAll('.chip-aud').forEach(function(x){ x.classList.remove('activo'); }); c.classList.add('activo'); };
  });
  el('nc-publicar').onclick = function(){
    if(!el('nc-tit').value.trim()){ el('nc-tit').focus(); return; }
    alert('Demo: comunicado publicado al grupo elegido.');
    location.hash = volver;
  };
}
['docente','preceptor','director','admin'].forEach(function(r){
  VISTAS[r + '.nuevoComunicado'] = function(m){ formComunicado(m, r); };
});

VISTAS['preceptor.comunicados'] = VISTAS['docente.comunicados'];
VISTAS['preceptor.mas'] = VISTAS['padre.mas'];

/* ============================== DIRECTOR ==============================
   Ve toda la escuela de un vistazo: asistencia del día, alumnos en riesgo,
   cursos que más faltan. No carga datos: observa y actúa sobre lo urgente. */
VISTAS['director.resumen'] = function(m){
  var e = D().escuela;
  function kpi(v, t, color){
    return '<div class="kpi"><b style="color:' + color + '">' + v + '</b><span>' + t + '</span></div>';
  }
  var docP = D().docentesHoy.filter(function(d){return d.estado==='P';}).length;
  var docA = D().docentesHoy.filter(function(d){return d.estado==='A';}).length;
  var docL = D().docentesHoy.filter(function(d){return d.estado==='L';}).length;
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Hoy en la escuela</h2></div>' +
    '<div class="kpis">' +
      kpi(e.asistenciaHoy + '%', 'asistencia alumnos', 'var(--verde)') +
      kpi(docP + '/' + D().docentesHoy.length, 'docentes en el aula', docA ? 'var(--rojo)' : 'var(--verde)') +
      kpi(e.enRiesgo, 'en riesgo', 'var(--rojo)') +
      kpi(e.mensajesAbiertos, 'consultas', 'var(--negro)') +
    '</div>' +
    '<div class="titulo-seccion"><h2>Necesita atención</h2></div>' +
    '<div class="tarjeta">' +
      (docA ? '<div class="fila"><div class="avatar" style="background:var(--rojo-suave);color:var(--rojo)">' + icono('alerta') + '</div>' +
        '<div class="texto"><div class="titulo">' + docA + ' docente' + (docA>1?'s':'') + ' ausente' + (docA>1?'s':'') + ' sin aviso</div><div class="sub">clases sin cubrir — organizar suplente</div></div></div>' : '') +
      (docL ? '<div class="fila"><div class="avatar" style="background:var(--magenta-suave);color:var(--magenta)">' + icono('usuarios') + '</div>' +
        '<div class="texto"><div class="titulo">' + docL + ' licencia' + (docL>1?'s':'') + ' activa' + (docL>1?'s':'') + '</div><div class="sub">ver detalle en "Docentes"</div></div></div>' : '') +
      '<div class="fila"><div class="avatar" style="background:var(--rojo-suave);color:var(--rojo)">' + icono('alerta') + '</div>' +
        '<div class="texto"><div class="titulo">' + e.sinJustificar + ' faltas sin justificar</div><div class="sub">los padres no respondieron la justificación</div></div></div>' +
      '<div class="fila"><div class="avatar" style="background:var(--rojo-suave);color:var(--rojo)">' + icono('boletin') + '</div>' +
        '<div class="texto"><div class="titulo">' + e.enRiesgo + ' alumnos con notas bajas</div><div class="sub">ver lista en "En riesgo"</div></div></div>' +
      '<div class="fila"><div class="avatar" style="background:var(--naranja-suave);color:var(--naranja-oscuro)">' + icono('mensaje') + '</div>' +
        '<div class="texto"><div class="titulo">' + e.mensajesAbiertos + ' consultas de familias abiertas</div><div class="sub">secretaría y pedagógico</div></div></div>' +
    '</div>' +
    '<div class="alertita info">El director observa todo pero no carga datos: notas las cargan los docentes, asistencia los preceptores.</div>';
};

VISTAS['director.faltas'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Faltas por curso · hoy</h2></div>' +
    D().escuela.faltasCurso.map(function(c){
      return '<div class="tarjeta" style="display:flex;justify-content:space-between;align-items:center">' +
        '<b>' + esc(c.curso) + '</b>' +
        '<div><span class="etiqueta ' + (c.faltas>2?'negra':'naranja') + '">' + c.faltas + ' falta' + (c.faltas>1?'s':'') + '</span> ' +
        (c.tarde ? '<span class="etiqueta magenta">' + c.tarde + ' tarde</span>' : '') + '</div></div>';
    }).join('') +
    '<div class="alertita info">El registro lo cargan los preceptores; las familias ya recibieron la notificación de cada falta.</div>';
};

VISTAS['director.riesgo'] = function(m){
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Alumnos en riesgo</h2></div>' +
    '<div class="alertita info">Notas debajo de 6 o entregas sin presentar. El seguimiento pedagógico lo hace el equipo con cada familia.</div>' +
    '<div class="tarjeta">' +
      D().escuela.alumnosRiesgo.map(function(a){
        return '<div class="fila"><div class="avatar" style="background:var(--rojo-suave);color:var(--rojo)">' + esc(a.nombre.charAt(0)) + '</div>' +
          '<div class="texto"><div class="titulo">' + esc(a.nombre) + ' · ' + esc(a.curso) + '</div>' +
          '<div class="sub">' + esc(a.detalle) + '</div></div></div>';
      }).join('') +
    '</div>';
};

/* Tablero del cuerpo docente: quién está, quién pidió licencia, qué queda sin cubrir */
VISTAS['director.docentes'] = function(m){
  var sinCubrir = D().docentesHoy.filter(function(d){ return d.estado==='A'; });
  var licencias = D().docentesHoy.filter(function(d){ return d.estado==='L'; });
  m.innerHTML =
    '<div class="titulo-seccion"><h2>Cuerpo docente · hoy</h2></div>' +
    (sinCubrir.length ? '<div class="alertita" style="background:var(--rojo-suave);color:var(--rojo)">' + icono('alerta') +
      '<div><b>' + sinCubrir.length + ' ausente' + (sinCubrir.length>1?'s':'') + ' sin aviso.</b> Hay clases sin cubrir — asignar suplente o avisar al curso.</div></div>' : '') +
    '<div class="tarjeta">' +
      D().docentesHoy.map(function(dt,i){ return filaDocente(dt,i,false); }).join('') +
    '</div>' +
    (licencias.length ? '<div class="titulo-seccion"><h2>Licencias activas</h2></div><div class="tarjeta">' +
      licencias.map(function(dt){
        return '<div class="fila"><div class="texto"><div class="titulo">' + esc(dt.nombre) + ' · ' + esc(dt.materia) + '</div>' +
          '<div class="sub">' + esc(dt.detalle) + '</div></div></div>';
      }).join('') + '</div>' : '') +
    '<div class="alertita info">Registra el preceptor al verificar el aula. Sirve para organizar cobertura y llevar el registro de licencias.</div>';
};

VISTAS['director.comunicados'] = VISTAS['docente.comunicados'] || VISTAS['admin.comunicados'];
VISTAS['director.mas'] = VISTAS['padre.mas'];
VISTAS['director.estadisticas'] = VISTAS['admin.estadisticas'];

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
  m.innerHTML = '<div class="titulo-seccion"><h2>Comunicados</h2><a href="#/nuevoComunicado" class="btn magenta chico">Nuevo</a></div>' +
    '<div class="alertita info">Elegís a quién llega: familias, estudiantes, docentes, preceptores o todos. Al publicar reciben push + e-mail.</div>' +
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
