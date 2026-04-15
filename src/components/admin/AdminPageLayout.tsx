import React from "react";

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function AdminPageLayout({ title, subtitle, children, action }: AdminPageLayoutProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-400 text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center w-full md:w-auto">
            {action}
          </div>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
