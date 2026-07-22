/**
 * Utilitário para detecção inteligente do número do quarto a partir de URL (?room=X ou ?q=X) ou localStorage.
 */

export function detectRoomFromURL(searchString = window.location.search) {
  try {
    const params = new URLSearchParams(searchString);
    const roomParam = params.get('room') || params.get('q') || params.get('quarto');

    if (roomParam) {
      const cleanRoom = roomParam.trim().padStart(2, '0');
      return cleanRoom;
    }
  } catch (e) {
    console.error('Erro ao ler URLSearchParams:', e);
  }
  return null;
}

export function getStoredRoomNumber() {
  try {
    return localStorage.getItem('pousada_guest_room') || null;
  } catch (e) {
    return null;
  }
}

export function saveStoredRoomNumber(roomNum) {
  try {
    if (roomNum) {
      localStorage.setItem('pousada_guest_room', roomNum);
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
  return stored || '04'; // Quarto padrão de demonstração
}
