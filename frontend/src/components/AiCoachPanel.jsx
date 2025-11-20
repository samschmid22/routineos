import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="card ai-coach-panel">
    <div className="card-header">
      <div>
        <p className="eyebrow">Insights</p>
        <h2 className="section-title">AI ROUTINE COACH</h2>
      </div>
    </div>
    <p className="muted small">
      Collaborate with Routine OS Coach to interpret today’s systems, habits, and analytics.
    </p>
    <div className="ai-coach-chat">
      <RoutineOsChat todayContext={context} />
    </div>
  </div>
);

export default AiCoachPanel;
