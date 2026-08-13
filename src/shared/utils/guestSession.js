/**
 * Utilitário para Gestão de Sessão do Hóspede, Autenticação por Token e Saudações Inteligentes.
 */

// Base de tokens simulados para demonstração / check-in
const MOCK_GUEST_RESERVATIONS = {
  '8Hd72KaP': {
    token: '8Hd72KaP',
    guestName: 'Diogo',
    room: '04',
    checkIn: '2026-08-10',
    checkOut: '2026-08-16',
    welcomeNote: 'Bem-vindo de volta à Bahia!'
  },
  'MORERE2026': {
    token: 'MORERE2026',
    guestName: 'Família Silva',
    room: '07',
    checkIn: '2026-08-12',
    checkOut: '2026-08-18',
    welcomeNote: 'Desejamos uma estadia inesquecível.'
  },
  'VIP01': {
    token: 'VIP01',
    guestName: 'Ana & Carlos',
    room: 'Chalé 01',
    checkIn: '2026-08-11',
    checkOut: '2026-08-17',
    welcomeNote: 'Aproveitem o pôr do sol em Moreré.'
  }
};

const STORAGE_KEY_SESSION = 'pousada_guest_session';

/**
 * Gera saudação baseada na hora do dia
 * @param {Date} [date=new Date()]
 * @param {string} [name='']
 * @returns {string}
 */
export function getGreetingByTime(date = new Date(), name = '') {
  const hours = date.getHours();
  let greeting = 'Olá';
  if (hours >= 5 && hours < 12) {
    greeting = 'Bom dia';
  } else if (hours >= 12 && hours < 18) {
    greeting = 'Boa tarde';
  } else {
    greeting = 'Boa noite';
  }

  return name ? `${greeting}, ${name}` : greeting;
}

/**
 * Extrai token da URL (querystring ou pathname /g/:token)
 * @param {string} [urlString=window.location.href]
 * @returns {string|null}
 */
export function extractTokenFromURL(urlString = typeof window !== 'undefined' ? window.location.href : '') {
  try {
    const url = new URL(urlString, 'https://mardemorere.com');
    
    // 1. Querystring ?token=XYZ ou ?t=XYZ ou ?g=XYZ
    const paramToken = url.searchParams.get('token') || url.searchParams.get('t') || url.searchParams.get('g');
    if (paramToken) return paramToken.trim();

    // 2. Pathname /g/8Hd72KaP
    const match = url.pathname.match(/\/g\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (e) {
    console.error('Erro ao extrair token:', e);
  }
  return null;
}

/**
 * Salva a sessão do hóspede
 * @param {object} sessionData
 */
export function saveGuestSession(sessionData) {
  try {
    if (typeof localStorage !== 'undefined' && sessionData) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    }
  } catch (e) {
    console.error('Erro ao persistir sessão:', e);
  }
}

/**
 * Obtém a sessão salva
 * @returns {object|null}
 */
export function getSavedGuestSession() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler sessão do localStorage:', e);
  }
  return null;
}

/**
 * Calcula dias restantes de estadia
 * @param {string} checkOutDateStr 
 * @param {Date} [currentDate=new Date()]
 * @returns {number}
 */
export function calculateRemainingDays(checkOutDateStr, currentDate = new Date()) {
  if (!checkOutDateStr) return 0;
  const outDate = new Date(checkOutDateStr);
  const diffTime = outDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Resolve a sessão ativa ou cria fallback elegante
 * @param {string} [urlString]
 * @returns {object}
 */
export function resolveGuestSession(urlString) {
  const token = extractTokenFromURL(urlString);

  if (token && MOCK_GUEST_RESERVATIONS[token]) {
    const reservation = MOCK_GUEST_RESERVATIONS[token];
    saveGuestSession(reservation);
    return reservation;
  }

  // Tenta carregar do localStorage
  const saved = getSavedGuestSession();
  if (saved) return saved;

  // Fallback padrão amigável
  return {
    token: 'DEMO',
    guestName: 'Hóspede',
    room: '04',
    checkIn: 'Hoje',
    checkOut: 'Em 4 dias',
    welcomeNote: 'Tenha uma estadia maravilhosa em Moreré.'
  };
}
