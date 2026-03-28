import React from 'react';
import { COORDINATOR_PRIORITY_BADGE_BY_CODE, COORDINATOR_PRIORITY_BADGE_DEFAULT } from '../shared/styleMaps';

export default function PriorityBadge({ priority }) {
  const key = priority?.toUpperCase();
  const s = COORDINATOR_PRIORITY_BADGE_BY_CODE[key]
    || { ...COORDINATOR_PRIORITY_BADGE_DEFAULT, label: priority || '—' };
 
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}
