import React from 'react';
import { twMerge } from 'tailwind-merge';

// Neumorphic styles
const baseBg = 'bg-slate-100';
const raisedShadow = 'shadow-[5px_5px_10px_#c7ced4,-5px_-5px_10px_#ffffff]';
const insetShadow = 'shadow-[inset_5px_5px_10px_#c7ced4,inset_-5px_-5px_10px_#ffffff]';
const activeInsetShadow = 'shadow-[inset_2px_2px_5px_#c7ced4,inset_-2px_-2px_5px_#ffffff]';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ children, className = '', padding = 'p-4 sm:p-6' }) => {
  return (
    <div className={`${baseBg} ${raisedShadow} rounded-2xl ${padding} ${className}`}>
      {children}
    </div>
  );
};

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 text-[8px] ml-1 font-normal">(obligatorio)</span>}
      </label>
      <input
        id={id}
        className={twMerge(`${baseBg} ${insetShadow} w-full rounded-lg py-3 px-4 text-gray-700 focus:outline-none transition-shadow duration-200`, className)}
        {...props}
      />
    </div>
  );
};

interface NeumorphicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export const NeumorphicSelect: React.FC<NeumorphicSelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div className="w-full">
       <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 text-[8px] ml-1 font-normal">(obligatorio)</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`${baseBg} ${insetShadow} w-full rounded-lg py-3 px-4 pr-10 text-gray-700 focus:outline-none appearance-none transition-shadow duration-200`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={twMerge(`${baseBg} ${raisedShadow} font-semibold text-gray-800 py-3 px-8 rounded-lg active:${activeInsetShadow} hover:text-blue-600 transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:shadow-none disabled:text-gray-500 disabled:hover:text-gray-500`, className)}
      {...props}
    >
      {children}
    </button>
  );
};

interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({ checked, onChange, id, disabled = false }) => {
  const uniqueId = id || React.useId();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(e.target.checked);
  };

  return (
    <label htmlFor={uniqueId} className={`relative inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
      <input 
        type="checkbox" 
        id={uniqueId} 
        className="sr-only peer" 
        checked={checked} 
        onChange={handleChange}
        disabled={disabled}
      />
      <div className={`w-14 h-7 rounded-full peer transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-red-400'} ${insetShadow}`}>
      </div>
      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${raisedShadow} peer-checked:translate-x-7`}></div>
    </label>
  );
};

interface SegmentedControlOption<T> {
  label: string;
  value: T;
  activeClassName?: string;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export const SegmentedControl = <T extends string | number | boolean>({ options, value, onChange, disabled = false }: SegmentedControlProps<T>) => {
  return (
    <div className={twMerge(`inline-flex items-center p-1 rounded-lg ${insetShadow}`, disabled ? 'opacity-60 cursor-not-allowed' : '')}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={twMerge(
              `py-1 px-3 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none`,
              isActive
                ? twMerge(activeInsetShadow, option.activeClassName || 'bg-slate-200 text-blue-600')
                : `${baseBg} text-gray-600 hover:bg-slate-200/50`,
              disabled ? 'cursor-not-allowed' : ''
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};