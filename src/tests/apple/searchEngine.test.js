import { describe, it, expect } from 'vitest';
import { searchAll } from '../../shared/utils/searchEngine';

describe('Apple-Style Test Suite: searchEngine (Busca Indexada Inteligente)', () => {
  const sampleMenu = [
    { title: 'Iscas de Peixe', description: 'Empanadas', searchKeywords: ['peixe', 'petisco'], tags: ['Crocante'] },
    { title: 'Caipirinha Tradicional', description: 'Limão e cachaça', searchKeywords: ['drink', 'álcool'], tags: ['Clássico'] }
  ];

  const sampleConvenience = [
    { title: 'Protetor Solar FPS 50', description: 'Biodegradável para corais', badge: 'Ecológico' },
    { title: 'Kit Dental de Bambu', description: 'Higiene sustentável', badge: 'Natural' }
  ];

  const sampleRules = [
    { title: 'Horário de Silêncio', summary: '22h às 8h', details: 'Respeite o sono dos hóspedes' }
  ];

  const sampleGuide = [
    { title: 'Praia de Moreré', description: 'Piscinas naturais com peixes', badge: 'Imperdível' }
  ];

  const sampleTours = [
    { title: 'Passeio de Barco Volta à Ilha', description: 'Piscinas naturais e Cova da Onça', highlights: 'Moreré, Castelhanos' }
  ];

  it('deve encontrar itens do menu pela busca por palavra-chave ("petisco")', () => {
    const results = searchAll('petisco', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.menuMatches.length).toBe(1);
    expect(results.menuMatches[0].title).toBe('Iscas de Peixe');
  });

  it('deve encontrar produtos de conveniência ("protetor solar")', () => {
    const results = searchAll('protetor', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.convenienceMatches.length).toBe(1);
    expect(results.convenienceMatches[0].title).toContain('Protetor Solar');
  });

  it('deve encontrar passeios ("Volta à Ilha")', () => {
    const results = searchAll('volta', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.tourMatches.length).toBe(1);
    expect(results.tourMatches[0].title).toContain('Volta à Ilha');
  });

  it('deve tolerar acentuação e caixa alta/baixa ("silencio")', () => {
    const results = searchAll('silencio', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.ruleMatches.length).toBe(1);
    expect(results.ruleMatches[0].title).toBe('Horário de Silêncio');
  });

  it('deve encontrar atrações do guia por termo ("moreré")', () => {
    const results = searchAll('moreré', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.guideMatches.length).toBe(1);
    expect(results.guideMatches[0].title).toBe('Praia de Moreré');
  });

  it('deve retornar arrays vazios se a busca for nula ou vazia', () => {
    const results = searchAll('', { 
      menuItems: sampleMenu, 
      convenienceItems: sampleConvenience, 
      rules: sampleRules, 
      guideAttractions: sampleGuide,
      tours: sampleTours
    });
    expect(results.menuMatches).toEqual([]);
    expect(results.convenienceMatches).toEqual([]);
    expect(results.ruleMatches).toEqual([]);
    expect(results.guideMatches).toEqual([]);
    expect(results.tourMatches).toEqual([]);
  });
});
