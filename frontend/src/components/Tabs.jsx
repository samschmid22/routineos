// Component: simple tri-tab navigation.
const Tabs = ({ active, onChange }) => {
  const tabs = ['Today', 'Systems', 'Analytics'];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab ${active === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
