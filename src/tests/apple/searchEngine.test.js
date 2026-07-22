import { describe, it, expect } from 'vitest';
import { searchAll } from '../../shared/utils/searchEngine';

describe('Apple-Style Test Suite: searchEngine (Busca Indexada Inteligente)', () => {
  const sampleMenu = [
    { title: 'Iscas de Peixe', description: 'Empanadas', searchKeywords: ['peixe', 'petisco'], tags: ['Crocante'] },
    { title: 'Caipirinha Tradicional', description: 'Limão e cachaça', searchKeywords: ['drink', 'álcool'], tags: ['Clássico'] }
  ];

  const sampleRules = [
    { title: 'Horário de Silêncio', summary: '22h às 8h', details: 'Respeite o sono dos hóspedes' }
  ];

  const sampleGuide = [
    { title: 'Praia de Moreré', description: 'Piscinas naturais com peixes', badge: 'Imperdível' }
  ];

  it('deve encontrar itens do menu pela busca por palavra-chave ("petisco")', () => {
    const results = searchAll('petisco', { menuItems: sampleMenu, rules: sampleRules, guideAttractions: sampleGuide });
    expect(results.menuMatches.length).toBe(1);
    expect(results.menuMatches[0].title).toBe('Iscas de Peixe');
  });

  it('deve tolerar acentuação e caixa alta/baixa ("silencio")', () => {
    const results = searchAll('silencio', { menuItems: sampleMenu, rules: sampleRules, guideAttractions: sampleGuide });
    expect(results.ruleMatches.length).toBe(1);
    expect(results.ruleMatches[0].title).toBe('Horário de Silêncio');
  });

  it('deve encontrar atrações do guia por termo ("moreré")', () => {
    const results = searchAll('moreré', { menuItems: sampleMenu, rules: sampleRules, guideAttractions: sampleGuide });
    expect(results.guideMatches.length).toBe(1);
    expect(results.guideMatches[0].title).toBe('Praia de Moreré');
  });

  it('deve retornar arrays vazios se a busca for nula ou vazia', () => {
    const results = searchAll('', { menuItems: sampleMenu, rules: sampleRules, guideAttractions: sampleGuide });
    expect(results.menuMatches).toEqual([]);
    expect(results.ruleMatches).toEqual([]);
    expect(results.guideMatches).toEqual([]);
  });
});
