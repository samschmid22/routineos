import { useEffect, useRef } from 'react';

export function ChatPanel({
  title,
  subtitle,
  messages = [],
  loading = false,
  inputValue = '',
  onInputChange,
  onSubmit,
  placeholder,
  className = '',
  onClose,
}) {
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`chat-panel ${className}`.trim()}>
      <div className="chat-panel-header">
        <div className="chat-panel-header-text">
          {subtitle && <p className="eyebrow chat-panel-subtitle">{subtitle}</p>}
          <h2 className="section-title chat-panel-title">{title}</h2>
        </div>
        {onClose && (
          <button type="button" className="chat-panel-close" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        )}
      </div>
      <div className="chat-panel-messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant">Thinking...</div>}
      </div>
      <form className="chat-panel-input-row" onSubmit={onSubmit}>
        <input
          value={inputValue}
          onChange={(event) => onInputChange?.(event.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
