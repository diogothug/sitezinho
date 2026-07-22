import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { formatGuestRequestMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';
import settings from '../../data/json/settings.json';

export default function QuickActionButtons({ currentRoom, onShowToast, t }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  const quickActions = [
    { id: 'toalha', icon: '🧻', label: 'Toalhas Extras', requestType: 'Troca/Solicitação de Toalhas' },
    { id: 'cama', icon: '🛏️', label: 'Roupa de Cama', requestType: 'Troca de Roupa de Cama' },
    { id: 'limpeza', icon: '🧹', label: 'Limpeza de Quarto', requestType: 'Limpeza do Quarto' },
    { id: 'ar', icon: '❄️', label: 'Ar-Condicionado', requestType: 'Suporte de Ar-Condicionado/Controle' },
    { id: 'manutencao', icon: '🔧', label: 'Manutenção Geral', requestType: 'Suporte Técnico no Quarto' },
    { id: 'recepcao', icon: '💬', label: 'Falar com Recepção', requestType: 'Atendimento Geral da Recepção' }
  ];

  const handleSendRequest = (action) => {
    const message = formatGuestRequestMessage({
      roomNumber: currentRoom,
      requestType: action.requestType,
      customDetails: customNotes
    });

    const waUrl = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waUrl, '_blank');
    if (onShowToast) onShowToast(`Solicitação de "${action.label}" enviada à recepção!`, 'success');
    setSelectedAction(null);
    setCustomNotes('');
  };

  return (
    <div className="quick-requests-section fade-in">
      <div className="section-header">
        <h2 className="section-title">{t('quickRequests')}</h2>
        <p className="section-subtitle">Precisa de algo no seu quarto? Solicite com 1 clique</p>
      </div>

      <div className="quick-actions-grid">
        {quickActions.map(action => (
          <button
            key={action.id}
            className="quick-action-card glass-panel"
            onClick={() => setSelectedAction(action)}
          >
            <span className="action-emoji">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Modal de Detalhes da Solicitação */}
      {selectedAction && (
        <div className="modal-backdrop fade-in" onClick={() => setSelectedAction(null)}>
          <div className="modal-content glass-panel slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAction.icon} {selectedAction.label}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedAction(null)}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Sua solicitação será enviada para o WhatsApp da Recepção identificada com o <strong>Quarto {currentRoom}</strong>.
              </p>

              <div className="modal-notes-field">
                <label htmlFor="reqNotes">Detalhes ou Observações Adicionais:</label>
                <textarea
                  id="reqNotes"
                  placeholder="Ex: quantidade necessária, melhor horário para limpeza..."
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedAction(null)}>Cancelar</button>
              <button className="btn-primary" onClick={() => handleSendRequest(selectedAction)}>
                <Send size={16} /> Enviar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
