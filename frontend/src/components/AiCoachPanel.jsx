import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="analytics-ai-wrapper">
    <RoutineOsChat
      todayContext={context}
      title="ROUTINE OS COACH"
      subtitle="ANALYTICS"
      panelClassName="analytics-card analytics-ai-card"
    />
  </div>
);

export default AiCoachPanel;
