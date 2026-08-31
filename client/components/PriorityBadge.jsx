export default function PriorityBadge({ priority, score }) {
  const getBadgeConfig = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)] font-bold';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-bold';
      case 'Medium':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 font-semibold';
      case 'Low':
      default:
        return 'bg-slate-900/80 text-slate-300 border-slate-700 font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-display border rounded-sm tracking-wide ${getBadgeConfig()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse opacity-90" />
      {priority || 'Low'}
      {score !== undefined && score !== null && (
        <span className="ml-1 opacity-80 text-[10px]">({score})</span>
      )}
    </span>
  );
}
