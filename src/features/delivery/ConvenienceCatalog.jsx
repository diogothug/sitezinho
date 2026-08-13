import React, { useState } from 'react';
import { ShoppingBag, Plus, Check, ShieldCheck, Sparkles, Send } from 'lucide-react';
import convenienceData from '../../data/json/convenience.json';

export default function ConvenienceCatalog({ onAddToCart, onShowToast, t }) {
  const [activeCategory, setActiveCategory] = useState('praia');
  const [addedItemIds, setAddedItemIds] = useState({});

  const filteredItems = convenienceData.items.filter(
    item => item.categoryId === activeCategory
  );

  const handleAdd = (item) => {
    onAddToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      type: 'convenience'
    }, 1, '');

    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 1500);

    if (onShowToast) {
      onShowToast(`${item.title} adicionado à comanda!`, 'success');
    }
  };

  return (
    <div className="convenience-section glass-panel fade-in">
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-icon-badge">
            <ShoppingBag size={20} className="text-gold" />
          </div>
          <div>
            <h2 className="section-title">{t ? t('convenienceTitle') : 'Conveniência & Praia'}</h2>
            <p className="section-subtitle">{t ? t('convenienceSub') : 'Itens essenciais entregues no seu quarto ou chalé'}</p>
          </div>
        </div>
      </div>

      {/* Categorias com scroll horizontal suave */}
      <div className="category-tabs-scroll">
        {convenienceData.categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Itens de Conveniência */}
      <div className="convenience-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="convenience-card">
            <div className="convenience-info">
              {item.badge && (
                <span className="convenience-badge-tag">
                  <Sparkles size={12} /> {item.badge}
                </span>
              )}
              <h4 className="convenience-item-title">{item.title}</h4>
              <p className="convenience-item-desc">{item.description}</p>
            </div>

            <div className="convenience-action-row">
              <span className="convenience-price">
                R$ {item.price.toFixed(2)}
              </span>

              <button
                className={`btn-add-cart ${addedItemIds[item.id] ? 'added' : ''}`}
                onClick={() => handleAdd(item)}
                title="Adicionar à Comanda"
              >
                {addedItemIds[item.id] ? (
                  <>
                    <Check size={16} /> Adicionado
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Pedir
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
