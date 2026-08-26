import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PatientOfflineQRModal } from '../components/PatientOfflineQRModal';
import { generateDetailedTextPatientReport } from '../utils/qrPayload';
import {
  ArrowLeft,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  Heart,
  Pill,
  Activity,
  AlertOctagon,
  FileCheck,
  Stethoscope,
  Share2,
  Ambulance,
  Radio,
  Clock,
  WifiOff,
  UserCheck,
  FileText,
  MessageSquareQuote,
  Zap,
  Info,
  Calendar,
  Syringe,
  Layers,
  QrCode,
  X,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
} from 'lucide-react';

export const EmergencyProfileScreen: React.FC = () => {
  const {
    role,
    patient,
    medications,
    reports,
    caregiverNotes,
    setActiveScreen,
    logAuditAccess,
    setNotificationBanner,
    speakText,
    stopSpeaking,
    isSpeaking,
    speakingNoteId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'triage' | 'meds' | 'labs' | 'notes'>('triage');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleClose = () => {
    stopSpeaking();
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopSpeaking();
    };
  }, []);

  // Filter patient's specific meds & reports
  const patientMeds = medications.filter(
    (m) => m.patientId === patient.id || m.patientId === 'patient_rahul_sharma'
  );
  const displayMeds = patientMeds.length > 0 ? patientMeds : medications;

  const patientReports = reports.filter(
    (r) => r.doctor?.includes(patient.primaryDoctor.name.split(' ')[1] || '') || true
  );

  const primaryContact = patient.emergencyContacts[0] || {
    name: 'Emergency Next of Kin',
    relationship: 'Primary ICE',
    phone: '+91 98765 43210',
  };

  const handleAlertDispatch = () => {
    logAuditAccess(
      'Emergency Dispatch Team',
      'First Responder / Paramedic',
      'Trauma Bay 1',
      `Triggered Emergency Code Red Dispatch for ${patient.name}`
    );
    setNotificationBanner({
      message: `Emergency Code Red dispatched for ${patient.name}. Relatives and Trauma Bay alerted.`,
      type: 'critical',
    });
  };

  const handleDownloadDossier = () => {
    const textReport = generateDetailedTextPatientReport(patient, displayMeds, patientReports, caregiverNotes);
    const element = document.createElement('a');
    const file = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Aeva_Emergency_Dossier_${patient.aevaId.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setNotificationBanner({
      message: 'Downloaded clinical emergency text dossier.',
      type: 'success',
    });
  };

  const handleCopyDossier = () => {
    const textReport = generateDetailedTextPatientReport(patient, displayMeds, patientReports, caregiverNotes);
    navigator.clipboard.writeText(textReport);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    setNotificationBanner({
      message: 'Emergency patient text report copied to clipboard.',
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 pt-3 px-3 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Top Emergency Red Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('scan_id')}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0"
              title="Back to Scanner"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 block flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                FIRST RESPONDER OVERRIDE ACCESS • GOLDEN HOUR
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight">
                Emergency Medical Profile
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors border border-white/30 cursor-pointer"
              title="View Offline Emergency QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Aeva QR</span>
            </button>

            {/* Direct Close Button (X) */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all hover:scale-105 border border-white/20 shrink-0 ml-1 cursor-pointer shadow-md"
              title="Close Profile (Esc)"
              aria-label="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Patient Basic Details Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {/* Initials Badge */}
              <div className="w-16 h-16 rounded-full bg-[#003882] text-white flex items-center justify-center font-black text-2xl tracking-tight shadow-md border-2 border-blue-100 shrink-0">
                {patient.initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {patient.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Age: <span className="text-slate-900 font-extrabold">{patient.age} yrs</span> • Gender: {patient.gender} • DOB: {patient.dob}
                </p>
                <div className="text-xs font-mono text-blue-900 font-bold mt-1 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Aeva ID: {patient.aevaId}
                </div>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300 uppercase">
              ABDM Verified
            </span>
          </div>

          {/* Primary ICE Contact Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${primaryContact.phone}`}
              className="bg-[#002D62] hover:bg-[#001D40] text-white font-extrabold py-3 px-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Call ICE ({primaryContact.relationship}): {primaryContact.phone}</span>
            </a>

            <button
              onClick={handleAlertDispatch}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Ambulance className="w-4 h-4 text-amber-300" />
              <span>Dispatch 108 ALS Unit</span>
            </button>
          </div>

          {/* Quick Dossier Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleDownloadDossier}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#002D62]" />
              <span>Download Dossier (.txt)</span>
            </button>
            <button
              onClick={handleCopyDossier}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedText ? 'Copied!' : 'Copy Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Critical Health Biomarkers (Blood, Organ Donor, Baseline BP) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Blood Group */}
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-3.5 text-center">
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              BLOOD GROUP
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight my-0.5">
              {patient.bloodGroup}
            </div>
            <div className="text-[9px] text-red-800 font-bold">
              National Blood Registry Verified
            </div>
          </div>

          {/* Organ Donor */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-3.5 text-center">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              ORGAN DONOR
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight my-0.5">
              {patient.organDonor ? 'Pledged Yes' : 'Not Pledged'}
            </div>
            <div className="text-[9px] text-blue-800 font-semibold">
              NOTTO Registered
            </div>
          </div>

          {/* Baseline BP */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-3.5 text-center">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              BASELINE BP
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight my-0.5">
              {patient.avgBp}
            </div>
            <div className="text-[9px] text-slate-600 font-semibold">
              Resting Baseline
            </div>
          </div>

          {/* Height & Weight */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-3.5 text-center">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              BMI & WEIGHT
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight my-0.5">
              {patient.bmi}
            </div>
            <div className="text-[9px] text-slate-600 font-semibold">
              {patient.weight} • {patient.height}
            </div>
          </div>
        </div>

        {/* Section 3: Severe Drug Allergies & Contraindications */}
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-black text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Severe Drug Allergies & Warnings</span>
            </div>
            <span className="bg-rose-200 text-rose-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              DO NOT ADMINISTER
            </span>
          </div>

          {patient.allergies.length === 0 ? (
            <div className="text-xs text-slate-500 font-semibold bg-white p-3 rounded-2xl">
              No known adverse drug allergies recorded (NKDA).
            </div>
          ) : (
            <div className="space-y-2">
              {patient.allergies.map((alg) => (
                <div
                  key={alg.id}
                  className="bg-white border border-red-200 rounded-2xl p-3 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="font-black text-slate-900 text-sm">{alg.name}</div>
                    {alg.reaction && (
                      <div className="text-xs text-rose-800 font-medium mt-0.5">
                        Reaction: {alg.reaction}
                      </div>
                    )}
                  </div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                    {alg.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs for In-depth Clinical Modules */}
        <div className="flex rounded-2xl bg-white p-1 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('triage')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'triage'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conditions
          </button>
          <button
            onClick={() => setActiveTab('meds')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'meds'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medications ({displayMeds.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'labs'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagnostic Labs ({patientReports.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voice Notes ({caregiverNotes.length})
          </button>
        </div>

        {/* Tab 1: Chronic Diagnosed Conditions */}
        {activeTab === 'triage' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <Activity className="w-5 h-5 text-[#002D62]" />
              <span>Chronic Diagnosed Conditions</span>
            </div>

            <div className="space-y-2">
              {patient.chronicConditions.map((cond) => (
                <div
                  key={cond.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-extrabold text-slate-900 block text-sm">{cond.name}</span>
                    <span className="text-slate-500 font-medium">Diagnosed: {cond.diagnosedSince || cond.diagnosedYear}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {cond.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Medications */}
        {activeTab === 'meds' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <Pill className="w-5 h-5 text-[#002D62]" />
              <span>Active Prescription Regimen</span>
            </div>

            <div className="space-y-2">
              {displayMeds.map((med) => (
                <div
                  key={med.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    med.isHighRisk
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {med.name} • {med.dosage}
                    </span>
                    <span className="text-slate-500 font-semibold">{med.form}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    Schedule: <strong>{med.frequency}</strong> ({med.foodInstruction})
                  </div>
                  {med.isHighRisk && (
                    <div className="text-[10px] text-rose-700 font-bold flex items-center gap-1 mt-1">
                      <AlertOctagon className="w-3 h-3" />
                      <span>HIGH RISK: Do not discontinue abruptly without cardiologist review</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostic Lab & Test Reports */}
        {activeTab === 'labs' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <FileCheck className="w-5 h-5 text-[#002D62]" />
              <span>Diagnostic Lab & Imaging Reports</span>
            </div>

            <div className="space-y-2.5">
              {patientReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{rep.title}</span>
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {rep.date}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold leading-relaxed">{rep.summary}</p>
                  {rep.doctorNotes && (
                    <div className="bg-blue-50 border-l-2 border-blue-600 p-2 rounded-r-lg text-[11px] text-blue-950 font-medium">
                      👨‍⚕️ <span className="font-bold">Doctor Finding:</span> {rep.doctorNotes}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-medium pt-1">
                    Issued by: {rep.doctor || 'Attending Physician'} • {rep.hospital}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Caregiver Notes & Voice Dictations */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <MessageSquareQuote className="w-5 h-5 text-[#002D62]" />
              <span>Caregiver & Attending Clinical Directives</span>
            </div>

            <div className="space-y-2.5">
              {caregiverNotes.map((note) => {
                const isThisSpeaking = isSpeaking && speakingNoteId === note.id;
                return (
                  <div
                    key={note.id}
                    className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-950">{note.author}</span>
                      <div className="flex items-center gap-2">
                        {note.hasAudio && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>🎙 {note.audioDuration || 'Audio'}</span>
                          </span>
                        )}
                        <span className="text-[10px] text-amber-800 font-bold">{note.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">"{note.text}"</p>

                    {/* Audio Playback Button for hands-free Doctor listen */}
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => {
                          if (isThisSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(note.text, note.id);
                          }
                        }}
                        className="text-[11px] font-bold text-[#002D62] hover:text-[#001D40] flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
                      >
                        {isThisSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span className="text-rose-700">Stop Listening</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Listen to Voice Note</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions Alert Card */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 text-xs text-amber-950 space-y-1 shadow-2xs">
          <div className="font-black text-sm flex items-center gap-1.5 text-amber-900">
            <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
            <span>EMERGENCY PROTOCOL & SPECIAL INSTRUCTIONS</span>
          </div>
          <p className="leading-relaxed font-semibold">
            "{patient.specialInstructions}"
          </p>
        </div>

        {/* Primary Doctor & Hospital Affiliation */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
              Primary Attending Physician
            </span>
            <span className="font-black text-slate-900 text-sm">
              {patient.primaryDoctor.name} ({patient.primaryDoctor.specialty})
            </span>
            <span className="text-slate-500 block text-[11px]">{patient.primaryDoctor.hospital}</span>
          </div>
          <a
            href={`tel:${patient.primaryDoctor.phone}`}
            className="bg-[#002D62] text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-[#001D40] flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Doctor</span>
          </a>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setActiveScreen('scan_id')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-3.5 px-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Scan Another ID</span>
          </button>
          <button
            onClick={() => setActiveScreen('doctor_dashboard')}
            className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-bold py-3.5 px-3 rounded-2xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Full Doctor EHR →</span>
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-3 rounded-2xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Emergency View</span>
          </button>
        </div>
      </div>

      {/* Offline QR Code Modal */}
      <PatientOfflineQRModal
        patient={patient}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};
