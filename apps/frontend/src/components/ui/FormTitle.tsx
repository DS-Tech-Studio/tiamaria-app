import React from 'react';

interface FormTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const FormTitle: React.FC<FormTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-6 flex flex-col items-start gap-1">
      <div className="flex items-center gap-2 text-white">
        {icon && <span className="flex items-center text-white">{icon}</span>}
        <h2 className="font-serif text-xl font-bold tracking-wide text-white sm:text-2xl">
          {title}
        </h2>
      </div>

      {subtitle && <p className="mt-1 text-xs text-gray-400 sm:text-sm">{subtitle}</p>}
    </div>
  );
};

export default FormTitle;
