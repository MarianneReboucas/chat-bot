import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

/**
 * Componente VoiceInput
 * Reconhecimento de Voz nativo (Speech-to-Text) com suporte a Web Speech API
 * Otimizado para desktop e smartphones (Android e iOS/Safari).
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Checagem de suporte do navegador à Web Speech API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      // Limpeza de recursos ao desmontar o componente
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignora erro no cleanup
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage('');

    // Validação de contexto de segurança para microfone no celular
    const isSecureContext =
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      setErrorMessage(
        'O acesso ao microfone no celular exige conexão segura (HTTPS ou túnel Localtunnel).'
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Reconhecimento de voz não suportado neste navegador. Use o Google Chrome ou Safari.'
      );
      return;
    }

    try {
      // Inicialização limpa a cada clique para evitar travamento de instâncias no mobile
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onTranscript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setErrorMessage(
              'Permissão de microfone negada. Toque no cadeado da barra de endereço e libere o microfone.'
            );
            break;
          case 'no-speech':
            setErrorMessage('Nenhuma voz detectada. Tente falar novamente.');
            break;
          case 'network':
            setErrorMessage(
              'Erro de conexão de rede no serviço de voz do navegador.'
            );
            break;
          default:
            setErrorMessage(`Erro no reconhecimento: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setErrorMessage('Não foi possível iniciar o microfone. Tente novamente.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignora erro se já estiver parado
      }
    }
    setIsListening(false);
  };

  const handleToggleVoice = () => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        className="voice-btn"
        disabled
        title="Reconhecimento de voz não suportado neste navegador"
        style={{ opacity: 0.4, cursor: 'not-allowed' }}
      >
        <MicOff size={20} />
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={handleToggleVoice}
        disabled={disabled}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Parar gravação' : 'Falar por voz (pt-BR)'}
        aria-label={isListening ? 'Parar gravação' : 'Falar por voz'}
      >
        {isListening ? <Mic size={20} color="var(--scena-primary)" /> : <Mic size={20} />}
      </button>

      {/* Indicador Flutuante de Gravação Ativa */}
      {isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-main)',
            border: '1px solid var(--scena-primary)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 100,
            animation: 'slide-in 0.2s ease-out'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--scena-primary)',
              animation: 'pulse-dot 1s infinite'
            }}
          />
          🎙️ Ouvindo... Fale o que deseja buscar ou descobrir!
        </div>
      )}

      {/* Alerta Flutuante de Erro */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            right: 0,
            background: 'var(--bg-surface-elevated)',
            color: 'var(--scena-primary)',
            border: '1px solid var(--scena-primary)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '0.75rem',
            width: '240px',
            lineHeight: 1.3,
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              marginLeft: 'auto',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
