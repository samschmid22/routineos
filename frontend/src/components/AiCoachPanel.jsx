// AiCoachPanel: placeholder chat UI for future AI assistant.
const AiCoachPanel = () => (
  <div className="card ai-coach-panel">
    <div className="card-header">
      <div>
        <p className="eyebrow">Insights</p>
        <h2 className="section-title">AI COACH (COMING SOON)</h2>
      </div>
    </div>
    <p className="muted small">
      Visualize conversations with your future routine coach. Ask about habits, trends, and time optimization.
    </p>
    <div className="coach-messages" role="log" aria-live="polite">
      <div className="coach-message">
        <span className="coach-label">You</span>
        <p>“Which system did I complete the most this week?”</p>
      </div>
      <div className="coach-message">
        <span className="coach-label">Coach</span>
        <p>“Your Morning Routine is at 85% completion. Body system follows at 72%.”</p>
      </div>
      <div className="coach-message">
        <span className="coach-label">You</span>
        <p>“Where am I slipping?”</p>
      </div>
      <div className="coach-message">
        <span className="coach-label">Coach</span>
        <p>“Career Growth dipped to 40%. Try focusing on it tomorrow morning.”</p>
      </div>
    </div>
    <div className="coach-input-row" aria-disabled="true" title="Connect API key to enable.">
      <input className="input" placeholder="Ask anything about your routines" disabled />
      <button type="button" className="btn-primary" disabled>
        Send
      </button>
    </div>
    <div className="coach-footer muted small">
      AI routines assistant coming soon—connect your data to unlock personalized insights.
    </div>
  </div>
);

export default AiCoachPanel;
