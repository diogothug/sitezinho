import React, { useState } from 'react';
import { Home, Edit3, Check, Globe } from 'lucide-react';
import settings from '../../data/json/settings.json';

export default function WelcomeCard({ currentRoom, onRoomChange, currentLang, onLangChange, t }) {
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [tempRoom, setTempRoom] = useState(currentRoom);

  const handleSaveRoom = () => {
    if (tempRoom.trim()) {
      onRoomChange(tempRoom.trim().padStart(2, '0'));
      setIsEditingRoom(false);
    }
  };

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

      <h1 className="welcome-title">{t('welcome')}</h1>
      <p className="welcome-subtitle">{settings.tagline}</p>

      <div className="room-indicator-bar">
        <span className="room-label">{t('room')}:</span>
        {isEditingRoom ? (
          <div className="room-edit-group">
            <input
              type="text"
              className="room-input"
              value={tempRoom}
              onChange={(e) => setTempRoom(e.target.value)}
              placeholder="Ex: 05"
              autoFocus
            />
            <button className="btn-icon btn-save" onClick={handleSaveRoom}>
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="room-display-group" onClick={() => setIsEditingRoom(true)}>
            <span className="room-number">Quarto {currentRoom}</span>
            <button className="btn-edit-room" title="Alterar quarto">
              <Edit3 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
