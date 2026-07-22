import React, { useState } from 'react';
import { Wifi, Copy, Check, Eye, EyeOff } from 'lucide-react';
import settings from '../../data/json/settings.json';

export default function WifiQuickConnect({ onShowToast, t }) {
  const [copied, setCopied] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(settings.wifi.password);
    setCopied(true);
    if (onShowToast) onShowToast(t('wifiCopied'), 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="wifi-card glass-panel highlight-border">
      <div className="wifi-header">
        <div className="wifi-icon-wrapper">
          <Wifi size={22} className="wifi-icon" />
        </div>
        <div>
          <h3 className="wifi-title">{t('wifiTitle')}</h3>
          <p className="wifi-network">{settings.wifi.network} • <span className="wifi-speed">{settings.wifi.speed}</span></p>
        </div>
      </div>

      <div className="wifi-action-box">
        <div className="wifi-password-display">
          <span className="pass-label">Senha:</span>
          <span className="pass-value">
            {showPass ? settings.wifi.password : '••••••••••••'}
          </span>
          <button 
            className="btn-toggle-eye" 
            onClick={() => setShowPass(!showPass)}
            title={showPass ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button 
          className={`btn-copy-wifi ${copied ? 'copied' : ''}`}
          onClick={handleCopyPassword}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span>{copied ? t('wifiCopied') : t('wifiCopy')}</span>
        </button>
      </div>
    </div>
  );
}
