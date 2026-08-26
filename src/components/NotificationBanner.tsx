import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notificationBanner, setNotificationBanner } = useApp();

  useEffect(() => {
    if (notificationBanner) {
      const timer = setTimeout(() => {
        setNotificationBanner(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationBanner, setNotificationBanner]);

  if (!notificationBanner) return null;

  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    info: 'bg-blue-50 text-blue-900 border-blue-300',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    critical: 'bg-rose-50 text-rose-900 border-rose-300',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    critical: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-top-4">
      <div
        className={`flex items-center justify-between p-3.5 rounded-xl border shadow-lg ${
          bgStyles[notificationBanner.type]
        }`}
      >
        <div className="flex items-center gap-2.5">
          {icons[notificationBanner.type]}
          <span className="text-xs font-semibold leading-snug">
            {notificationBanner.message}
          </span>
        </div>
        <button
          onClick={() => setNotificationBanner(null)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
