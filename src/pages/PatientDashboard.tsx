import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  QrCode,
  Scan,
  AlertOctagon,
  Pill,
  Activity,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  PhoneCall,
  Sparkles,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { EmergencySOSModal } from '../components/EmergencySOSModal';

export const PatientDashboard: React.FC = () => {
  const {
    patient,
    medications,
    setActiveScreen,
    markDoseStatus,
    activeSos,
    isOnline,
    lastOfflineCachedTime,
    refreshOfflineCache,
    triggerPortalTestAlert,
  } = useApp();

  const [showSosModal, setShowSosModal] = useState(false);

  // Find next upcoming / due medication
  const nextMed = medications
    .flatMap((m) =>
      m.scheduledTimes.map((st) => ({
        medId: m.id,
        name: m.name,
        dosage: m.dosage,
        scheduleId: st.id,
        time: st.time,
        period: st.period,
        label: st.label,
        status: st.status,
        takenAt: st.takenAt,
      }))
    )
    .find((item) => item.status === 'Due' || item.status === 'Upcoming') || {
    medId: medications[0]?.id || '',
    name: 'Metformin 500mg',
    dosage: '1 tablet',
    scheduleId: medications[0]?.scheduledTimes[0]?.id || '',
    time: '08:00 AM',
    period: 'Morning',
    label: 'After Breakfast',
    status: 'Taken',
    takenAt: '08:15 AM',
  };

  const takenCount = medications
    .flatMap((m) => m.scheduledTimes)
    .filter((st) => st.status === 'Taken').length;
  const totalDoses = medications.flatMap((m) => m.scheduledTimes).length;
  const adherencePercent = Math.round((takenCount / Math.max(totalDoses, 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Greeting Header matching screenshot */}
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Good Morning, {patient.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Here is your daily health update.
          </p>
        </div>

        {/* 1. Aeva ID Card */}
        <div className="relative bg-white rounded-3xl p-5 border border-blue-100 shadow-sm overflow-hidden">
          {/* Subtle curved background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-36 bg-blue-50/80 rounded-l-full pointer-events-none" />
          <div className="absolute top-4 right-4 text-[#003882]/70">
            <CreditCard className="w-9 h-9 stroke-[1.5]" />
          </div>

          <div className="relative z-10">
            <span className="text-base font-extrabold text-[#002D62] tracking-tight block">
              Aeva ID Card
            </span>
            <span className="text-xl font-bold font-mono tracking-wider text-slate-800 block mt-0.5">
              {patient.aevaId}
            </span>

            {/* Scan QR and View QR Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setActiveScreen('scan_id')}
                className="bg-[#002D62] hover:bg-[#001D40] text-white font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>Scan QR</span>
              </button>

              <button
                onClick={() => setActiveScreen('aeva_id')}
                className="bg-white hover:bg-slate-50 border-2 border-[#002D62] text-[#002D62] font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Emergency SOS Card from Screenshot */}
        <div
          onClick={() => setShowSosModal(true)}
          className="bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-3xl p-5 shadow-md cursor-pointer transition-all active:scale-98 text-center relative overflow-hidden group"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 text-white border border-white/30">
            <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Emergency SOS</h2>
          <p className="text-xs text-red-100 font-medium mt-0.5">
            Tap to trigger emergency protocols
          </p>
        </div>

        {/* 3. Next Medication Card from Screenshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Next Medication
            </h2>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {nextMed.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{nextMed.time}</span>
                <span>•</span>
                <span>{nextMed.label}</span>
              </div>
            </div>

            {/* Checkbox / Taken Button */}
            <button
              onClick={() =>
                markDoseStatus(
                  nextMed.medId,
                  nextMed.scheduleId,
                  nextMed.status === 'Taken' ? 'Due' : 'Taken'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                nextMed.status === 'Taken'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  nextMed.status === 'Taken'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-400 bg-white'
                }`}
              >
                {nextMed.status === 'Taken' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <span>{nextMed.status === 'Taken' ? 'Taken' : 'Taken'}</span>
            </button>
          </div>

          {/* Adherence Mini Status */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today's compliance: {takenCount} of {totalDoses} taken</span>
            <button
              onClick={() => setActiveScreen('medicines')}
              className="text-[#003882] font-bold hover:underline flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Health Summary Card from Screenshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Health Summary
              </h2>
            </div>
            <button
              onClick={() => setActiveScreen('health')}
              className="text-xs font-bold text-[#003882] hover:underline"
            >
              Details
            </button>
          </div>

          {/* 3 Metric Cards in Row from Screenshot */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Blood Group */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
              <div className="text-2xl font-black text-rose-600 tracking-tight">
                {patient.bloodGroup}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Blood Group
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                {patient.allergies.length}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Allergies
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                {patient.chronicConditions.length}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Conditions
              </div>
            </div>
          </div>
        </div>

        {/* Offline LocalStorage Health Cache Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-100">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Offline Health Cache
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Encrypted LocalStorage Persistence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => triggerPortalTestAlert('patient')}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-rose-200"
                title="Test real-time medication schedule alert popup"
              >
                <span>Test Dose Alert</span>
              </button>
              <button
                onClick={refreshOfflineCache}
                className="text-xs font-bold text-[#003882] hover:text-[#001D40] flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Refresh offline LocalStorage cache"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{isOnline ? 'Network Connected • Cached' : 'Offline Mode • Cached'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Profile ({patient.name}), {medications.length} active prescriptions & emergency dossier stored locally.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Family / Caregiver Notice */}
        <div className="bg-slate-100 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Caregiver Linked: <strong>{patient.emergencyContacts[0]?.name}</strong></span>
          </div>
          <button
            onClick={() => setActiveScreen('family')}
            className="text-xs font-bold text-[#003882] hover:underline"
          >
            Family Portal →
          </button>
        </div>
      </div>

      {/* SOS Modal */}
      <EmergencySOSModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
    </div>
  );
};
