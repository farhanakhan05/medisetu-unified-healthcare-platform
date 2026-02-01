
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, onLogout, showBack, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-blue-600">Medisetu</h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {title && <span className="hidden sm:inline font-medium text-slate-700">{title}</span>}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4">
        {children}
      </main>
    </div>
  );
};
