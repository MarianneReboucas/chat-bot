import React from 'react';
import { Bot, CheckCircle, XCircle, RefreshCw, Sparkles, GraduationCap } from 'lucide-react';

/**
 * Componente Header
 * Cabeçalho institucional com marca Afesu Veleiros / SENAI-SP / SCENA,
 * identificação do curso de IA e monitoramento de conexão em tempo real da API.
 *
 * @param {Object} props
 * @param {boolean} props.isApiOnline - Status da conexão com o backend FastAPI
 * @param {boolean} props.isChecking - Flag indicando se a verificação de saúde está em andamento
 * @param {Function} props.onCheckHealth - Função para forçar re-checagem do status da API
 */
export default function Header({ isApiOnline = true, isChecking = false, onCheckHealth }) {
  return (
    <header className="afesu-header glass-card">
      <div className="header-brand-container">
        <div className="brand-icon-badge">
          <GraduationCap size={22} className="brand-cap-icon" />
        </div>
        <div className="header-brand-info">
          <div className="brand-main-title">
            <span className="brand-highlight">Afesu Veleiros</span>
            <span className="brand-divider">/</span>
            <span className="brand-partner">SENAI-SP</span>
          </div>
          <div className="brand-subtitle-line">
            <span className="project-badge">AfesuTech</span>
            <span className="course-name">Desenvolvimento de IA Generativa & Chatbots com Voz</span>
          </div>
        </div>
      </div>

      <div className="header-status-container">
        <div 
          className={`api-status-pill ${isApiOnline ? 'status-online' : 'status-offline'}`}
          title={isApiOnline ? 'Backend FastAPI conectado e operacional' : 'Backend FastAPI desconectado ou indisponível'}
        >
          <span className="status-indicator-dot"></span>
          <span className="status-text">
            {isChecking ? 'Verificando...' : isApiOnline ? 'API Conectada' : 'API Offline'}
          </span>
          {isApiOnline ? (
            <CheckCircle size={14} className="status-badge-icon" />
          ) : (
            <XCircle size={14} className="status-badge-icon" />
          )}
        </div>

        {onCheckHealth && (
          <button
            className="btn-refresh-status"
            onClick={onCheckHealth}
            disabled={isChecking}
            title="Atualizar status da conexão"
          >
            <RefreshCw size={14} className={isChecking ? 'spinning' : ''} />
          </button>
        )}
      </div>
    </header>
  );
}
