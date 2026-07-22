/**
 * Motor de busca indexada ponderada para itens do menu, regras, atrações e solicitações.
 */

export function searchAll(query, { menuItems = [], rules = [], guideAttractions = [] }) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { menuMatches: [], ruleMatches: [], guideMatches: [] };
  }

  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const matchText = (text) => {
    if (!text) return false;
    const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes(normalizedQuery);
  };

  const matchKeywords = (keywords = []) => {
    return keywords.some(kw => matchText(kw));
  };

  const menuMatches = menuItems.filter(item => 
    matchText(item.title) ||
    matchText(item.description) ||
    matchKeywords(item.searchKeywords) ||
    (item.tags && item.tags.some(tag => matchText(tag)))
  );

  const ruleMatches = rules.filter(rule =>
    matchText(rule.title) ||
    matchText(rule.summary) ||
    matchText(rule.details)
  );

  const guideMatches = guideAttractions.filter(attraction =>
    matchText(attraction.title) ||
    matchText(attraction.description) ||
    matchText(attraction.badge)
  );

  return { menuMatches, ruleMatches, guideMatches };
}
