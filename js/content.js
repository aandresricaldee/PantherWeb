// Única fuente de datos editables de la landing.
// Para actualizar disciplinas (carrusel), horarios, planes, entrenadores o el WhatsApp, editar solo este archivo.
// Los textos de Hero, Nosotros, Ubicación y Contacto están directamente en index.html.
export const content = {
  // Zona horaria del club: define cuándo se muestra "Abierto ahora" (no depende de dónde esté quien mira la página).
  zona: 'America/Argentina/Buenos_Aires',

  // Número en formato internacional, solo dígitos (ej.: 5491122334455 = +54 9 11 2233-4455).
  // Lo usan el botón flotante y el botón de contacto.
  whatsapp: {
    numero: '5400000000000',
    mensaje: 'Hola! Quiero consultar por los planes de Panther Club.',
  },

  disciplinas: [
    { id: 'sala-pesas', nombre: 'Sala de pesas', descripcion: 'Mancuernas, discos y racks para trabajar cada grupo muscular.', icono: 'pesas' },
    { id: 'maquinas', nombre: 'Máquinas guiadas', descripcion: 'Equipos de última generación, ideales para empezar y progresar con seguridad.', icono: 'maquina' },
    { id: 'peso-libre', nombre: 'Peso libre', descripcion: 'Barras, bancos y jaulas de sentadilla para entrenamiento de fuerza.', icono: 'barra' },
    { id: 'rutina', nombre: 'Rutina personalizada', descripcion: 'Un plan armado a tu medida, según tu objetivo y tu nivel.', icono: 'objetivo' },
    { id: 'evaluacion', nombre: 'Evaluación física', descripcion: 'Medimos tu punto de partida para entrenar con criterio desde el primer día.', icono: 'pulso' },
    { id: 'seguimiento', nombre: 'Seguimiento', descripcion: 'Controlamos tu progreso y ajustamos la rutina cuando hace falta.', icono: 'grafico' },
  ],

  horarios: [
    { dia: 'Lunes', turnos: [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }] },
    { dia: 'Martes', turnos: [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }] },
    { dia: 'Miércoles', turnos: [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }] },
    { dia: 'Jueves', turnos: [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }] },
    { dia: 'Viernes', turnos: [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }] },
  ],

  planes: [
    { nombre: 'Básico', precio: '$25.000', periodo: '/ mes', destacado: false,
      beneficios: ['Acceso a sala de musculación', '3 días por semana', 'Rutina inicial'] },
    { nombre: 'Full', precio: '$35.000', periodo: '/ mes', destacado: true,
      beneficios: ['Acceso libre todos los días', 'Rutina personalizada', 'Seguimiento con entrenador', 'Evaluación física mensual'] },
    { nombre: 'Trimestral', precio: '$90.000', periodo: '/ 3 meses', destacado: false,
      beneficios: ['Todo lo del plan Full', 'Ahorro frente al pago mensual', 'Congelamiento de 15 días'] },
    { nombre: 'Anual', precio: '$300.000', periodo: '/ año', destacado: false,
      beneficios: ['Todo lo del plan Full', 'El mayor ahorro del año', 'Congelamiento de 30 días', 'Un pase de invitado por mes'] },
  ],

  entrenadores: [
    { nombre: 'Martín Gómez', especialidad: 'Hipertrofia y fuerza', foto: null },
    { nombre: 'Lucía Fernández', especialidad: 'Rutinas personalizadas', foto: null },
    { nombre: 'Diego Romero', especialidad: 'Powerlifting', foto: null },
    { nombre: 'Camila Ríos', especialidad: 'Rehabilitación y movilidad', foto: null },
    { nombre: 'Nicolás Acosta', especialidad: 'Fuerza y acondicionamiento', foto: null },
  ],
};
