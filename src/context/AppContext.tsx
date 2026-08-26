import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PatientProfile,
  Medication,
  MedicalReport,
  AuditLog,
  CaregiverAlert,
  CaregiverNote,
  SOSAlert,
  UserRole,
  ConsentPreferences,
  DoctorProfile,
  HospitalProfile,
  TriageAdmissionRecord,
  HospitalBed,
  InboundAmbulance,
  OperationTheater,
  BloodInventoryItem,
  OxygenSupplyMetrics,
  CaregiverRegistrationData,
  DoctorRegistrationData,
  HospitalRegistrationData,
  EmergencyStaffRegistrationData,
  RealtimePortalAlert,
} from '../types';
import {
  INITIAL_PATIENT,
  SAMPLE_PATIENTS,
  INITIAL_MEDICATIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CAREGIVER_ALERTS,
  INITIAL_CAREGIVER_NOTES,
  DOCTORS_DIRECTORY,
} from '../data/mockData';
import { DEMO_HOSPITALS, INITIAL_TRIAGE_RECORDS } from '../data/database';
import {
  INITIAL_HOSPITAL_BEDS,
  INITIAL_INBOUND_AMBULANCES,
  INITIAL_OPERATION_THEATERS,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_OXYGEN_METRICS,
  DRUG_INTERACTIONS_DB,
  DrugInteraction,
} from '../data/hospitalData';
import {
  safeSetItem,
  safeGetItem,
  STORAGE_KEYS,
  cacheEssentialHealthData,
} from '../utils/offlineStorage';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  activeScreen: string;
  setActiveScreen: (screen: string, replace?: boolean) => void;
  goBack: () => void;
  patient: PatientProfile;
  patientsList: PatientProfile[];
  selectPatientById: (id: string) => void;
  selectPatientByAevaId: (aevaId: string) => boolean;
  doctorsList: DoctorProfile[];
  activeDoctor: DoctorProfile;
  selectDoctorById: (id: string) => void;
  hospitalsList: HospitalProfile[];
  activeHospital: HospitalProfile;
  selectHospitalById: (id: string) => void;
  triageRecords: TriageAdmissionRecord[];
  addTriageRecord: (record: Omit<TriageAdmissionRecord, 'id' | 'scannedAt'>) => void;
  medications: Medication[];
  reports: MedicalReport[];
  medicalReports: MedicalReport[];
  auditLogs: AuditLog[];
  caregiverAlerts: CaregiverAlert[];
  caregiverNotes: CaregiverNote[];
  activeSos: SOSAlert | null;
  activeAevaIdForEmergency: string;
  setActiveAevaIdForEmergency: (id: string) => void;
  editingMedId: string | null;
  setEditingMedId: (id: string | null) => void;
  notificationBanner: { message: string; type: 'success' | 'info' | 'warning' | 'critical' } | null;
  setNotificationBanner: (banner: { message: string; type: 'success' | 'info' | 'warning' | 'critical' } | null) => void;
  consentPreferences: ConsentPreferences;
  updateConsentPreferences: (updates: Partial<ConsentPreferences>) => void;

  // Offline LocalStorage Caching Status
  isOnline: boolean;
  isOfflineCached: boolean;
  lastOfflineCachedTime: string | null;
  refreshOfflineCache: () => void;

  // Real-Time Portal Alert Popup Engine
  activeRealtimeAlerts: RealtimePortalAlert[];
  sendRealtimeAlert: (alert: Omit<RealtimePortalAlert, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => void;
  dismissRealtimeAlert: (id: string) => void;
  triggerPortalTestAlert: (roleOverride?: UserRole) => void;
  
  // Hospital Real-Time Capacity & Bed Allocation
  hospitalBeds: HospitalBed[];
  allocateBed: (bedId: string, allocation: Partial<HospitalBed>) => void;
  dischargeBed: (bedId: string) => void;
  sanitizeBed: (bedId: string) => void;
  reserveBedForAmbulance: (bedId: string, ambulanceUnit: string) => void;
  inboundAmbulances: InboundAmbulance[];
  operationTheaters: OperationTheater[];
  bloodInventory: BloodInventoryItem[];
  oxygenSupply: OxygenSupplyMetrics;
  requestBloodUnits: (bloodGroup: string, units: number) => void;
  checkDrugInteractions: (drugs: string[]) => DrugInteraction[];

  // 5-Portal Registrations
  registrationRole: UserRole;
  setRegistrationRole: (role: UserRole) => void;
  openRegistration: (role?: UserRole) => void;
  registerPatient: (patientData: Partial<PatientProfile>) => void;
  registerCaregiver: (data: CaregiverRegistrationData) => void;
  registerDoctor: (data: DoctorRegistrationData) => void;
  registerHospital: (data: HospitalRegistrationData) => void;
  registerEmergencyStaff: (data: EmergencyStaffRegistrationData) => void;

  // Voice note & speech synthesis
  isSpeaking: boolean;
  speakingNoteId: string | null;
  speakText: (text: string, noteId?: string) => void;
  stopSpeaking: () => void;

  // Actions
  login: (identifier: string, role?: UserRole) => void;
  logout: () => void;
  markDoseStatus: (medId: string, scheduleId: string, status: 'Taken' | 'Due' | 'Upcoming' | 'Missed' | 'Skipped') => void;
  addMedication: (med: Omit<Medication, 'id' | 'patientId'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  updateConsent: (updates: Partial<ConsentPreferences>) => void;
  triggerSOS: () => void;
  resolveSOS: () => void;
  addCaregiverNote: (text: string, hasAudio?: boolean, audioDuration?: string, audioVoiceType?: 'voice_dictation' | 'physician_note') => void;
  addMedicalReport: (report: Omit<MedicalReport, 'id'>) => void;
  deleteMedicalReport: (id: string) => void;
  logAuditAccess: (accessedBy: string, role: string, hospitalOrAgency: string, action: string) => void;
  verifyAevaId: (aevaId: string) => boolean;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return safeGetItem<UserRole>(STORAGE_KEYS.ROLE, 'patient');
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeGetItem<boolean>(STORAGE_KEYS.AUTH, false);
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  });

  const [lastOfflineCachedTime, setLastOfflineCachedTime] = useState<string | null>(() => {
    return safeGetItem<string | null>(STORAGE_KEYS.LAST_OFFLINE_CACHED_AT, new Date().toISOString());
  });

  const [registrationRole, setRegistrationRole] = useState<UserRole>('patient');

  const openRegistration = (targetRole: UserRole = 'patient') => {
    setRegistrationRole(targetRole);
    setActiveScreen('register');
  };

  const [activeScreen, setActiveScreenState] = useState<string>(() => {
    // Check if URL hash exists or fall back to stored screen / login
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) return hash;
    }
    return safeGetItem<string>(STORAGE_KEYS.SCREEN, 'login');
  });

  // Navigate to screen and sync with browser/mobile history
  const setActiveScreen = (newScreen: string, replace: boolean = false) => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch (e) {}
    setActiveScreenState((current) => {
      if (current === newScreen) return current;
      try {
        if (replace) {
          window.history.replaceState({ screen: newScreen, role }, '', `#${newScreen}`);
        } else {
          window.history.pushState({ screen: newScreen, role }, '', `#${newScreen}`);
        }
      } catch (err) {
        console.warn('History pushState error:', err);
      }
      return newScreen;
    });
  };

  // Dedicated back action that triggers native history or fallback
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback screen based on current screen & role
      if (activeScreen === 'add_medicine' || activeScreen === 'edit_medicine') {
        setActiveScreen('medicines', true);
      } else if (activeScreen === 'emergency_profile') {
        if (role === 'emergency_staff') setActiveScreen('emergency_gateway', true);
        else if (role === 'doctor') setActiveScreen('doctor_dashboard', true);
        else if (role === 'hospital') setActiveScreen('hospital_portal', true);
        else setActiveScreen('home', true);
      } else if (activeScreen === 'scan_id') {
        if (role === 'emergency_staff') setActiveScreen('emergency_gateway', true);
        else setActiveScreen('home', true);
      } else if (activeScreen === 'register') {
        setActiveScreen('login', true);
      } else {
        if (role === 'doctor') setActiveScreen('doctor_dashboard', true);
        else if (role === 'caregiver') setActiveScreen('family', true);
        else if (role === 'hospital') setActiveScreen('hospital_portal', true);
        else if (role === 'emergency_staff') setActiveScreen('emergency_gateway', true);
        else setActiveScreen('home', true);
      }
    }
  };

  // Listen to Phone Return / Browser Back / Swipe navigation (popstate)
  useEffect(() => {
    // Initial state registration
    try {
      if (!window.history.state || !window.history.state.screen) {
        window.history.replaceState({ screen: activeScreen, role }, '', `#${activeScreen}`);
      }
    } catch (err) {
      console.warn('Initial replaceState error:', err);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setActiveScreenState(event.state.screen);
        if (event.state.role) {
          setRole(event.state.role);
        }
      } else if (window.location.hash) {
        const hashScreen = window.location.hash.replace(/^#/, '');
        if (hashScreen) {
          setActiveScreenState(hashScreen);
        }
      } else {
        // Popped to root
        if (!isAuthenticated) {
          setActiveScreenState('login');
        } else {
          if (role === 'doctor') setActiveScreenState('doctor_dashboard');
          else if (role === 'caregiver') setActiveScreenState('family');
          else if (role === 'hospital') setActiveScreenState('hospital_portal');
          else if (role === 'emergency_staff') setActiveScreenState('emergency_gateway');
          else setActiveScreenState('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [role, isAuthenticated]);

  // Online / Offline Network State Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationBanner({
        message: 'Network connection active. Local health records synced.',
        type: 'success',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationBanner({
        message: 'Device is offline. Running securely from LocalStorage cache (Profile & Medicines available).',
        type: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [patient, setPatient] = useState<PatientProfile>(() => {
    return safeGetItem<PatientProfile>(STORAGE_KEYS.PATIENT, INITIAL_PATIENT);
  });

  const [patientsList, setPatientsList] = useState<PatientProfile[]>(() => {
    const saved = safeGetItem<PatientProfile[]>(STORAGE_KEYS.PATIENTS_LIST, SAMPLE_PATIENTS);
    return Array.isArray(saved) && saved.length >= SAMPLE_PATIENTS.length ? saved : SAMPLE_PATIENTS;
  });

  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(() => {
    const saved = safeGetItem<DoctorProfile[]>(STORAGE_KEYS.DOCTORS_LIST, DOCTORS_DIRECTORY);
    return Array.isArray(saved) && saved.length >= DOCTORS_DIRECTORY.length ? saved : DOCTORS_DIRECTORY;
  });

  const [activeDoctor, setActiveDoctor] = useState<DoctorProfile>(() => {
    return safeGetItem<DoctorProfile>(STORAGE_KEYS.ACTIVE_DOCTOR, DOCTORS_DIRECTORY[0]);
  });

  const [hospitalsList, setHospitalsList] = useState<HospitalProfile[]>(() => {
    const saved = safeGetItem<HospitalProfile[]>(STORAGE_KEYS.HOSPITALS_LIST, DEMO_HOSPITALS);
    return Array.isArray(saved) && saved.length >= DEMO_HOSPITALS.length ? saved : DEMO_HOSPITALS;
  });

  const [activeHospital, setActiveHospital] = useState<HospitalProfile>(() => {
    return safeGetItem<HospitalProfile>(STORAGE_KEYS.ACTIVE_HOSPITAL, DEMO_HOSPITALS[0]);
  });

  const [triageRecords, setTriageRecords] = useState<TriageAdmissionRecord[]>(() => {
    return safeGetItem<TriageAdmissionRecord[]>(STORAGE_KEYS.TRIAGE_RECORDS, INITIAL_TRIAGE_RECORDS);
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    return safeGetItem<Medication[]>(STORAGE_KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
  });

  const [reports, setReports] = useState<MedicalReport[]>(() => {
    return safeGetItem<MedicalReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return safeGetItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  });

  const [caregiverAlerts, setCaregiverAlerts] = useState<CaregiverAlert[]>(() => {
    return safeGetItem<CaregiverAlert[]>(STORAGE_KEYS.CAREGIVER_ALERTS, INITIAL_CAREGIVER_ALERTS);
  });

  const [caregiverNotes, setCaregiverNotes] = useState<CaregiverNote[]>(() => {
    return safeGetItem<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, INITIAL_CAREGIVER_NOTES);
  });

  // Hospital Real-Time Capacity & Bed Management
  const [hospitalBeds, setHospitalBeds] = useState<HospitalBed[]>(() => {
    return safeGetItem<HospitalBed[]>(STORAGE_KEYS.HOSPITAL_BEDS, INITIAL_HOSPITAL_BEDS);
  });

  const [inboundAmbulances, setInboundAmbulances] = useState<InboundAmbulance[]>(() => {
    return safeGetItem<InboundAmbulance[]>(STORAGE_KEYS.INBOUND_AMBULANCES, INITIAL_INBOUND_AMBULANCES);
  });

  const [operationTheaters, setOperationTheaters] = useState<OperationTheater[]>(() => {
    return safeGetItem<OperationTheater[]>(STORAGE_KEYS.OPERATION_THEATERS, INITIAL_OPERATION_THEATERS);
  });

  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>(() => {
    return safeGetItem<BloodInventoryItem[]>(STORAGE_KEYS.BLOOD_INVENTORY, INITIAL_BLOOD_INVENTORY);
  });

  const [oxygenSupply, setOxygenSupply] = useState<OxygenSupplyMetrics>(() => {
    return safeGetItem<OxygenSupplyMetrics>(STORAGE_KEYS.OXYGEN_SUPPLY, INITIAL_OXYGEN_METRICS);
  });

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.HOSPITAL_BEDS, hospitalBeds);
  }, [hospitalBeds]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.INBOUND_AMBULANCES, inboundAmbulances);
  }, [inboundAmbulances]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.OPERATION_THEATERS, operationTheaters);
  }, [operationTheaters]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.BLOOD_INVENTORY, bloodInventory);
  }, [bloodInventory]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.OXYGEN_SUPPLY, oxygenSupply);
  }, [oxygenSupply]);

  const refreshOfflineCache = () => {
    cacheEssentialHealthData(patient, medications, patientsList);
    const now = new Date().toISOString();
    setLastOfflineCachedTime(now);
    setNotificationBanner({
      message: `Offline health cache refreshed: Profile and ${medications.length} medicines cached locally.`,
      type: 'success',
    });
  };

  // Real-Time Portal Alert Popup Engine
  const [activeRealtimeAlerts, setActiveRealtimeAlerts] = useState<RealtimePortalAlert[]>([]);

  const playAlertChime = (severity: 'critical' | 'warning' | 'info' | 'success') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (severity === 'critical') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (severity === 'warning') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const sendRealtimeAlert = (
    alertData: Omit<RealtimePortalAlert, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ) => {
    const id = alertData.id || `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = alertData.timestamp || new Date().toISOString();
    const newAlert: RealtimePortalAlert = {
      ...alertData,
      id,
      timestamp,
      autoDismissMs: alertData.autoDismissMs ?? (alertData.severity === 'critical' ? 12000 : 7000),
    };

    setActiveRealtimeAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== id)].slice(0, 3));
    playAlertChime(newAlert.severity);

    if (newAlert.autoDismissMs && newAlert.autoDismissMs > 0) {
      setTimeout(() => {
        dismissRealtimeAlert(id);
      }, newAlert.autoDismissMs);
    }
  };

  const dismissRealtimeAlert = (id: string) => {
    setActiveRealtimeAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const triggerPortalTestAlert = (roleOverride?: UserRole) => {
    const target = roleOverride || role;

    if (target === 'patient') {
      sendRealtimeAlert({
        targetRole: 'patient',
        title: 'Medication Schedule Due Now',
        message: 'Metformin 500mg (1 Tablet - Post Lunch) is due for Rahul Sharma.',
        severity: 'warning',
        category: 'MEDICATION',
        actionLabel: 'Log Dose',
        actionScreen: 'medicines',
      });
    } else if (target === 'doctor') {
      sendRealtimeAlert({
        targetRole: 'doctor',
        title: 'Clinical Panic Value: Serum Creatinine 2.1 mg/dL',
        message: 'Rahul Sharma (AEVA-1234-5678-9012) renal labs exceed normal limits. ACE inhibitor dose adjustment advised.',
        severity: 'critical',
        category: 'CLINICAL_INTERACTION',
        actionLabel: 'Open Patient EHR',
        actionScreen: 'doctor_dashboard',
        patientAevaId: 'AEVA-1234-5678-9012',
      });
    } else if (target === 'hospital') {
      sendRealtimeAlert({
        targetRole: 'hospital',
        title: 'Inbound ALS 108 Ambulance Arrival',
        message: 'Ambulance Unit EMS-DELHI-108-A3 arriving in 4 mins (Rahul Sharma, B+). Trauma Bay 02 pre-reserved.',
        severity: 'critical',
        category: 'HOSPITAL_CAPACITY',
        actionLabel: 'View ER Bay Status',
        actionScreen: 'hospital_portal',
      });
    } else if (target === 'caregiver') {
      sendRealtimeAlert({
        targetRole: 'caregiver',
        title: 'Supervised Care Dose Alert',
        message: 'Morning dose for Rahul Sharma was confirmed. Daily adherence rate currently at 88%.',
        severity: 'success',
        category: 'MEDICATION',
        actionLabel: 'Review Log',
        actionScreen: 'family',
      });
    } else if (target === 'emergency_staff') {
      sendRealtimeAlert({
        targetRole: 'emergency_staff',
        title: 'Golden Hour Emergency Telemetry Active',
        message: 'Offline QR Matrix verified for Patient Rahul Sharma (B+). Critical allergy to Penicillin flagged.',
        severity: 'critical',
        category: 'TRIAGE_DISPATCH',
        actionLabel: 'View Triage Dossier',
        actionScreen: 'emergency_gateway',
        patientAevaId: 'AEVA-1234-5678-9012',
      });
    }
  };

  // Bed Allocation Actions
  const allocateBed = (bedId: string, allocation: Partial<HospitalBed>) => {
    setHospitalBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: 'Occupied',
          admittedAt: 'Just now (Admitted)',
          ...allocation,
        };
      })
    );

    // Also update hospital summary numbers
    setHospitalsList((prev) =>
      prev.map((h) => {
        if (h.id !== activeHospital.id) return h;
        return {
          ...h,
          erBedsAvailable: Math.max(0, h.erBedsAvailable - 1),
        };
      })
    );

    logAuditAccess('Hospital Bed Allocation Admin', 'hospital', activeHospital.name, `Allocated bed ${bedId} to ${allocation.patientName || 'patient'}`);

    setNotificationBanner({
      message: `Bed ${bedId} successfully allocated to ${allocation.patientName || 'Patient'}. Registered in Hospital Inpatient Matrix.`,
      type: 'success',
    });
  };

  const dischargeBed = (bedId: string) => {
    let dischargedPatientName = '';
    setHospitalBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId) return bed;
        dischargedPatientName = bed.patientName || 'Patient';
        return {
          ...bed,
          status: 'Sanitizing / Turnover',
          patientName: undefined,
          patientAevaId: undefined,
          diagnosis: undefined,
          acuityLevel: undefined,
          assignedDoctor: undefined,
          notes: 'Bed under terminal UV-C & chemical sanitization protocol.',
        };
      })
    );

    logAuditAccess('Discharge & Triage Clearance', 'hospital', activeHospital.name, `Discharged ${dischargedPatientName} from bed ${bedId}`);

    setNotificationBanner({
      message: `${dischargedPatientName} discharged. Bed ${bedId} marked for sanitization turnover.`,
      type: 'info',
    });
  };

  const sanitizeBed = (bedId: string) => {
    setHospitalBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: 'Available',
          notes: 'Sanitized and inspected. Ready for acute admission.',
        };
      })
    );

    // Increment hospital free beds
    setHospitalsList((prev) =>
      prev.map((h) => {
        if (h.id !== activeHospital.id) return h;
        return {
          ...h,
          erBedsAvailable: Math.min(h.erBedsTotal, h.erBedsAvailable + 1),
        };
      })
    );

    setNotificationBanner({
      message: `Bed ${bedId} is now verified sanitized and available for patient intake.`,
      type: 'success',
    });
  };

  const reserveBedForAmbulance = (bedId: string, ambulanceUnit: string) => {
    setHospitalBeds((prev) =>
      prev.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: 'Reserved - Inbound Ambulance',
          notes: `Pre-reserved for incoming EMS Unit: ${ambulanceUnit}. Crash team standing by.`,
        };
      })
    );

    setNotificationBanner({
      message: `Bed ${bedId} reserved for incoming ambulance ${ambulanceUnit}.`,
      type: 'warning',
    });
  };

  const requestBloodUnits = (bloodGroup: string, units: number) => {
    setBloodInventory((prev) =>
      prev.map((item) => {
        if (item.bloodGroup !== bloodGroup) return item;
        const newTotal = item.unitsAvailable + units;
        return {
          ...item,
          unitsAvailable: newTotal,
          status: newTotal < item.criticalThreshold ? 'Moderate' : 'Adequate',
        };
      })
    );

    logAuditAccess('Emergency Blood Bank Requisition', 'hospital', activeHospital.name, `Dispatched request for ${units} units of ${bloodGroup} blood`);

    setNotificationBanner({
      message: `Emergency request for ${units} units of ${bloodGroup} dispatched to Regional Red Cross Blood Grid.`,
      type: 'success',
    });
  };

  const checkDrugInteractions = (drugNames: string[]): DrugInteraction[] => {
    const detected: DrugInteraction[] = [];
    const lower = drugNames.map((d) => d.toLowerCase());

    for (const rule of DRUG_INTERACTIONS_DB) {
      const matchA = lower.some((d) => d.includes(rule.drugA.toLowerCase()) || rule.drugA.toLowerCase().includes(d));
      const matchB = lower.some((d) => d.includes(rule.drugB.toLowerCase()) || rule.drugB.toLowerCase().includes(d));
      if (matchA && matchB) {
        detected.push(rule);
      }
    }
    return detected;
  };

  // 5-Portal Registration Handlers
  const registerPatient = (data: Partial<PatientProfile>) => {
    const rawDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const formattedAevaId = `AEVA-${rawDigits.substring(0, 4)}-${rawDigits.substring(4, 8)}-${rawDigits.substring(8, 12)}`;

    const newPatient: PatientProfile = {
      ...INITIAL_PATIENT,
      ...data,
      id: `pat_${Date.now()}`,
      aevaId: formattedAevaId,
      createdAt: new Date().toISOString(),
      activeStatus: 'Active',
      emergencyShareEnabled: true,
      lastSyncTime: 'Just now',
    };

    setPatientsList((prev) => [newPatient, ...prev]);
    setPatient(newPatient);
    setActiveAevaIdForEmergency(newPatient.aevaId);
    setRole('patient');
    setIsAuthenticated(true);
    setActiveScreen('home');

    logAuditAccess('Self Enrollment', 'patient', 'Aeva Cloud Universal Registry', `Created new Universal Health Passport for ${newPatient.name}`);

    setNotificationBanner({
      message: `Welcome to Aeva, ${newPatient.name}! Your Universal Health ID is ${formattedAevaId}.`,
      type: 'success',
    });
  };

  const registerCaregiver = (data: CaregiverRegistrationData) => {
    // Attempt to link to specified patient or current patient
    if (data.linkedPatientAevaId) {
      selectPatientByAevaId(data.linkedPatientAevaId);
    }

    const newAlert: CaregiverAlert = {
      id: `alert_${Date.now()}`,
      type: 'system',
      title: 'Caregiver Linked',
      description: `${data.name} (${data.relation}) registered as primary caregiver with PIN clearance.`,
      timestamp: 'Just now',
      severity: 'info',
      read: false,
    };
    setCaregiverAlerts((prev) => [newAlert, ...prev]);

    setRole('caregiver');
    setIsAuthenticated(true);
    setActiveScreen('family');

    logAuditAccess(data.name, 'caregiver', 'Family Guardian Network', `Enrolled as primary caregiver for ${patient.name}`);

    setNotificationBanner({
      message: `Welcome, ${data.name}! You are now linked as Family Guardian for ${patient.name}.`,
      type: 'success',
    });
  };

  const registerDoctor = (data: DoctorRegistrationData) => {
    const newDoc: DoctorProfile = {
      id: `doc_${Date.now()}`,
      name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
      registrationNumber: data.registrationNumber || `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}`,
      specialty: data.specialty,
      degrees: data.degrees || 'MBBS, MD',
      hospital: data.hospital || activeHospital.name,
      department: data.department || 'Clinical Medicine',
      experienceYears: data.experienceYears || 8,
      rating: 4.9,
      phone: data.phone,
      email: data.email,
      emergencyOnCall: data.emergencyOnCall ?? true,
      activeStatus: 'Available',
      opdTimings: data.opdTimings || 'Mon-Sat 10:00 AM - 04:00 PM',
      consultationFee: data.consultationFee || '₹800',
      assignedPatientIds: ['pat_rahul_sharma', 'pat_anirban_mukherjee', 'pat_rajesh_deshmukh'],
    };

    setDoctorsList((prev) => [newDoc, ...prev]);
    setActiveDoctor(newDoc);
    setRole('doctor');
    setIsAuthenticated(true);
    setActiveScreen('doctor_dashboard');

    logAuditAccess(newDoc.name, 'doctor', newDoc.hospital, `Enrolled doctor profile in National Clinical Registry`);

    setNotificationBanner({
      message: `Welcome, ${newDoc.name}! Doctor Clinical Suite credentials verified.`,
      type: 'success',
    });
  };

  const registerHospital = (data: HospitalRegistrationData) => {
    const newHosp: HospitalProfile = {
      id: `hosp_${Date.now()}`,
      name: data.name,
      licenseNumber: data.licenseNumber || `NABH-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type || 'Multispecialty',
      city: data.city || 'National Capital',
      state: data.state || 'NCR',
      address: data.address || 'Medical Enclave, Central City',
      emergencyHelpline: data.emergencyHelpline || '108 / 112',
      erBedsTotal: Number(data.erBedsTotal) || 50,
      erBedsAvailable: Number(data.erBedsAvailable) || 12,
      icuBedsAvailable: Number(data.icuBedsAvailable) || 6,
      bloodBankUnitsAvailable: Number(data.bloodBankUnitsAvailable) || 120,
      traumaLevel: data.traumaLevel || 'Level 1 Apex Trauma Center',
      activeDoctorsCount: 45,
      registeredPatientsCount: 1500,
      departments: data.departments?.length ? data.departments : ['Emergency & Trauma', 'Cardiology', 'ICU Critical Care', 'General Medicine'],
    };

    setHospitalsList((prev) => [newHosp, ...prev]);
    setActiveHospital(newHosp);
    setRole('hospital');
    setIsAuthenticated(true);
    setActiveScreen('hospital_portal');

    logAuditAccess(data.medicalDirectorName || 'Medical Director', 'hospital', newHosp.name, `Enrolled hospital facility in Universal Bed Registry`);

    setNotificationBanner({
      message: `Facility "${newHosp.name}" registered successfully with Universal Bed Allocation Grid.`,
      type: 'success',
    });
  };

  const registerEmergencyStaff = (data: EmergencyStaffRegistrationData) => {
    setRole('emergency_staff');
    setIsAuthenticated(true);
    setActiveScreen('emergency_gateway');

    logAuditAccess(data.name, 'emergency_staff', data.agencyOrStation || 'National EMS 108', `Paramedic Responder Badge ${data.badgeNumber} authenticated`);

    setNotificationBanner({
      message: `Welcome Officer ${data.name}! Emergency Triage & Rapid Scanner clearance verified.`,
      type: 'critical',
    });
  };


  const [activeSos, setActiveSos] = useState<SOSAlert | null>(() => {
    const saved = localStorage.getItem('aeva_active_sos');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeAevaIdForEmergency, setActiveAevaIdForEmergency] = useState<string>(INITIAL_PATIENT.aevaId);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning' | 'critical';
  } | null>(null);

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingNoteId, setSpeakingNoteId] = useState<string | null>(null);

  const speakText = (text: string, noteId?: string) => {
    if (!('speechSynthesis' in window)) {
      setNotificationBanner({
        message: 'Speech synthesis is not supported on this browser.',
        type: 'warning',
      });
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    setIsSpeaking(true);
    if (noteId) setSpeakingNoteId(noteId);

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingNoteId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingNoteId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingNoteId(null);
  };

  // Sync to local storage & update offline cache timestamp
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.AUTH, isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SCREEN, activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.PATIENT, patient);
    const now = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.LAST_OFFLINE_CACHED_AT, now);
    setLastOfflineCachedTime(now);
  }, [patient]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.PATIENTS_LIST, patientsList);
  }, [patientsList]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.DOCTORS_LIST, doctorsList);
  }, [doctorsList]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ACTIVE_DOCTOR, activeDoctor);
  }, [activeDoctor]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.HOSPITALS_LIST, hospitalsList);
  }, [hospitalsList]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ACTIVE_HOSPITAL, activeHospital);
  }, [activeHospital]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.TRIAGE_RECORDS, triageRecords);
  }, [triageRecords]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.MEDICATIONS, medications);
    const now = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.LAST_OFFLINE_CACHED_AT, now);
    setLastOfflineCachedTime(now);
  }, [medications]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.REPORTS, reports);
  }, [reports]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CAREGIVER_ALERTS, caregiverAlerts);
  }, [caregiverAlerts]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CAREGIVER_NOTES, caregiverNotes);
  }, [caregiverNotes]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ACTIVE_SOS, activeSos);
  }, [activeSos]);

  // Select patient by ID
  const selectPatientById = (id: string) => {
    const found = patientsList.find((p) => p.id === id);
    if (found) {
      setPatient(found);
      setActiveAevaIdForEmergency(found.aevaId);
      logAuditAccess('System User', role, 'Aeva Portal', `Switched active patient record to ${found.name}`);
      setNotificationBanner({
        message: `Switched active patient profile to ${found.name} (${found.aevaId}).`,
        type: 'info',
      });
    }
  };

  // Select patient by Aeva ID (or 12-digit number)
  const selectPatientByAevaId = (targetAevaId: string): boolean => {
    const cleanSearch = targetAevaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const found = patientsList.find((p) => {
      const cleanPId = p.aevaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanDigitsOnly = p.aevaId.replace(/[^0-9]/g, '');
      return cleanPId.includes(cleanSearch) || cleanDigitsOnly === cleanSearch.replace(/[^0-9]/g, '');
    });

    if (found) {
      setPatient(found);
      setActiveAevaIdForEmergency(found.aevaId);
      return true;
    }
    return false;
  };

  // Select doctor by ID
  const selectDoctorById = (id: string) => {
    const found = doctorsList.find((d) => d.id === id);
    if (found) {
      setActiveDoctor(found);
      setNotificationBanner({
        message: `Switched active doctor profile to ${found.name} (${found.specialty}).`,
        type: 'info',
      });
    }
  };

  // Select hospital by ID
  const selectHospitalById = (id: string) => {
    const found = hospitalsList.find((h) => h.id === id);
    if (found) {
      setActiveHospital(found);
      setNotificationBanner({
        message: `Connected to ${found.name} universal database registry.`,
        type: 'info',
      });
    }
  };

  // Add Triage Admission Record
  const addTriageRecord = (rec: Omit<TriageAdmissionRecord, 'id' | 'scannedAt'>) => {
    const newRec: TriageAdmissionRecord = {
      ...rec,
      id: `triage_${Date.now()}`,
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTriageRecords((prev) => [newRec, ...prev]);
  };

  // Verify Aeva ID
  const verifyAevaId = (idToCheck: string): boolean => {
    const clean = idToCheck.replace(/[^0-9]/g, '');
    if (clean.length === 12) return true;
    return patientsList.some((p) => p.aevaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === idToCheck.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
  };

  // Log Audit Access
  const logAuditAccess = (accessedBy: string, userRole: string, hospitalOrAgency: string, action: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      patientId: patient.id,
      patientName: patient.name,
      aevaId: patient.aevaId,
      accessedBy,
      role: userRole,
      hospitalOrAgency,
      action,
      timestamp: new Date().toLocaleString(),
      status: userRole.toLowerCase().includes('emergency') || userRole.toLowerCase().includes('responder') ? 'Emergency Access' : 'Authorized',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Authentication Flow
  const login = (identifier: string, userRole: UserRole = 'patient') => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch (e) {}
    setIsAuthenticated(true);
    setRole(userRole);

    if (userRole === 'patient') {
      selectPatientByAevaId(identifier);
      setActiveScreen('home');
      setNotificationBanner({
        message: `Welcome back, ${patient.name}! Signed into Patient Portal.`,
        type: 'success',
      });
    } else if (userRole === 'caregiver') {
      setActiveScreen('family');
      setNotificationBanner({
        message: `Signed in as Family & Caregiver for ${patient.name}.`,
        type: 'success',
      });
    } else if (userRole === 'doctor') {
      setActiveScreen('doctor_dashboard');
      setNotificationBanner({
        message: `Signed in to Doctor Clinical EHR Suite (${activeDoctor.name}).`,
        type: 'success',
      });
    } else if (userRole === 'hospital') {
      setActiveScreen('hospital_portal');
      setNotificationBanner({
        message: `Connected to Universal Hospital Registry & Bed Status (${activeHospital.name}).`,
        type: 'success',
      });
    } else if (userRole === 'emergency_staff') {
      setActiveScreen('emergency_gateway');
      setNotificationBanner({
        message: `Emergency Triage & Paramedic Scanner Gateway Active.`,
        type: 'critical',
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveScreen('login');
    stopSpeaking();
    setNotificationBanner({
      message: 'You have been signed out successfully.',
      type: 'info',
    });
  };

  // Mark Dose Status
  const markDoseStatus = (medId: string, scheduleId: string, status: 'Taken' | 'Due' | 'Upcoming' | 'Missed' | 'Skipped') => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id !== medId) return med;
        const updatedSchedules = med.scheduledTimes.map((st) => {
          if (st.id !== scheduleId) return st;
          return {
            ...st,
            status,
            takenAt: status === 'Taken' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        });
        return { ...med, scheduledTimes: updatedSchedules };
      })
    );

    const medObj = medications.find((m) => m.id === medId);
    if (medObj) {
      if (status === 'Taken') {
        setNotificationBanner({
          message: `Dose logged: ${medObj.name} taken.`,
          type: 'success',
        });
      }
    }
  };

  // Add Medication
  const addMedication = (med: Omit<Medication, 'id' | 'patientId'>) => {
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}`,
      patientId: patient.id,
    };
    setMedications((prev) => [...prev, newMed]);
    setNotificationBanner({
      message: `Prescription for ${med.name} added.`,
      type: 'success',
    });
  };

  // Update Medication
  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
    );
    setNotificationBanner({
      message: 'Medication updated successfully.',
      type: 'success',
    });
  };

  // Delete Medication
  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setNotificationBanner({
      message: 'Medication removed from active regimen.',
      type: 'info',
    });
  };

  // Update Patient Profile
  const updatePatientProfile = (updates: Partial<PatientProfile>) => {
    setPatient((prev) => {
      const updated = { ...prev, ...updates };
      setPatientsList((pList) => pList.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    });
    setNotificationBanner({
      message: 'Patient profile & vital signs updated.',
      type: 'success',
    });
  };

  // Update Consent
  const updateConsent = (updates: Partial<ConsentPreferences>) => {
    setPatient((prev) => ({
      ...prev,
      consent: { ...prev.consent, ...updates },
    }));
    setNotificationBanner({
      message: 'Privacy and consent preferences saved.',
      type: 'info',
    });
  };

  // Trigger SOS Alert
  const triggerSOS = () => {
    const newAlert: SOSAlert = {
      id: `sos_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      aevaId: patient.aevaId,
      triggeredAt: new Date().toLocaleTimeString(),
      location: {
        address: 'Connaught Place, Central Delhi, 110001 (GPS Fixed)',
        lat: 28.6304,
        lng: 77.2177,
      },
      status: 'ACTIVE',
      contactsNotified: patient.emergencyContacts.map((c) => `${c.name} (${c.phone})`),
    };

    setActiveSos(newAlert);
    logAuditAccess('Emergency SOS Trigger', 'Automated Dispatch', 'Aeva Cloud Relay', `SOS Panic Beacon Activated by ${patient.name}`);
    setNotificationBanner({
      message: 'EMERGENCY SOS BROADCAST ACTIVE: First Responders and Family Alerted!',
      type: 'critical',
    });
  };

  // Resolve SOS Alert
  const resolveSOS = () => {
    setActiveSos(null);
    setNotificationBanner({
      message: 'Emergency SOS alert resolved and deactivated.',
      type: 'success',
    });
  };

  // Add Caregiver Note (supporting voice notes)
  const addCaregiverNote = (
    text: string,
    hasAudio: boolean = false,
    audioDuration: string = '0:35',
    audioVoiceType: 'voice_dictation' | 'physician_note' = 'voice_dictation'
  ) => {
    const newNote: CaregiverNote = {
      id: `note_${Date.now()}`,
      author: role === 'doctor' ? `${activeDoctor.name} (Attending Physician)` : role === 'caregiver' ? 'Arjun Sharma (Caregiver)' : patient.name,
      text,
      timestamp: 'Just now',
      hasAudio,
      audioDuration,
      audioVoiceType,
    };
    setCaregiverNotes((prev) => [newNote, ...prev]);
    setNotificationBanner({
      message: hasAudio ? 'Voice audio note recorded and attached to patient record.' : 'Clinical observation note saved.',
      type: 'success',
    });
  };

  // Add Medical Report
  const addMedicalReport = (report: Omit<MedicalReport, 'id'>) => {
    const newRep: MedicalReport = {
      ...report,
      id: `rep_${Date.now()}`,
    };
    setReports((prev) => [newRep, ...prev]);
    setNotificationBanner({
      message: `Diagnostic Report "${report.title}" uploaded.`,
      type: 'success',
    });
  };

  // Delete Medical Report
  const deleteMedicalReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setNotificationBanner({
      message: 'Report deleted from records.',
      type: 'info',
    });
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    localStorage.clear();
    setRole('patient');
    setIsAuthenticated(false);
    setActiveScreen('login');
    setPatient(INITIAL_PATIENT);
    setPatientsList(SAMPLE_PATIENTS);
    setDoctorsList(DOCTORS_DIRECTORY);
    setActiveDoctor(DOCTORS_DIRECTORY[0]);
    setHospitalsList(DEMO_HOSPITALS);
    setActiveHospital(DEMO_HOSPITALS[0]);
    setTriageRecords(INITIAL_TRIAGE_RECORDS);
    setMedications(INITIAL_MEDICATIONS);
    setReports(INITIAL_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCaregiverAlerts(INITIAL_CAREGIVER_ALERTS);
    setCaregiverNotes(INITIAL_CAREGIVER_NOTES);
    setActiveSos(null);
    setActiveAevaIdForEmergency(INITIAL_PATIENT.aevaId);
    stopSpeaking();
    setNotificationBanner({
      message: 'Application reset to default state.',
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        activeScreen,
        setActiveScreen,
        goBack,
        patient,
        patientsList,
        selectPatientById,
        selectPatientByAevaId,
        doctorsList,
        activeDoctor,
        selectDoctorById,
        hospitalsList,
        activeHospital,
        selectHospitalById,
        triageRecords,
        addTriageRecord,
        medications,
        reports,
        medicalReports: reports,
        auditLogs,
        caregiverAlerts,
        caregiverNotes,
        activeSos,
        activeAevaIdForEmergency,
        setActiveAevaIdForEmergency,
        editingMedId,
        setEditingMedId,
        notificationBanner,
        setNotificationBanner,
        consentPreferences: patient.consent,
        updateConsentPreferences: updateConsent,
        
        // Offline LocalStorage Caching Status
        isOnline,
        isOfflineCached: true,
        lastOfflineCachedTime,
        refreshOfflineCache,

        // Real-Time Portal Alert Popup Engine
        activeRealtimeAlerts,
        sendRealtimeAlert,
        dismissRealtimeAlert,
        triggerPortalTestAlert,
        
        // Hospital Real-Time Capacity & Bed Management
        hospitalBeds,
        allocateBed,
        dischargeBed,
        sanitizeBed,
        reserveBedForAmbulance,
        inboundAmbulances,
        operationTheaters,
        bloodInventory,
        oxygenSupply,
        requestBloodUnits,
        checkDrugInteractions,

        // 5-Portal Registrations
        registrationRole,
        setRegistrationRole,
        openRegistration,
        registerPatient,
        registerCaregiver,
        registerDoctor,
        registerHospital,
        registerEmergencyStaff,

        isSpeaking,
        speakingNoteId,
        speakText,
        stopSpeaking,
        login,
        logout,
        markDoseStatus,
        addMedication,
        updateMedication,
        deleteMedication,
        updatePatientProfile,
        updateConsent,
        triggerSOS,
        resolveSOS,
        addCaregiverNote,
        addMedicalReport,
        deleteMedicalReport,
        logAuditAccess,
        verifyAevaId,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
