import { PatientProfile, Medication } from '../types';

export const STORAGE_KEYS = {
  ROLE: 'aeva_role',
  AUTH: 'aeva_auth',
  SCREEN: 'aeva_screen',
  PATIENT: 'aeva_patient',
  PATIENTS_LIST: 'aeva_patients_list',
  DOCTORS_LIST: 'aeva_doctors_list',
  ACTIVE_DOCTOR: 'aeva_active_doctor',
  HOSPITALS_LIST: 'aeva_hospitals_list',
  ACTIVE_HOSPITAL: 'aeva_active_hospital',
  TRIAGE_RECORDS: 'aeva_triage_records',
  MEDICATIONS: 'aeva_medications',
  REPORTS: 'aeva_reports',
  AUDIT_LOGS: 'aeva_audit_logs',
  CAREGIVER_ALERTS: 'aeva_caregiver_alerts',
  CAREGIVER_NOTES: 'aeva_caregiver_notes',
  ACTIVE_SOS: 'aeva_active_sos',
  HOSPITAL_BEDS: 'aeva_hospital_beds',
  INBOUND_AMBULANCES: 'aeva_inbound_ambulances',
  OPERATION_THEATERS: 'aeva_operation_theaters',
  BLOOD_INVENTORY: 'aeva_blood_inventory',
  OXYGEN_SUPPLY: 'aeva_oxygen_supply',
  LAST_OFFLINE_CACHED_AT: 'aeva_last_offline_cached_at',
  OFFLINE_CACHE_VERSION: 'aeva_cache_version',
} as const;

/**
 * Safely saves data to LocalStorage with quota and serialization protection
 */
export function safeSetItem(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[LocalStorage] Failed to cache key "${key}":`, error);
    return false;
  }
}

/**
 * Safely retrieves and deserializes data from LocalStorage with fallback support
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch (error) {
    console.warn(`[LocalStorage] Failed to read key "${key}":`, error);
    return fallback;
  }
}

export interface OfflineCacheSummary {
  isCached: boolean;
  lastCachedAt: string | null;
  cachedPatientName?: string;
  cachedPatientAevaId?: string;
  cachedMedicationCount: number;
  offlineStorageBytes: number;
}

/**
 * Caches essential user profile and medication regimens directly for instant offline access
 */
export function cacheEssentialHealthData(
  patient: PatientProfile,
  medications: Medication[],
  patientsList?: PatientProfile[]
): boolean {
  try {
    const timestamp = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.PATIENT, patient);
    safeSetItem(STORAGE_KEYS.MEDICATIONS, medications);
    if (patientsList && patientsList.length > 0) {
      safeSetItem(STORAGE_KEYS.PATIENTS_LIST, patientsList);
    }
    safeSetItem(STORAGE_KEYS.LAST_OFFLINE_CACHED_AT, timestamp);
    safeSetItem(STORAGE_KEYS.OFFLINE_CACHE_VERSION, '3.2.0');
    return true;
  } catch (err) {
    console.error('[Offline Storage] Failed caching essential health data:', err);
    return false;
  }
}

/**
 * Inspects and returns a summary of the current offline health cache
 */
export function getOfflineCacheSummary(): OfflineCacheSummary {
  if (typeof window === 'undefined') {
    return {
      isCached: false,
      lastCachedAt: null,
      cachedMedicationCount: 0,
      offlineStorageBytes: 0,
    };
  }

  const patient = safeGetItem<PatientProfile | null>(STORAGE_KEYS.PATIENT, null);
  const medications = safeGetItem<Medication[]>(STORAGE_KEYS.MEDICATIONS, []);
  const lastCachedAt = localStorage.getItem(STORAGE_KEYS.LAST_OFFLINE_CACHED_AT);

  let totalBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('aeva_')) {
        const val = localStorage.getItem(key) || '';
        totalBytes += key.length + val.length;
      }
    }
  } catch (e) {}

  return {
    isCached: !!patient && !!patient.aevaId,
    lastCachedAt,
    cachedPatientName: patient?.name,
    cachedPatientAevaId: patient?.aevaId,
    cachedMedicationCount: Array.isArray(medications) ? medications.length : 0,
    offlineStorageBytes: totalBytes,
  };
}
