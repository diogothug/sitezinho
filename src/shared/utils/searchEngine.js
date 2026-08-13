/**
 * Motor de busca indexada ponderada para itens do menu, conveniência, regras, atrações e passeios.
 */

export function searchAll(query, { 
  menuItems = [], 
  convenienceItems = [], 
  rules = [], 
  guideAttractions = [],
  tours = []
} = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { 
      menuMatches: [], 
      convenienceMatches: [], 
      ruleMatches: [], 
      guideMatches: [], 
      tourMatches: [] 
    };
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

  const convenienceMatches = convenienceItems.filter(item =>
    matchText(item.title) ||
    matchText(item.description) ||
    matchText(item.badge)
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

  const tourMatches = tours.filter(tour =>
    matchText(tour.title) ||
    matchText(tour.description) ||
    matchText(tour.highlights)
  );

  return { 
    menuMatches, 
    convenienceMatches, 
    ruleMatches, 
    guideMatches, 
    tourMatches 
  };
}
