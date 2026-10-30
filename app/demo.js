/* AYLLU — datos de demostración (modo sin backend).
   Las mismas estructuras que tendrán las tablas reales. */
var DEMO = {
  escuela: { nombre: 'Colegio Modelo', lema: 'La escuela y la familia, conectadas' },

  hijos: [
    { id: 'st1', nombre: 'Martina González', curso: '3° A', avatar: 'MG' },
    { id: 'st2', nombre: 'Joaquín González', curso: '1° B', avatar: 'JG' }
  ],

  comunicados: [
    { id: 'c1', categoria: 'urgente', titulo: 'Reunión de familias de 3° año', cuerpo: 'El jueves 6 de noviembre a las 18 h se realizará la reunión de familias para informar el viaje de egresados. Es importante la presencia de al menos un responsable.', fecha: 'Hoy', leido: false, requiereRespuesta: true, opciones: ['Confirmo asistencia', 'No puedo asistir'] },
    { id: 'c2', categoria: 'charla', titulo: 'Charla sobre uso de pantallas', cuerpo: 'El martes se dictará una charla para familias sobre hábitos digitales saludables, a cargo del equipo de orientación escolar.', fecha: 'Ayer', leido: false, requiereRespuesta: false },
    { id: 'c3', categoria: 'general', titulo: 'Cambio de horario de salida', cuerpo: 'A partir del lunes, la salida de primaria se adelanta 15 minutos por obras en la vereda.', fecha: 'Hace 3 días', leido: true, requiereRespuesta: false },
    { id: 'c4', categoria: 'autorizacion', titulo: 'Salida didáctica al museo', cuerpo: 'El 12 de noviembre el curso visitará el Museo de Ciencias Naturales. Costo: $3.500. Se requiere autorización firmada.', fecha: 'Hace 4 días', leido: true, requiereRespuesta: true, opciones: ['Autorizo', 'No autorizo'], respondido: false }
  ],

  notas: [
    { materia: 'Matemática', items: [ { act: 'TP 3 · Funciones', nota: 8 }, { act: 'Evaluación 2', nota: 7 } ], trimestre: 7.5 },
    { materia: 'Lengua', items: [ { act: 'Análisis de texto', nota: 9 }, { act: 'Evaluación 2', nota: 8 } ], trimestre: 8.5 },
    { materia: 'Biología', items: [ { act: 'Informe laboratorio', nota: 0 } ], trimestre: null, pendiente: true },
    { materia: 'Historia', items: [ { act: 'Evaluación 2', nota: 6 } ], trimestre: 6 }
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

  conversaciones: [
    { id: 'm1', sector: 'Secretaría', asunto: 'Constancia de alumno regular', ultimo: 'Sí, la retirás por mostrador el jueves.', fecha: 'Ayer', estado: 'en curso' },
    { id: 'm2', sector: 'Pedagógico', asunto: 'Consulta sobre proyecto final', ultimo: 'Te derivo con la docente de Historia.', fecha: 'Hace 5 días', estado: 'resuelto' }
  ],

  cursosDocente: [
    { curso: '3° A', materia: 'Biología', alumnos: 28, cargadas: 24 },
    { curso: '3° B', materia: 'Biología', alumnos: 26, cargadas: 26 },
    { curso: '4° A', materia: 'Biología', alumnos: 25, cargadas: 18 }
  ],

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

  usuariosAdmin: [
    { nombre: 'López, Ana', rol: 'docente', detalle: 'Biología · 3°A 3°B 4°A' },
    { nombre: 'Ruiz, Marcos', rol: 'preceptor', detalle: 'Cursos 1°A 1°B 3°A' },
    { nombre: 'González, Laura', rol: 'padre', detalle: 'Martina (3°A) y Joaquín (1°B)' },
    { nombre: 'Fernández, Sol', rol: 'docente', detalle: 'Matemática · 1°A 1°B' }
  ],

  notificaciones: [
    { tipo: 'asistencia', texto: 'Martina González registró una falta hoy (3° A).', fecha: 'Hoy 08:12', leida: false },
    { tipo: 'nota', texto: 'Nueva nota en Biología: Informe laboratorio — pendiente de entrega.', fecha: 'Ayer', leida: false },
    { tipo: 'comunicado', texto: 'Nuevo comunicado: Reunión de familias de 3° año.', fecha: 'Ayer', leida: true },
    { tipo: 'incidente', texto: 'Nuevo llamado de atención registrado: conducta (leve).', fecha: '28/10', leida: true }
  ]
};
