import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { decodeOfflineQRPayload, generateDetailedTextPatientReport } from '../utils/qrPayload';
import { PatientProfile } from '../types';
import {
  Scan,
  CreditCard,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  Zap,
  Activity,
  Heart,
  Users,
  Camera,
  Upload,
  RefreshCw,
  X,
  ArrowLeft,
  Lock,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Download,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

export const ScanIdScreen: React.FC = () => {
  const {
    role,
    patient,
    patientsList,
    medications,
    reports,
    caregiverNotes,
    selectPatientById,
    verifyAevaId,
    setActiveScreen,
    setActiveAevaIdForEmergency,
    logAuditAccess,
    setNotificationBanner,
  } = useApp();

  const [inputAevaId, setInputAevaId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('Point camera at patient’s Aeva QR card or upload image.');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasDecodedRef = useRef(false);

  const handleDownloadTxt = (targetPatient: PatientProfile = patient) => {
    const textReport = generateDetailedTextPatientReport(
      targetPatient,
      medications.filter((m) => m.patientId === targetPatient.id),
      reports,
      caregiverNotes
    );
    const element = document.createElement('a');
    const file = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Aeva_Emergency_Dossier_${targetPatient.aevaId.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setNotificationBanner({
      message: `Downloaded emergency .txt dossier for ${targetPatient.name}.`,
      type: 'success',
    });
  };

  const handleCopyTxt = (targetPatient: PatientProfile = patient) => {
    const textReport = generateDetailedTextPatientReport(
      targetPatient,
      medications.filter((m) => m.patientId === targetPatient.id),
      reports,
      caregiverNotes
    );
    navigator.clipboard.writeText(textReport);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);

    setNotificationBanner({
      message: `Emergency text dossier for ${targetPatient.name} copied to clipboard.`,
      type: 'success',
    });
  };

  const handleClose = () => {
    stopCamera();
    if (role === 'doctor') {
      setActiveScreen('doctor_dashboard');
    } else if (role === 'caregiver') {
      setActiveScreen('family');
    } else {
      setActiveScreen('home');
    }
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
  }, [role]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setScanStatus('Initializing high-speed optical camera...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
          setScanStatus('Scanning optical feed for Aeva QR cards...');
          scanVideoFrame();
        }
      } else {
        setCameraError('Camera API is not supported on this browser/device.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        'Camera access was denied or is unavailable. You can upload a QR image or enter the 12-digit Aeva ID below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Optical scanning loop
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data && !hasDecodedRef.current) {
        handleDetectedQR(code.data);
        return;
      }
    }

    if (!hasDecodedRef.current) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5 beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext might be muted
    }
  };

  const handleDetectedQR = (rawScanData: string) => {
    if (hasDecodedRef.current) return;
    hasDecodedRef.current = true;
    setIsScanning(true);
    setDetectedCode(rawScanData);
    setScanStatus('QR code detected! Decoding emergency profile...');
    playBeep();

    setTimeout(() => {
      setErrorMsg('');
      const clean = rawScanData.replace(/[\s-]/g, '');

      // 1. Try decoding as offline self-contained Aeva QR payload
      const decodedOffline = decodeOfflineQRPayload(rawScanData);
      if (decodedOffline) {
        // Check if patient exists in database or match by Aeva ID
        const matched = patientsList.find(
          (p) =>
            p.aevaId.replace(/[\s-]/g, '') === decodedOffline.aevaId.replace(/[\s-]/g, '') ||
            p.name.toLowerCase() === decodedOffline.name.toLowerCase()
        );

        if (matched) {
          selectPatientById(matched.id);
          setActiveAevaIdForEmergency(matched.aevaId);
        } else {
          setActiveAevaIdForEmergency(decodedOffline.aevaId);
        }

        logAuditAccess(
          'Hardware Camera Scanner (First Responder)',
          'Emergency Paramedic / Trauma Triage',
          'Field Trauma Unit',
          `Decoded offline emergency QR for ${decodedOffline.name} (Aeva ID: ${decodedOffline.aevaId})`
        );

        setNotificationBanner({
          message: `⚡ Successfully decoded emergency record for ${decodedOffline.name} (${decodedOffline.bloodGroup})!`,
          type: 'critical',
        });

        stopCamera();
        setActiveScreen('emergency_profile');
        return;
      }

      // 2. Match by 12-digit Aeva ID in database
      const idMatches = rawScanData.match(/\d{12}/) || [clean];
      const extractedId = idMatches[0];

      const matchedPatient = patientsList.find(
        (p) =>
          p.aevaId.replace(/[\s-]/g, '') === extractedId ||
          p.patientIdNumber.replace(/[\s-]/g, '') === extractedId ||
          rawScanData.includes(p.aevaId.replace(/\s+/g, ''))
      );

      if (matchedPatient) {
        selectPatientById(matchedPatient.id);
        setActiveAevaIdForEmergency(matchedPatient.aevaId);
        logAuditAccess(
          'Hardware Camera Scanner (Hospital Gateway)',
          'Emergency ER Staff',
          'Trauma Bay 1',
          `Aeva ID Verified for ${matchedPatient.name}`
        );
        setNotificationBanner({
          message: `Verified Aeva ID for ${matchedPatient.name}. Emergency Access Authorized.`,
          type: 'critical',
        });
        stopCamera();
        setActiveScreen('emergency_profile');
        return;
      }

      // 3. Valid 12-digit fallback
      if (extractedId && extractedId.length === 12) {
        const formatted = `${extractedId.slice(0, 4)} ${extractedId.slice(4, 8)} ${extractedId.slice(8, 12)}`;
        setActiveAevaIdForEmergency(formatted);
        setNotificationBanner({
          message: `Emergency Access Authorized for Aeva ID: ${formatted}`,
          type: 'critical',
        });
        logAuditAccess(
          'Hardware Optical Scanner',
          'First Responder',
          'Emergency Triage Unit',
          `Authorized scan for Aeva ID: ${formatted}`
        );
        stopCamera();
        setActiveScreen('emergency_profile');
      } else {
        setIsScanning(false);
        hasDecodedRef.current = false;
        setScanStatus('QR recognized but unverified. Try again or enter Aeva ID below.');
        if (cameraActive) scanVideoFrame();
      }
    }, 600);
  };

  const handleVerify = (idToVerify: string) => {
    setErrorMsg('');
    const isValid = verifyAevaId(idToVerify);
    if (!isValid) {
      setErrorMsg('Invalid 12-digit Aeva ID. Please enter a valid registered ID.');
      return;
    }

    setActiveAevaIdForEmergency(idToVerify);
    const matched = patientsList.find((p) => p.aevaId.replace(/\s+/g, '') === idToVerify.replace(/\s+/g, ''));
    if (matched) {
      selectPatientById(matched.id);
    }

    logAuditAccess(
      'Manual Scanner Keyboard Interface',
      'Emergency First Responder',
      'Apollo ER Unit 1',
      `Manual ID verification for ${matched ? matched.name : 'Patient'} (Aeva ID: ${idToVerify})`
    );

    setNotificationBanner({
      message: `Emergency Medical Profile unlocked for Aeva ID: ${idToVerify}`,
      type: 'critical',
    });

    stopCamera();
    setActiveScreen('emergency_profile');
  };

  // Image Upload QR decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus('Reading QR code from uploaded image...');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsScanning(false);
          setErrorMsg('Failed to process image context.');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          hasDecodedRef.current = false;
          handleVerify(code.data);
        } else {
          setIsScanning(false);
          setErrorMsg('No QR code detected in the uploaded image. Please ensure the QR code is clearly visible and well-lit.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateScanPatient = (p: (typeof patientsList)[0]) => {
    setIsScanning(true);
    setInputAevaId(p.aevaId);
    setScanStatus(`Simulating scan for ${p.name}...`);
    setTimeout(() => {
      hasDecodedRef.current = false;
      handleVerify(p.aevaId);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden pb-20 md:pb-0">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <div className="pt-4 px-4 sm:px-6 flex items-center justify-between z-20">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
          title="Back (Esc)"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 justify-center">
            <Scan className="w-4 h-4 text-emerald-400" />
            <span>Hardware Aeva ID Scanner</span>
          </h1>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <WifiOff className="w-3 h-3" />
            <span>100% Offline Optical Decoder</span>
          </span>
        </div>

        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
          title="Close (Esc)"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 z-10 relative">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 max-w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex items-center justify-center">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            muted
            playsInline
          />

          {/* Hidden Canvas for QR parsing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Fallback View when Camera is Inactive or Denied */}
          {!cameraActive && (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-xs text-slate-300 font-medium px-2 leading-relaxed">
                {cameraError || 'Camera inactive. Click to activate or upload a photo of the Aeva QR code.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={startCamera}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Optical Target Finder Overlay */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            </div>

            {/* Glowing Laser Scan Bar */}
            <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />

            <div className="flex justify-between">
              <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
            </div>
          </div>

          {/* Decoding Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-30">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-black text-emerald-300 animate-pulse">
                Decrypting Aeva Health Record...
              </span>
            </div>
          )}
        </div>

        {/* Live Status Feedback Pill */}
        <div className="mt-4 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full text-xs font-semibold text-slate-300 flex items-center gap-2 max-w-sm text-center shadow-lg">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{scanStatus}</span>
        </div>

        {/* Quick Demo Patients Dropdown Selector & TXT Export Actions */}
        <div className="mt-4 w-full max-w-md space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Simulate Scan via Demo Dropdown</span>
            </span>
            <span className="text-emerald-400 font-semibold">{patientsList.length} Profiles</span>
          </div>

          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => {
                const found = patientsList.find(p => p.id === e.target.value);
                if (found) {
                  handleSimulateScanPatient(found);
                }
              }}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold rounded-xl focus:outline-hidden focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Choose Demo Patient to Simulate Optical Scan --
              </option>
              {patientsList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} ({p.bloodGroup}) — {p.chronicConditions[0]?.name || 'Standard'} • {p.age}y
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick TXT & Text Export Bar */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDownloadTxt(patient)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Download plain text emergency summary"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .TXT Report</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyTxt(patient)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Copy patient emergency text"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy Patient Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Manual Entry Drawer */}
      <div className="bg-white text-slate-900 rounded-t-3xl p-4 sm:p-6 shadow-2xl z-20">
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-2.5" />

        <div className="max-w-md mx-auto space-y-3">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Manual 12-Digit Aeva ID Entry
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Type the patient's Universal Aeva ID or select an instant patient above.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Box */}
          <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden focus-within:border-[#002D62] bg-slate-50 transition-all">
            <div className="px-3.5 py-3 text-slate-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#002D62]" />
            </div>
            <input
              type="text"
              value={inputAevaId}
              onChange={(e) => setInputAevaId(e.target.value)}
              placeholder="AEVA-1234-5678-9012"
              className="w-full px-2 py-2.5 text-slate-900 font-black font-mono tracking-wider text-base sm:text-lg focus:outline-hidden bg-transparent"
            />
          </div>

          {/* Verify ID Button */}
          <button
            onClick={() => handleVerify(inputAevaId)}
            className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-extrabold py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify & Open Emergency Health Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
