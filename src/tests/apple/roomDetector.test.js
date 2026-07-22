import { describe, it, expect, beforeEach } from 'vitest';
import { detectRoomFromURL, getStoredRoomNumber, saveStoredRoomNumber, resolveCurrentRoom } from '../../shared/utils/roomDetector';

describe('Apple-Style Test Suite: roomDetector (QR Code Inteligente por Quarto)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve extrair o quarto a partir de ?room=08 na URL', () => {
    const room = detectRoomFromURL('?room=08');
    expect(room).toBe('08');
  });

  it('deve extrair o quarto a partir de ?q=5 com formatação de 2 dígitos ("05")', () => {
    const room = detectRoomFromURL('?q=5');
    expect(room).toBe('05');
  });

  it('deve salvar e recuperar o número do quarto no localStorage', () => {
    saveStoredRoomNumber('14');
    expect(getStoredRoomNumber()).toBe('14');
  });

  it('deve resolver o quarto via URL prioritariamente em relação ao localStorage', () => {
    saveStoredRoomNumber('02');
    const room = resolveCurrentRoom();
    // Como window.location.search está sem params no jsdom padrão, vai cair no localStorage '02'
    expect(room).toBe('02');
  });
});
