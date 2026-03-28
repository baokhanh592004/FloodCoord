import React from 'react';

export default function SectionHeader({
  variant = 'manager',
  title,
  subtitle,
  actions = null,
  adminTheme,
  containerClass = 'shrink-0 flex items-center justify-between',
  managerTitleClass = 'text-xl font-bold text-gray-900',
  adminTitleClass = 'text-xl font-bold',
  managerSubtitleClass = 'text-xs text-gray-500',
  adminSubtitleClass = 'text-xs mt-0.5',
}) {
  const isAdmin = variant === 'admin';

  return (
    <div className={containerClass}>
      <div>
        <h1
          className={isAdmin ? adminTitleClass : managerTitleClass}
          style={isAdmin ? { color: adminTheme?.textMain } : undefined}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={isAdmin ? adminSubtitleClass : managerSubtitleClass}
            style={isAdmin ? { color: adminTheme?.textMuted } : undefined}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
