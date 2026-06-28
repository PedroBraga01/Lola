import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const originalTextRef = useRef('');

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR'; // Set to Portuguese

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        // Iterate over ALL results from this session (from 0 to length)
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        // Combine the text that was already in the box BEFORE clicking mic, with the new spoken text
        setText(prev => {
          const original = originalTextRef.current;
          const newText = original ? original + ' ' + currentTranscript : currentTranscript;
          // We don't use prev here to avoid stacking interim results over themselves
          return newText.trim();
        });
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
        originalTextRef.current = text; // Save what's already typed before we start speaking
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
