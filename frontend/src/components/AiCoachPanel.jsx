import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="card analytics-ai-card">
    <div className="analytics-card-header">
      <span className="card-subtitle">ANALYTICS</span>
      <h3 className="card-title">ROUTINE OS COACH</h3>
    </div>
    <div className="analytics-ai-body">
      <RoutineOsChat
        todayContext={context}
        messagesClassName="analytics-ai-messages"
        inputClassName="analytics-ai-input-row"
      />
    </div>
  </div>
);

export default AiCoachPanel;
