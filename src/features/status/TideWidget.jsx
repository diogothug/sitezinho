import React, { useState, useEffect } from 'react';
import { Waves, Compass, Moon, Sun, ArrowUpRight, ArrowDownRight, Sparkles, Clock } from 'lucide-react';
import { getMorereTideInfo } from '../../shared/utils/tideEngine';

export default function TideWidget({ t }) {
  const [tideData, setTideData] = useState(() => getMorereTideInfo());

  useEffect(() => {
    // Atualiza a cada 60 segundos
    const timer = setInterval(() => {
      setTideData(getMorereTideInfo());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { currentLevel, trend, lowTideTime, highTideTime, naturalPoolsIdeal, poolsWindow, moon, isSpringTide } = tideData;

  return (
    <div className="tide-widget glass-panel fade-in">
      <div className="tide-header">
        <div className="tide-title-group">
          <div className="tide-icon-bubble">
            <Waves size={20} className="text-cyan" />
          </div>
          <div>
            <h3 className="tide-title">{t('tideTitle')}</h3>
            <p className="tide-sub">Praia de Moreré • Boipeba - BA</p>
          </div>
        </div>

        <div className="moon-badge-compact" title={`Fase da Lua: ${moon.name} (${moon.illumination}% iluminada)`}>
          <span className="moon-icon">{moon.icon}</span>
          <span className="moon-text">{moon.name}</span>
        </div>
      </div>

      <div className="tide-metrics-grid">
        {/* Nível Atual da Maré */}
        <div className="tide-card-item">
          <div className="tide-card-label">Maré Atual Estimada</div>
          <div className="tide-card-value">
            <span className="tide-level-number">{currentLevel}m</span>
            <span className={`tide-trend-pill ${trend}`}>
              {trend === 'subindo' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend === 'subindo' ? 'Enchendo' : 'Vazando'}
            </span>
          </div>
        </div>

        {/* Baixa-Mar */}
        <div className="tide-card-item">
          <div className="tide-card-label">{t('tideLow')} (Mínima)</div>
          <div className="tide-card-time">
            <Clock size={15} className="text-amber" />
            <span>{lowTideTime}h</span>
          </div>
        </div>

        {/* Preamar */}
        <div className="tide-card-item">
          <div className="tide-card-label">{t('tideHigh')} (Máxima)</div>
          <div className="tide-card-time">
            <Clock size={15} className="text-cyan" />
            <span>{highTideTime}h</span>
          </div>
        </div>
      </div>

      {/* Destaque Piscinas Naturais */}
      <div className={`pools-highlight-box ${naturalPoolsIdeal ? 'ideal' : 'upcoming'}`}>
        <div className="pools-header">
          <Sparkles size={18} className="text-gold" />
          <strong className="pools-title">{t('naturalPools')}</strong>
          {naturalPoolsIdeal && <span className="pools-status-badge">Agora Ideal! 🤿</span>}
        </div>
        <p className="pools-desc">
          {t('naturalPoolsBest')}: <strong>{poolsWindow}</strong>
          {isSpringTide && <span className="spring-tag"> • {t('springTide')}</span>}
        </p>
      </div>
    </div>
  );
}
