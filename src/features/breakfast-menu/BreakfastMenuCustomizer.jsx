import React, { useState, useMemo } from 'react';
import { Coffee, Send } from 'lucide-react';
import menuData from '../../data/json/menu.json';
import settings from '../../data/json/settings.json';
import { formatBreakfastPreferenceMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

const SUBSTITUTION_OPTIONS = [
  'Sem glúten',
  'Sem lactose',
  'Vegano',
  'Trocar por fruta da estação',
  'Trocar por bolo caseiro',
  'Sem açúcar'
];

export default function BreakfastMenuCustomizer({ currentRoom, onShowToast }) {
  const breakfastItems = useMemo(
    () => menuData.items.filter(item => item.categoryId === 'cafe'),
    []
  );

  const [preferences, setPreferences] = useState(() => {
    const initial = {};
    breakfastItems.forEach(item => {
      initial[item.id] = { included: true, substitution: '' };
    });
    return initial;
  });

  const toggleIncluded = (itemId) => {
    setPreferences(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], included: !prev[itemId].included, substitution: '' }
    }));
  };

  const setSubstitution = (itemId, value) => {
    setPreferences(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], substitution: value }
    }));
  };

  const handleSend = () => {
    const removedItems = breakfastItems
      .filter(item => !preferences[item.id].included)
      .map(item => item.title);

    const substitutions = breakfastItems
      .filter(item => preferences[item.id].included && preferences[item.id].substitution)
      .map(item => ({ from: item.title, to: preferences[item.id].substitution }));

    const message = formatBreakfastPreferenceMessage({
      roomNumber: currentRoom,
      removedItems,
      substitutions
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast('Preferências do café enviadas à recepção!', 'success');
  };

  return (
    <div className="breakfast-menu-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Coffee size={18} className="inline-icon" /> Cardápio do Café</h2>
        <p className="section-subtitle">Desmarque o que não quiser e escolha uma substituição, se houver</p>
      </div>

      <div className="menu-custom-list">
        {breakfastItems.map(item => {
          const pref = preferences[item.id];
          return (
            <div key={item.id} className={`menu-custom-item glass-panel ${pref.included ? '' : 'excluded'}`}>
              <div className="menu-custom-top">
                <button
                  className={`check-box ${pref.included ? 'checked' : ''}`}
                  onClick={() => toggleIncluded(item.id)}
                  aria-label={`Incluir ${item.title}`}
                >
                  {pref.included ? '✓' : ''}
                </button>
                <div>
                  <div className="menu-custom-name">{item.title}</div>
                  <div className="menu-custom-desc">{item.description}</div>
                </div>
              </div>

              {pref.included && (
                <select
                  className="menu-custom-select"
                  value={pref.substitution}
                  onChange={e => setSubstitution(item.id, e.target.value)}
                >
                  <option value="">Manter como está</option>
                  {SUBSTITUTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-primary btn-full" onClick={handleSend}>
        <Send size={16} /> Enviar Preferências pro Café de Amanhã
      </button>
    </div>
  );
}
