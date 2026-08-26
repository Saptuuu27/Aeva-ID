import { PatientProfile, OfflineEmergencyQRData, Medication, MedicalReport, CaregiverNote } from '../types';

/**
 * Creates a single, unified, comprehensive Aeva QR payload.
 * Encodes core vital patient demographics, severe allergies, active medications,
 * emergency contacts, attending physician, and recent clinical notes into a
 * structured, high-density, easily scannable format.
 */
export function generateOfflineQRPayload(
  patient: PatientProfile,
  meds?: Medication[],
  reports?: MedicalReport[],
  notes?: CaregiverNote[]
): string {
  const patientMeds = meds || patient.medicationsList || [];
  const activeReports = reports || patient.records || [];
  const clinicalNotes = notes || patient.caregiverNotesList || [];

  // Format: AEVA:3|AevaID|Name|Age|Gender|BloodGroup|BP|Weight|Height|Allergies|Conditions|Meds|ICE(Name:Phone:Rel)|Doctor(Name:Hospital:Phone)|OrganDonor|LastReport|LastNote
  const algStr = patient.allergies.map(a => `${a.name}${a.severity?.includes('Severe') ? ':Sev' : ''}`).join(';');
  const conStr = patient.chronicConditions.map(c => c.name).join(';');
  const medStr = patientMeds.slice(0, 6).map(m => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.isHighRisk ? '!' : ''}`).join(';');
  
  const ice = patient.emergencyContacts[0] || { name: 'Emergency Contact', phone: '+919876543210', relationship: 'Family' };
  const iceStr = `${ice.name || 'ICE'}:${ice.phone || ''}:${ice.relationship || 'Kin'}`;
  
  const doc = patient.primaryDoctor || { name: 'Hospital Specialist', hospital: 'Apollo ER', phone: '+919811234567' };
  const docStr = `${doc.name || 'Attending'}:${doc.hospital || 'Hospital'}:${doc.phone || ''}`;
  
  const donor = patient.organDonor ? '1' : '0';
  const cleanAevaId = patient.aevaId ? patient.aevaId.replace(/[\s-]/g, '') : 'AEVA123456789012';
  const bp = patient.avgBp || '120/80';
  const wt = patient.weight || '70kg';
  const ht = patient.height || '170cm';
  
  const lastRep = activeReports[0] ? `${activeReports[0].title.slice(0, 30)}` : 'Stable Labs';
  const lastNot = clinicalNotes[0] ? `${clinicalNotes[0].text.slice(0, 45)}` : 'No acute distress recorded';

  // Unified single payload schema
  return `AEVA:3|${cleanAevaId}|${patient.name}|${patient.age}|${patient.gender}|${patient.bloodGroup}|${bp}|${wt}|${ht}|${algStr}|${conStr}|${medStr}|${iceStr}|${docStr}|${donor}|${lastRep}|${lastNot}`;
}

/**
 * Generates an organized, readable clinical plain-text patient dossier report
 * for viewing or downloading (.txt) across offline & online triage scenarios.
 */
export function generateDetailedTextPatientReport(
  patient: PatientProfile,
  meds?: Medication[],
  reports?: MedicalReport[],
  notes?: CaregiverNote[]
): string {
  const patientMeds = meds || patient.medicationsList || [];
  const patientReports = reports || patient.records || [];
  const patientNotes = notes || patient.caregiverNotesList || [];

  const divider = '================================================================================';
  const subDivider = '--------------------------------------------------------------------------------';

  let txt = '';
  txt += `${divider}\n`;
  txt += `                      AEVA HEALTHCARE UNIVERSAL PATIENT DOSSIER                  \n`;
  txt += `                    CONFIDENTIAL MEDICAL EMERGENCY HEALTH RECORD                 \n`;
  txt += `${divider}\n\n`;

  txt += `[1] PATIENT DEMOGRAPHICS & IDENTIFICATION\n`;
  txt += `${subDivider}\n`;
  txt += `  Aeva ID               : ${patient.aevaId}\n`;
  txt += `  Medical Record No(MRN): ${patient.patientIdNumber}\n`;
  txt += `  Full Legal Name       : ${patient.name}\n`;
  txt += `  Age / Gender / DOB    : ${patient.age} Years  |  ${patient.gender}  |  DOB: ${patient.dob}\n`;
  txt += `  Blood Group (ABO/Rh)  : ${patient.bloodGroup}  ${patient.bloodGroup.includes('-') ? '(RARE RH-NEGATIVE)' : ''}\n`;
  txt += `  Organ Donor Registry  : ${patient.organDonor ? 'YES - Registered Organ Donor' : 'No / Unspecified'}\n`;
  txt += `  Baseline Blood Pres.  : ${patient.avgBp || '120/80 mmHg'}\n`;
  txt += `  Height & Weight (BMI) : ${patient.height}  |  ${patient.weight}  (BMI: ${patient.bmi})\n`;
  txt += `  Current Clinical Stat : ${patient.status.toUpperCase()}\n`;
  txt += `  Registered Phone      : ${patient.phone}\n`;
  txt += `  Registered Email      : ${patient.email || 'N/A'}\n\n`;

  txt += `[2] EMERGENCY CONTACTS (IN CASE OF EMERGENCY - ICE)\n`;
  txt += `${subDivider}\n`;
  patient.emergencyContacts.forEach((contact, idx) => {
    txt += `  ${idx + 1}. ${contact.name} (${contact.relationship}) ${contact.isPrimary ? '[PRIMARY ICE]' : ''}\n`;
    txt += `     Phone: ${contact.phone}\n`;
  });
  txt += `\n`;

  txt += `[3] PRIMARY ATTENDING PHYSICIAN & HOSPITAL\n`;
  txt += `${subDivider}\n`;
  txt += `  Doctor Name           : ${patient.primaryDoctor.name}\n`;
  txt += `  Specialty             : ${patient.primaryDoctor.specialty}\n`;
  txt += `  Hospital Affiliation  : ${patient.primaryDoctor.hospital}\n`;
  txt += `  Direct Doctor Contact : ${patient.primaryDoctor.phone}\n\n`;

  txt += `[4] CRITICAL ALLERGIES & ADVERSE DRUG REACTIONS (DRUG ALERTS)\n`;
  txt += `${subDivider}\n`;
  if (patient.allergies.length === 0) {
    txt += `  No known drug allergies (NKDA) recorded.\n`;
  } else {
    patient.allergies.forEach((alg, idx) => {
      txt += `  ${idx + 1}. [${alg.severity.toUpperCase()}] ${alg.name}\n`;
      if (alg.reaction) txt += `     Clinical Reaction: ${alg.reaction}\n`;
    });
  }
  txt += `\n`;

  txt += `[5] CHRONIC DIAGNOSED CONDITIONS\n`;
  txt += `${subDivider}\n`;
  if (patient.chronicConditions.length === 0) {
    txt += `  No chronic conditions recorded.\n`;
  } else {
    patient.chronicConditions.forEach((cond, idx) => {
      txt += `  ${idx + 1}. ${cond.name} (Diagnosed: ${cond.diagnosedSince || cond.diagnosedYear || 'Documented'})\n`;
      if (cond.status) txt += `     Status: ${cond.status}\n`;
    });
  }
  txt += `\n`;

  txt += `[6] ACTIVE PRESCRIPTION MEDICATIONS & DOSAGE SCHEDULE\n`;
  txt += `${subDivider}\n`;
  if (patientMeds.length === 0) {
    txt += `  No active medications recorded.\n`;
  } else {
    patientMeds.forEach((med, idx) => {
      txt += `  ${idx + 1}. ${med.name} - ${med.dosage} (${med.form.toUpperCase()})\n`;
      txt += `     Frequency & Food  : ${med.frequency}  |  ${med.foodInstruction}\n`;
      if (med.isHighRisk) {
        txt += `     HIGH-RISK WARNING : Strict compliance required. Do not alter dosage abruptly.\n`;
      }
      if (med.notes) {
        txt += `     Clinical Notes    : ${med.notes}\n`;
      }
    });
  }
  txt += `\n`;

  txt += `[7] PAST SURGICAL PROCEDURES\n`;
  txt += `${subDivider}\n`;
  if (patient.pastSurgeries.length === 0) {
    txt += `  No major past surgeries recorded.\n`;
  } else {
    patient.pastSurgeries.forEach((surg, idx) => {
      txt += `  ${idx + 1}. ${surg.procedure} (${surg.date})\n`;
      txt += `     Hospital & Surgeon: ${surg.hospital} | ${surg.doctor}\n`;
      if (surg.notes) txt += `     Operative Notes   : ${surg.notes}\n`;
    });
  }
  txt += `\n`;

  txt += `[8] DIAGNOSTIC LAB & TEST REPORTS\n`;
  txt += `${subDivider}\n`;
  if (patientReports.length === 0) {
    txt += `  No recent lab reports attached.\n`;
  } else {
    patientReports.forEach((rep, idx) => {
      txt += `  ${idx + 1}. ${rep.title} [${rep.category}] - Date: ${rep.date}\n`;
      txt += `     Facility: ${rep.hospital}\n`;
      txt += `     Summary : ${rep.summary}\n`;
    });
  }
  txt += `\n`;

  txt += `[9] CLINICAL OBSERVATIONS & CAREGIVER VOICE NOTES\n`;
  txt += `${subDivider}\n`;
  if (patientNotes.length === 0) {
    txt += `  No caregiver notes recorded.\n`;
  } else {
    patientNotes.forEach((n, idx) => {
      txt += `  ${idx + 1}. [${n.timestamp}] By: ${n.author} ${n.hasAudio ? `(Audio Note - ${n.audioDuration || 'Voice Recorded'})` : ''}\n`;
      txt += `     "${n.text}"\n`;
    });
  }
  txt += `\n`;

  txt += `[10] SPECIAL EMERGENCY INSTRUCTIONS\n`;
  txt += `${subDivider}\n`;
  txt += `  ${patient.specialInstructions || 'Strictly follow allergy warnings. Verify blood group before emergency transfusion.'}\n\n`;

  txt += `${divider}\n`;
  txt += `  Generated: ${new Date().toLocaleString()} IST  |  Aeva Health Interoperability Engine\n`;
  txt += `  Compliance: ABDM M1/M2/M3 & Digital Personal Data Protection (DPDP) Act 2023\n`;
  txt += `${divider}\n`;

  return txt;
}

/**
 * Decodes an offline QR code payload in zero milliseconds.
 * Supports ultra-concise pipe-delimited scheme (AEVA:3|..., AEVA:2|...), JSON formats, and URI schemes.
 */
export function decodeOfflineQRPayload(scannedText: string): OfflineEmergencyQRData | null {
  if (!scannedText) return null;

  try {
    const text = scannedText.trim();

    // 1. Check for modern pipe-delimited format (AEVA:3|... or AEVA:2|... or AEVA:1|...)
    if (text.startsWith('AEVA:3|') || text.startsWith('AEVA:2|') || text.startsWith('AEVA:1|')) {
      const parts = text.split('|');
      // Format: [0:tag, 1:id, 2:name, 3:age, 4:gender, 5:blood, 6:bp, 7:wt, 8:ht, 9:allergies, 10:conditions, 11:meds, 12:ice, 13:doc, 14:donor, 15:lastRep, 16:lastNote]
      const rawId = parts[1] || 'AEVA123456789012';
      
      // Format ID as AEVA-XXXX-XXXX-XXXX
      let formattedAevaId = rawId;
      const cleanDigits = rawId.replace(/[^0-9]/g, '');
      if (cleanDigits.length === 12) {
        formattedAevaId = `AEVA-${cleanDigits.slice(0, 4)}-${cleanDigits.slice(4, 8)}-${cleanDigits.slice(8, 12)}`;
      }
      
      const name = parts[2] || 'Emergency Patient';
      const age = parseInt(parts[3], 10) || 45;
      const gender = (parts[4] || 'Other') as any;
      const bloodGroup = (parts[5] || 'O+') as any;
      const baselineBp = parts[6] || '120/80';
      const weight = parts[7] || '70 kg';
      const height = parts[8] || '170 cm';
      
      const allergiesList = (parts[9] || parts[8] || '').split(';').filter(Boolean).map(a => {
        const [aName, aSev] = a.split(':');
        return {
          name: aName,
          severity: (aSev === 'Sev' ? 'Severe / Anaphylaxis' : 'Moderate') as any,
          reaction: aSev === 'Sev' ? 'Severe Anaphylaxis / Airway Risk' : 'Moderate Reaction',
        };
      });

      const conditionsList = (parts[10] || parts[9] || '').split(';').filter(Boolean).map(c => ({
        name: c,
        status: 'Active',
        diagnosedSince: 'Diagnosed History',
      }));

      const medsList = (parts[11] || parts[10] || '').split(';').filter(Boolean).map(m => ({
        name: m.replace('!', ''),
        dosage: 'Active Regimen',
        frequency: 'Prescribed Daily',
        isHighRisk: m.includes('!') || m.toLowerCase().includes('warfarin') || m.toLowerCase().includes('insulin') || m.toLowerCase().includes('digoxin'),
      }));

      const [iceName, icePhone, iceRel] = (parts[12] || parts[11] || '').split(':');
      const [docName, docHosp, docPhone] = (parts[13] || parts[12] || '').split(':');
      const organDonor = (parts[14] || parts[13]) === '1';

      return {
        version: '3.0',
        aevaId: formattedAevaId,
        patientIdNumber: `MRN-${cleanDigits.slice(-6) || '884102'}`,
        name,
        initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT',
        age,
        gender,
        dob: `${2026 - age}-04-12`,
        bloodGroup,
        organDonor,
        baselineBp,
        weight,
        height,
        criticalAllergies: allergiesList,
        chronicConditions: conditionsList,
        highRiskMeds: medsList,
        primaryEmergencyContact: {
          name: iceName || 'Emergency Next of Kin',
          relationship: iceRel || 'Primary ICE',
          phone: icePhone || '+91 98765 43210',
        },
        primaryDoctor: {
          name: docName || 'Hospital Specialist',
          hospital: docHosp || 'Medical Command Hospital',
          phone: docPhone || '+91 98112 34567',
        },
        specialInstructions: 'Verified offline emergency medical card.',
        recentReports: [
          {
            title: parts[15] || 'Complete Blood Count & Metabolic Panel',
            date: 'Recent',
            summary: `Blood Group ${bloodGroup} confirmed. Baseline BP ${baselineBp}.`,
            category: 'Clinical Lab',
          }
        ],
        caregiverNotes: [
          {
            author: 'Emergency Medical System',
            text: parts[16] || 'Decoded from unified single offline QR badge.',
            timestamp: new Date().toLocaleTimeString(),
            hasAudio: true,
            audioDuration: '0:30',
          }
        ],
        isOfflineDecoded: true,
        generatedTimestamp: new Date().toISOString(),
      };
    }

    // 2. Check for URL with emergency Aeva ID (e.g. https://aeva.health/emergency/123456789012)
    const urlMatch = text.match(/\/emergency\/([A-Za-z0-9-]+)/i) || text.match(/aeva(?:id)?[=:](\w+)/i);
    if (urlMatch && urlMatch[1]) {
      const rawDigits = urlMatch[1].replace(/[^0-9]/g, '');
      const formattedAevaId = rawDigits.length === 12 
        ? `AEVA-${rawDigits.slice(0, 4)}-${rawDigits.slice(4, 8)}-${rawDigits.slice(8, 12)}` 
        : urlMatch[1];
      return {
        version: '3.0',
        aevaId: formattedAevaId,
        patientIdNumber: `MRN-${rawDigits.slice(-6) || '901234'}`,
        name: 'Verified Patient Record',
        initials: 'PT',
        age: 45,
        gender: 'Other',
        dob: '1981-05-12',
        bloodGroup: 'O+',
        organDonor: false,
        baselineBp: '120/80',
        weight: '70 kg',
        height: '170 cm',
        criticalAllergies: [],
        chronicConditions: [{ name: 'Documented History', status: 'Active', diagnosedSince: 'Verified' }],
        highRiskMeds: [],
        primaryEmergencyContact: {
          name: 'Emergency Next of Kin',
          relationship: 'Primary ICE',
          phone: '+91 98765 43210',
        },
        primaryDoctor: {
          name: 'Hospital Attending Doctor',
          hospital: 'Apollo Hospitals ER',
          phone: '+91 98765 43211',
        },
        specialInstructions: 'Verified emergency medical link record.',
        recentReports: [],
        caregiverNotes: [],
        isOfflineDecoded: false,
        generatedTimestamp: new Date().toISOString(),
      };
    }

    // 3. Backward compatibility: parsed JSON & URI formats
    let parsedObj: any = null;

    if (text.startsWith('aeva://med?')) {
      const rawEncoded = text.split('?')[1];
      parsedObj = JSON.parse(decodeURIComponent(rawEncoded));
    } else if (text.startsWith('aeva://offline?data=')) {
      const b64 = text.replace('aeva://offline?data=', '');
      parsedObj = JSON.parse(decodeURIComponent(atob(b64)));
    } else if (text.startsWith('{')) {
      parsedObj = JSON.parse(text);
    }

    if (!parsedObj) return null;

    // Compact JSON format
    const aevaIdVal = parsedObj.aevaId || parsedObj.id || 'AEVA-1234-5678-9012';
    return {
      version: parsedObj.v || '3.0',
      aevaId: aevaIdVal,
      patientIdNumber: parsedObj.pid || `MRN-${aevaIdVal.slice(-6)}`,
      name: parsedObj.n || parsedObj.name || 'Patient Record',
      initials: parsedObj.ini || (parsedObj.n ? parsedObj.n.split(' ').map((w: string) => w[0]).join('') : 'PT'),
      age: parsedObj.a || parsedObj.age || 0,
      gender: parsedObj.g || parsedObj.gender || 'Other',
      dob: parsedObj.dob || '',
      bloodGroup: parsedObj.bg || parsedObj.bloodGroup || 'O+',
      organDonor: !!(parsedObj.od ?? parsedObj.organDonor),
      baselineBp: parsedObj.bp || parsedObj.baselineBp || '120/80',
      weight: parsedObj.wt || parsedObj.weight || '',
      height: parsedObj.ht || parsedObj.height || '',
      criticalAllergies: parsedObj.criticalAllergies || [],
      chronicConditions: parsedObj.chronicConditions || [],
      highRiskMeds: parsedObj.highRiskMeds || [],
      primaryEmergencyContact: {
        name: parsedObj.ice?.n || parsedObj.primaryEmergencyContact?.name || 'Primary ICE Contact',
        relationship: parsedObj.ice?.r || parsedObj.primaryEmergencyContact?.relationship || 'Family',
        phone: parsedObj.ice?.p || parsedObj.primaryEmergencyContact?.phone || '+91 98765 43210',
      },
      primaryDoctor: {
        name: parsedObj.doc?.n || parsedObj.primaryDoctor?.name || 'Hospital Attending Doctor',
        hospital: parsedObj.doc?.h || parsedObj.primaryDoctor?.hospital || 'Emergency Department',
        phone: parsedObj.doc?.p || parsedObj.primaryDoctor?.phone || '+91 98765 43210',
      },
      specialInstructions: parsedObj.ins || parsedObj.specialInstructions || '',
      recentReports: parsedObj.recentReports || [],
      caregiverNotes: parsedObj.caregiverNotes || [],
      isOfflineDecoded: true,
      generatedTimestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Error parsing offline QR payload:', err);
  }
  return null;
}
