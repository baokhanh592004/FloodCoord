import React from 'react';

export default function AuthShell({
  rootClass,
  leftClass,
  rightClass,
  rootStyle,
  leftStyle,
  rightStyle,
  leftContent,
  rightContent,
}) {
  return (
    <div className={rootClass} style={rootStyle}>
      <div className={leftClass} style={leftStyle}>{leftContent}</div>
      <div className={rightClass} style={rightStyle}>{rightContent}</div>
    </div>
  );
}
