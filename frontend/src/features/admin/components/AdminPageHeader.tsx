import React from 'react';

interface AdminPageHeaderProps {
  badgeText: string;
  badgeColor?: string; // e.g., "bg-orange-500"
  title: string;
  accentTitle?: string;
  accentColor?: string; // e.g., "text-orange-500"
  subtitle: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  badgeText,
  badgeColor = "bg-orange-500",
  title,
  accentTitle,
  accentColor = "text-orange-500",
  subtitle,
  icon,
  children
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon ? (
             <div className={`flex-shrink-0 ${accentColor.startsWith('text-') ? accentColor : ''}`} style={{ color: accentColor.startsWith('text-') ? undefined : accentColor }}>
               {icon}
             </div>
          ) : (
            <span className={`flex h-2 w-2 rounded-full ${badgeColor}`}></span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em]`} style={{ color: accentColor.startsWith('text-') ? undefined : accentColor }}>
            <span className={accentColor.startsWith('text-') ? accentColor : ''}>{badgeText}</span>
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {title} {accentTitle && <span className={accentColor.startsWith('text-') ? accentColor : ''} style={{ color: accentColor.startsWith('text-') ? undefined : accentColor }}>{accentTitle}</span>}
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium tracking-tight">
          {subtitle}
        </p>
      </div>
      
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
