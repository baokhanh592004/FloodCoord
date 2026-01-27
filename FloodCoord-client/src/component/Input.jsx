import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value, 
    onChange,
    onBlur,
    error,
    placeholder, 
    icon: Icon,
    required = false,
    disabled = false
}) => {
    return (
        <div className="input-group">
            {label && (
                <label htmlFor={name} className="input-label">
                    {label} 
                    {required && 
                    <span className="required">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {Icon && (
                    <div className="input-icon">
                        <Icon size={18}/>
                    </div>
                )}
                <input
                 id = {name}
                 type = {type}
                 name = {name}
                 value = {value}
                 onChange = {onChange}
                 onBlur = {onBlur}
                 placeholder = {placeholder}
                 className = { `input-field ${error ? 'input-error' : ''}
                    ${Icon ? 'with-icon' : ''}`}
                 disabled = {disabled}
                 aria-invalid = {error ? 'true' : 'false'}
                 aria-describedby= {error ? `${name}-error` : undefined}                 
                 />
            </div>
            {error && (
                <span id={`${name}-error`} className="error-message"
                    role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;