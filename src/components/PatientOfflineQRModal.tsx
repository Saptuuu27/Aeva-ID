import React, { useState, useEffect } from 'react';
import { PatientProfile } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { generateOfflineQRPayload } from '../utils/qrPayload';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  WifiOff,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Pill,
  Phone,
  Building2,
  Sparkles,
  QrCode,
  Scan,
} from 'lucide-react';

interface PatientOfflineQRModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientOfflineQRModal: React.FC<PatientOfflineQRModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const { medications, reports, caregiverNotes, setActiveScreen, setActiveAevaIdForEmergency, setNotificationBanner } = useApp();
  const [copied, setCopied] = useState(false);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const offlinePayload = generateOfflineQRPayload(
    patient,
    patient.medicationsList || medications,
    patient.records || reports,
    patient.caregiverNotesList || caregiverNotes
  );

  const handleDownloadQR = () => {
    const canvas = document.querySelector('.offline-qr-canvas canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `Aeva-Offline-ID-${patient.name.replace(/\s+/g, '_')}-${patient.aevaId.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setNotificationBanner({
        message: `Offline QR Code for ${patient.name} downloaded successfully.`,
        type: 'success',
      });
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(offlinePayload);
    setCopied(true);
    setNotificationBanner({
      message: `Offline clinical payload for ${patient.name} copied to clipboard.`,
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestScan = () => {
    setActiveAevaIdForEmergency(patient.aevaId);
    setActiveScreen('emergency_profile');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#002D62] text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
              {patient.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300">
                  <WifiOff className="w-3 h-3 text-emerald-600" />
                  <span>100% Offline Self-Contained QR</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {patient.patientIdNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {patient.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Blood: <strong className="text-rose-600 font-black">{patient.bloodGroup}</strong> • Age: {patient.age}y ({patient.gender}) • BP: {patient.avgBp}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl p-4 text-center border border-slate-200 space-y-3">
          <div className="offline-qr-canvas inline-block bg-white p-2 rounded-2xl shadow-xs border border-slate-200/80">
            <QRCodeDisplay
              value={offlinePayload}
              size={210}
              showCorners={true}
              className="border-none shadow-none p-1"
            />
          </div>

          <div>
            <div className="font-mono text-xl sm:text-2xl font-black tracking-wider text-[#002D62]">
              {patient.aevaId}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Scannable by ambulance dispatchers, triage nurses & ER doctors with <strong>zero internet</strong>.
            </p>
          </div>

          {/* Offline Data Guarantees */}
          <div className="grid grid-cols-2 gap-2 text-left text-[11px]">
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700 font-bold truncate">Allergies & Reactions</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-slate-700 font-bold truncate">High-Risk Meds</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700 font-bold truncate">ICE Contact Phone</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-slate-700 font-bold truncate">Attending Doctor</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={handleDownloadQR}
            className="bg-[#002D62] hover:bg-[#001D40] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleTestScan}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Scan className="w-4 h-4" />
            <span>Simulate ER Scan</span>
          </button>

          <button
            onClick={handleCopyPayload}
            className="col-span-2 sm:col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>

        {/* Technical Offline Payload Inspector toggle */}
        <div className="pt-1 border-t border-slate-100">
          <button
            onClick={() => setShowPayloadDetails(!showPayloadDetails)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between w-full p-1 cursor-pointer"
          >
            <span>Inspect Aeva:3 Offline String Payload</span>
            <span>{showPayloadDetails ? '▲ Hide' : '▼ View Payload'}</span>
          </button>

          {showPayloadDetails && (
            <div className="mt-2 p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 break-all select-all">
              {offlinePayload}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
