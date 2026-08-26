import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalReport, Medication, PatientProfile } from '../types';
import { PatientOfflineQRModal } from '../components/PatientOfflineQRModal';
import {
  Stethoscope,
  Building2,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Share2,
  Plus,
  Edit2,
  Calendar,
  Activity,
  Heart,
  ShieldCheck,
  User,
  ChevronRight,
  ExternalLink,
  Pill,
  Search,
  Users,
  Eye,
  X,
  Printer,
  Download,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ClipboardList,
  Phone,
  Mail,
  MapPin,
  Award,
  Star,
  UserCheck,
  Briefcase,
  QrCode,
  WifiOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

export const DoctorDashboardScreen: React.FC = () => {
  const {
    patient,
    patientsList,
    selectPatientById,
    selectPatientByAevaId,
    doctorsList,
    activeDoctor,
    selectDoctorById,
    medications,
    reports,
    medicalReports,
    caregiverAlerts,
    caregiverNotes,
    addCaregiverNote,
    addMedication,
    setActiveScreen,
    setEditingMedId,
    logAuditAccess,
    setNotificationBanner,
    updatePatientProfile,
    speakText,
    stopSpeaking,
    isSpeaking,
    speakingNoteId,
    triggerPortalTestAlert,
  } = useApp();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  // Selected patient search & switch state

  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState<'all' | 'assigned'>('all');
  const [selectedReportModal, setSelectedReportModal] = useState<MedicalReport | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showDoctorSwitcherModal, setShowDoctorSwitcherModal] = useState(false);
  const [qrModalPatient, setQrModalPatient] = useState<PatientProfile | null>(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('All');
  const [clinicalNoteInput, setClinicalNoteInput] = useState('');
  const [reportFilter, setReportFilter] = useState('All');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setClinicalNoteInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setNotificationBanner({
        message: 'Doctor voice dictation captured.',
        type: 'success',
      });
    } else {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          setIsRecording(true);
        }
      } else {
        setIsRecording(true);
        setTimeout(() => {
          setClinicalNoteInput((prev) =>
            prev
              ? `${prev} Patient reviewed. Advised low sodium diet and regular morning blood pressure logging.`
              : 'Patient reviewed in OPD. Vitals stable. Continue Telmisartan 40mg once daily.'
          );
        }, 1500);
      }
      setNotificationBanner({
        message: 'Microphone listening: Dictating doctor clinical evaluation note...',
        type: 'info',
      });
    }
  };

  // New vitals state
  const [newBp, setNewBp] = useState(patient.avgBp || '128/82 mmHg');
  const [newWeight, setNewWeight] = useState(patient.weight || '78 kg');
  const [newStatus, setNewStatus] = useState<'Stable' | 'Critical' | 'Observation'>(patient.status || 'Stable');

  // New prescription state
  const [prescName, setPrescName] = useState('');
  const [prescDosage, setPrescDosage] = useState('1 tablet (500mg)');
  const [prescForm, setPrescForm] = useState<'tablet' | 'capsule' | 'injection' | 'syrup' | 'inhaler'>('tablet');
  const [prescFreq, setPrescFreq] = useState<'Once daily' | 'Twice daily' | 'Thrice daily' | 'As needed'>('Once daily');
  const [prescFood, setPrescFood] = useState<'Before food' | 'With food' | 'After food'>('After food');
  const [prescNotes, setPrescNotes] = useState('');
  const [prescRisk, setPrescRisk] = useState(false);

  const activeReports = medicalReports || reports || [];

  const takenDoses = medications
    .flatMap((m) => m.scheduledTimes)
    .filter((st) => st.status === 'Taken').length;
  const totalDoses = medications.flatMap((m) => m.scheduledTimes).length;
  const adherenceRate = Math.round((takenDoses / Math.max(totalDoses, 1)) * 100);

  // Doctors filtering
  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      (doc.city || '').toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.registrationNumber.toLowerCase().includes(doctorSearchQuery.toLowerCase());

    const matchesSpecialty =
      doctorSpecialtyFilter === 'All' ||
      doc.specialty.toLowerCase().includes(doctorSpecialtyFilter.toLowerCase()) ||
      doc.department.toLowerCase().includes(doctorSpecialtyFilter.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  // Patients filtering based on assignment
  const assignedPatientIds = activeDoctor.assignedPatientIds || [];
  const displayedPatients =
    patientFilter === 'assigned' && assignedPatientIds.length > 0
      ? patientsList.filter((p) => assignedPatientIds.includes(p.id))
      : patientsList;

  const handleShareWithHospital = () => {
    logAuditAccess(
      `${activeDoctor.name} (EHR Portal)`,
      'Doctor',
      activeDoctor.hospital,
      `Exported Patient Comprehensive EHR for ${patient.name}`
    );
    setNotificationBanner({
      message: `EHR for ${patient.name} (Aeva ID: ${patient.aevaId}) securely exported under digital authorization of ${activeDoctor.name}.`,
      type: 'success',
    });
  };

  const handleAddClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNoteInput.trim()) return;

    const hadVoice = recordSeconds > 0 || isRecording;
    const durationStr = recordSeconds > 0 ? `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds}` : '0:28';

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    addCaregiverNote(
      `${activeDoctor.name} (${activeDoctor.specialty}): ${clinicalNoteInput.trim()}`,
      hadVoice,
      durationStr,
      'voice_dictation'
    );
    logAuditAccess(
      activeDoctor.name,
      activeDoctor.specialty,
      activeDoctor.hospital,
      `Added clinical evaluation note for ${patient.name}`
    );
    setClinicalNoteInput('');
    setRecordSeconds(0);
    setNotificationBanner({
      message: `Clinical note signed by ${activeDoctor.name} added to patient record.`,
      type: 'success',
    });
  };

  const handleUpdateVitals = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      avgBp: newBp,
      weight: newWeight,
      status: newStatus,
    });
    setShowVitalsModal(false);
    logAuditAccess(
      activeDoctor.name,
      activeDoctor.specialty,
      activeDoctor.hospital,
      `Updated vital biomarkers for ${patient.name} (BP: ${newBp}, Weight: ${newWeight})`
    );
  };

  const handlePrescribeMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescName.trim()) return;

    addMedication({
      name: prescName.trim(),
      dosage: prescDosage.trim(),
      form: prescForm,
      frequency: prescFreq,
      foodInstruction: prescFood,
      startDate: new Date().toISOString().split('T')[0],
      reminderEnabled: true,
      active: true,
      isHighRisk: prescRisk,
      notes: `${prescNotes.trim() ? prescNotes.trim() + ' • ' : ''}Prescribed by ${activeDoctor.name} (${activeDoctor.registrationNumber})`,
      scheduledTimes: [
        {
          id: `st_${Date.now()}`,
          time: '08:00 AM',
          period: 'Morning',
          label: prescFood,
          status: 'Upcoming',
        },
      ],
    });

    logAuditAccess(
      activeDoctor.name,
      'Attending Physician',
      activeDoctor.hospital,
      `Issued digital prescription for ${prescName} to ${patient.name}`
    );

    setShowPrescribeModal(false);
    setPrescName('');
    setPrescNotes('');
    setNotificationBanner({
      message: `New digital prescription for ${prescName} issued by ${activeDoctor.name}.`,
      type: 'success',
    });
  };

  const handlePatientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const success = selectPatientByAevaId(searchQuery.trim());
    if (!success) {
      const match = patientsList.find((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      if (match) {
        selectPatientById(match.id);
      } else {
        setNotificationBanner({
          message: `No patient found matching "${searchQuery}". Try an Aeva ID like AEVA-1234-5678-9012 or "Rahul".`,
          type: 'warning',
        });
      }
    }
  };

  const filteredReports =
    reportFilter === 'All'
      ? activeReports
      : activeReports.filter(
          (r) => r.category === reportFilter || r.type?.toLowerCase().includes(reportFilter.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-slate-100 pb-28 pt-3 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Doctor Banner */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${activeDoctor.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-md border-2 border-indigo-100 shrink-0`}>
              {activeDoctor.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeDoctor.name}
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-indigo-600" />
                  <span>Reg: {activeDoctor.registrationNumber}</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeDoctor.experienceYears}+ Yrs
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-indigo-900 font-bold">{activeDoctor.specialty}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  {activeDoctor.hospital}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {activeDoctor.opdTimings}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Doctor Switcher */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              onClick={() => triggerPortalTestAlert('doctor')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 cursor-pointer"
              title="Test real-time clinical panic value alert popup"
            >
              <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Test Live Alert</span>
            </button>

            <button
              onClick={() => setShowDoctorSwitcherModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-2.5 sm:px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 col-span-2 sm:col-span-1"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch Doctor ({doctorsList.length})</span>
            </button>

            <button
              onClick={() => setShowPrescribeModal(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 sm:px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
            >
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Rx</span>
            </button>

            <button
              onClick={() => setShowVitalsModal(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2.5 sm:px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Record Vitals</span>
            </button>

            <button
              onClick={handleShareWithHospital}
              className="bg-[#002D62] hover:bg-[#001D40] text-white font-bold px-2.5 sm:px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs col-span-2 sm:col-span-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export Record</span>
            </button>
          </div>
        </div>

        {/* Patient Selection & Quick Search Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Patients
                </span>
              </div>

              {/* Assignment Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  onClick={() => setPatientFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    patientFilter === 'all'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({patientsList.length})
                </button>
                <button
                  onClick={() => setPatientFilter('assigned')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    patientFilter === 'assigned'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Assigned ({assignedPatientIds.length})
                </button>
              </div>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={handlePatientSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Lookup Aeva ID / Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 w-full sm:w-60 font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Find
              </button>
            </form>
          </div>

          {/* Quick Select Patient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
            {displayedPatients.map((p) => {
              const isSelected = p.id === patient.id;
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectPatientById(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectPatientById(p.id);
                    }
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs block text-slate-900 truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-mono">
                        {p.aevaId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                        p.status === 'Stable'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrModalPatient(p);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                      title={`View Offline Emergency QR for ${p.name}`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Patient Diagnostic Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#003882] text-white flex items-center justify-center font-black text-base sm:text-xl shadow-sm shrink-0">
              {patient.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {patient.name}
                </h2>
                <span className="bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md">
                  Age {patient.age} • {patient.gender}
                </span>
                <span className="bg-red-100 text-rose-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  Blood: {patient.bloodGroup}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono font-medium mt-0.5">
                Universal Aeva ID: <strong>{patient.aevaId}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setQrModalPatient(patient)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 border border-emerald-300 transition-colors shadow-2xs"
            >
              <WifiOff className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Offline QR</span>
            </button>
            <button
              onClick={() => setActiveScreen('emergency_profile')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 border border-rose-200 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Emergency</span>
            </button>
            <button
              onClick={() => setActiveScreen('audit_logs')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 border border-slate-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Audit</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Vitals, Adherence & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Clinical Vitals & Biomarkers</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">Last Sync: Today, 11:30 AM</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-semibold block">Blood Pressure</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {patient.avgBp || '128/82'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-semibold block">HbA1c Target</span>
                  <span className="text-xl font-black text-blue-700 tracking-tight">6.8%</span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Under Control</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-semibold block">Fasting Glucose</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">118</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">mg/dL (Normal)</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-semibold block">BMI / Weight</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {patient.bmi || '25.5'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                    {patient.weight} ({patient.height})
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Adherence & Medication Schedule */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Medication Regimen & Adherence Rate</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {adherenceRate}% Compliance
                </span>
              </div>

              {/* Progress Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-emerald-700">{takenDoses}</div>
                  <div className="text-xs font-bold text-emerald-900">Doses Taken</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-blue-700">
                    {Math.max(0, totalDoses - takenDoses)}
                  </div>
                  <div className="text-xs font-bold text-blue-900">Upcoming</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-slate-700">0</div>
                  <div className="text-xs font-bold text-slate-600">Missed Doses</div>
                </div>
              </div>

              {/* Prescribed Medications List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Active Regimen ({medications.length})
                  </span>
                  <button
                    onClick={() => {
                      setEditingMedId(null);
                      setActiveScreen('add_medicine');
                    }}
                    className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Prescribe New</span>
                  </button>
                </div>

                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {m.name}
                          </span>
                          {m.isHighRisk && (
                            <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                              High Risk
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">
                          {m.dosage} • {m.frequency} ({m.foodInstruction})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                          m.scheduledTimes[0]?.status === 'Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {m.scheduledTimes[0]?.status === 'Taken'
                          ? `✓ Taken (${m.scheduledTimes[0]?.time})`
                          : `⏰ ${m.scheduledTimes[0]?.time || 'Scheduled'}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Reports & Clinical Documents */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Medical Reports & Lab History</span>
                </h3>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['All', 'Lab Test', 'Imaging', 'Prescription'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setReportFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        reportFilter === cat
                          ? 'bg-[#002D62] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{rep.title}</span>
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          {rep.category || rep.type || 'Lab Test'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-snug">{rep.summary}</p>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {rep.date} • {rep.hospital} • {rep.doctor || 'Attending Physician'}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReportModal(rep)}
                      className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-700" />
                      <span>View PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Clinical Allergies, Observations & Notes */}
          <div className="space-y-6">
            {/* Critical Allergies & Surgical History */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Critical Clinical Warnings</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Severe Drug Allergies
                  </span>
                  <div className="space-y-1.5">
                    {patient.allergies.map((alg) => (
                      <div
                        key={alg.id}
                        className="bg-red-50 border border-red-200 text-rose-900 p-2.5 rounded-xl font-bold flex items-start justify-between"
                      >
                        <div>
                          <span>⚠ {alg.name}</span>
                          {alg.reaction && (
                            <span className="text-[10px] text-rose-700 font-normal block">
                              Reaction: {alg.reaction}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase bg-red-100 text-rose-800 px-2 py-0.5 rounded-full">
                          {alg.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Chronic Diagnoses
                  </span>
                  <div className="space-y-1">
                    {patient.chronicConditions.map((cond) => (
                      <div
                        key={cond.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">{cond.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {cond.diagnosedSince || cond.diagnosedYear || 'Documented'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Past Surgical History
                  </span>
                  <div className="space-y-1.5">
                    {patient.pastSurgeries.map((surg) => (
                      <div key={surg.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-800">
                          {surg.procedure} ({surg.date})
                        </div>
                        <div className="text-[11px] text-slate-500">{surg.hospital}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Clinical Notes Composer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <span>Doctor Consultation Notes</span>
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  Voice-to-Text & Audio
                </span>
              </div>

              <form onSubmit={handleAddClinicalNote} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={clinicalNoteInput}
                    onChange={(e) => setClinicalNoteInput(e.target.value)}
                    placeholder="Type or click the microphone to dictate clinical observations, titration advice, or referral notes..."
                    className="w-full p-3 pr-12 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`absolute right-2.5 top-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                {isRecording && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      Recording Doctor Memo (0:{recordSeconds < 10 ? '0' : ''}{recordSeconds})...
                    </span>
                    <button type="button" onClick={toggleRecording} className="underline text-rose-900">
                      Done
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isRecording ? 'Stop Dictating' : 'Voice Dictate'}</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Previous Notes Log with Hands-Free Audio Playback for Busy Doctors */}
              <div className="space-y-2.5 pt-2 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {caregiverNotes.map((note) => {
                  const isThisSpeaking = isSpeaking && speakingNoteId === note.id;
                  return (
                    <div key={note.id} className="pt-2 first:pt-0 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-800">{note.author}</span>
                        <div className="flex items-center gap-1.5">
                          {note.hasAudio && (
                            <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded text-[9px] flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5 text-rose-600" />
                              <span>{note.audioDuration || 'Audio'}</span>
                            </span>
                          )}
                          <span>{note.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-snug">{note.text}</p>

                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => {
                            if (isThisSpeaking) {
                              stopSpeaking();
                            } else {
                              speakText(note.text, note.id);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          {isThisSpeaking ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-600 animate-pulse" />
                              <span className="text-rose-700">Stop Listening</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-indigo-600" />
                              <span>Listen to Voice Memo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 Interactive Clinical Document / PDF Viewer Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {selectedReportModal.category || 'Clinical Document'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Verified Digital Record
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedReportModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">PATIENT</span>
                <span className="font-bold text-slate-800">{patient.name} ({patient.aevaId})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE & FACILITY</span>
                <span className="font-bold text-slate-800">{selectedReportModal.date}</span>
                <div className="text-[10px] text-slate-500">{selectedReportModal.hospital}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PHYSICIAN</span>
                <span className="font-bold text-slate-800">{selectedReportModal.doctor || 'Dr. Rajesh Kumar'}</span>
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Diagnostic Findings & Parameters
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed">
                {selectedReportModal.summary}
              </div>
            </div>

            {/* Doctor Verification Notes */}
            {selectedReportModal.doctorNotes && (
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-indigo-900">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Attending Physician Clinical Notes</span>
                </div>
                <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200 text-indigo-950 font-medium">
                  "{selectedReportModal.doctorNotes}"
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Signed via Aeva National Health Gateway</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNotificationBanner({
                      message: `Downloading PDF: ${selectedReportModal.title}...`,
                      type: 'success',
                    });
                    setSelectedReportModal(null);
                  }}
                  className="bg-[#002D62] hover:bg-[#001D40] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🩺 Record Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Record Patient Vitals ({patient.name})</span>
              </h3>
              <button
                onClick={() => setShowVitalsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateVitals} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={newBp}
                  onChange={(e) => setNewBp(e.target.value)}
                  placeholder="e.g. 128/82 mmHg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Weight (kg)</label>
                <input
                  type="text"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="e.g. 78 kg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Stable">Stable</option>
                  <option value="Observation">Observation</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Save Biomarkers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💊 Digital Prescription Modal */}
      {showPrescribeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Digital Prescription Module
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <span>Prescribe for {patient.name} ({patient.aevaId})</span>
                </h3>
              </div>
              <button
                onClick={() => setShowPrescribeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePrescribeMedication} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medication Name & Strength *</label>
                <input
                  type="text"
                  required
                  value={prescName}
                  onChange={(e) => setPrescName(e.target.value)}
                  placeholder="e.g. Telmisartan 40 mg or Glimepiride 2 mg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
                  <select
                    value={prescForm}
                    onChange={(e) => setPrescForm(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="injection">Injection</option>
                    <option value="syrup">Syrup</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage Units</label>
                  <input
                    type="text"
                    value={prescDosage}
                    onChange={(e) => setPrescDosage(e.target.value)}
                    placeholder="e.g. 1 tablet (40mg)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={prescFreq}
                    onChange={(e) => setPrescFreq(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="As needed">As needed (SOS)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Food Timing</label>
                  <select
                    value={prescFood}
                    onChange={(e) => setPrescFood(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="After food">After food</option>
                    <option value="Before food">Before food</option>
                    <option value="With food">With food</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Instructions / Purpose</label>
                <input
                  type="text"
                  value={prescNotes}
                  onChange={(e) => setPrescNotes(e.target.value)}
                  placeholder="e.g. For arterial hypertension; check BP weekly"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">High-Risk Drug Warning</span>
                  <span className="text-[10px] text-amber-700">Flag for strict caregiver alert & adherence monitoring</span>
                </div>
                <input
                  type="checkbox"
                  checked={prescRisk}
                  onChange={(e) => setPrescRisk(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
              </div>

              {/* Digital Practitioner Signature */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-2.5 text-[11px] text-indigo-950">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold block">Digital Practitioner Signature:</span>
                  <span className="text-slate-600">
                    {activeDoctor.name}, {activeDoctor.degrees} • {activeDoctor.hospital} (NMC: {activeDoctor.registrationNumber})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrescribeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Issue Digital Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👨‍⚕️ Multi-Doctor Switcher & National Clinical Faculty Directory Modal */}
      {showDoctorSwitcherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    National Medical Registry
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {doctorsList.length} Verified Specialist Doctors Available
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  <span>Clinical Specialists & Doctor Directory</span>
                </h3>
              </div>
              <button
                onClick={() => setShowDoctorSwitcherModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Specialty Filter Bar */}
            <div className="space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  placeholder="Search by doctor name, specialty, hospital, city, or NMC registration number..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Specialty Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  'All',
                  'Medicine',
                  'Cardiology',
                  'Pulmonology',
                  'Diabetology',
                  'Pediatrics',
                  'Neurology',
                  'Surgery',
                  'Nephrology',
                  'Oncology',
                  'Gynecology',
                  'Orthopedics',
                  'Hepatology',
                  'Radiology',
                  'Urology',
                ].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setDoctorSpecialtyFilter(spec)}
                    className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] ${
                      doctorSpecialtyFilter === spec
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="overflow-y-auto space-y-3 pr-1 grow">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No doctors found matching "{doctorSearchQuery}". Try clearing filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredDoctors.map((doc) => {
                    const isActive = doc.id === activeDoctor.id;
                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200 shadow-sm'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-full ${
                                  doc.avatarColor || 'bg-indigo-600'
                                } text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}
                              >
                                {doc.initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-slate-900">
                                    {doc.name}
                                  </h4>
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    {doc.rating || 4.9}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold text-indigo-700 block">
                                  {doc.specialty}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {doc.degrees}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full shrink-0">
                              {doc.experienceYears} Yrs Exp
                            </span>
                          </div>

                          <div className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="font-medium truncate">{doc.hospital}, {doc.city}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px]">{doc.opdTimings}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="font-mono text-[10px] text-emerald-800 font-bold">
                                Reg: {doc.registrationNumber}
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-relaxed mt-2 line-clamp-2 italic">
                            "{doc.bio}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                          <div className="text-[10px] text-slate-500">
                            Fee: <strong className="text-slate-800">{doc.consultationFee || '₹1,500'}</strong> • Assigned: <strong className="text-indigo-800">{doc.assignedPatientIds.length} patients</strong>
                          </div>

                          {isActive ? (
                            <span className="bg-emerald-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active Practitioner</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                selectDoctorById(doc.id);
                                setShowDoctorSwitcherModal(false);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Switch to Doctor</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Directory Footer Info */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All practitioners verified via National Medical Commission (NMC / MCI)</span>
              </span>
              <button
                onClick={() => setShowDoctorSwitcherModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-1.5 rounded-xl transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Offline Emergency QR Modal */}
      {qrModalPatient && (
        <PatientOfflineQRModal
          patient={qrModalPatient}
          isOpen={!!qrModalPatient}
          onClose={() => setQrModalPatient(null)}
        />
      )}
    </div>
  );
};
