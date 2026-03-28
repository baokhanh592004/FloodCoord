import React from 'react'

export default function AuthStrengthMeter({
  show = true,
  value,
  colors,
  labels,
  barsClassName,
  barClassName,
  labelClassName,
  inactiveColor = '#dde8f0',
}) {
  if (!show) return null

  const currentColor = colors[value] || inactiveColor

  return (
    <>
      <div className={barsClassName}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={barClassName}
            style={{ background: value >= i ? currentColor : inactiveColor }}
          />
        ))}
      </div>
      <div className={labelClassName} style={{ color: currentColor }}>
        {labels[value]}
      </div>
    </>
  )
}