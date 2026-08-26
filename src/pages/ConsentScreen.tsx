import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';

export const ConsentScreen: React.FC = () => {
  const { consentPreferences, updateConsentPreferences, setActiveScreen, setNotificationBanner } =
    useApp();

  const handleToggle = (key: keyof typeof consentPreferences) => {
    updateConsentPreferences({ [key]: !consentPreferences[key] });
    setNotificationBanner({
      message: 'Privacy consent preferences updated.',
      type: 'info',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveScreen('health')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#002D62] tracking-tight">
            Privacy & Consent
          </h1>
          <div className="w-10" />
        </div>

        {/* DPDP Act Compliance Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>DPDP Act (India) Compliant</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Your health records are end-to-end encrypted. You maintain complete ownership and can grant or revoke access anytime.
          </p>
        </div>

        {/* Consent Switches */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-5">
          {/* Emergency Access Override */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm text-slate-900 block">
                Emergency First-Responder Access
              </span>
              <p className="text-xs text-slate-500 leading-snug">
                Allows verified paramedics and hospital ER staff to view blood group, severe allergies, and emergency contacts via QR scan.
              </p>
            </div>
            <button
              onClick={() => handleToggle('emergencyAccessAllowed')}
              className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                consentPreferences.emergencyAccessAllowed ? 'bg-[#002D62]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  consentPreferences.emergencyAccessAllowed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Caregiver Access */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm text-slate-900 block">
                Caregiver Monitoring (Family)
              </span>
              <p className="text-xs text-slate-500 leading-snug">
                Allows designated family members (Arjun Sharma) to receive missed-dose alerts and SOS push notifications.
              </p>
            </div>
            <button
              onClick={() => handleToggle('caregiverAccessAllowed')}
              className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                consentPreferences.caregiverAccessAllowed ? 'bg-[#002D62]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  consentPreferences.caregiverAccessAllowed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Doctor Comprehensive EHR Access */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm text-slate-900 block">
                Doctor Full EHR Sharing
              </span>
              <p className="text-xs text-slate-500 leading-snug">
                Authorizes Dr. Rajesh Kumar (Apollo Hospitals) to view past surgeries, lab reports, and prescribe new medications.
              </p>
            </div>
            <button
              onClick={() => handleToggle('doctorAccessAllowed')}
              className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                consentPreferences.doctorAccessAllowed ? 'bg-[#002D62]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  consentPreferences.doctorAccessAllowed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Location Sharing on SOS */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm text-slate-900 block">
                GPS Location on Emergency SOS
              </span>
              <p className="text-xs text-slate-500 leading-snug">
                Automatically transmits live device location to 112 emergency services and family when SOS is tapped.
              </p>
            </div>
            <button
              onClick={() => handleToggle('shareLocationOnSos')}
              className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                consentPreferences.shareLocationOnSos ? 'bg-[#002D62]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  consentPreferences.shareLocationOnSos ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audit Log button */}
        <button
          onClick={() => setActiveScreen('audit_logs')}
          className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs"
        >
          <FileCheck className="w-4 h-4 text-blue-700" />
          <span>View Access History & Security Logs</span>
        </button>
      </div>
    </div>
  );
};
