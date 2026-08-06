import React, { useState } from 'react';
import { Waves, Send } from 'lucide-react';
import divingData from '../../data/json/divingRental.json';
import settings from '../../data/json/settings.json';
import { formatItemizedOrderMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

export default function DivingRentalRequest({ currentRoom, onShowToast }) {
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    divingData.items.forEach(item => { initial[item.id] = 0; });
    return initial;
  });

  const changeQty = (id, delta) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleRequest = () => {
    if (totalItems === 0) return;

    const items = divingData.items
      .filter(item => quantities[item.id] > 0)
      .map(item => ({ title: item.title, quantity: quantities[item.id] }));

    const message = formatItemizedOrderMessage({
      title: 'Aluguel de Mergulho e Pesca Sub',
      emoji: '🤿',
      roomNumber: currentRoom,
      items,
      generalNotes: 'Uso por conta e risco do hóspede, respeitando as normas locais de pesca submarina.'
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast('Equipamento de mergulho solicitado!', 'success');
  };

  return (
    <div className="diving-rental-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Waves size={18} className="inline-icon" /> Mergulho & Pesca Sub</h2>
        <p className="section-subtitle">Monte seu kit de mergulho ou pesca submarina</p>
      </div>

      <div className="info-box">
        Equipamento sujeito à disponibilidade. Recomendamos mergulhar e pescar sempre acompanhado e respeitando as áreas e períodos permitidos na região.
      </div>

      <div className="stepper-list">
        {divingData.items.map(item => (
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
        <Send size={16} /> Solicitar Equipamento
      </button>
    </div>
  );
}
