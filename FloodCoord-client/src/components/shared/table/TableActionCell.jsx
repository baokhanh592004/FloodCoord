import React, { useState } from 'react';

const MANAGER_TONE_CLASS = {
  view: 'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
  edit: 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50',
  delete: 'text-gray-500 hover:text-red-600 hover:bg-red-50',
};

const ADMIN_TONE_STYLE = {
  view: { hoverColor: '#1a3a5c', hoverBg: '#f0f6ff' },
  edit: { hoverColor: '#78350f', hoverBg: '#fefce8' },
  delete: { hoverColor: '#9a3a10', hoverBg: '#fff0ed' },
};

function ActionButton({ action, variant, theme }) {
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;
  const tone = action.tone || 'view';

  if (variant === 'admin') {
    const styleMeta = ADMIN_TONE_STYLE[tone] || ADMIN_TONE_STYLE.view;
    return (
      <button
        title={action.title}
        onClick={action.onClick}
        disabled={action.disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: hovered && !action.disabled ? styleMeta.hoverColor : theme?.textMuted || '#64748b',
          background: hovered && !action.disabled ? styleMeta.hoverBg : 'transparent',
        }}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      title={action.title}
      onClick={action.onClick}
      disabled={action.disabled}
      className={`p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${MANAGER_TONE_CLASS[tone] || MANAGER_TONE_CLASS.view}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function TableActionCell({ actions, variant = 'manager', theme }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {actions.map((action) => (
        <ActionButton
          key={action.key}
          action={action}
          variant={variant}
          theme={theme}
        />
      ))}
    </div>
  );
}
