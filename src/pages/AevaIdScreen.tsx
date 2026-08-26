import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { generateOfflineQRPayload, generateDetailedTextPatientReport } from '../utils/qrPayload';
import {
  ShieldCheck,
  QrCode,
  Download,
  Copy,
  Check,
  FileText,
  Heart,
  AlertTriangle,
  Pill,
  User,
  Phone,
  Stethoscope,
  Activity,
  Share2,
  Lock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode2,
} from 'lucide-react';

export const AevaIdScreen: React.FC = () => {
  const { patient, medications, reports, caregiverNotes, setNotificationBanner } = useApp();

  const [copiedText, setCopiedText] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showFullDossier, setShowFullDossier] = useState(false);

  // Single unified QR payload
  const unifiedPayload = generateOfflineQRPayload(patient, medications, reports, caregiverNotes);
  const textPatientReport = generateDetailedTextPatientReport(patient, medications, reports, caregiverNotes);

  const handleCopyTextReport = () => {
    navigator.clipboard.writeText(textPatientReport);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
    setNotificationBanner({
      message: 'Organized Patient Dossier text copied to clipboard.',
      type: 'success',
    });
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(unifiedPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
    setNotificationBanner({
      message: 'Unified Aeva QR Code string payload copied.',
      type: 'success',
    });
  };

  const handleDownloadTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([textPatientReport], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Aeva_Health_Dossier_${patient.aevaId.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setNotificationBanner({
      message: `Downloaded Aeva_Health_Dossier_${patient.aevaId.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#002D62] via-[#003882] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>OFFLINE & ONLINE UNIFIED HEALTH BADGE</span>
              </span>
              <span className="bg-white/15 text-blue-100 text-xs font-bold px-3 py-1 rounded-full">
                ABDM Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Aeva ID Universal Digital Health Card
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium">
              Single unified QR code providing instant offline emergency triage info and full clinical history across all healthcare networks.
            </p>
          </div>
        </div>

        {/* The Universal Aeva ID Card & QR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left QR Section */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 relative group">
                <QRCodeDisplay
                  value={unifiedPayload}
                  size={200}
                  showCorners={true}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                    Universal Single QR
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#002D62]" />
                  <span>Scan in Offline & Online Mode</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Decodes in 0ms without internet. Yields emergency blood group, allergies, medications, and contact dossiers.
                </p>
              </div>

              <button
                onClick={handleCopyPayload}
                className="w-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'QR Payload Copied' : 'Copy QR Payload String'}</span>
              </button>
            </div>

            {/* Right Card Demographics Section */}
            <div className="md:col-span-7 space-y-4">
              {/* Virtual Badge Preview */}
              <div className="bg-gradient-to-br from-[#002D62] to-[#001D40] text-white p-6 rounded-2xl shadow-lg space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">NATIONAL HEALTH IDENTIFIER</div>
                    <div className="text-xl font-extrabold tracking-tight">{patient.name}</div>
                  </div>
                  <div className="bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                    {patient.bloodGroup}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">AEVA ID NUMBER</div>
                  <div className="text-lg sm:text-xl font-mono font-black tracking-wider text-emerald-300">
                    {patient.aevaId}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-white/15 pt-3">
                  <div>
                    <div className="text-[10px] text-blue-200">Age / Gender</div>
                    <div className="font-bold">{patient.age} Y / {patient.gender}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-200">Baseline BP</div>
                    <div className="font-bold">{patient.avgBp || '120/80'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-200">Organ Donor</div>
                    <div className="font-bold">{patient.organDonor ? 'YES (Registered)' : 'No'}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Text Report */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadTextFile}
                  className="bg-[#002D62] hover:bg-[#001D40] text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99]"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Dossier (.txt)</span>
                </button>

                <button
                  onClick={handleCopyTextReport}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copiedText ? 'Dossier Text Copied!' : 'Copy Text Dossier'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Formatted Text Report Preview */}
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => setShowFullDossier(!showFullDossier)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800">
                <FileCode2 className="w-4 h-4 text-[#002D62]" />
                <span>View Organized Plain-Text Clinical Patient Report</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                <span>{showFullDossier ? 'Hide Text Dossier' : 'Show Text Dossier'}</span>
                {showFullDossier ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFullDossier && (
              <div className="mt-3 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                  <span>UNIFIED AEVA PATIENT DOSSIER (STANDARDIZED TEXT FORMAT)</span>
                  <button
                    onClick={handleCopyTextReport}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{textPatientReport}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Offline vs Online Scanning Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Offline Triage Mode</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When first responders or paramedics scan this single QR in low connectivity zones, the camera instantly decodes ABO/Rh blood group, anaphylaxis allergies, mechanical implants, and ICE emergency contacts directly from the high-density payload.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Online EHR Sync Mode</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When connected hospitals or physicians scan this QR, the Aeva ID automatically queries the ABDM health exchange to fetch full diagnostic lab reports, operative surgical summaries, and caregiver voice mail dictations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
