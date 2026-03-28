import React from 'react'
import AuthField from './AuthField'

export default function AuthPasswordField({
  fieldClassName,
  label,
  labelClassName,
  inputWrapperClassName,
  inputClassName,
  icon,
  toggleButtonClassName,
  visible,
  onToggle,
  visibleIcon,
  hiddenIcon,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  return (
    <AuthField
      fieldClassName={fieldClassName}
      label={label}
      labelClassName={labelClassName}
      inputWrapperClassName={inputWrapperClassName}
      inputClassName={inputClassName}
      icon={icon}
      type={visible ? 'text' : 'password'}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      rightSlot={(
        <button type="button" className={toggleButtonClassName} onClick={onToggle}>
          {visible ? hiddenIcon : visibleIcon}
        </button>
      )}
    />
  )
}