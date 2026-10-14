// src/components/StatusBadge.js
export default function StatusBadge({ status }) {
  const configs = {
    Approved: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    Pending: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500 animate-pulse',
    },
    Rejected: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
  };

  const config = configs[status] || {
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };

  const label = status || 'Pending';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border shadow-2xs ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label}</span>
    </span>
  );
}