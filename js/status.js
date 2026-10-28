/** "Abierto ahora": estado en vivo del club según los horarios de content.js, en la zona horaria del club. */

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const byDesde = (a, b) => a.desde.localeCompare(b.desde);

// ---------- Lógica pura (testeada en tests/status.test.mjs) ----------

/** Día de la semana (en español) y minutos desde la medianoche, en la zona horaria del club. */
export function zonedNow(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return { dia: DIAS[WEEKDAYS_EN.indexOf(get('weekday'))], minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** Abierto o cerrado, y cuándo cierra o vuelve a abrir. El fin de un turno ya cuenta como cerrado. */
export function openStatus(horarios, { dia, minutes }) {
  const turnosPorDia = new Map(horarios.map((h) => [h.dia, [...h.turnos].sort(byDesde)]));
  const hoy = turnosPorDia.get(dia) ?? [];

  const actual = hoy.find((t) => minutes >= toMinutes(t.desde) && minutes < toMinutes(t.hasta));
  if (actual) return { open: true, closesAt: actual.hasta };

  const masTarde = hoy.find((t) => toMinutes(t.desde) > minutes);
  if (masTarde) return { open: false, next: { when: 'today', hora: masTarde.desde } };

  const start = DIAS.indexOf(dia);
  for (let i = 1; i <= 7; i += 1) {
    const siguiente = DIAS[(start + i) % 7];
    const turnos = turnosPorDia.get(siguiente) ?? [];
    if (turnos.length > 0) return { open: false, next: { when: i === 1 ? 'tomorrow' : 'day', dia: siguiente, hora: turnos[0].desde } };
  }
  return { open: false, next: null };
}

export function statusText(status) {
  if (status.open) return `Abierto ahora · cierra ${status.closesAt}`;
  const { next } = status;
  if (!next) return 'Cerrado';
  if (next.when === 'today') return `Cerrado · abre hoy a las ${next.hora}`;
  if (next.when === 'tomorrow') return `Cerrado · abre mañana a las ${next.hora}`;
  return `Cerrado · abre el ${next.dia.toLowerCase()} a las ${next.hora}`;
}

// ---------- DOM ----------

/** Rellena los [data-status] y marca con "Hoy" la tarjeta del día en Horarios. Se actualiza cada minuto. */
export function initStatus({ horarios, zona }, root = document) {
  const badges = [...root.querySelectorAll('[data-status]')];
  const days = [...root.querySelectorAll('.day[data-dia]')];
  if (badges.length === 0 && days.length === 0) return;

  const update = () => {
    const now = zonedNow(new Date(), zona);
    const status = openStatus(horarios, now);
    const text = statusText(status);
    for (const badge of badges) {
      const label = badge.querySelector('.status-text');
      if (label.textContent !== text) label.textContent = text; // solo escribe si cambió
      badge.dataset.state = status.open ? 'open' : 'closed';
    }
    for (const day of days) {
      const isToday = day.getAttribute('data-dia') === now.dia && !day.querySelector('.day-empty');
      day.classList.toggle('is-today', isToday);
    }
  };

  update();
  setInterval(update, 60_000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
}
