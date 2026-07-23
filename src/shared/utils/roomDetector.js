/**
 * Utilitário para detecção inteligente de Quartos e Chalés da Pousada Mar de Moreré.
 */

export function detectRoomFromURL(searchString = window.location.search) {
  try {
    const params = new URLSearchParams(searchString);
    const roomParam = params.get('room') || params.get('q') || params.get('quarto') || params.get('chale');

    if (roomParam) {
      const trimmed = roomParam.trim().toUpperCase();
      // Se for chalé (ex: CH1, CH01, CHALE1)
      if (trimmed.startsWith('CH') || trimmed.includes('CHALE')) {
        const num = trimmed.replace(/\D/g, '').padStart(2, '0');
        return `Chalé ${num}`;
      }
      // Se for número (ex: 5 -> Quarto 05)
      const cleanNum = trimmed.replace(/\D/g, '').padStart(2, '0');
      return `Quarto ${cleanNum}`;
    }
  } catch (e) {
    console.error('Erro ao ler URLSearchParams:', e);
  }
  return null;
}

export function getStoredRoomNumber() {
  try {
    return localStorage.getItem('pousada_mar_morere_room') || null;
  } catch (e) {
    return null;
  }
}

export function saveStoredRoomNumber(roomNum) {
  try {
    if (roomNum) {
      localStorage.setItem('pousada_mar_morere_room', roomNum);
    }
  } catch (e) {
    console.error('Erro ao salvar quarto no localStorage:', e);
  }
}

export function resolveCurrentRoom() {
  const urlRoom = detectRoomFromURL();
  if (urlRoom) {
    saveStoredRoomNumber(urlRoom);
    return urlRoom;
  }
  const stored = getStoredRoomNumber();
  return stored || 'Quarto 04';
}
