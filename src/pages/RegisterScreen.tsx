import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  User,
  Heart,
  Stethoscope,
  Building2,
  Ambulance,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Phone,
  CreditCard,
  Lock,
  Sparkles,
  MapPin,
  BedDouble,
  Activity,
  Award,
} from 'lucide-react';

export const RegisterScreen: React.FC = () => {
  const {
    registrationRole,
    setRegistrationRole,
    registerPatient,
    registerCaregiver,
    registerDoctor,
    registerHospital,
    registerEmergencyStaff,
    setActiveScreen,
    patientsList,
    hospitalsList,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(registrationRole || 'patient');

  useEffect(() => {
    if (registrationRole) {
      setSelectedRole(registrationRole);
    }
  }, [registrationRole]);

  // 1. Patient Registration Form State
  const [patientStep, setPatientStep] = useState(1);
  const [patientName, setPatientName] = useState('Priya Sharma');
  const [patientMobile, setPatientMobile] = useState('9812345678');
  const [patientDob, setPatientDob] = useState('1988-04-12');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [patientAllergies, setPatientAllergies] = useState('Aspirin, Penicillin');
  const [patientConditions, setPatientConditions] = useState('Asthma');
  const [patientContactName, setPatientContactName] = useState('Kavita Sharma (Sister)');
  const [patientContactPhone, setPatientContactPhone] = useState('+91 98123 45679');

  // 2. Caregiver Registration Form State
  const [cgName, setCgName] = useState('Siddharth Verma');
  const [cgPhone, setCgPhone] = useState('+91 98765 11223');
  const [cgRelation, setCgRelation] = useState('Son');
  const [cgLinkedPatientAevaId, setCgLinkedPatientAevaId] = useState(patientsList[0]?.aevaId || 'AEVA-1234-5678-9012');
  const [cgPin, setCgPin] = useState('4491');
  const [cgPermissions, setCgPermissions] = useState<string[]>([
    'Vitals & Medication Monitoring',
    'Emergency Alert Broadcasts',
    'Voice Note Observations',
  ]);

  // 3. Doctor Registration Form State
  const [docName, setDocName] = useState('Dr. Radhika Sen');
  const [docRegNo, setDocRegNo] = useState('MCI-DL-2016-8812');
  const [docSpecialty, setDocSpecialty] = useState('Interventional Cardiology');
  const [docDegrees, setDocDegrees] = useState('MBBS, MD (Medicine), DM (Cardiology)');
  const [docHospital, setDocHospital] = useState('Apollo Multispecialty Hospitals');
  const [docDepartment, setDocDepartment] = useState('Cardiology & Cath Lab');
  const [docPhone, setDocPhone] = useState('+91 98200 44556');
  const [docEmail, setDocEmail] = useState('dr.radhika@apollo.org');
  const [docExperience, setDocExperience] = useState(12);
  const [docOpdTimings, setDocOpdTimings] = useState('Mon - Fri: 10:00 AM - 04:00 PM');
  const [docEmergencyOnCall, setDocEmergencyOnCall] = useState(true);
  const [docFee, setDocFee] = useState('₹1,000');

  // 4. Hospital Registration Form State
  const [hospName, setHospName] = useState('Max Super Speciality Hospital');
  const [hospLicense, setHospLicense] = useState('NABH-DEL-2025-410');
  const [hospType, setHospType] = useState<'Multispecialty' | 'Government Apex' | 'Super Speciality' | 'Trauma Center'>('Super Speciality');
  const [hospCity, setHospCity] = useState('New Delhi');
  const [hospState, setHospState] = useState('Delhi NCR');
  const [hospAddress, setHospAddress] = useState('1, Press Enclave Road, Saket, New Delhi 110017');
  const [hospHelpline, setHospHelpline] = useState('+91 11 2651 5050 / 1066');
  const [hospErBeds, setHospErBeds] = useState(40);
  const [hospErBedsAvailable, setHospErBedsAvailable] = useState(14);
  const [hospIcuBeds, setHospIcuBeds] = useState(12);
  const [hospBloodUnits, setHospBloodUnits] = useState(140);
  const [hospTraumaLevel, setHospTraumaLevel] = useState('Level 1 Apex Trauma Center');
  const [hospDirector, setHospDirector] = useState('Dr. Sanjay Sachdeva (Medical Director)');

  // 5. Emergency Staff Registration Form State
  const [emsName, setEmsName] = useState('Officer Amit Deshmukh');
  const [emsBadge, setEmsBadge] = useState('EMS-DL-9921');
  const [emsAgency, setEmsAgency] = useState('National Emergency Ambulance Service (108)');
  const [emsCertLevel, setEmsCertLevel] = useState('Advanced Life Support (ALS) Paramedic');
  const [emsBaseHospital, setEmsBaseHospital] = useState('Apollo Hospitals Sarita Vihar Trauma Wing');
  const [emsPhone, setEmsPhone] = useState('+91 99110 88220');

  // Submit Handlers
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientStep < 3) {
      setPatientStep(patientStep + 1);
      return;
    }

    registerPatient({
      name: patientName,
      phone: `+91 ${patientMobile}`,
      dob: patientDob,
      age: 38,
      gender: patientGender,
      bloodGroup: patientBloodGroup,
      initials: patientName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      allergies: patientAllergies
        ? patientAllergies.split(',').map((alg, idx) => ({
            id: `alg_${idx}`,
            name: alg.trim(),
            reaction: 'Known allergic sensitivity',
            severity: 'moderate' as const,
          }))
        : [],
      chronicConditions: patientConditions
        ? patientConditions.split(',').map((c, idx) => ({
            id: `cond_${idx}`,
            name: c.trim(),
            diagnosedSince: '2022',
            status: 'Managed',
          }))
        : [],
      emergencyContacts: [
        {
          id: 'ec_new',
          name: patientContactName,
          relationship: 'Family Member',
          phone: patientContactPhone,
          isPrimary: true,
        },
      ],
      primaryDoctor: {
        id: 'doc_priya',
        name: 'Dr. Vikram Malhotra',
        specialty: 'Internal Medicine & Critical Care',
        hospital: 'Apollo Hospitals',
        phone: '+91 98111 22334',
        initials: 'VM',
      },
      organDonor: true,
      specialInstructions: 'Universal Aeva Digital Health Passport with Emergency NFC/QR Fast-Pass.',
    });
  };

  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerCaregiver({
      name: cgName,
      phone: cgPhone,
      relation: cgRelation,
      linkedPatientAevaId: cgLinkedPatientAevaId,
      guardianPin: cgPin,
      permissions: cgPermissions,
    });
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerDoctor({
      name: docName,
      registrationNumber: docRegNo,
      specialty: docSpecialty,
      degrees: docDegrees,
      hospital: docHospital,
      department: docDepartment,
      city: 'New Delhi',
      phone: docPhone,
      email: docEmail,
      experienceYears: Number(docExperience),
      opdTimings: docOpdTimings,
      emergencyOnCall: docEmergencyOnCall,
      consultationFee: docFee,
    });
  };

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerHospital({
      name: hospName,
      licenseNumber: hospLicense,
      type: hospType,
      city: hospCity,
      state: hospState,
      address: hospAddress,
      emergencyHelpline: hospHelpline,
      erBedsTotal: Number(hospErBeds),
      erBedsAvailable: Number(hospErBedsAvailable),
      icuBedsAvailable: Number(hospIcuBeds),
      bloodBankUnitsAvailable: Number(hospBloodUnits),
      traumaLevel: hospTraumaLevel,
      departments: ['Emergency Trauma Unit', 'Cardiology', 'ICU Critical Care', 'Neurosurgery', 'Pediatrics'],
      medicalDirectorName: hospDirector,
    });
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerEmergencyStaff({
      name: emsName,
      badgeNumber: emsBadge,
      agencyOrStation: emsAgency,
      certificationLevel: emsCertLevel,
      baseHospital: emsBaseHospital,
      contactPhone: emsPhone,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 py-8 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Top Back to Login Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveScreen('login')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#002D62] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Sign In</span>
          </button>

          <span className="text-[11px] font-black text-[#002D62] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Universal ABDM Onboarding
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Create New Account & Health Clearance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Select your role to generate your universal ID, digital credentials, or facility registry.
          </p>
        </div>

        {/* 5-Portal Role Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-200/80 rounded-2xl sm:rounded-3xl border border-slate-300 shadow-inner">
          {/* 1. Patient */}
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`p-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'patient'
                ? 'bg-white text-[#002D62] shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              selectedRole === 'patient' ? 'bg-[#002D62] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-black">Patient</span>
          </button>

          {/* 2. Caregiver */}
          <button
            type="button"
            onClick={() => setSelectedRole('caregiver')}
            className={`p-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'caregiver'
                ? 'bg-white text-emerald-800 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              selectedRole === 'caregiver' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs font-black">Caregiver</span>
          </button>

          {/* 3. Doctor */}
          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`p-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'doctor'
                ? 'bg-white text-indigo-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              selectedRole === 'doctor' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-xs font-black">Doctor</span>
          </button>

          {/* 4. Hospital */}
          <button
            type="button"
            onClick={() => setSelectedRole('hospital')}
            className={`p-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'hospital'
                ? 'bg-white text-blue-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              selectedRole === 'hospital' ? 'bg-[#002D62] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-black">Hospital</span>
          </button>

          {/* 5. Emergency */}
          <button
            type="button"
            onClick={() => setSelectedRole('emergency_staff')}
            className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              selectedRole === 'emergency_staff'
                ? 'bg-white text-rose-800 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              selectedRole === 'emergency_staff' ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Ambulance className="w-4 h-4" />
            </div>
            <span className="text-xs font-black">Paramedic</span>
          </button>
        </div>

        {/* Role Specific Registration Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          {/* ================= 1. PATIENT REGISTRATION ================= */}
          {selectedRole === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#002D62]">
                    New Patient Universal Health ID Enrollment
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Step {patientStep} of 3 • Generates your 12-Digit Aeva Medical ID & Emergency QR Card
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${
                        patientStep === s
                          ? 'bg-[#002D62] text-white'
                          : patientStep > s
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {patientStep > s ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : s}
                    </div>
                  ))}
                </div>
              </div>

              {patientStep === 1 && (
                <div className="space-y-4">
                  <div className="text-xs font-black text-[#002D62] uppercase tracking-wider">
                    1. Personal & Contact Demographics
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">+91</span>
                        <input
                          type="tel"
                          value={patientMobile}
                          onChange={(e) => setPatientMobile(e.target.value)}
                          required
                          placeholder="9876543210"
                          className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={patientDob}
                        onChange={(e) => setPatientDob(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Biological Gender</label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={patientBloodGroup}
                        onChange={(e) => setPatientBloodGroup(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-bold text-rose-700 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                      >
                        <option value="O+">O+ (Universal RBC Recipient)</option>
                        <option value="O-">O- (Universal RBC Donor)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+ (Universal Plasma Donor)</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {patientStep === 2 && (
                <div className="space-y-4">
                  <div className="text-xs font-black text-[#002D62] uppercase tracking-wider">
                    2. Critical Allergies & Medical History
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Drug / Food Allergies (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={patientAllergies}
                      onChange={(e) => setPatientAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, NSAIDs, Sulfa, Peanuts"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Highlighted in bright red on your emergency lockscreen card.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chronic Medical Conditions
                    </label>
                    <input
                      type="text"
                      value={patientConditions}
                      onChange={(e) => setPatientConditions(e.target.value)}
                      placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="organ_donor"
                      defaultChecked
                      className="w-4 h-4 text-[#002D62] rounded"
                    />
                    <label htmlFor="organ_donor" className="text-xs text-slate-700 font-bold cursor-pointer">
                      Pledge as Registered Organ Donor (NOTTO / National Organ Registry)
                    </label>
                  </div>
                </div>
              )}

              {patientStep === 3 && (
                <div className="space-y-4">
                  <div className="text-xs font-black text-[#002D62] uppercase tracking-wider">
                    3. Emergency Contact & SOS Auto-Alerts
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Emergency Contact Name & Relation
                    </label>
                    <input
                      type="text"
                      value={patientContactName}
                      onChange={(e) => setPatientContactName(e.target.value)}
                      required
                      placeholder="e.g. Kavita Sharma (Sister / Guardian)"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={patientContactPhone}
                      onChange={(e) => setPatientContactPhone(e.target.value)}
                      required
                      placeholder="+91 98123 45679"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Zero-Knowledge DPDP Consent Protection</span>
                    </div>
                    <p>
                      Your health records will remain privately encrypted on your device and can be securely accessed by first responders via optical QR scan in an emergency.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {patientStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPatientStep(patientStep - 1)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    ← Previous Step
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="bg-[#002D62] hover:bg-[#001D40] text-white px-6 py-3 rounded-2xl text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  <span>{patientStep === 3 ? 'Generate Aeva ID & Enter Portal' : 'Continue to Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. CAREGIVER REGISTRATION ================= */}
          {selectedRole === 'caregiver' && (
            <form onSubmit={handleCaregiverSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                    Family Guardian & Caregiver Enrollment
                  </h2>
                  <p className="text-xs text-emerald-700 font-medium">
                    Monitor loved ones, track dose adherence, and receive critical SOS emergency alerts.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  Caregiver Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caregiver Full Name</label>
                  <input
                    type="text"
                    value={cgName}
                    onChange={(e) => setCgName(e.target.value)}
                    required
                    placeholder="e.g. Siddharth Verma"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caregiver Mobile</label>
                  <input
                    type="tel"
                    value={cgPhone}
                    onChange={(e) => setCgPhone(e.target.value)}
                    required
                    placeholder="+91 98765 11223"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relationship to Patient</label>
                  <select
                    value={cgRelation}
                    onChange={(e) => setCgRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Parent">Parent / Mother / Father</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Professional Nurse">Professional Nurse / Attendant</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Patient's Aeva ID / Mobile
                  </label>
                  <input
                    type="text"
                    value={cgLinkedPatientAevaId}
                    onChange={(e) => setCgLinkedPatientAevaId(e.target.value)}
                    required
                    placeholder="e.g. AEVA-1234-5678-9012"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create 4-Digit Guardian Security PIN
                </label>
                <div className="relative max-w-xs">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength={4}
                    value={cgPin}
                    onChange={(e) => setCgPin(e.target.value)}
                    required
                    placeholder="4-digit PIN"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Granted Guardian Permissions:</label>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {['Medication Schedule & Missed Dose Reminders', 'Live SOS Beacon & Geolocation Broadcasts', 'Voice Dictation & Clinical Observations Handoff'].map((perm) => (
                    <label key={perm} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Register Caregiver & Link Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= 3. DOCTOR REGISTRATION ================= */}
          {selectedRole === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-indigo-950">
                    Physician & Clinician Registration
                  </h2>
                  <p className="text-xs text-indigo-700 font-medium">
                    National Medical Council (NMC / MCI) verified digital prescription & clinical suite.
                  </p>
                </div>
                <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full">
                  Doctor Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor's Full Name</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Radhika Sen"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Council Reg. No (MCI)</label>
                  <input
                    type="text"
                    value={docRegNo}
                    onChange={(e) => setDocRegNo(e.target.value)}
                    required
                    placeholder="e.g. MCI-DL-2016-8812"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Specialty</label>
                  <select
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="Interventional Cardiology">Interventional Cardiology</option>
                    <option value="Critical Care Medicine & Trauma">Critical Care Medicine & Trauma</option>
                    <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
                    <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Orthopedics & Joint Surgery">Orthopedics & Joint Surgery</option>
                    <option value="Pediatrics & Neonatology">Pediatrics & Neonatology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Degrees & Qualifications</label>
                  <input
                    type="text"
                    value={docDegrees}
                    onChange={(e) => setDocDegrees(e.target.value)}
                    required
                    placeholder="e.g. MBBS, MD, DM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
                  <input
                    type="text"
                    value={docHospital}
                    onChange={(e) => setDocHospital(e.target.value)}
                    required
                    placeholder="e.g. Apollo Multispecialty Hospitals"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">OPD Clinic Timings</label>
                  <input
                    type="text"
                    value={docOpdTimings}
                    onChange={(e) => setDocOpdTimings(e.target.value)}
                    placeholder="e.g. Mon-Sat 10:00 AM - 04:00 PM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Doctor Contact Phone</label>
                  <input
                    type="tel"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    required
                    placeholder="+91 98200 44556"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Clinical Email</label>
                  <input
                    type="email"
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    required
                    placeholder="dr.name@hospital.org"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="doc_on_call"
                  checked={docEmergencyOnCall}
                  onChange={(e) => setDocEmergencyOnCall(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="doc_on_call" className="text-xs text-slate-800 font-bold cursor-pointer">
                  Available for Emergency Golden-Hour On-Call Triage & Trauma Consults
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Register Doctor & Enter Clinical EHR Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= 4. HOSPITAL REGISTRATION ================= */}
          {selectedRole === 'hospital' && (
            <form onSubmit={handleHospitalSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#002D62]">
                    Hospital Facility & Universal Bed Grid Enrollment
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Connect your healthcare facility to live ambulance dispatch, bed matrix, and oxygen telemetry.
                  </p>
                </div>
                <span className="bg-blue-100 text-[#002D62] text-xs font-bold px-3 py-1 rounded-full">
                  Hospital Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Medical Center Name</label>
                  <input
                    type="text"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                    required
                    placeholder="e.g. Max Super Speciality Hospital"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NABH / State License Number</label>
                  <input
                    type="text"
                    value={hospLicense}
                    onChange={(e) => setHospLicense(e.target.value)}
                    required
                    placeholder="e.g. NABH-DEL-2025-410"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Category</label>
                  <select
                    value={hospType}
                    onChange={(e) => setHospType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  >
                    <option value="Super Speciality">Super Speciality</option>
                    <option value="Multispecialty">Multispecialty</option>
                    <option value="Government Apex">Government Apex Center</option>
                    <option value="Trauma Center">Apex Level 1 Trauma Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={hospCity}
                    onChange={(e) => setHospCity(e.target.value)}
                    required
                    placeholder="e.g. New Delhi"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">24x7 Emergency Helpline</label>
                  <input
                    type="text"
                    value={hospHelpline}
                    onChange={(e) => setHospHelpline(e.target.value)}
                    required
                    placeholder="e.g. 1066 / 011-26515050"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={hospAddress}
                  onChange={(e) => setHospAddress(e.target.value)}
                  required
                  placeholder="e.g. 1, Press Enclave Road, Saket, New Delhi"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                />
              </div>

              {/* Bed Metrics Inputs */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" />
                  <span>Real-Time Bed Allocation & Capacity Setup:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Total ER Trauma Bays</label>
                    <input
                      type="number"
                      value={hospErBeds}
                      onChange={(e) => setHospErBeds(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ER Beds Available</label>
                    <input
                      type="number"
                      value={hospErBedsAvailable}
                      onChange={(e) => setHospErBedsAvailable(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-sm font-bold text-emerald-700 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ICU Ventilator Beds</label>
                    <input
                      type="number"
                      value={hospIcuBeds}
                      onChange={(e) => setHospIcuBeds(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-sm font-bold text-indigo-700 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Blood Units in Stock</label>
                    <input
                      type="number"
                      value={hospBloodUnits}
                      onChange={(e) => setHospBloodUnits(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-sm font-bold text-rose-700 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Register Facility & Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= 5. EMERGENCY RESPONDER REGISTRATION ================= */}
          {selectedRole === 'emergency_staff' && (
            <form onSubmit={handleEmergencySubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-rose-950">
                    Paramedic & Emergency First Responder Credentialing
                  </h2>
                  <p className="text-xs text-rose-700 font-medium">
                    Zero-latency optical Aeva ID badge triage scanner & trauma radio integration.
                  </p>
                </div>
                <span className="bg-rose-100 text-rose-900 text-xs font-bold px-3 py-1 rounded-full">
                  Paramedic Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Responder Full Name</label>
                  <input
                    type="text"
                    value={emsName}
                    onChange={(e) => setEmsName(e.target.value)}
                    required
                    placeholder="e.g. Officer Amit Deshmukh"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">EMS Badge / Dispatch ID</label>
                  <input
                    type="text"
                    value={emsBadge}
                    onChange={(e) => setEmsBadge(e.target.value)}
                    required
                    placeholder="e.g. EMS-DL-9921"
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ambulance Service / EMS Agency</label>
                  <input
                    type="text"
                    value={emsAgency}
                    onChange={(e) => setEmsAgency(e.target.value)}
                    required
                    placeholder="e.g. National Emergency Ambulance Service 108"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">EMS Certification Level</label>
                  <select
                    value={emsCertLevel}
                    onChange={(e) => setEmsCertLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  >
                    <option value="Advanced Life Support (ALS) Paramedic">Advanced Life Support (ALS) Paramedic</option>
                    <option value="Basic Life Support (BLS) EMT">Basic Life Support (BLS) EMT</option>
                    <option value="Critical Care Transport Specialist">Critical Care Transport Specialist</option>
                    <option value="Trauma Flight Paramedic">Trauma Flight Paramedic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Trauma Hospital</label>
                  <input
                    type="text"
                    value={emsBaseHospital}
                    onChange={(e) => setEmsBaseHospital(e.target.value)}
                    required
                    placeholder="e.g. Apollo Sarita Vihar Trauma Center"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paramedic Direct Mobile</label>
                  <input
                    type="tel"
                    value={emsPhone}
                    onChange={(e) => setEmsPhone(e.target.value)}
                    required
                    placeholder="+91 99110 88220"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-rose-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Activate Responder Fast-Pass Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
