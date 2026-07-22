import { describe, it, expect } from 'vitest';
import { parseTimeToMinutes, checkScheduleStatus, getPousadaLiveStatus } from '../../shared/utils/statusEngine';

describe('Apple-Style Test Suite: statusEngine (Motor de Regras & Status em Tempo Real)', () => {
  describe('Especificação: Conversão de horários para minutos', () => {
    it('deve converter corretamente "08:30" para 510 minutos', () => {
      expect(parseTimeToMinutes('08:30')).toBe(510);
    });

    it('deve retornar 0 para entradas inválidas ou nulas', () => {
      expect(parseTimeToMinutes(null)).toBe(0);
      expect(parseTimeToMinutes('')).toBe(0);
      expect(parseTimeToMinutes(undefined)).toBe(0);
    });
  });

  describe('Especificação: Status de funcionamento de serviços', () => {
    const breakfastSchedule = { start: '07:30', end: '10:30', title: 'Café da Manhã' };

    it('deve indicar que o café da manhã está aberto às 08:00', () => {
      const result = checkScheduleStatus(breakfastSchedule, '08:00');
      expect(result.isOpen).toBe(true);
      expect(result.statusText).toContain('Aberto');
      expect(result.badgeClass).toBe('status-open');
    });

    it('deve indicar que o café da manhã está fechado às 11:00', () => {
      const result = checkScheduleStatus(breakfastSchedule, '11:00');
      expect(result.isOpen).toBe(false);
      expect(result.statusText).toContain('Fechado');
      expect(result.badgeClass).toBe('status-closed');
    });
  });

  describe('Especificação: Horário de silêncio (Cruzando a meia-noite)', () => {
    const silenceSchedule = { start: '22:00', end: '08:00', title: 'Horário de Silêncio' };

    it('deve estar ATIVO às 23:30', () => {
      const result = checkScheduleStatus(silenceSchedule, '23:30');
      expect(result.isOpen).toBe(true);
    });

    it('deve estar ATIVO às 03:00 da madrugada', () => {
      const result = checkScheduleStatus(silenceSchedule, '03:00');
      expect(result.isOpen).toBe(true);
    });

    it('deve estar INATIVO às 14:00 da tarde', () => {
      const result = checkScheduleStatus(silenceSchedule, '14:00');
      expect(result.isOpen).toBe(false);
    });
  });

  describe('Especificação: Resumo de status completo da pousada', () => {
    it('deve gerar o mapeamento de status para todos os horários cadastrados', () => {
      const schedules = {
        breakfast: { start: '07:30', end: '10:30' },
        pool: { start: '08:00', end: '22:00' }
      };
      const result = getPousadaLiveStatus(schedules, '09:00');
      expect(result.breakfast.isOpen).toBe(true);
      expect(result.pool.isOpen).toBe(true);
    });
  });
});
