import React from 'react'

export default function AuthField({
  fieldClassName,
  label,
  labelClassName,
  inputWrapperClassName,
  inputClassName,
  icon,
  rightSlot,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  return (
    <div className={fieldClassName}>
      {label ? <label className={labelClassName}>{label}</label> : null}
      <div className={inputWrapperClassName}>
        {icon}
        <input
          className={inputClassName}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
        />
        {rightSlot}
      </div>
    </div>
  )
}