/* AYLLU — datos de demostración (modo sin backend).
   Las mismas estructuras que tendrán las tablas reales. */
var DEMO = {
  escuela: { nombre: 'Colegio Modelo', lema: 'La escuela y la familia, conectadas' },

  hijos: [
    { id: 'st1', nombre: 'Martina González', curso: '3° A', avatar: 'MG' },
    { id: 'st2', nombre: 'Joaquín González', curso: '1° B', avatar: 'JG' }
  ],

  /* audiencia: todos / familias / estudiantes / docentes / preceptores */
  comunicados: [
    { id: 'c1', categoria: 'urgente', audiencia: 'familias', titulo: 'Reunión de familias de 3° año', cuerpo: 'El jueves 6 de noviembre a las 18 h se realizará la reunión de familias para informar el viaje de egresados. Es importante la presencia de al menos un responsable.', fecha: 'Hoy', leido: false, requiereRespuesta: true, opciones: ['Confirmo asistencia', 'No puedo asistir'] },
    { id: 'c2', categoria: 'charla', audiencia: 'familias', titulo: 'Charla sobre uso de pantallas', cuerpo: 'El martes se dictará una charla para familias sobre hábitos digitales saludables, a cargo del equipo de orientación escolar.', fecha: 'Ayer', leido: false, requiereRespuesta: false },
    { id: 'c5', categoria: 'general', audiencia: 'docentes', titulo: 'Entrega de planillas de notas', cuerpo: 'Recuerden cerrar las actividades del 2° trimestre antes del viernes 7. Cualquier duda, secretaría.', fecha: 'Hoy', leido: false, requiereRespuesta: false },
    { id: 'c6', categoria: 'general', audiencia: 'estudiantes', titulo: 'Semana de la ciencia', cuerpo: 'La semana próxima habrá feria de proyectos en el SUM. Anotense los grupos que quieran presentar.', fecha: 'Hace 2 días', leido: true, requiereRespuesta: false },
    { id: 'c7', categoria: 'general', audiencia: 'preceptores', titulo: 'Reunión de preceptores', cuerpo: 'Mañana a las 12 h, reunión de coordinación en sala de profesores.', fecha: 'Hoy', leido: false, requiereRespuesta: true, opciones: ['Confirmo', 'No puedo'], respondido: false },
    { id: 'c3', categoria: 'general', audiencia: 'todos', titulo: 'Cambio de horario de salida', cuerpo: 'A partir del lunes, la salida de primaria se adelanta 15 minutos por obras en la vereda.', fecha: 'Hace 3 días', leido: true, requiereRespuesta: false },
    { id: 'c4', categoria: 'autorizacion', audiencia: 'familias', titulo: 'Salida didáctica al museo', cuerpo: 'El 12 de noviembre el curso visitará el Museo de Ciencias Naturales. Costo: $3.500. Se requiere autorización firmada.', fecha: 'Hace 4 días', leido: true, requiereRespuesta: true, opciones: ['Autorizo', 'No autorizo'], respondido: false }
  ],

  /* Cursos a cargo del preceptor y estado de la asistencia de hoy */
  cursosPreceptor: [
    { curso: '1° A', tomada: true, ausentes: 0, tardes: 0 },
    { curso: '1° B', tomada: true, ausentes: 1, tardes: 0 },
    { curso: '3° A', tomada: false, ausentes: 0, tardes: 0 }
  ],

  /* Por materia → por trimestre → actividades (tipo, nota, fecha de entrega).
     nota 0 = entregado sin corregir; null = aún no entregó (pendiente). */
  notas: [
    { materia: 'Matemática', tri: {
      1: { items: [ { act: 'TP 3 · Funciones', tipo: 'Trabajo práctico', nota: 8, entrega: '14/04' },
                    { act: 'Evaluación escrita 2 · Funciones', tipo: 'Evaluación escrita', nota: 7, entrega: '28/04' } ], trimestre: 7.5 },
      2: { items: [ { act: 'TP 1 · Geometría', tipo: 'Trabajo práctico', nota: 9, entrega: '12/08' } ], trimestre: null },
      3: { items: [], trimestre: null } } },
    { materia: 'Lengua', tri: {
      1: { items: [ { act: 'Análisis de texto', tipo: 'Trabajo práctico', nota: 9, entrega: '10/04' },
                    { act: 'Evaluación escrita 2', tipo: 'Evaluación escrita', nota: 8, entrega: '25/04' } ], trimestre: 8.5 },
      2: { items: [], trimestre: null },
      3: { items: [], trimestre: null } } },
    { materia: 'Biología', tri: {
      1: { items: [ { act: 'Informe de laboratorio', tipo: 'Trabajo práctico', nota: 0, entrega: '30/04' } ], trimestre: null, pendiente: true },
      2: { items: [], trimestre: null },
      3: { items: [], trimestre: null } } },
    { materia: 'Historia', tri: {
      1: { items: [ { act: 'Evaluación escrita 2', tipo: 'Evaluación escrita', nota: 4, entrega: '22/04' },
                    { act: 'Presentación en grupo · Siglo XX', tipo: 'Presentación en grupo', nota: null, entrega: '06/11' } ], trimestre: 4 },
      2: { items: [], trimestre: null },
      3: { items: [], trimestre: null } } }
  ],

  /* Entregas del estudiante: lo que figura marcado en su calendario */
  entregas: [
    { dia: 6, titulo: 'Presentación en grupo · Siglo XX', materia: 'Historia', tipo: 'Presentación en grupo' },
    { dia: 12, titulo: 'TP 4 · Ecuaciones', materia: 'Matemática', tipo: 'Trabajo práctico' },
    { dia: 19, titulo: 'Evaluación escrita · Célula', materia: 'Biología', tipo: 'Evaluación escrita' }
  ],

  asistenciaMes: [
    { dia: 1, e: 'P' }, { dia: 2, e: 'P' }, { dia: 3, e: 'P' }, { dia: 6, e: 'T' },
    { dia: 7, e: 'P' }, { dia: 8, e: 'P' }, { dia: 9, e: 'P' }, { dia: 10, e: 'P' },
    { dia: 13, e: 'P' }, { dia: 14, e: 'P' }, { dia: 15, e: 'A' }, { dia: 16, e: 'P' },
    { dia: 17, e: 'P' }, { dia: 20, e: 'P' }, { dia: 21, e: 'T' }, { dia: 22, e: 'P' },
    { dia: 23, e: 'P' }, { dia: 24, e: 'P' }, { dia: 27, e: 'P' }, { dia: 28, e: 'P' },
    { dia: 29, e: 'P' }, { dia: 30, e: 'P' }
  ],

  incidentes: [
    { id: 'i1', tipo: 'conducta', gravedad: 'leve', texto: 'Conversaba reiteradamente durante la clase de Matemática.', fecha: '28/10', firmado: false },
    { id: 'i2', tipo: 'uniforme', gravedad: 'leve', texto: 'Ingresó sin el buzo reglamentario del colegio.', fecha: '15/10', firmado: true }
  ],

  eventos: [
    { id: 'e1', titulo: 'Fotos del acto de la Patria', categoria: 'eventos', fecha: '25 de mayo', fotos: 34 },
    { id: 'e2', titulo: 'Jornada de ciencias', categoria: 'eventos', fecha: '12 de noviembre', fotos: 12 },
    { id: 'e3', titulo: 'Reunión de familias 3° año', categoria: 'reuniones', fecha: '6 de noviembre', hora: '18:00' }
  ],

  materiales: [
    { id: 'ma1', materia: 'Biología', titulo: 'Guía de célula eucariota', tipo: 'PDF', peso: '1,4 MB', fecha: '28/10' },
    { id: 'ma2', materia: 'Biología', titulo: 'Consignas informe de laboratorio', tipo: 'PDF', peso: '0,3 MB', fecha: '24/10' },
    { id: 'ma3', materia: 'Matemática', titulo: 'Funciones — ejercitación completa', tipo: 'PDF', peso: '2,1 MB', fecha: '20/10' },
    { id: 'ma4', materia: 'Lengua', titulo: 'Texto para analizar: cap. 4', tipo: 'Fotocopia', peso: '0,8 MB', fecha: '15/10' }
  ],

  conversaciones: [
    { id: 'm1', sector: 'Secretaría', asunto: 'Constancia de alumno regular', ultimo: 'Sí, la retirás por mostrador el jueves.', fecha: 'Ayer', estado: 'en curso' },
    { id: 'm2', sector: 'Pedagógico', asunto: 'Consulta sobre proyecto final', ultimo: 'Te derivo con la docente de Historia.', fecha: 'Hace 5 días', estado: 'resuelto' }
  ],

  cursosDocente: [
    { curso: '3° A', materia: 'Biología', alumnos: 28, cargadas: 24 },
    { curso: '3° B', materia: 'Biología', alumnos: 26, cargadas: 26 },
    { curso: '4° A', materia: 'Biología', alumnos: 25, cargadas: 18 }
  ],

  /* Planilla de carga del docente: alumnos × actividades.
     Editar una celda guarda al instante → familia/estudiante lo ven ya. */
  planilla: {
    materia: 'Biología', curso: '3° A', trimestre: 2,
    columnas: [
      { id: 'tp1', titulo: 'TP 1 · Célula', tipo: 'Trabajo práctico', entrega: '12/08' },
      { id: 'tp2', titulo: 'TP 2 · Tejidos', tipo: 'Trabajo práctico', entrega: '02/09' },
      { id: 'ev1', titulo: 'Evaluación 1', tipo: 'Evaluación escrita', entrega: '25/09' },
      { id: 'pr1', titulo: 'Ecosistemas', tipo: 'Presentación en grupo', entrega: '12/11' }
    ],
    /* nota = número 1-10, null = sin cargar, 0 = no entregó */
    notas: {
      a1: { tp1: 8, tp2: 7,  ev1: 9,  pr1: null },
      a2: { tp1: 9, tp2: 9,  ev1: 8,  pr1: null },
      a3: { tp1: 7, tp2: 6,  ev1: null, pr1: null },
      a4: { tp1: 5, tp2: 0,  ev1: null, pr1: null },
      a5: { tp1: 6, tp2: null, ev1: null, pr1: null },
      a6: { tp1: 9, tp2: 8,  ev1: 7,  pr1: null },
      a7: { tp1: 8, tp2: 8,  ev1: null, pr1: null },
      a8: { tp1: 6, tp2: 7,  ev1: null, pr1: null },
      a9: { tp1: null, tp2: null, ev1: null, pr1: null },
      a10:{ tp1: 7, tp2: null, ev1: null, pr1: null }
    }
  },

  docenteResumen: {
    clasesHoy: [
      { h: '08:00', curso: '3° A', materia: 'Biología', aula: 'Lab 1' },
      { h: '10:15', curso: '3° B', materia: 'Biología', aula: '12' },
      { h: '14:00', curso: '4° A', materia: 'Biología', aula: 'Lab 1' }
    ],
    actividades: 4,
    materiales: 6
  },

  listaCurso: [
    { id: 'a1', nombre: 'Acosta, Bruno', estado: 'P' }, { id: 'a2', nombre: 'Benítez, Carla', estado: 'P' },
    { id: 'a3', nombre: 'Chávez, Delfina', estado: 'P' }, { id: 'a4', nombre: 'Díaz, Emilio', estado: 'T' },
    { id: 'a5', nombre: 'González, Martina', estado: 'A' }, { id: 'a6', nombre: 'Luna, Faustino', estado: 'P' },
    { id: 'a7', nombre: 'Molina, Giuliana', estado: 'P' }, { id: 'a8', nombre: 'Paredes, Hernán', estado: 'P' },
    { id: 'a9', nombre: 'Quintero, Ivana', estado: 'P' }, { id: 'a10', nombre: 'Ríos, Julián', estado: 'P' }
  ],

  alertasPreceptor: [
    { nombre: 'González, Martina', curso: '3° A', detalle: '3 faltas en la semana', tipo: 'faltas' },
    { nombre: 'Díaz, Emilio', curso: '3° A', detalle: '2 llegadas tarde', tipo: 'tarde' },
    { nombre: 'Sosa, Pablo', curso: '1° B', detalle: 'Nota pendiente en Biología', tipo: 'nota' }
  ],

  /* Asistencia del cuerpo docente — la marca el preceptor */
  docentesHoy: [
    { nombre: 'López, Ana',      materia: 'Biología',   cursos: '3°A 3°B 4°A', estado: 'P', detalle: '' },
    { nombre: 'Fernández, Sol',  materia: 'Matemática', cursos: '1°A 1°B',     estado: 'P', detalle: '' },
    { nombre: 'Ibarra, José',    materia: 'Historia',   cursos: '3°A 4°A',     estado: 'L', detalle: 'Licencia médica hasta el 5/11' },
    { nombre: 'Moya, Carla',     materia: 'Lengua',     cursos: '3°A 2°A',     estado: 'A', detalle: 'Sin aviso — 2 horas sin cubrir' },
    { nombre: 'Quiroga, Ramón',  materia: 'Ed. Física', cursos: 'todos',       estado: 'P', detalle: '' },
    { nombre: 'Benítez, Lucrecia', materia: 'Inglés',   cursos: '1°A 1°B 2°A', estado: 'L', detalle: 'Licencia por maternidad (suplente: Vega)' }
  ],

  /* Vista del director: toda la escuela de un vistazo */
  escuela: {
    asistenciaHoy: 92, faltasHoy: 8, sinJustificar: 3, enRiesgo: 4, mensajesAbiertos: 2,
    faltasCurso: [
      { curso: '3° A', faltas: 4, tarde: 2 }, { curso: '1° B', faltas: 2, tarde: 0 },
      { curso: '4° A', faltas: 1, tarde: 1 }, { curso: '2° A', faltas: 1, tarde: 0 }
    ],
    alumnosRiesgo: [
      { nombre: 'González, Martina', curso: '3° A', detalle: 'Historia: nota 4' },
      { nombre: 'Sosa, Pablo', curso: '1° B', detalle: 'Biología: sin entregar' },
      { nombre: 'Díaz, Emilio', curso: '3° A', detalle: 'Matemática: nota 5' },
      { nombre: 'Pereyra, Ana', curso: '4° A', detalle: '3 materias debajo de 6' }
    ]
  },

  usuariosAdmin: [
    { nombre: 'López, Ana', rol: 'docente', detalle: 'Biología · 3°A 3°B 4°A' },
    { nombre: 'Ruiz, Marcos', rol: 'preceptor', detalle: 'Cursos 1°A 1°B 3°A' },
    { nombre: 'González, Laura', rol: 'padre', detalle: 'Martina (3°A) y Joaquín (1°B)' },
    { nombre: 'Fernández, Sol', rol: 'docente', detalle: 'Matemática · 1°A 1°B' }
  ],

  /* Horario semanal del curso */
  horarios: [
    { dia: 'Lunes',     bloques: [['08:00','Matemática','12'],['08:45','Lengua','12'],['10:15','Biología','Lab 1'],['11:10','Historia','12']] },
    { dia: 'Martes',    bloques: [['08:00','Historia','12'],['08:45','Matemática','12'],['10:15','Ed. Física','SUM'],['11:10','Inglés','12']] },
    { dia: 'Miércoles', bloques: [['08:00','Biología','Lab 1'],['08:45','Inglés','12'],['10:15','Lengua','12']] },
    { dia: 'Jueves',    bloques: [['08:00','Matemática','12'],['08:45','Historia','12'],['10:15','Inglés','12'],['11:10','Lengua','12']] },
    { dia: 'Viernes',   bloques: [['08:00','Lengua','12'],['08:45','Biología','Lab 1'],['10:15','Ed. Física','SUM']] }
  ],

  /* Ficha médica: la declara la familia, la consulta la escuela */
  ficha: {
    grupo: '0 positivo', alergias: 'Ninguna declarada',
    cobertura: 'OSDE 210 · Credencial 44-556677-8',
    contacto: 'Laura González (mamá) — 387 555-1234',
    observaciones: 'Asma leve: lleva el inhalador en la mochila.'
  },

  /* Quiénes pueden retirar al alumno */
  autorizados: [
    { nombre: 'Laura González', vinculo: 'Mamá' },
    { nombre: 'Pedro Ruiz', vinculo: 'Papá' },
    { nombre: 'Marta Díaz', vinculo: 'Abuela' }
  ],
  retiroHoy: { quien: 'Laura González (mamá)', hora: '13:10', aviso: false },

  /* Preferencias de notificación por tipo de evento */
  notifPrefs: [
    { id: 'faltas',        label: 'Faltas y llegadas tarde',   detalle: 'aviso inmediato',           on: true },
    { id: 'notas',         label: 'Notas nuevas',              detalle: 'cuando el docente carga',   on: true },
    { id: 'avisos',        label: 'Llamados de atención',      detalle: 'requieren tu firma',        on: true },
    { id: 'comunicados',   label: 'Comunicados y eventos',     detalle: 'del colegio',               on: true },
    { id: 'recordatorios', label: 'Recordatorio de entregas',  detalle: 'el día anterior',           on: false }
  ],

  datosAlumno: {
    nombre: 'Martina González', curso: '3° A · turno mañana', dni: '45.678.901',
    docente: 'Prof. López (Biología)', preceptor: 'Preceptor Ruiz',
    contacto: 'familia.gonzalez@mail.com'
  },

  notificaciones: [
    { tipo: 'asistencia', texto: 'Martina González registró una falta hoy (3° A).', fecha: 'Hoy 08:12', leida: false },
    { tipo: 'nota', texto: 'Nueva nota en Biología: Informe laboratorio — pendiente de entrega.', fecha: 'Ayer', leida: false },
    { tipo: 'comunicado', texto: 'Nuevo comunicado: Reunión de familias de 3° año.', fecha: 'Ayer', leida: true },
    { tipo: 'incidente', texto: 'Nuevo llamado de atención registrado: conducta (leve).', fecha: '28/10', leida: true }
  ]
};
