/**
 * Engine astronômico e de marés específico para Moreré / Ilha de Boipeba (Bahia).
 * Calcula maré atual estimada, horários de maré baixa/alta e janelas ideais
 * para visitação às Piscinas Naturais de Moreré.
 */

// Ciclo lunar médio de ~29.53 dias
const SYNODIC_MONTH = 29.53058867;
// Lua nova conhecida de referência: 11 de Janeiro de 2024 às 11:57 UTC
const KNOWN_NEW_MOON_TIMESTAMP = new Date('2024-01-11T11:57:00Z').getTime();

/**
 * Calcula a fase da lua atual com base em timestamp astronômico
 * @param {Date} [date=new Date()] 
 * @returns {{ phase: string, name: string, illumination: number, icon: string, isSpringTide: boolean }}
 */
export function getMoonPhase(date = new Date()) {
  const diffMs = date.getTime() - KNOWN_NEW_MOON_TIMESTAMP;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cyclePosition = (diffDays % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseNormalized = cyclePosition / SYNODIC_MONTH; // 0.0 a 1.0

  let phase = 'new';
  let name = 'Lua Nova';
  let icon = '🌑';
  let isSpringTide = false; // Maré de sizígia (lua nova ou cheia = maré mais seca)

  if (phaseNormalized < 0.03 || phaseNormalized > 0.97) {
    phase = 'new';
    name = 'Lua Nova';
    icon = '🌑';
    isSpringTide = true;
  } else if (phaseNormalized < 0.22) {
    phase = 'waxing-crescent';
    name = 'Lua Crescente';
    icon = '🌒';
  } else if (phaseNormalized < 0.28) {
    phase = 'first-quarter';
    name = 'Quarto Crescente';
    icon = '🌓';
  } else if (phaseNormalized < 0.47) {
    phase = 'waxing-gibbous';
    name = 'Gibosa Crescente';
    icon = '🌔';
  } else if (phaseNormalized < 0.53) {
    phase = 'full';
    name = 'Lua Cheia';
    icon = '🌕';
    isSpringTide = true;
  } else if (phaseNormalized < 0.72) {
    phase = 'waning-gibbous';
    name = 'Gibosa Minguante';
    icon = '🌖';
  } else if (phaseNormalized < 0.78) {
    phase = 'last-quarter';
    name = 'Quarto Minguante';
    icon = '🌗';
  } else {
    phase = 'waning-crescent';
    name = 'Lua Minguante';
    icon = '🌘';
  }

  // Iluminação percentual aproximada (0 a 100%)
  const illumination = Math.round((1 - Math.cos(phaseNormalized * 2 * Math.PI)) / 2 * 100);

  return {
    phase,
    name,
    illumination,
    icon,
    isSpringTide
  };
}

/**
 * Calcula a curva aproximada de maré semidiurna para a Costa do Dendê (Moreré)
 * @param {Date} [date=new Date()]
 * @returns {{ currentLevel: number, trend: 'subindo'|'descendo', lowTideTime: string, highTideTime: string, naturalPoolsIdeal: boolean, poolsWindow: string }}
 */
export function getMorereTideInfo(date = new Date()) {
  const moon = getMoonPhase(date);
  const hours = date.getHours() + date.getMinutes() / 60;
  
  // Amplitude em Moreré varia com sizígia vs quadratura
  const amplitude = moon.isSpringTide ? 1.05 : 0.75;
  const meanLevel = 1.25;

  // Fase diária de maré calculada com base no período semidiurno (~12.4h)
  const tidePhase = ((hours % 12.4) / 12.4) * 2 * Math.PI;
  const currentLevel = Math.max(0.1, Number((meanLevel - amplitude * Math.cos(tidePhase)).toFixed(2)));

  // Tendência: derivada da curva de maré
  const trend = Math.sin(tidePhase) >= 0 ? 'subindo' : 'descendo';

  // Horários aproximados de baixa-mar e preamar mais próximos
  const lowTideHour = (Math.round((0 - tidePhase) / (2 * Math.PI) * 12.4 + hours + 12.4) % 12.4);
  const highTideHour = (lowTideHour + 6.2) % 24;

  const formatHour = (h) => {
    const totalMinutes = Math.round(h * 60);
    const hh = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const lowTideTime = formatHour(lowTideHour);
  const highTideTime = formatHour(highTideHour);

  // Janela ideal para Piscinas Naturais: maré <= 0.6m
  const naturalPoolsIdeal = currentLevel <= 0.65;
  const poolWindowStart = formatHour(Math.max(0, lowTideHour - 1.5));
  const poolWindowEnd = formatHour((lowTideHour + 1.5) % 24);
  const poolsWindow = `${poolWindowStart} às ${poolWindowEnd}`;

  return {
    currentLevel,
    trend,
    lowTideTime,
    highTideTime,
    isSpringTide: moon.isSpringTide,
    moon,
    naturalPoolsIdeal,
    poolsWindow
  };
}
