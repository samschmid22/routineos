import { useState } from 'react';
import { ChatPanel } from './ChatPanel';

const defaultIntro = [
  {
    role: 'assistant',
    content: 'I am Routine OS Coach. Ask me how to win today.',
  },
];

export function RoutineOsChat({
  todayContext,
  title = 'Routine OS Coach',
  subtitle,
  panelClassName = '',
  placeholder = "Ask Routine OS Coach about today's habits...",
  onClose,
  className = '',
}) {
  const [messages, setMessages] = useState(defaultIntro);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
    <ChatPanel
      title={title}
      subtitle={subtitle}
      messages={messages}
      loading={loading}
      inputValue={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      placeholder={placeholder}
      className={`${panelClassName} ${className}`.trim()}
      onClose={onClose}
      focusRef={focusRef}
    />
  );
}
