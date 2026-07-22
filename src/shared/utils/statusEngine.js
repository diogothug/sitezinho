/**
 * Engine centralizado para cálculo de status em tempo real das áreas e serviços da Pousada.
 */

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function checkScheduleStatus(schedule, currentTimeStr) {
  if (!schedule || !schedule.start || !schedule.end) {
    return { isOpen: false, statusText: 'Indisponível', badgeClass: 'status-closed' };
  }

  const startMins = parseTimeToMinutes(schedule.start);
  const endMins = parseTimeToMinutes(schedule.end);
  const currentMins = currentTimeStr
    ? parseTimeToMinutes(currentTimeStr)
    : (() => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
      })();

  let isOpen = false;

  // Trata horários que passam da meia-noite (ex: 22:00 às 08:00)
  if (startMins > endMins) {
    isOpen = currentMins >= startMins || currentMins < endMins;
  } else {
    isOpen = currentMins >= startMins && currentMins < endMins;
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: `Aberto (até às ${schedule.end})`,
      badgeClass: 'status-open'
    };
  } else {
    return {
      isOpen: false,
      statusText: `Fechado (Abre às ${schedule.start})`,
      badgeClass: 'status-closed'
    };
  }
}

export function getPousadaLiveStatus(schedules, currentTimeStr = null) {
  const result = {};
  if (!schedules) return result;

  for (const [key, schedule] of Object.entries(schedules)) {
    result[key] = {
      ...schedule,
      ...checkScheduleStatus(schedule, currentTimeStr)
    };
  }
  return result;
}
