import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Scan,
  CreditCard,
  PhoneCall,
  ShieldCheck,
  Zap,
  Activity,
  Heart,
  FileCheck2,
  Users,
  Search,
  Radio,
  ArrowRight,
  ShieldAlert,
  Ambulance,
  Building,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Lock,
  X,
  ArrowLeft,
  Clock,
  Download,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const EmergencyGatewayScreen: React.FC = () => {
  const {
    role,
    patient,
    patientsList,
    selectPatientById,
    verifyAevaId,
    setActiveScreen,
    setActiveAevaIdForEmergency,
    triageRecords,
    addTriageRecord,
    logAuditAccess,
    setNotificationBanner,
    triggerPortalTestAlert,
  } = useApp();

  const [inputAevaId, setInputAevaId] = useState('AEVA-1234-5678-9012');
  const [responderBadge, setResponderBadge] = useState('EMS-ND-8841 (Apollo Emergency Unit)');
  const [hospitalUnit, setHospitalUnit] = useState('Apollo Hospitals ER / Trauma Bay 1');
  const [triageReason, setTriageReason] = useState('Road Traffic Incident / Unconscious Patient');
  const [isScanning, setIsScanning] = useState(false);
  const [isDecodingOffline, setIsDecodingOffline] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    setActiveScreen('home');
  };

  // Keyboard shortcut to close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthorizeAndOpen = (idToVerify: string, patientName?: string) => {
    setErrorMsg('');
    const isValid = verifyAevaId(idToVerify);
    if (!isValid) {
      setErrorMsg('Invalid 12-digit Aeva ID. Please enter a valid registered ID.');
      return;
    }

    setActiveAevaIdForEmergency(idToVerify);
    
    // Add to triage queue
    const patientObj = patientsList.find(p => p.aevaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === idToVerify.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) || patient;
    addTriageRecord({
      patientAevaId: idToVerify,
      patientName: patientName || patientObj.name,
      bloodGroup: patientObj.bloodGroup,
      triagePriority: patientObj.bloodGroup.includes('-') ? 'Red (Resuscitation)' : 'Yellow (Urgent)',
      chiefComplaint: triageReason,
      allergiesSummary: patientObj.allergies.map(a => a.name).join(', ') || 'No critical allergies documented',
      hospitalUnit,
      responderName: responderBadge,
      vitalsBp: patientObj.avgBp || '120/80 mmHg',
      scanMode: 'Emergency Fast-Pass QR',
    });

    logAuditAccess(
      responderBadge,
      'Emergency First Responder',
      hospitalUnit,
      `Emergency Override Access: ${triageReason} for ${patientName || patientObj.name}`
    );

    setNotificationBanner({
      message: `Emergency Gateway Authorized: Accessing ${patientName || patientObj.name} Critical Profile.`,
      type: 'critical',
    });

    setActiveScreen('emergency_profile');
  };

  const handleSimulateOfflineQrDecode = () => {
    setIsDecodingOffline(true);
    setTimeout(() => {
      setIsDecodingOffline(false);
      handleAuthorizeAndOpen(patient.aevaId, patient.name);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top High-Urgency Emergency Header with Close / Exit Cross Button */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          {/* Prominent Floating Close Button (X) */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all hover:scale-105 border border-white/20 z-10 cursor-pointer shadow-lg"
            title="Close Emergency Gateway (Esc)"
            aria-label="Close Emergency Gateway"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1 pr-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white font-black text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>GOLDEN HOUR DISPATCH GATEWAY</span>
              </span>
              <span className="bg-white text-rose-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Aeva ID Integrated
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Ambulance className="w-6 h-6 text-white" />
              <span>First Responder Emergency Gateway</span>
            </h1>
            <p className="text-xs text-rose-100 font-medium">
              Instant bypass for Paramedics, ER Triage, and Trauma teams with immutable audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0">
            <button
              onClick={() => triggerPortalTestAlert('emergency_staff')}
              className="bg-black/40 hover:bg-black/60 text-white font-black px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-white/30 transition-all cursor-pointer shadow-md"
              title="Test real-time paramedic / triage alert popup"
            >
              <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Test Live Telemetry Alert</span>
            </button>

            <a
              href="tel:112"
              className="bg-white hover:bg-slate-100 text-rose-800 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Call 112 / 108</span>
            </a>

            <button
              onClick={handleClose}
              className="bg-black/30 hover:bg-black/50 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-white/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        {/* Emergency Triage Access Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Scanner & ID Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Optical & Offline QR Scan Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Scan className="w-5 h-5 text-emerald-400" />
                  <span>Hardware QR & Optical Scanners</span>
                </h2>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                  100% Offline Compatible
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Instant Offline QR Decode */}
                <button
                  onClick={handleSimulateOfflineQrDecode}
                  disabled={isDecodingOffline}
                  className="bg-slate-800/80 hover:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-36 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      0ms Offline
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block group-hover:text-emerald-300">
                      {isDecodingOffline ? 'Decoding Aeva QR...' : 'Decode Unified Aeva QR'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Decode patient's self-contained offline emergency QR in 0ms
                    </span>
                  </div>
                  {isDecodingOffline && (
                    <div className="absolute inset-0 bg-emerald-950/90 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-emerald-300">Decoding in 0ms...</span>
                    </div>
                  )}
                </button>

                {/* Live Camera QR Scanner Trigger */}
                <button
                  onClick={() => setActiveScreen('scan_id')}
                  className="bg-slate-800/80 hover:bg-slate-800 border-2 border-blue-500/40 hover:border-blue-400 rounded-2xl p-4 text-left transition-all group flex flex-col justify-between h-36 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Scan className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-md">
                      LIVE CAMERA
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block group-hover:text-blue-300">
                      Open Camera Scanner
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Live optical viewfinder & image QR recognition
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Aeva ID Verification & Hospital Authorization Form */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Manual Aeva ID Verification</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter patient's 12-digit Aeva ID or national MRN number.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Patient 12-Digit Aeva ID
                  </label>
                  <div className="flex rounded-2xl border-2 border-slate-700 bg-slate-950 focus-within:border-emerald-500 overflow-hidden transition-all">
                    <div className="px-3.5 py-3 text-slate-500 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      value={inputAevaId}
                      onChange={(e) => setInputAevaId(e.target.value)}
                      placeholder="AEVA-1234-5678-9012"
                      className="w-full px-2 py-3 text-white font-mono font-black text-base sm:text-lg focus:outline-hidden bg-transparent tracking-wider"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Responder Badge / ID
                    </label>
                    <input
                      type="text"
                      value={responderBadge}
                      onChange={(e) => setResponderBadge(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Hospital Facility
                    </label>
                    <input
                      type="text"
                      value={hospitalUnit}
                      onChange={(e) => setHospitalUnit(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleAuthorizeAndOpen(inputAevaId)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Verify & Unlock Emergency Medical Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Recent ER Queue & Quick Patient Triage (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Patient Triage Dropdown Selector */}
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-rose-400" />
                  <span>Demo Patient Triage Selector</span>
                </h3>
                <span className="text-[10px] bg-rose-950 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                  {patientsList.length} Profiles
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400">
                  Select Patient to Simulate ER Admission:
                </label>
                <div className="relative">
                  <select
                    value={patient.id}
                    onChange={(e) => {
                      const selected = patientsList.find(p => p.id === e.target.value);
                      if (selected) {
                        selectPatientById(selected.id);
                      }
                    }}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:border-rose-500 rounded-xl focus:outline-hidden focus:border-rose-500 appearance-none cursor-pointer"
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name} ({p.bloodGroup}) — {p.chronicConditions[0]?.name || 'Standard'} • {p.age}y
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-rose-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Active Selected Patient Triage Card */}
              <div className="p-4 bg-slate-800/90 rounded-2xl border border-rose-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-900/80 text-rose-200 flex items-center justify-center font-black text-sm border border-rose-700 shrink-0">
                      {patient.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white truncate block">
                          {patient.name}
                        </span>
                        <span className="bg-rose-950 text-rose-300 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                          {patient.bloodGroup}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Aeva ID: {patient.aevaId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-amber-300 font-semibold bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
                  ⚠ Critical Allergy: {patient.allergies[0]?.name || 'None listed'} ({patient.allergies[0]?.severity || 'Standard'})
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAuthorizeAndOpen(patient.aevaId, patient.name);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <span>Unlock Emergency Dossier for {patient.name.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Legal & DPDP Emergency Access Notice */}
            <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>DPDP Act 2023 Statutory Override Compliance</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Under Section 7 of the Digital Personal Data Protection Act, certified emergency
                responders are authorized to access vital health records for life-saving triage. All
                access events generate an immutable cryptographic log timestamped on the National
                Health Gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
