export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="border-b border-border">
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium
                border-b-2 transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
