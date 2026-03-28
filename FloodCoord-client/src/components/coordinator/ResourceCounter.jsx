import React from 'react';

// Percentage thresholds → color system semantic colors
function getCountColor(percentage) {
  if (percentage >= 70) return { valueClass: 'text-success-900', badgeClass: 'bg-success-50' };
  if (percentage >= 40) return { valueClass: 'text-warning-900', badgeClass: 'bg-warning-50' };
  return { valueClass: 'text-accent-900', badgeClass: 'bg-accent-50' };
}

export default function ResourceCounter({ icon, label, current, total }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const { valueClass, badgeClass } = getCountColor(percentage);

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors bg-neutral-50">
      {/* Left: icon + label */}
      <div className="flex items-center gap-3">
        <div className="text-neutral-400">{icon}</div>
        <span className="text-sm font-medium text-neutral-600">{label}</span>
      </div>

      {/* Right: current / total */}
      <div className="flex items-center gap-1.5">
        <span className={`text-lg font-bold px-1.5 py-0.5 rounded-md font-condensed ${valueClass} ${badgeClass}`}>
          {current}
        </span>
        <span className="text-sm text-navy-100">/ {total}</span>
      </div>
    </div>
  );
}