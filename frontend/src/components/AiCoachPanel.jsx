import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="card analytics-ai-card">
    <div className="card-header">
      <div>
        <p className="eyebrow">Analytics</p>
        <h2 className="section-title">Routine OS Coach</h2>
      </div>
    </div>
    <div className="ai-coach-chat">
      <RoutineOsChat todayContext={context} />
    </div>
  </div>
);

export default AiCoachPanel;
