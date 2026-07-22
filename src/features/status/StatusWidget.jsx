import React from 'react';
import { Coffee, Waves, Utensils, VolumeX, PhoneCall } from 'lucide-react';
import { getPousadaLiveStatus } from '../../shared/utils/statusEngine';
import settings from '../../data/json/settings.json';

export default function StatusWidget({ t }) {
  const status = getPousadaLiveStatus(settings.schedules);

  const scheduleIcons = {
    breakfast: <Coffee size={18} />,
    pool: <Waves size={18} />,
    kitchen: <Utensils size={18} />,
    silence: <VolumeX size={18} />,
    reception: <PhoneCall size={18} />
  };

  return (
    <div className="status-widget glass-panel">
      <h3 className="widget-title">{t('statusTitle')}</h3>

      <div className="status-grid">
        {Object.entries(status).map(([key, item]) => (
          <div key={key} className="status-item-card">
            <div className="status-item-header">
              <span className="status-item-icon">{scheduleIcons[key] || <Coffee size={18} />}</span>
              <span className="status-item-title">{item.title}</span>
            </div>

            <div className="status-item-body">
              <span className={`status-badge ${item.badgeClass}`}>
                {item.isOpen ? t('open') : t('closed')}
              </span>
              <span className="status-time-detail">{item.statusText}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
