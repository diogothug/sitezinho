import React, { useState } from 'react';
import { Sun, Send } from 'lucide-react';
import beachData from '../../data/json/beachRental.json';
import settings from '../../data/json/settings.json';
import { formatItemizedOrderMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

export default function BeachRentalRequest({ currentRoom, onShowToast }) {
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    beachData.items.forEach(item => { initial[item.id] = 0; });
    return initial;
  });

  const changeQty = (id, delta) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleRequest = () => {
    if (totalItems === 0) return;

    const items = beachData.items
      .filter(item => quantities[item.id] > 0)
      .map(item => ({ title: item.title, quantity: quantities[item.id] }));

    const message = formatItemizedOrderMessage({
      title: 'Aluguel de Praia',
      emoji: '🏖️',
      roomNumber: currentRoom,
      items
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast('Kit de praia solicitado! ☀️', 'success');
  };

  return (
    <div className="beach-rental-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Sun size={18} className="inline-icon" /> Aluguel de Praia</h2>
        <p className="section-subtitle">Monte seu kit de barraca, cooler e cadeira para o dia</p>
      </div>

      <div className="stepper-list">
        {beachData.items.map(item => (
          <div key={item.id} className="stepper-row glass-panel">
            <div>
              <div className="stepper-label">{item.title}</div>
              <div className="delivery-item-price">{item.priceLabel}</div>
            </div>
            <div className="qty-controls">
              <button onClick={() => changeQty(item.id, -1)}>-</button>
              <span>{quantities[item.id]}</span>
              <button onClick={() => changeQty(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary btn-full" onClick={handleRequest} disabled={totalItems === 0}>
        <Send size={16} /> Solicitar Kit de Praia
      </button>
    </div>
  );
}
