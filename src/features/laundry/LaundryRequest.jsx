import React, { useState } from 'react';
import { Shirt, Send } from 'lucide-react';
import settings from '../../data/json/settings.json';
import { formatItemizedOrderMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

const LAUNDRY_CATEGORIES = [
  { id: 'l1', title: 'Camisas / Camisetas' },
  { id: 'l2', title: 'Calças / Shorts' },
  { id: 'l3', title: 'Vestidos / Saídas de Praia' },
  { id: 'l4', title: 'Roupa Íntima' },
  { id: 'l5', title: 'Toalhas' }
];

export default function LaundryRequest({ currentRoom, onShowToast }) {
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    LAUNDRY_CATEGORIES.forEach(c => { initial[c.id] = 0; });
    return initial;
  });
  const [notes, setNotes] = useState('');
  const [requested, setRequested] = useState(false);

  const changeQty = (id, delta) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
  };

  const totalPieces = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleRequest = () => {
    const items = LAUNDRY_CATEGORIES
      .filter(c => quantities[c.id] > 0)
      .map(c => ({ title: c.title, quantity: quantities[c.id] }));

    const message = formatItemizedOrderMessage({
      title: 'Solicitação de Lavanderia',
      emoji: '👕',
      roomNumber: currentRoom,
      items: items.length > 0 ? items : [{ title: 'Retirada geral', quantity: 1 }],
      generalNotes: notes
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast('Solicitação de lavanderia enviada!', 'success');
    setRequested(true);
  };

  return (
    <div className="laundry-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Shirt size={18} className="inline-icon" /> Lavanderia</h2>
        <p className="section-subtitle">Entrega até 9h, roupa pronta no mesmo dia à noite</p>
      </div>

      <div className="stepper-list">
        {LAUNDRY_CATEGORIES.map(cat => (
          <div key={cat.id} className="stepper-row glass-panel">
            <span className="stepper-label">{cat.title}</span>
            <div className="qty-controls">
              <button onClick={() => changeQty(cat.id, -1)}>-</button>
              <span>{quantities[cat.id]}</span>
              <button onClick={() => changeQty(cat.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-notes-field">
        <label htmlFor="laundryNotes">Observações (horário preferido, peças delicadas...):</label>
        <textarea
          id="laundryNotes"
          placeholder="Ex: preciso de volta até amanhã cedo"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <button className="btn-primary btn-full" onClick={handleRequest}>
        <Send size={16} /> {totalPieces > 0 ? `Solicitar Retirada (${totalPieces} peças)` : 'Solicitar Retirada'}
      </button>

      {requested && <p className="confirm-note">🧺 Retirada solicitada — alguém vem buscar sua roupa em breve.</p>}
    </div>
  );
}
