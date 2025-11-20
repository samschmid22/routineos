import { RoutineOsChat } from './RoutineOsChat';

const AiCoachPanel = ({ context }) => (
  <div className="analytics-ai-wrapper">
    <div className="card analytics-card analytics-ai-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="section-title">ROUTINE OS COACH</h2>
        </div>
      </div>
      <RoutineOsChat
        todayContext={context}
        showHeader={false}
        panelClassName="analytics-ai-body"
        placeholder="Ask Routine OS Coach about today's habits..."
      />
    </div>
  </div>
);

export default AiCoachPanel;
