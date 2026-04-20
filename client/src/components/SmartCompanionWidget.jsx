import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SmartCompanionWidget.css';

const SmartCompanionWidget = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="smart-companion-widget glass-panel floating" 
      onClick={() => navigate('/companion')}
      title="Ask Smart Companion"
    >
      <div className="robot-icon">🤖</div>
      <div className="tooltip">Need Help?</div>
    </div>
  );
};

export default SmartCompanionWidget;
