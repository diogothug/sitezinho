import React, { useState } from 'react';
import { ChevronDown, Clock, VolumeX, Waves, Zap, Heart, Key, Info } from 'lucide-react';
import rulesData from '../../data/json/rules.json';

export default function RulesAccordion({ t }) {
  const [openRuleId, setOpenRuleId] = useState(null);

  const ruleIcons = {
    Clock: <Clock size={20} />,
    VolumeX: <VolumeX size={20} />,
    Waves: <Waves size={20} />,
    Zap: <Zap size={20} />,
    Heart: <Heart size={20} />,
    Key: <Key size={20} />
  };

  const toggleRule = (id) => {
    setOpenRuleId(openRuleId === id ? null : id);
  };

  return (
    <div className="rules-section fade-in">
      <div className="section-header">
        <h2 className="section-title">Regras & Informações Úteis</h2>
        <p className="section-subtitle">Tudo para tornar sua estadia confortável, harmoniosa e segura</p>
      </div>

      <div className="rules-accordion-list">
        {rulesData.rules.map(rule => {
          const isOpen = openRuleId === rule.id;
          return (
            <div key={rule.id} className={`rule-accordion-card glass-panel ${isOpen ? 'expanded' : ''}`}>
              <div className="rule-accordion-header" onClick={() => toggleRule(rule.id)}>
                <div className="rule-header-left">
                  <span className="rule-icon-box">
                    {ruleIcons[rule.icon] || <Info size={20} />}
                  </span>
                  <div>
                    <h4 className="rule-title">{rule.title}</h4>
                    <p className="rule-summary">{rule.summary}</p>
                  </div>
                </div>

                <button className={`btn-chevron ${isOpen ? 'rotate' : ''}`}>
                  <ChevronDown size={20} />
                </button>
              </div>

              {isOpen && (
                <div className="rule-accordion-body slide-down">
                  <p className="rule-details">{rule.details}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
