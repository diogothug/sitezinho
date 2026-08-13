import React, { useState } from 'react';
import { Home, Edit3, Check, Globe, Calendar, Sparkles } from 'lucide-react';
import settings from '../../data/json/settings.json';
import { getGreetingByTime } from '../../shared/utils/guestSession';

export default function WelcomeCard({ 
  currentRoom, 
  onRoomChange, 
  currentLang, 
  onLangChange, 
  guestSession,
  t 
}) {
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [tempRoom, setTempRoom] = useState(currentRoom);

  const handleSaveRoom = () => {
    if (tempRoom.trim()) {
      onRoomChange(tempRoom.trim());
      setIsEditingRoom(false);
    }
  };

  const guestName = guestSession?.guestName && guestSession.guestName !== 'Hóspede' ? guestSession.guestName : '';
  const greeting = getGreetingByTime(new Date(), guestName);

  return (
    <div className="welcome-card glass-panel fade-in">
      <div className="welcome-header">
        <div className="welcome-badge">
          <Home size={14} />
          <span>{settings.pousadaName}</span>
        </div>

        <div className="lang-selector">
          <Globe size={14} className="text-muted" />
          <select 
            value={currentLang} 
            onChange={(e) => onLangChange(e.target.value)}
            className="lang-select"
          >
            <option value="pt">🇧🇷 PT</option>
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇪🇸 ES</option>
          </select>
        </div>
      </div>

      <div className="welcome-body">
        <h1 className="welcome-title">{greeting}!</h1>
        <p className="welcome-subtitle">{guestSession?.welcomeNote || settings.tagline}</p>
      </div>

      {/* Barra de identificação do Quarto e Estadia */}
      <div className="guest-stay-bar">
        <div className="room-indicator-bar">
          <span className="room-label">{t('room')}:</span>
          {isEditingRoom ? (
            <div className="room-edit-group">
              <input
                type="text"
                className="room-input"
                value={tempRoom}
                onChange={(e) => setTempRoom(e.target.value)}
                placeholder="Ex: Quarto 05 ou Chalé 01"
                autoFocus
              />
              <button className="btn-icon btn-save" onClick={handleSaveRoom}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="room-display-group" onClick={() => setIsEditingRoom(true)}>
              <span className="room-number">{currentRoom.startsWith('Quarto') || currentRoom.startsWith('Chalé') ? currentRoom : `Quarto ${currentRoom}`}</span>
              <button className="btn-edit-room" title="Alterar acomodação">
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>

        {guestSession?.checkOut && guestSession.checkOut !== 'Em 4 dias' && (
          <div className="stay-dates-tag">
            <Calendar size={13} className="text-gold" />
            <span>Até {guestSession.checkOut}</span>
          </div>
        )}
      </div>
    </div>
  );
}
