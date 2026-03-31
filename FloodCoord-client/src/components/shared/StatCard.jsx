import React from 'react';

const COLOR_MAP = {
  blue: {
    shell: 'border-navy-100 hover:border-navy-200',
    iconWrap: 'bg-navy-50 text-navy',
    iconColor: 'text-navy',
    count: 'text-navy-dark',
  },
  green: {
    shell: 'border-success-100 hover:border-success',
    iconWrap: 'bg-success-50 text-success',
    iconColor: 'text-success',
    count: 'text-success-900',
  },
  red: {
    shell: 'border-accent-100 hover:border-accent',
    iconWrap: 'bg-accent-50 text-accent',
    iconColor: 'text-accent',
    count: 'text-accent-900',
  },
  yellow: {
    shell: 'border-warning-100 hover:border-warning',
    iconWrap: 'bg-warning-50 text-warning',
    iconColor: 'text-warning',
    count: 'text-warning-900',
  },
  cyan: {
    shell: 'border-info-100 hover:border-info',
    iconWrap: 'bg-info-50 text-info',
    iconColor: 'text-info',
    count: 'text-info-dark',
  },
  rose: {
    shell: 'border-manager-100 hover:border-manager',
    iconWrap: 'bg-manager-50 text-manager',
    iconColor: 'text-manager',
    count: 'text-manager-900',
  },
};

const FALLBACK_COLOR = COLOR_MAP.blue;

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatCount(count, pad) {
  if (count == null) return '—';
  if (pad && typeof count === 'number' && count < 10) return `0${count}`;
  return count;
}

export default function StatCard({
  label,
  count,
  icon,
  color = 'blue',
  padCount = false,
  variant = 'standard',
}) {
  const c = COLOR_MAP[color] || FALLBACK_COLOR;
  const isElement   = React.isValidElement(icon);
  const isComponent = typeof icon === 'function';
  const isGlass = variant === 'glass';

  return (
    <div
      className={cx(
        'cursor-default p-5 transition-all duration-200',
        isGlass
          ? 'rounded-2xl border border-white/60 bg-white/60 shadow-sm backdrop-blur-md hover:shadow-md'
          : cx('rounded-xl border bg-white hover:shadow-sm', c.shell),
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="mb-2 truncate text-sm font-medium text-neutral-400">
            {label}
          </p>
          <p className={cx('font-condensed text-3xl font-bold leading-none', c.count)}>
            {formatCount(count, padCount)}
          </p>
        </div>
        <div className={cx('ml-3 shrink-0 rounded-xl p-2.5 transition-colors duration-200', c.iconWrap)}>
          {isElement && React.cloneElement(icon, {
            className: cx(icon.props?.className, c.iconColor),
            style: undefined,
            color: undefined,
          })}
          {isComponent && React.createElement(icon, { size: 22, className: c.iconColor })}
        </div>
      </div>
    </div>
  );
}