import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getGreetingByTime, 
  extractTokenFromURL, 
  calculateRemainingDays, 
  resolveGuestSession,
  saveGuestSession,
  getSavedGuestSession 
} from '../../shared/utils/guestSession';

describe('Apple-Style Test Suite: guestSession (Autenticação por Token & Concierge do Hóspede)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Especificação: Saudação Personalizada de acordo com o Período do Dia', () => {
    it('deve saudar com "Bom dia" entre 05h e 11h59', () => {
      const morningDate = new Date('2026-08-13T08:30:00');
      expect(getGreetingByTime(morningDate, 'Diogo')).toBe('Bom dia, Diogo');
    });

    it('deve saudar com "Boa tarde" entre 12h e 17h59', () => {
      const afternoonDate = new Date('2026-08-13T15:45:00');
      expect(getGreetingByTime(afternoonDate, 'Diogo')).toBe('Boa tarde, Diogo');
    });

    it('deve saudar com "Boa noite" entre 18h e 04h59', () => {
      const nightDate = new Date('2026-08-13T21:15:00');
      expect(getGreetingByTime(nightDate, 'Diogo')).toBe('Boa noite, Diogo');
    });

    it('deve retornar saudação sem vírgula caso o nome não seja fornecido', () => {
      const morningDate = new Date('2026-08-13T09:00:00');
      expect(getGreetingByTime(morningDate)).toBe('Bom dia');
    });
  });

  describe('Especificação: Extração de Token da URL', () => {
    it('deve extrair token por parâmetro de busca ?token=8Hd72KaP', () => {
      const token = extractTokenFromURL('https://mardemorere.com/?token=8Hd72KaP');
      expect(token).toBe('8Hd72KaP');
    });

    it('deve extrair token de rota /g/8Hd72KaP', () => {
      const token = extractTokenFromURL('https://mardemorere.com/g/8Hd72KaP');
      expect(token).toBe('8Hd72KaP');
    });

    it('deve retornar null caso a URL não contenha token', () => {
      const token = extractTokenFromURL('https://mardemorere.com/');
      expect(token).toBeNull();
    });
  });

  describe('Especificação: Resolução de Sessão e Persistência', () => {
    it('deve resolver reserva válida correspondente ao token 8Hd72KaP', () => {
      const session = resolveGuestSession('https://mardemorere.com/?token=8Hd72KaP');
      expect(session.guestName).toBe('Diogo');
      expect(session.room).toBe('04');
    });

    it('deve persistir e recuperar sessão do localStorage', () => {
      const customSession = {
        guestName: 'Marina',
        room: '08',
        checkIn: '2026-08-15',
        checkOut: '2026-08-20'
      };
      saveGuestSession(customSession);
      const retrieved = getSavedGuestSession();
      expect(retrieved.guestName).toBe('Marina');
      expect(retrieved.room).toBe('08');
    });

    it('deve calcular dias restantes com precisão até a data de checkout', () => {
      const today = new Date('2026-08-13T12:00:00');
      const checkout = '2026-08-16T12:00:00';
      const days = calculateRemainingDays(checkout, today);
      expect(days).toBe(3);
    });
  });
});
