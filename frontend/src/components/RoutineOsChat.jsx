import { useEffect, useRef, useState } from 'react';

const defaultIntro = [
  {
    role: 'assistant',
    content: 'I am Routine OS Coach. Ask me how to win today.',
  },
];

export function RoutineOsChat({
  todayContext,
  wrapperClassName = '',
  messagesClassName = '',
  inputClassName = '',
}) {
  const [messages, setMessages] = useState(defaultIntro);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const endNode = messagesEndRef.current;
    if (endNode?.parentElement) {
      const container = endNode.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/routineos-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: todayContext }),
      });
      const data = await response.json();
      const reply = data.reply || 'Hmm, I could not generate a response right now.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I hit a snag reaching the AI service. Try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`routineos-chat ${wrapperClassName}`.trim()}>
      <div className={`chat-messages ${messagesClassName}`.trim()}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className={`chat-input-row ${inputClassName}`.trim()} onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Routine OS Coach about today's habits..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
