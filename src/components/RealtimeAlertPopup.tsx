import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RealtimePortalAlert } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  BellRing,
  Volume2,
  VolumeX,
  Radio,
  Zap,
} from 'lucide-react';

export const RealtimeAlertPopup: React.FC = () => {
  const {
    activeRealtimeAlerts,
    dismissRealtimeAlert,
    triggerPortalTestAlert,
    setActiveScreen,
    selectPatientByAevaId,
    role,
    isOnline,
  } = useApp();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  if (!activeRealtimeAlerts || activeRealtimeAlerts.length === 0) {
    return null;
  }

  const handleActionClick = (alert: RealtimePortalAlert) => {
    if (alert.patientAevaId) {
      selectPatientByAevaId(alert.patientAevaId);
    }
    if (alert.actionScreen) {
      setActiveScreen(alert.actionScreen);
    }
    dismissRealtimeAlert(alert.id);
  };

  const getPortalLabel = (targetRole: string) => {
    switch (targetRole) {
      case 'patient':
        return 'PATIENT HEALTH ALERT';
      case 'doctor':
        return 'CLINICAL EHR ALERT';
      case 'hospital':
        return 'HOSPITAL COMMAND ALERT';
      case 'caregiver':
        return 'CAREGIVER MONITOR';
      case 'emergency':
        return 'EMS 112 EMERGENCY';
      default:
        return 'SYSTEM ALERT';
    }
  };

  const getSeverityStyles = (severity: RealtimePortalAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-rose-950/95 text-rose-50 border-rose-500 shadow-rose-950/50',
          badge: 'bg-rose-500/30 text-rose-200 border-rose-400/40',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />,
          actionBtn: 'bg-rose-600 hover:bg-rose-500 text-white',
          accentBorder: 'border-l-4 border-l-rose-500',
        };
      case 'warning':
        return {
          container: 'bg-amber-950/95 text-amber-50 border-amber-500 shadow-amber-950/50',
          badge: 'bg-amber-500/30 text-amber-200 border-amber-400/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          actionBtn: 'bg-amber-600 hover:bg-amber-500 text-white',
          accentBorder: 'border-l-4 border-l-amber-500',
        };
      case 'info':
        return {
          container: 'bg-slate-900/95 text-slate-100 border-blue-500/50 shadow-slate-950/60',
          badge: 'bg-blue-500/30 text-blue-200 border-blue-400/40',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          actionBtn: 'bg-blue-600 hover:bg-blue-500 text-white',
          accentBorder: 'border-l-4 border-l-blue-500',
        };
      case 'success':
        return {
          container: 'bg-emerald-950/95 text-emerald-50 border-emerald-500/50 shadow-emerald-950/50',
          badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          actionBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          accentBorder: 'border-l-4 border-l-emerald-500',
        };
    }
  };

  return (
    <div
      id="aeva-realtime-alert-container"
      className="fixed top-16 right-3 sm:right-6 left-3 sm:left-auto sm:w-[420px] z-50 flex flex-col gap-2.5 pointer-events-auto transition-all duration-300"
    >
      {activeRealtimeAlerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);

        return (
          <div
            key={alert.id}
            id={`alert-popup-${alert.id}`}
            role="alert"
            className={`relative rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4 ${styles.container} ${styles.accentBorder}`}
          >
            {/* Header with Portal Tag & Timestamp */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      alert.severity === 'critical' ? 'bg-rose-400' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${styles.badge}`}
                >
                  {getPortalLabel(alert.targetRole)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-300 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <button
                  onClick={() => dismissRealtimeAlert(alert.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss Alert"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alert Content */}
            <div className="flex items-start gap-3">
              {styles.icon}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-snug">
                  {alert.title}
                </h4>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed line-clamp-3">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-white/10 gap-2">
              <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live Portal Telemetry</span>
              </span>

              <div className="flex items-center gap-2">
                {alert.actionLabel && (
                  <button
                    onClick={() => handleActionClick(alert)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${styles.actionBtn}`}
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => dismissRealtimeAlert(alert.id)}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
