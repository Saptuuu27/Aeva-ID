import { HospitalProfile, DoctorProfile, PatientProfile, TriageAdmissionRecord } from '../types';
import { EXTENDED_HOSPITALS_LIST } from './extendedHospitals';

/**
 * Universal Relational Healthcare Database Registry
 * Structured relational schema compatible with MySQL / PostgreSQL schemas:
 * - hospitals
 * - departments
 * - doctors
 * - patients
 * - medications
 * - clinical_reports
 * - caregiver_voice_notes
 * - triage_admissions
 * - dpdp_audit_ledger
 */

export interface DatabaseSchema {
  hospitals: HospitalProfile[];
  doctors: DoctorProfile[];
  patients: PatientProfile[];
  triageAdmissions: TriageAdmissionRecord[];
}

export const DEMO_HOSPITALS: HospitalProfile[] = EXTENDED_HOSPITALS_LIST;


export const INITIAL_TRIAGE_RECORDS: TriageAdmissionRecord[] = [
  {
    id: 'triage_rec_101',
    patientAevaId: 'AEVA-1234-5678-9012',
    patientName: 'Rahul Sharma',
    age: 67,
    gender: 'Male',
    bloodGroup: 'B+',
    scannedAt: 'Today, 02:15 AM',
    scanMode: 'Offline Optical',
    responderName: 'Paramedic R. Verma (EMS-ND-8841)',
    triagePriority: 'Yellow - Urgent',
    chiefComplaint: 'Acute Dizziness, post-fall contusion on left shoulder, baseline hypertension',
    hospitalUnit: 'Apollo Hospitals Sarita Vihar - Trauma Bay 1',
    allergiesSummary: 'Severe Anaphylaxis to Penicillin (Beta-lactam)',
    vitalsBp: '138/88 mmHg',
  },
  {
    id: 'triage_rec_102',
    patientAevaId: 'AEVA-5678-9012-3456',
    patientName: 'Ananya Roy',
    age: 41,
    gender: 'Female',
    bloodGroup: 'O+',
    scannedAt: 'Yesterday, 10:45 PM',
    scanMode: 'Universal Cloud Registry',
    responderName: 'ER Triage Nurse K. Dsouza (AIIMS-ER-12)',
    triagePriority: 'Green - Non-Urgent',
    chiefComplaint: 'Asthma exacerbation during seasonal smog, SpO2 93% on room air',
    hospitalUnit: 'AIIMS New Delhi - Apex Triage Zone B',
    allergiesSummary: 'Severe NSAIDs (Ibuprofen / Aspirin)',
    vitalsBp: '122/78 mmHg',
  },
  {
    id: 'triage_rec_103',
    patientAevaId: 'AEVA-9012-3456-7890',
    patientName: 'Col. Bikram Singh (Retd.)',
    age: 74,
    gender: 'Male',
    bloodGroup: 'AB+',
    scannedAt: '2 days ago, 06:10 PM',
    scanMode: 'Manual Aeva ID',
    responderName: 'Dr. Neha Kapoor (Fortis GGN Trauma)',
    triagePriority: 'Red - Immediate',
    chiefComplaint: 'Substernal chest pressure radiating to left jaw, ST elevation observed on 12-lead ECG',
    hospitalUnit: 'Fortis Memorial - Cardiac Cath Lab Emergency',
    allergiesSummary: 'Sulfa Drugs / Bactrim',
    vitalsBp: '158/96 mmHg',
  },
];
