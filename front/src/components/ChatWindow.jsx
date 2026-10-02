import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Download,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  User,
  Activity,
  Smile,
  Cpu,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import FormattedMessage from './FormattedMessage';
import VoiceInput from './VoiceInput';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Componente ChatWindow
 * Janela principal de chat inteligente com histórico, voz, feedback, métricas e exportação.
 */
export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Olá! Sou o assistente de inteligência artificial da **AfesuTech / SCENA Cultural**.\n\nComo posso ajudar você hoje? Pergunte sobre nossos cursos, acervo, eventos ou use os atalhos rápidos abaixo!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'sistema',
      confidence: 1.0,
      feedback: null, // 'positive' | 'negative' | null
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([
    'Quais cursos de tecnologia estão disponíveis?',
    'Como funciona a metodologia prática dos projetos?',
    'Me recomende obras clássicas do acervo cultural',
  ]);

  const [metrics, setMetrics] = useState({
    totalMessages: 1,
    satisfactionRate: 100,
    activeMode: 'Base de Conhecimento + IA',
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll suave para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Atualizar contadores de métricas locais e da API
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics((prev) => ({
          ...prev,
          satisfactionRate: data.satisfaction_rate_percent ?? prev.satisfactionRate,
        }));
      }
    } catch (error) {
      console.warn('Não foi possível sincronizar métricas com a API:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Envio de mensagem para a API
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      const botMsg = {
        id: data.message_id || `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Desculpe, não consegui obter uma resposta no momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'LLM / RAG',
        confidence: data.confidence,
        suggestedActions: data.suggested_actions || [],
        feedback: null,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.suggested_actions && data.suggested_actions.length > 0) {
        setSuggestedActions(data.suggested_actions);
      }

      // Atualiza métricas locais
      setMetrics((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 2,
        activeMode: data.source === 'base_conhecimento' ? 'RAG Base de Conhecimento' : 'LLM Ativa',
      }));

      // Sincroniza métricas gerais
      fetchMetrics();
    } catch (error) {
      console.error('Falha ao comunicar com o chatbot:', error);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ **Desculpe, ocorreu um erro temporário na comunicação.** Por favor, certifique-se de que o backend FastAPI está ativo e tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'erro',
        feedback: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Envio de feedback (Like / Dislike)
  const handleFeedback = async (messageId, isPositive) => {
    // Atualização otimista na UI
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: isPositive ? 'positive' : 'negative' }
          : msg
      )
    );

    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          is_positive: isPositive,
        }),
      });
      fetchMetrics();
    } catch (error) {
      console.error('Erro ao registrar feedback:', error);
    }
  };

  // Manipular transcrição de áudio vinda do VoiceInput
  const handleVoiceTranscript = (text) => {
    if (text) {
      setInputMessage(text);
      handleSendMessage(text);
    }
  };

  // Exportar histórico de atendimento para .txt
  const handleExportHistory = () => {
    const header = `=====================================================\n` +
                   `LOG DE ATENDIMENTO INTELIGENTE - AFESUTECH / SCENA\n` +
                   `Data de Exportação: ${new Date().toLocaleString()}\n` +
                   `Total de Mensagens: ${messages.length}\n` +
                   `=====================================================\n\n`;

    const body = messages
      .map((msg) => {
        const role = msg.sender === 'user' ? '👤 USUÁRIO' : '🤖 IA SUPORTE';
        const meta = msg.source ? ` [Origem: ${msg.source}]` : '';
        return `[${msg.timestamp}] ${role}${meta}:\n${msg.text}\n`;
      })
      .join('\n-----------------------------------------------------\n\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atendimento_chatbot_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-window-wrapper">
      {/* 1. Barra de Métricas no Topo */}
      <header className="chat-metrics-bar">
        <div className="metric-item">
          <Activity size={16} className="metric-icon" />
          <span className="metric-label">Mensagens:</span>
          <span className="metric-value">{metrics.totalMessages}</span>
        </div>

        <div className="metric-item">
          <Smile size={16} className="metric-icon text-success" />
          <span className="metric-label">Satisfação:</span>
          <span className="metric-value">{metrics.satisfactionRate}%</span>
        </div>

        <div className="metric-item mode-item">
          {metrics.activeMode.includes('RAG') ? (
            <Database size={16} className="metric-icon text-accent" />
          ) : (
            <Cpu size={16} className="metric-icon text-primary" />
          )}
          <span className="metric-label">Modo:</span>
          <span className="metric-value">{metrics.activeMode}</span>
        </div>

        <button
          className="btn-export-chat"
          onClick={handleExportHistory}
          title="Exportar histórico de atendimento em .txt"
        >
          <Download size={15} />
          <span>Exportar Log</span>
        </button>
      </header>

      {/* 2. Área de Mensagens com Scroll */}
      <main className="chat-messages-area">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`chat-bubble-container ${isUser ? 'bubble-user' : 'bubble-bot'}`}
            >
              <div className="chat-avatar">
                {isUser ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div className="chat-bubble-content">
                <div className="chat-bubble-header">
                  <span className="chat-sender-name">
                    {isUser ? 'Você' : 'Assistente IA'}
                  </span>
                  <span className="chat-timestamp">{msg.timestamp}</span>
                </div>

                <div className="chat-message-text">
                  <FormattedMessage content={msg.text} />
                </div>

                {/* Ações e Tags na Resposta da IA */}
                {!isUser && msg.sender === 'bot' && msg.id !== 'welcome-msg' && (
                  <div className="chat-bubble-footer">
                    {msg.source && (
                      <span className="source-tag">
                        {msg.source === 'base_conhecimento' ? '📚 Base RAG' : '⚡ Modelo IA'}
                      </span>
                    )}

                    <div className="feedback-buttons">
                      <button
                        className={`btn-feedback ${msg.feedback === 'positive' ? 'active-like' : ''}`}
                        onClick={() => handleFeedback(msg.id, true)}
                        title="Avaliar como útil (Like)"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className={`btn-feedback ${msg.feedback === 'negative' ? 'active-dislike' : ''}`}
                        onClick={() => handleFeedback(msg.id, false)}
                        title="Avaliar como não útil (Dislike)"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Indicador de Carregamento da IA */}
        {isLoading && (
          <div className="chat-bubble-container bubble-bot">
            <div className="chat-avatar">
              <Bot size={18} />
            </div>
            <div className="chat-bubble-content loading-bubble">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <span className="typing-label">IA digitando resposta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 3. Chips de Perguntas Frequentes / Ações Sugeridas */}
      {suggestedActions.length > 0 && (
        <div className="chat-suggestions-container">
          <span className="suggestions-title">
            <Sparkles size={14} /> Sugestões rápidas:
          </span>
          <div className="suggestions-scroll">
            {suggestedActions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Campo de Entrada com Voz e Envio */}
      <form
        className="chat-input-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          disabled={isLoading}
        />

        <input
          ref={inputRef}
          type="text"
          className="chat-text-input"
          placeholder="Digite sua dúvida ou utilize o microfone para falar..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          className="chat-send-btn"
          disabled={isLoading || !inputMessage.trim()}
          title="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
