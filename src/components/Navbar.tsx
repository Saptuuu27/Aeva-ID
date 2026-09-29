import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Bell,
  Heart,
  RefreshCw,
  Stethoscope,
  Users,
  Building2,
  Ambulance,
  UserCheck,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { EmergencySOSModal } from './EmergencySOSModal';
import { SIHJudgeHelpbookModal } from './SIHJudgeHelpbookModal';

export const Navbar: React.FC = () => {
  const {
    role,
    activeScreen,
    setActiveScreen,
    patient,
    activeDoctor,
    activeHospital,
    caregiverAlerts,
    resetToDefaults,
    logout,
    isOnline,
    lastOfflineCachedTime,
    triggerPortalTestAlert,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showHelpbookModal, setShowHelpbookModal] = useState(false);

  const roleMeta: Record<UserRole, { label: string; icon: any; badgeColor: string }> = {
    patient: {
      label: `Patient Portal: ${patient.name}`,
      icon: UserCheck,
      badgeColor: 'bg-blue-700 text-blue-100',
    },
    caregiver: {
      label: `Caregiver Portal: Monitoring ${patient.name}`,
      icon: Users,
      badgeColor: 'bg-emerald-700 text-emerald-100',
    },
    doctor: {
      label: `Doctor Portal: ${activeDoctor.name} (${activeDoctor.specialty})`,
      icon: Stethoscope,
      badgeColor: 'bg-indigo-700 text-indigo-100',
    },
    hospital: {
      label: `Hospital Portal: ${activeHospital.name}`,
      icon: Building2,
      badgeColor: 'bg-purple-700 text-purple-100',
    },
    emergency_staff: {
      label: 'Emergency Trauma Gateway: Field Responder',
      icon: Ambulance,
      badgeColor: 'bg-rose-700 text-rose-100',
    },
  };

  const unreadAlerts = caregiverAlerts.filter((a) => a.severity === 'critical').length;
  const currentMeta = roleMeta[role] || roleMeta.patient;
  const RoleIcon = currentMeta.icon;

  const handleHomeClick = () => {
    if (role === 'patient') setActiveScreen('home');
    else if (role === 'caregiver') setActiveScreen('family');
    else if (role === 'doctor') setActiveScreen('doctor_dashboard');
    else if (role === 'hospital') setActiveScreen('hospital_portal');
    else if (role === 'emergency_staff') setActiveScreen('emergency_gateway');
    else setActiveScreen('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Authenticated Role Status Banner */}
      <div className="bg-[#002D62] text-white px-3 sm:px-6 py-1.5 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`px-2 py-0.5 rounded-md font-bold text-[11px] sm:text-xs flex items-center gap-1.5 truncate ${currentMeta.badgeColor}`}>
            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{currentMeta.label}</span>
          </div>
          {role === 'patient' && (
            <span className="text-blue-200 hidden md:inline text-[11px] font-mono">• Aeva ID: {patient.aevaId}</span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* SIH Judge Manual / Helpbook Fast-Access */}
          <button
            onClick={() => setShowHelpbookModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Open SIH Evaluator Manual & Workflow Flowcharts"
          >
            <BookOpen className="w-3 h-3 text-slate-900" />
            <span>SIH Helpbook</span>
          </button>

          {/* Offline / Local Storage Status Badge */}
          <div
            className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-[11px] flex items-center gap-1.5 transition-all ${
              isOnline
                ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/40'
                : 'bg-amber-600 text-amber-100 animate-pulse border border-amber-400'
            }`}
            title={
              isOnline
                ? 'LocalStorage Active: User profile & medications cached offline'
                : 'Offline Mode: Reading essential health records from local cache'
            }
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-white'}`} />
            <span className="hidden sm:inline">{isOnline ? 'Offline Cache Active' : 'Offline Mode'}</span>
            <span className="sm:hidden">{isOnline ? 'Cached' : 'Offline'}</span>
          </div>

          <button
            onClick={logout}
            className="bg-rose-600/90 hover:bg-rose-700 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Sign out of current portal"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="text-blue-200 hover:text-white flex items-center gap-1 text-[11px] transition-colors p-1 cursor-pointer"
            title="Reset data to initial state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#003882] to-[#001D40] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                  Aeva
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-1.5 py-0.2 rounded-md">
                  Health
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block leading-tight">
                Universal Health Ecosystem
              </span>
            </div>
          </button>
        </div>

        {/* Section Navigation Links Tailored to Logged-in Role */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-600 font-medium">
            {role === 'patient' && (
              <>
                <button
                  onClick={() => setActiveScreen('home')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'home' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveScreen('medicines')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'medicines' || activeScreen === 'add_medicine' || activeScreen === 'edit_medicine'
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Medicines
                </button>
                <button
                  onClick={() => setActiveScreen('health')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'health' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Health Profile
                </button>
                <button
                  onClick={() => setActiveScreen('aeva_id')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'aeva_id' || activeScreen === 'medi_id' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Aeva ID
                </button>
                <button
                  onClick={() => setActiveScreen('reports')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'reports' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Reports
                </button>
                <button
                  onClick={() => setActiveScreen('consent')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'consent' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Consent
                </button>
                <button
                  onClick={() => setActiveScreen('audit_logs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'audit_logs' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Audit Logs
                </button>
              </>
            )}

            {role === 'caregiver' && (
              <>
                <button
                  onClick={() => setActiveScreen('family')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'family' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Caregiver Overview
                </button>
                <button
                  onClick={() => setActiveScreen('medicines')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'medicines' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Patient Medicines
                </button>
                <button
                  onClick={() => setActiveScreen('reports')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'reports' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Diagnostic Reports
                </button>
                <button
                  onClick={() => setActiveScreen('audit_logs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'audit_logs' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Access Audit Logs
                </button>
              </>
            )}

            {role === 'doctor' && (
              <>
                <button
                  onClick={() => setActiveScreen('doctor_dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'doctor_dashboard' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Doctor Consultation Suite
                </button>
                <button
                  onClick={() => setActiveScreen('reports')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'reports' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Patient EHR Records
                </button>
                <button
                  onClick={() => setActiveScreen('audit_logs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'audit_logs' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Clinical Audit Trail
                </button>
              </>
            )}

            {role === 'hospital' && (
              <>
                <button
                  onClick={() => setActiveScreen('hospital_portal')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'hospital_portal' ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  ER & Bed Management
                </button>
                <button
                  onClick={() => setActiveScreen('audit_logs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'audit_logs' ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Hospital Audit Registry
                </button>
              </>
            )}

            {role === 'emergency_staff' && (
              <>
                <button
                  onClick={() => setActiveScreen('emergency_gateway')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'emergency_gateway' ? 'bg-rose-50 text-rose-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Trauma Triage Gateway
                </button>
                <button
                  onClick={() => setActiveScreen('scan_id')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeScreen === 'scan_id' ? 'bg-rose-50 text-rose-900 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Optical QR Scanner
                </button>
              </>
            )}
          </div>

          {/* Notifications button with bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-24 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">System & Health Alerts</span>
                  <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    {caregiverAlerts.length} total
                  </span>
                </div>

                {/* Portal Live Test Alert Trigger */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-600 font-medium">
                    Test live portal alert telemetry:
                  </div>
                  <button
                    onClick={() => {
                      triggerPortalTestAlert();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-bold bg-[#003882] hover:bg-[#002D62] text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Trigger Alert</span>
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {caregiverAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${
                            alert.severity === 'critical'
                              ? 'text-rose-600 font-bold'
                              : alert.severity === 'warning'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {alert.title}
                        </span>
                        <span className="text-slate-400 text-[10px]">{alert.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-snug">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SOS Button */}
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />

      {/* SIH Judge Helpbook & System Manual Modal */}
      <SIHJudgeHelpbookModal isOpen={showHelpbookModal} onClose={() => setShowHelpbookModal(false)} />
    </header>
  );
};
