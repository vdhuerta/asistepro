
import React from 'react';

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
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        id={id}
        className={`${baseBg} ${insetShadow} w-full rounded-lg py-3 px-4 text-gray-700 focus:outline-none transition-shadow duration-200`}
        {...props}
      />
    </div>
  );
};

interface NeumorphicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const NeumorphicSelect: React.FC<NeumorphicSelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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
      className={`${baseBg} ${raisedShadow} font-semibold text-gray-800 py-3 px-8 rounded-lg active:${activeInsetShadow} hover:text-blue-600 transition-all duration-200 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
