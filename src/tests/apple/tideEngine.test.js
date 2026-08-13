import { describe, it, expect } from 'vitest';
import { getMoonPhase, getMorereTideInfo } from '../../shared/utils/tideEngine';

describe('Apple-Style Test Suite: tideEngine (Tábua de Marés & Fases Lunares de Moreré)', () => {
  describe('Especificação: Cálculo Astronômico de Fase da Lua', () => {
    it('deve identificar Lua Nova no marco de referência com maré de sizígia', () => {
      const knownNewMoon = new Date('2024-01-11T12:00:00Z');
      const moon = getMoonPhase(knownNewMoon);

      expect(moon.phase).toBe('new');
      expect(moon.name).toBe('Lua Nova');
      expect(moon.isSpringTide).toBe(true);
      expect(moon.icon).toBe('🌑');
    });

    it('deve identificar Lua Cheia aproximadamente 14.7 dias após a Lua Nova', () => {
      const fullMoonDate = new Date(new Date('2024-01-11T12:00:00Z').getTime() + 14.76 * 24 * 60 * 60 * 1000);
      const moon = getMoonPhase(fullMoonDate);

      expect(moon.phase).toBe('full');
      expect(moon.name).toBe('Lua Cheia');
      expect(moon.isSpringTide).toBe(true);
      expect(moon.icon).toBe('🌕');
      expect(moon.illumination).toBeGreaterThanOrEqual(95);
    });

    it('deve calcular iluminação percentual coerente entre 0% e 100%', () => {
      const moon = getMoonPhase(new Date());
      expect(moon.illumination).toBeGreaterThanOrEqual(0);
      expect(moon.illumination).toBeLessThanOrEqual(100);
    });
  });

  describe('Especificação: Estimativa de Maré & Janela para Piscinas Naturais de Moreré', () => {
    it('deve retornar níveis de maré positivos e estruturados', () => {
      const tide = getMorereTideInfo(new Date());

      expect(typeof tide.currentLevel).toBe('number');
      expect(tide.currentLevel).toBeGreaterThanOrEqual(0.1);
      expect(['subindo', 'descendo']).toContain(tide.trend);
      expect(tide.lowTideTime).toMatch(/^\d{2}:\d{2}$/);
      expect(tide.highTideTime).toMatch(/^\d{2}:\d{2}$/);
      expect(typeof tide.naturalPoolsIdeal).toBe('boolean');
      expect(typeof tide.poolsWindow).toBe('string');
    });

    it('deve sinalizar naturalPoolsIdeal quando a maré estiver baixa (<= 0.65m)', () => {
      // Cria uma data com maré simulada no ponto mais baixo
      const tide = getMorereTideInfo(new Date('2026-08-13T10:00:00'));
      if (tide.currentLevel <= 0.65) {
        expect(tide.naturalPoolsIdeal).toBe(true);
      } else {
        expect(tide.naturalPoolsIdeal).toBe(false);
      }
    });

    it('deve formatar a janela de piscinas naturais com horário de início e fim', () => {
      const tide = getMorereTideInfo(new Date());
      expect(tide.poolsWindow).toContain(' às ');
    });
  });
});
