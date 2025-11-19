// AiCoachPanel: placeholder chat UI for future AI assistant.
const AiCoachPanel = () => (
  <div className="card ai-coach-panel">
    <div className="card-header">
      <div>
        <p className="eyebrow">Insights</p>
        <h2 className="section-title">AI COACH (COMING SOON)</h2>
      </div>
    </div>
    <div className="coach-messages" role="log" aria-live="polite">
      <div className="coach-message muted small">
        This will connect to an AI assistant to review your routines, suggest improvements, and answer questions.
      </div>
    </div>
    <div className="coach-input-row" aria-disabled="true" title="Connect API key to enable.">
      <input className="input" placeholder="Ask anything about your routines" disabled />
      <button type="button" className="btn-primary" disabled>
        Send
      </button>
    </div>
  </div>
);

export default AiCoachPanel;
