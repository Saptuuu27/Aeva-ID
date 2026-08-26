export type UserRole = 'patient' | 'caregiver' | 'doctor' | 'hospital' | 'emergency_staff';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface MedicationScheduleItem {
  id: string;
  time: string; // e.g. "08:00 AM"
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  label: string; // e.g. "After Breakfast"
  status: 'Taken' | 'Due' | 'Upcoming' | 'Missed' | 'Skipped';
  takenAt?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string; // e.g. "1 tablet (500mg)"
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler';
  frequency: 'Once daily' | 'Twice daily' | 'Thrice daily' | 'As needed' | 'Weekly';
  scheduledTimes: MedicationScheduleItem[];
  foodInstruction: 'Before food' | 'With food' | 'After food';
  startDate: string;
  endDate?: string;
  reminderEnabled: boolean;
  active: boolean;
  isHighRisk?: boolean;
  notes?: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  doctor: string;
  hospital: string;
  date: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  reaction?: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedYear?: string;
  diagnosedSince?: string;
  status?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  type?: string;
  category: 'Lab Test' | 'Imaging' | 'Prescription' | 'Discharge Summary' | 'Cardiology' | 'Diagnostic Lab' | string;
  date: string;
  hospital: string;
  doctor?: string;
  summary: string;
  tags?: string[];
  status?: 'NEW' | 'REVIEWED' | string;
  fileUrl?: string;
  fileType?: 'pdf' | 'dicom' | 'image' | string;
  doctorNotes?: string;
}

export interface ConsentPreferences {
  emergencyAccessEnabled: boolean;
  caregiverAccessEnabled: boolean;
  doctorAccessEnabled: boolean;
  allowAuditLogging: boolean;
  shareLocationOnSOS: boolean;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  degrees: string; // e.g. "MBBS, MD (Medicine), DM (Cardiology), FRCP"
  hospital: string;
  department: string;
  city?: string;
  phone: string;
  email: string;
  experienceYears: number;
  registrationNumber: string; // e.g. "MCI-48291-DMC"
  opdTimings: string; // e.g. "Mon - Fri, 09:00 AM - 01:00 PM"
  initials?: string;
  avatarColor?: string;
  assignedPatientIds?: string[];
  bio?: string;
  consultationFee?: string;
  rating?: number;
  availableDays?: string[];
  emergencyOnCall?: boolean;
  activeStatus?: string;
}

export interface HospitalProfile {
  id: string;
  name: string;
  licenseNumber: string; // e.g. "HOSP-APOLLO-DEL-01"
  type: 'Multispecialty' | 'Government Apex' | 'Super Speciality' | 'Trauma Center';
  city: string;
  state: string;
  address: string;
  emergencyHelpline: string;
  erBedsTotal: number;
  erBedsAvailable: number;
  icuBedsAvailable: number;
  bloodBankUnitsAvailable: number;
  traumaLevel: string; // e.g. "Level 1 Trauma Apex"
  activeDoctorsCount: number;
  registeredPatientsCount: number;
  departments: string[];
  medicalDirectorName?: string;
}

export interface TriageAdmissionRecord {
  id: string;
  patientAevaId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  scannedAt: string;
  scanMode: 'Offline Optical' | 'Manual Aeva ID' | 'Universal Cloud Registry';
  responderName: string;
  triagePriority: 'Red - Immediate' | 'Yellow - Urgent' | 'Green - Non-Urgent';
  chiefComplaint: string;
  hospitalUnit: string;
  allergiesSummary: string;
  vitalsBp: string;
}

export interface PatientProfile {
  id: string;
  aevaId: string; // e.g. "AEVA-1234-5678-9012"
  patientIdNumber: string; // e.g. "RS-8924" or "9876-5432-10"
  name: string;
  initials: string; // "RS"
  dob: string; // "12/04/1958"
  age: number; // 67
  gender: 'Male' | 'Female' | 'Other';
  phone: string; // "+91 98765 43210"
  email?: string;
  bloodGroup: string; // "B+"
  height: string; // "175 cm"
  weight: string; // "78 kg"
  bmi: string; // "25.5"
  avgBp: string; // "128/82 mmHg"
  offlineQrReady: boolean;
  idVerified: boolean;
  organDonor?: boolean;
  status: 'Stable' | 'Critical' | 'Observation';
  activeStatus?: string;
  createdAt?: string;
  emergencyShareEnabled?: boolean;
  lastSyncTime?: string;
  primaryDoctor: {
    name: string;
    specialty: string;
    hospital: string;
    phone: string;
    initials: string;
  };
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  specialInstructions: string;
  emergencyContacts: EmergencyContact[];
  pastSurgeries: Surgery[];
  consent: ConsentPreferences;
  records?: MedicalReport[];
  medicationsList?: Medication[];
  caregiverNotesList?: CaregiverNote[];
}

export interface OfflineEmergencyQRData {
  version: string;
  aevaId: string;
  patientIdNumber: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  dob: string;
  bloodGroup: string;
  organDonor: boolean;
  baselineBp: string;
  weight: string;
  height: string;
  criticalAllergies: Array<{ name: string; severity: string; reaction?: string }>;
  chronicConditions: Array<{ name: string; status?: string; diagnosedSince?: string }>;
  highRiskMeds: Array<{ name: string; dosage: string; frequency: string; isHighRisk?: boolean }>;
  primaryEmergencyContact: { name: string; relationship: string; phone: string };
  primaryDoctor: { name: string; hospital: string; phone: string };
  specialInstructions: string;
  recentReports: Array<{ title: string; date: string; summary: string; category?: string }>;
  caregiverNotes: Array<{ text: string; author: string; timestamp: string; hasAudio?: boolean; audioDuration?: string }>;
  isOfflineDecoded: boolean;
  generatedTimestamp: string;
}

export interface AuditLog {
  id: string;
  patientId: string;
  patientName: string;
  aevaId: string;
  accessedBy: string;
  role: string;
  hospitalOrAgency: string;
  action: string;
  timestamp: string;
  status: 'Authorized' | 'Emergency Access' | 'Restricted';
}

export interface SOSAlert {
  id: string;
  patientId: string;
  patientName: string;
  aevaId: string;
  triggeredAt: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: 'ACTIVE' | 'RESOLVED';
  resolvedBy?: string;
  contactsNotified: string[];
}

export interface RealtimePortalAlert {
  id: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  category: 'MEDICATION' | 'SOS_EMERGENCY' | 'TRIAGE_DISPATCH' | 'HOSPITAL_CAPACITY' | 'CLINICAL_INTERACTION' | 'SECURITY_CONSENT';
  actionLabel?: string;
  actionScreen?: string;
  patientAevaId?: string;
  autoDismissMs?: number;
}

export interface CaregiverAlert {
  id: string;
  type: 'sos' | 'missed_dose' | 'system' | 'update';
  title: string;
  description: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
}

export interface CaregiverNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  hasAudio?: boolean;
  audioDuration?: string;
  audioVoiceType?: 'voice_dictation' | 'physician_note';
}


export interface HospitalBed {
  id: string;
  hospitalId: string;
  bedNumber: string; // e.g. "ER-BAY-01", "ICU-VENT-04", "WARD-302-A"
  ward: 'Emergency Trauma Bay' | 'ICU - Invasive Ventilator' | 'CCU - Cardiac Care' | 'NICU / PICU' | 'Isolation / Negative Pressure' | 'General Inpatient Ward' | 'Daycare & Dialysis';
  floor: string;
  status: 'Available' | 'Occupied' | 'Reserved - Inbound Ambulance' | 'Sanitizing / Turnover' | 'Maintenance';
  patientName?: string;
  patientAevaId?: string;
  patientAge?: number;
  patientGender?: string;
  patientBloodGroup?: string;
  assignedDoctor?: string;
  admittedAt?: string;
  oxygenType?: 'High Flow Nasal Cannula' | 'Mechanical Ventilator' | 'BiPAP' | 'Standard O2' | 'None';
  acuityLevel?: 'Red - Critical' | 'Yellow - Stepdown' | 'Green - Stable';
  diagnosis?: string;
  notes?: string;
}

export interface InboundAmbulance {
  id: string;
  hospitalId: string;
  unitCode: string; // "EMS-DELHI-108-A3"
  responderName: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientBloodGroup: string;
  patientAevaId?: string;
  etaMinutes: number;
  traumaCondition: string;
  triagePriority: 'Red - Immediate' | 'Yellow - Urgent' | 'Green - Non-Urgent';
  targetBedId?: string;
  goldenHourRemainingMinutes: number;
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temp: string;
    gcs: number; // Glasgow Coma Scale (3-15)
  };
}

export interface OperationTheater {
  id: string;
  hospitalId: string;
  otNumber: string;
  specialty: string;
  status: 'In Surgery' | 'Prepped / Ready' | 'Sanitizing' | 'Emergency Standby';
  currentProcedure?: string;
  leadSurgeon?: string;
  patientName?: string;
  timeRemaining?: string;
  emergencyReserved: boolean;
}

export interface BloodInventoryItem {
  bloodGroup: string;
  unitsAvailable: number;
  criticalThreshold: number;
  status: 'Adequate' | 'Moderate' | 'Critical Deficit';
  plasmaUnits: number;
  plateletPacks: number;
}

export interface OxygenSupplyMetrics {
  tankLevelPercent: number; // e.g. 84%
  liquidOxygenKL: number; // 18.2 KL
  consumptionRateLPM: number; // 420 LPM
  estimatedRuntimeHours: number; // 46 hours
  manifoldPressurePSI: number; // 58 PSI (Normal 55-60)
  backupCylindersCount: number; // 64 cylinders
}

export interface CaregiverRegistrationData {
  name: string;
  phone: string;
  relation: string;
  linkedPatientAevaId: string;
  guardianPin: string;
  permissions: string[];
}

export interface DoctorRegistrationData {
  name: string;
  registrationNumber: string;
  specialty: string;
  subSpecialty?: string;
  degrees: string;
  hospital: string;
  department: string;
  city: string;
  phone: string;
  email: string;
  experienceYears: number;
  opdTimings: string;
  emergencyOnCall: boolean;
  consultationFee?: string;
  pin?: string;
}

export interface HospitalRegistrationData {
  name: string;
  licenseNumber: string;
  type: 'Multispecialty' | 'Government Apex' | 'Super Speciality' | 'Trauma Center';
  city: string;
  state: string;
  address: string;
  emergencyHelpline: string;
  erBedsTotal: number;
  erBedsAvailable: number;
  icuBedsAvailable: number;
  bloodBankUnitsAvailable: number;
  traumaLevel: string;
  departments: string[];
  medicalDirectorName?: string;
  adminPin?: string;
}

export interface EmergencyStaffRegistrationData {
  name: string;
  badgeNumber: string;
  agencyOrStation: string;
  certificationLevel: string;
  baseHospital: string;
  contactPhone: string;
}



