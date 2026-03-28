import React from 'react';
import { COORDINATOR_STATUS_BADGE_BY_CODE, COORDINATOR_STATUS_BADGE_DEFAULT } from '../shared/styleMaps';

export default function StatusBadge({ status, showDot = false }) {
  const key = status?.toUpperCase();
  const s = COORDINATOR_STATUS_BADGE_BY_CODE[key]
    || { ...COORDINATOR_STATUS_BADGE_DEFAULT, label: status || '—' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {s.label}
    </span>
  );
}