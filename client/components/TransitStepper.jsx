'use client';

export default function TransitStepper({ status }) {
  const stations = [
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const getActiveIndex = () => {
    switch (status) {
      case 'in-progress':
        return 1;
      case 'resolved':
        return 2;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="w-full py-1">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line Track */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0" />
        
        {/* Animated Progress Line */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--transit-green)] shadow-[0_0_8px_#10B981] transition-all duration-500 ease-in-out z-0"
          style={{
            width: activeIndex === 0 ? '0%' : activeIndex === 1 ? '50%' : 'calc(100% - 24px)'
          }}
        />

        {/* Stations */}
        {stations.map((st, idx) => {
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          let circleStyle = 'bg-slate-900 border-2 border-slate-700 text-slate-500';
          let textStyle = 'text-slate-400 font-normal';

          if (isCompleted) {
            circleStyle = 'bg-[var(--transit-green)] border-2 border-[var(--transit-green)] text-[#0B132B] font-bold shadow-[0_0_8px_#10B981]';
            textStyle = 'text-emerald-400 font-semibold';
          }
          if (isCurrent && status === 'pending') {
            circleStyle = 'bg-[var(--signal-amber)] border-2 border-[var(--signal-amber)] text-[#0B132B] font-bold animate-pulse shadow-[0_0_10px_#F59E0B]';
            textStyle = 'text-amber-400 font-bold';
          } else if (isCurrent && status === 'in-progress') {
            circleStyle = 'bg-[var(--route-blue)] border-2 border-[var(--route-blue)] text-[#0B132B] font-bold animate-pulse shadow-[0_0_10px_#00D2FF]';
            textStyle = 'text-[var(--route-blue)] font-bold';
          }

          return (
            <div key={st.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display transition-colors duration-300 ${circleStyle}`}
              >
                {idx + 1}
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-display mt-1 transition-colors duration-300 ${textStyle}`}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
