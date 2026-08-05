import React, { useState } from 'react';
import { Plus, Check, Info, ShoppingBag } from 'lucide-react';
import menuData from '../../data/json/menu.json';
import { assetUrl } from '../../shared/utils/assetPath';

export default function MenuCatalog({ onAddToCart, onShowToast, cartCount, onOpenCart }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  const filteredItems = activeCategory === 'todos'
    ? menuData.items
    : menuData.items.filter(item => item.categoryId === activeCategory);

  const handleQuickAdd = (item) => {
    onAddToCart(item, 1, '');
    setAddedAnimationId(item.id);
    onShowToast(`Adicionado: ${item.title}`, 'success');
    setTimeout(() => setAddedAnimationId(null), 1500);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedItemModal(item);
    setItemNotes('');
    setItemQuantity(1);
  };

  const handleAddFromModal = () => {
    if (!selectedItemModal) return;
    onAddToCart(selectedItemModal, itemQuantity, itemNotes);
    onShowToast(`${itemQuantity}x ${selectedItemModal.title} adicionado ao pedido!`, 'success');
    setSelectedItemModal(null);
  };

  return (
    <div className="menu-catalog-section fade-in">
      <div className="section-header-flex">
        <div>
          <h2 className="section-title">Cardápio & Room Service</h2>
          <p className="section-subtitle">Peça diretamente do seu quarto ou bar da piscina</p>
        </div>

        {cartCount > 0 && (
          <button className="btn-floating-cart-badge btn-glow" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span>Ver Pedido ({cartCount})</span>
          </button>
        )}
      </div>

      {/* Abas de Categorias */}
      <div className="category-tabs-scroll">
        <button
          className={`tab-btn ${activeCategory === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveCategory('todos')}
        >
          🍽️ Todos
        </button>
        {menuData.categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de Pratos */}
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-card glass-panel">
            <div className="menu-card-img-wrapper" onClick={() => handleOpenDetailModal(item)}>
              <img src={assetUrl(item.image)} alt={item.title} className="menu-card-img" />
              {item.tags && item.tags.length > 0 && (
                <span className="menu-tag-badge">{item.tags[0]}</span>
              )}
            </div>

            <div className="menu-card-content">
              <div className="menu-card-title-row">
                <h4 className="menu-card-title" onClick={() => handleOpenDetailModal(item)}>{item.title}</h4>
                <span className="menu-card-price">R$ {item.price.toFixed(2)}</span>
              </div>

              <p className="menu-card-desc">{item.description}</p>

              <div className="menu-card-actions">
                <button
                  className="btn-text-info"
                  onClick={() => handleOpenDetailModal(item)}
                >
                  <Info size={14} /> Obs / Detalhes
                </button>

                <button
                  className={`btn-add-cart ${addedAnimationId === item.id ? 'added' : ''}`}
                  onClick={() => handleQuickAdd(item)}
                >
                  {addedAnimationId === item.id ? <Check size={16} /> : <Plus size={16} />}
                  <span>{addedAnimationId === item.id ? 'Adicionado' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes e Observações */}
      {selectedItemModal && (
        <div className="modal-backdrop fade-in" onClick={() => setSelectedItemModal(null)}>
          <div className="modal-content glass-panel slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItemModal.title}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedItemModal(null)}>×</button>
            </div>

            <div className="modal-body">
              <img src={assetUrl(selectedItemModal.image)} alt={selectedItemModal.title} className="modal-img" />
              <p className="modal-desc">{selectedItemModal.description}</p>
              <div className="modal-price">Preço unitário: <strong>R$ {selectedItemModal.price.toFixed(2)}</strong></div>

              <div className="modal-quantity-row">
                <label>Quantidade:</label>
                <div className="qty-controls">
                  <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}>-</button>
                  <span>{itemQuantity}</span>
                  <button onClick={() => setItemQuantity(itemQuantity + 1)}>+</button>
                </div>
              </div>

              <div className="modal-notes-field">
                <label htmlFor="notes">Observações do Prato (opcional):</label>
                <textarea
                  id="notes"
                  placeholder="Ex: sem cebola, ponto da carne, pouco gelo, vegetariano..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedItemModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddFromModal}>
                Adicionar (R$ {(selectedItemModal.price * itemQuantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
