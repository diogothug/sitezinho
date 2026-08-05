import React, { useState } from 'react';
import { Compass, MapPin } from 'lucide-react';
import guideData from '../../data/json/guide.json';
import { assetUrl } from '../../shared/utils/assetPath';

export default function LocalGuideGrid({ t }) {
  const [activeFilter, setActiveFilter] = useState('todos');

  const filteredAttractions = activeFilter === 'todos'
    ? guideData.attractions
    : guideData.attractions.filter(item => item.categoryId === activeFilter);

  return (
    <div className="local-guide-section fade-in">
      <div className="section-header">
        <h2 className="section-title">Guia & Dicas da Região</h2>
        <p className="section-subtitle">Descubra as melhores praias, restaurantes e passeios da Ilha de Boipeba</p>
      </div>

      {/* Filtros do Guia */}
      <div className="category-tabs-scroll">
        <button
          className={`tab-btn ${activeFilter === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveFilter('todos')}
        >
          🌟 Todos os Locais
        </button>
        {guideData.categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Atividades e Lugares */}
      <div className="guide-grid">
        {filteredAttractions.map(item => (
          <div key={item.id} className="guide-card glass-panel">
            <div className="guide-card-img-wrapper">
              <img src={assetUrl(item.image)} alt={item.title} className="guide-card-img" />
              <span className="guide-badge">{item.badge}</span>
            </div>

            <div className="guide-card-content">
              <h4 className="guide-title">{item.title}</h4>
              <div className="guide-dist-row">
                <MapPin size={14} className="text-amber-400" />
                <span>{item.distance}</span>
              </div>
              <p className="guide-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
