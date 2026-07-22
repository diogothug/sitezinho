import React, { useState } from 'react';
import { Search, X, Utensils, BookOpen, Compass } from 'lucide-react';
import { searchAll } from '../../shared/utils/searchEngine';
import menuData from '../../data/json/menu.json';
import rulesData from '../../data/json/rules.json';
import guideData from '../../data/json/guide.json';

export default function GlobalSearchBar({ onAddToCart, onShowToast, t }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const results = searchAll(query, {
    menuItems: menuData.items,
    rules: rulesData.rules,
    guideAttractions: guideData.attractions
  });

  const hasResults = results.menuMatches.length > 0 || results.ruleMatches.length > 0 || results.guideMatches.length > 0;

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
  };

  return (
    <div className="global-search-container">
      <div className="search-bar-wrapper glass-panel">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsSearching(true);
          }}
        />
        {query && (
          <button className="btn-clear-search" onClick={handleClear}>
            <X size={18} />
          </button>
        )}
      </div>

      {query.trim().length > 0 && isSearching && (
        <div className="search-results-overlay glass-panel slide-down">
          <div className="results-header">
            <h4>Resultados da Busca para "{query}"</h4>
            <button className="btn-close-results" onClick={handleClear}>Fechar</button>
          </div>

          {!hasResults ? (
            <div className="no-results">Nenhum resultado encontrado. Tente buscar por "toalha", "caipirinha", "piscina" ou "café".</div>
          ) : (
            <div className="results-list">
              {results.menuMatches.length > 0 && (
                <div className="result-category-block">
                  <h5><Utensils size={16} /> Pratos & Drinks ({results.menuMatches.length})</h5>
                  {results.menuMatches.map(item => (
                    <div key={item.id} className="search-item-row">
                      <div>
                        <strong>{item.title}</strong> - R$ {item.price.toFixed(2)}
                        <p>{item.description}</p>
                      </div>
                      <button className="btn-mini-add" onClick={() => {
                        onAddToCart(item, 1, '');
                        onShowToast(`Adicionado: ${item.title}`, 'success');
                      }}>
                        + Pedir
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {results.ruleMatches.length > 0 && (
                <div className="result-category-block">
                  <h5><BookOpen size={16} /> Regras & Informações ({results.ruleMatches.length})</h5>
                  {results.ruleMatches.map(rule => (
                    <div key={rule.id} className="search-item-row">
                      <div>
                        <strong>{rule.title}</strong>
                        <p>{rule.summary} - {rule.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.guideMatches.length > 0 && (
                <div className="result-category-block">
                  <h5><Compass size={16} /> Guia da Região ({results.guideMatches.length})</h5>
                  {results.guideMatches.map(place => (
                    <div key={place.id} className="search-item-row">
                      <div>
                        <strong>{place.title}</strong> ({place.distance})
                        <p>{place.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
