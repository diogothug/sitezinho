import React, { useState } from 'react';
import { Compass, Send } from 'lucide-react';
import toursData from '../../data/json/tours.json';
import settings from '../../data/json/settings.json';
import { formatGuestRequestMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

export default function ToursSection({ currentRoom, onShowToast }) {
  const [filter, setFilter] = useState('gratis');

  const filteredTours = toursData.tours.filter(t => filter === 'gratis' ? !t.paid : t.paid);

  const handleInterest = (tour) => {
    const requestType = tour.paid
      ? `Reserva de Passeio Pago: ${tour.title}`
      : `Interesse em Passeio Grátis: ${tour.title}`;

    const message = formatGuestRequestMessage({
      roomNumber: currentRoom,
      requestType,
      customDetails: tour.paid ? `Valor de referência: R$ ${tour.price.toFixed(2)} / pessoa` : ''
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast(`Interesse em "${tour.title}" enviado à recepção!`, 'success');
  };

  return (
    <div className="tours-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Compass size={18} className="inline-icon" /> Passeios</h2>
        <p className="section-subtitle">Dicas da casa e passeios com parceiros locais</p>
      </div>

      <div className="category-tabs-scroll">
        <button className={`tab-btn ${filter === 'gratis' ? 'active' : ''}`} onClick={() => setFilter('gratis')}>
          🌿 Grátis
        </button>
        <button className={`tab-btn ${filter === 'pagos' ? 'active' : ''}`} onClick={() => setFilter('pagos')}>
          🚤 Pagos
        </button>
      </div>

      <div className="tours-grid">
        {filteredTours.map(tour => (
          <div key={tour.id} className="tour-card glass-panel">
            <h4 className="tour-title">{tour.title}</h4>
            <p className="tour-desc">{tour.description}</p>
            <div className="tour-meta-row">
              <span className="tour-duration">⏱ {tour.duration}</span>
              {tour.paid && <span className="tour-price">R$ {tour.price.toFixed(2)} / pessoa</span>}
            </div>
            <button className="btn-secondary btn-full" onClick={() => handleInterest(tour)}>
              <Send size={14} /> {tour.paid ? 'Quero Reservar' : 'Tenho Interesse'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
