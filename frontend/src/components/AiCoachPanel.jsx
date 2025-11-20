import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="card analytics-ai-card">
    <div className="analytics-ai-header">
      <p className="eyebrow">Analytics</p>
      <h2 className="section-title">ROUTINE OS COACH</h2>
    </div>
    <RoutineOsChat
      todayContext={context}
      messagesClassName="analytics-ai-messages"
      inputClassName="analytics-ai-input-row"
      variant="analytics"
    />
  </div>
);

export default AiCoachPanel;
