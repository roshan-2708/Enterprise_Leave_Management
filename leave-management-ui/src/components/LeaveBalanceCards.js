// src/components/LeaveBalanceCards.js
'use client';

export default function LeaveBalanceCards({ balances = [], loading = false }) {
  const cardThemes = {
    CL: {
      border: 'border-blue-200 hover:border-blue-300',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      progress: 'bg-blue-600',
      track: 'bg-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    SL: {
      border: 'border-amber-200 hover:border-amber-300',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      progress: 'bg-amber-600',
      track: 'bg-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    EL: {
      border: 'border-emerald-200 hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progress: 'bg-emerald-600',
      track: 'bg-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  };

  if (loading && (!balances || balances.length === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {balances.map((item) => {
        const theme = cardThemes[item.type] || cardThemes.CL;
        const percentUsed = item.total > 0 ? Math.min(100, Math.round((item.used / item.total) * 100)) : 0;

        return (
          <div
            key={item.type}
            className={`bg-white border ${theme.border} rounded-xl p-5 shadow-sm transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${theme.iconBg}`}>
                  {theme.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <span className="text-[11px] font-mono text-gray-500 uppercase">{item.type}</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {item.remaining} left
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-gray-900">
                  {item.remaining}{' '}
                  <span className="text-xs font-medium text-gray-500">/ {item.total} days</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {item.used} used
                </div>
              </div>

              {/* Progress bar */}
              <div className={`w-full ${theme.track} h-1.5 rounded-full mt-3 overflow-hidden`}>
                <div
                  className={`${theme.progress} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>

              {item.pending > 0 && (
                <p className="text-[11px] text-amber-600 mt-2 font-medium flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item.pending} day(s) pending approval
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
