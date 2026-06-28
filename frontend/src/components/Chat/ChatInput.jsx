import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR'; // Set to Portuguese, or you could make it dynamic

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        // When using interim results, it's better to manage the state carefully
        // Here we just append the final results to the existing text
        if (event.results[event.results.length - 1].isFinal) {
           setText(prev => {
             const newText = prev ? prev + ' ' + currentTranscript : currentTranscript;
             return newText.trim();
           });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Microphone start error:", e);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
    
    if (isListening) {
      recognitionRef.current?.stop();
    }
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-area">
      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          disabled={!isSupported}
          title={!isSupported ? "Navegador não suporta gravação de voz" : (isListening ? "Parar gravação" : "Falar mensagem")}
          aria-label="Microfone"
          style={{ opacity: !isSupported ? 0.5 : 1, cursor: !isSupported ? 'not-allowed' : 'pointer' }}
        >
          🎤
        </button>
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          id="chat-input-field"
          aria-label="Campo de mensagem"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!text.trim() || isLoading}
          id="chat-send-btn"
          aria-label="Enviar mensagem"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}
