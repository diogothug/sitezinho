import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import deliveryData from '../../data/json/roomDelivery.json';
import settings from '../../data/json/settings.json';
import { formatItemizedOrderMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

export default function RoomDeliveryCatalog({ currentRoom, onShowToast }) {
  const [activeCategory, setActiveCategory] = useState(deliveryData.categories[0].id);
  const [cart, setCart] = useState([]);

  const itemsInCategory = deliveryData.items.filter(i => i.categoryId === activeCategory);

  const addItem = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const totalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    const message = formatItemizedOrderMessage({
      title: 'Entrega no Quarto',
      emoji: '🛎️',
      roomNumber: currentRoom,
      items: cart
    });
    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast('Pedido de entrega enviado à recepção!', 'success');
    setCart([]);
  };

  return (
    <div className="room-delivery-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Bell size={18} className="inline-icon" /> Entrega no Quarto</h2>
        <p className="section-subtitle">Escolha um item e a gente leva até você</p>
      </div>

      <div className="category-tabs-scroll">
        {deliveryData.categories.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="delivery-item-list">
        {itemsInCategory.map(item => (
          <div key={item.id} className="delivery-row glass-panel">
            <div>
              <div className="delivery-item-name">{item.title}</div>
              <div className="delivery-item-price">R$ {item.price.toFixed(2)}</div>
            </div>
            <button className="btn-secondary btn-pedir" onClick={() => addItem(item)}>Pedir</button>
          </div>
        ))}
      </div>

      {totalCount > 0 && (
        <div className="delivery-cart-bar">
          <span>{totalCount} ite{totalCount === 1 ? 'm' : 'ns'} no pedido</span>
          <button className="btn-primary" onClick={handleSendOrder}>
            <Send size={16} /> Enviar Pedido
          </button>
        </div>
      )}
    </div>
  );
}
