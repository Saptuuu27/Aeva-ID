import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  User,
  Heart,
  Stethoscope,
  Building2,
  Ambulance,
  Shield,
  KeyRound,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Fingerprint,
  ChevronDown,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    login,
    patientsList,
    doctorsList,
    hospitalsList,
    selectPatientByAevaId,
    selectDoctorById,
    selectHospitalById,
    setActiveScreen,
    openRegistration,
  } = useApp();

  const [selectedPortal, setSelectedPortal] = useState<UserRole>('patient');

  // Form states
  // 1. Patient
  const [patientLoginMode, setPatientLoginMode] = useState<'aevaId' | 'phone'>('aevaId');
  const [patientAevaId, setPatientAevaId] = useState('AEVA-1234-5678-9012');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [patientPassword, setPatientPassword] = useState('••••••••');

  // 2. Caregiver
  const [caregiverPhone, setCaregiverPhone] = useState('+91 98765 43210');
  const [caregiverOtp, setCaregiverOtp] = useState('884102');
  const [otpSent, setOtpSent] = useState(false);

  // 3. Doctor
  const [doctorRegNo, setDoctorRegNo] = useState('MCI-DL-2012-44910');
  const [doctorPhone, setDoctorPhone] = useState('+91 98101 23456');
  const [doctorPin, setDoctorPin] = useState('9942');

  // 4. Hospital
  const [hospitalLicense, setHospitalLicense] = useState('NABH-DL-2024-0091');
  const [hospitalAdminPin, setHospitalAdminPin] = useState('7721');

  // 5. Emergency Paramedic
  const [paramedicBadge, setParamedicBadge] = useState('EMS-ND-8841');

  const [errorMessage, setErrorMessage] = useState('');

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const idToUse = patientLoginMode === 'aevaId' ? patientAevaId : patientPhone;
    login(idToUse, 'patient');
  };

  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!caregiverPhone) {
      setErrorMessage('Please enter your registered caregiver mobile number.');
      return;
    }
    login(caregiverPhone, 'caregiver');
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!doctorRegNo) {
      setErrorMessage('Please enter your Medical Council Registration Number.');
      return;
    }
    const docFound = doctorsList.find(d => d.registrationNumber.toLowerCase() === doctorRegNo.toLowerCase());
    if (docFound) {
      selectDoctorById(docFound.id);
    }
    login(doctorRegNo, 'doctor');
  };

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const hospFound = hospitalsList.find(h => h.licenseNumber.toLowerCase() === hospitalLicense.toLowerCase());
    if (hospFound) {
      selectHospitalById(hospFound.id);
    }
    login(hospitalLicense, 'hospital');
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(paramedicBadge, 'emergency_staff');
  };

  const quickSwitchDemoPatient = (aevaId: string) => {
    setPatientAevaId(aevaId);
    selectPatientByAevaId(aevaId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 py-8 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <Shield className="w-4 h-4 text-[#002D62]" />
            <span className="text-xs font-black tracking-wider text-[#002D62] uppercase">
              ABDM & DPDP Act 2023 Compliant Health Portal
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Aeva Health Network
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Unified National Digital Health Suite. Choose your dedicated gateway to access patient vitals, clinical records, or trauma admissions.
          </p>
        </div>

        {/* 5 Portals Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-1.5 bg-slate-200/80 rounded-2xl sm:rounded-3xl border border-slate-300/80 shadow-inner">
          {/* 1. Patient */}
          <button
            type="button"
            onClick={() => { setSelectedPortal('patient'); setErrorMessage(''); }}
            className={`p-3 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all ${
              selectedPortal === 'patient'
                ? 'bg-white text-[#002D62] shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              selectedPortal === 'patient' ? 'bg-[#002D62] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black">Patient</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Aeva ID / Phone</div>
            </div>
          </button>

          {/* 2. Caregiver */}
          <button
            type="button"
            onClick={() => { setSelectedPortal('caregiver'); setErrorMessage(''); }}
            className={`p-3 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all ${
              selectedPortal === 'caregiver'
                ? 'bg-white text-emerald-800 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              selectedPortal === 'caregiver' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black">Caregiver</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">Mobile + OTP</div>
            </div>
          </button>

          {/* 3. Doctor */}
          <button
            type="button"
            onClick={() => { setSelectedPortal('doctor'); setErrorMessage(''); }}
            className={`p-3 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all ${
              selectedPortal === 'doctor'
                ? 'bg-white text-indigo-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              selectedPortal === 'doctor' ? 'bg-indigo-700 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black">Doctor</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">MCI Reg + Phone</div>
            </div>
          </button>

          {/* 4. Hospital */}
          <button
            type="button"
            onClick={() => { setSelectedPortal('hospital'); setErrorMessage(''); }}
            className={`p-3 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all ${
              selectedPortal === 'hospital'
                ? 'bg-white text-blue-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              selectedPortal === 'hospital' ? 'bg-[#002D62] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black">Hospital</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">NABH License</div>
            </div>
          </button>

          {/* 5. Emergency */}
          <button
            type="button"
            onClick={() => { setSelectedPortal('emergency_staff'); setErrorMessage(''); }}
            className={`col-span-2 sm:col-span-1 p-3 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all ${
              selectedPortal === 'emergency_staff'
                ? 'bg-white text-rose-800 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              selectedPortal === 'emergency_staff' ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              <Ambulance className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black">Emergency</div>
              <div className="text-[10px] text-slate-500 hidden sm:block">First Responder</div>
            </div>
          </button>
        </div>

        {/* Portal Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-2xl mx-auto w-full">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Patient Form */}
          {selectedPortal === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Patient Health Portal</h2>
                  <p className="text-xs text-slate-500 font-medium">Access your personal Aeva ID, prescriptions, and emergency card.</p>
                </div>
                <span className="bg-blue-50 text-[#002D62] text-xs font-black px-3 py-1 rounded-full border border-blue-200">
                  Patient Mode
                </span>
              </div>

              {/* Login Mode Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setPatientLoginMode('aevaId')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    patientLoginMode === 'aevaId' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Login with Aeva ID
                </button>
                <button
                  type="button"
                  onClick={() => setPatientLoginMode('phone')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    patientLoginMode === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Login with Mobile Number
                </button>
              </div>

              {patientLoginMode === 'aevaId' ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Aeva ID (Universal 12-Digit Healthcare ID)
                  </label>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={patientAevaId}
                      onChange={(e) => setPatientAevaId(e.target.value)}
                      placeholder="e.g. AEVA-1234-5678-9012"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Account Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>
              </div>

              {/* Quick Select Demo Patient Dropdown */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-[#002D62]">
                    <Sparkles className="w-3 h-3 text-[#002D62]" />
                    <span>Quick Select Demo Patient:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{patientsList.length} Profiles</span>
                </div>
                <div className="relative">
                  <select
                    value={patientAevaId}
                    onChange={(e) => quickSwitchDemoPatient(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62] focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.aevaId}>
                        {p.name} ({p.bloodGroup}) — {p.chronicConditions[0]?.name || 'Standard'} • {p.age}y (Aeva ID: {p.aevaId})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Enter Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">New patient without an Aeva ID?</span>
                <button
                  type="button"
                  onClick={() => openRegistration('patient')}
                  className="font-extrabold text-[#002D62] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Register as New Patient</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {/* 2. Caregiver & Family Form */}
          {selectedPortal === 'caregiver' && (
            <form onSubmit={handleCaregiverSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-emerald-900">Caregiver & Family Portal</h2>
                  <p className="text-xs text-slate-500 font-medium">Monitor loved ones, listen to doctor audio notes, and receive alerts.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                  Caregiver Mode
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Caregiver Registered Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700">
                    6-Digit One Time Password (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP via SMS'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={caregiverOtp}
                    onChange={(e) => setCaregiverOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold tracking-widest rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Demo auto-filled OTP is <strong>884102</strong> for instant access.
                </p>
              </div>

              {/* Quick Select Demo Caregiver Dropdown */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Quick Select Demo Caregiver:</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Auto-fills OTP</span>
                </div>
                <div className="relative">
                  <select
                    value={caregiverPhone}
                    onChange={(e) => {
                      setCaregiverPhone(e.target.value);
                      setCaregiverOtp('884102');
                    }}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-emerald-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 appearance-none cursor-pointer"
                  >
                    <option value="+91 98765 43210">Arjun Sharma (Son of Rahul Sharma) — +91 98765 43210</option>
                    <option value="+91 98765 43211">Sunita Sharma (Spouse of Rahul Sharma) — +91 98765 43211</option>
                    <option value="+91 98300 12345">Poulomi Mukherjee (Daughter of Anirban) — +91 98300 12345</option>
                    <option value="+91 98200 67890">Kavita Deshmukh (Spouse of Rajesh) — +91 98200 67890</option>
                    <option value="+91 98450 11223">Vignesh Iyer (Son of Priya Iyer) — +91 98450 11223</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Verify OTP & Enter Caregiver Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">New caregiver / family guardian?</span>
                <button
                  type="button"
                  onClick={() => openRegistration('caregiver')}
                  className="font-extrabold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Register as New Caregiver</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {/* 3. Doctor Portal Form */}
          {selectedPortal === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-indigo-950">Doctor Clinical EHR Portal</h2>
                  <p className="text-xs text-slate-500 font-medium">Prescribe medicines, dictate clinical voice notes, and review EHR.</p>
                </div>
                <span className="bg-indigo-50 text-indigo-800 text-xs font-black px-3 py-1 rounded-full border border-indigo-200">
                  Physician Mode
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Medical Council Registration Number (MCI / State Council)
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={doctorRegNo}
                    onChange={(e) => setDoctorRegNo(e.target.value)}
                    placeholder="e.g. MCI-DL-2012-44910"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Dedicated Doctor Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="+91 98101 23456"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Quick Select Demo Physician Dropdown */}
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Quick Select Demo Physician:</span>
                  </span>
                  <span className="text-[10px] text-indigo-700 font-semibold">{doctorsList.length} Doctors</span>
                </div>
                <div className="relative">
                  <select
                    value={doctorRegNo}
                    onChange={(e) => {
                      const found = doctorsList.find(d => d.registrationNumber === e.target.value);
                      if (found) {
                        setDoctorRegNo(found.registrationNumber);
                        setDoctorPhone(found.phone);
                        selectDoctorById(found.id);
                      }
                    }}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-indigo-300 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                  >
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.registrationNumber}>
                        {d.name} — {d.specialty} • {d.hospital} ({d.city})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Authenticate Doctor Clinical Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">New clinician or specialist doctor?</span>
                <button
                  type="button"
                  onClick={() => openRegistration('doctor')}
                  className="font-extrabold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Register as New Doctor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {/* 4. Hospital Universal Portal Form */}
          {selectedPortal === 'hospital' && (
            <form onSubmit={handleHospitalSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Hospital Universal Registry</h2>
                  <p className="text-xs text-slate-500 font-medium">Manage ICU beds, department rosters, and interconnected MySQL registries.</p>
                </div>
                <span className="bg-blue-50 text-[#002D62] text-xs font-black px-3 py-1 rounded-full border border-blue-200">
                  Hospital Admin
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Hospital NABH / State Healthcare License
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={hospitalLicense}
                    onChange={(e) => setHospitalLicense(e.target.value)}
                    placeholder="e.g. NABH-DL-2024-0091"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Hospital Security Admin PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={hospitalAdminPin}
                    onChange={(e) => setHospitalAdminPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#002D62]"
                  />
                </div>
              </div>

              {/* Quick Select Demo Hospital Dropdown */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#002D62] uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#002D62]" />
                    <span>Quick Select Demo Hospital Facility:</span>
                  </span>
                  <span className="text-[10px] text-[#002D62] font-semibold">{hospitalsList.length} Hospitals</span>
                </div>
                <div className="relative">
                  <select
                    value={hospitalLicense}
                    onChange={(e) => {
                      const found = hospitalsList.find(h => h.licenseNumber === e.target.value);
                      if (found) {
                        setHospitalLicense(found.licenseNumber);
                        selectHospitalById(found.id);
                      }
                    }}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-blue-300 focus:outline-hidden focus:border-[#002D62] focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                  >
                    {hospitalsList.map((h) => (
                      <option key={h.id} value={h.licenseNumber}>
                        {h.name} — {h.city} (License: {h.licenseNumber})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#002D62] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Access Hospital Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">New hospital facility or trauma center?</span>
                <button
                  type="button"
                  onClick={() => openRegistration('hospital')}
                  className="font-extrabold text-[#002D62] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Register New Hospital Facility</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

          {/* 5. Emergency Paramedic Form */}
          {selectedPortal === 'emergency_staff' && (
            <form onSubmit={handleEmergencySubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-rose-950">Emergency & Paramedic Gateway</h2>
                  <p className="text-xs text-rose-700 font-medium">Instant optical QR scanning & zero-latency emergency triage.</p>
                </div>
                <span className="bg-rose-100 text-rose-900 text-xs font-black px-3 py-1 rounded-full border border-rose-200 animate-pulse">
                  Trauma 0ms
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Paramedic / First Responder Badge ID
                </label>
                <div className="relative">
                  <Ambulance className="w-4 h-4 text-rose-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={paramedicBadge}
                    onChange={(e) => setParamedicBadge(e.target.value)}
                    placeholder="e.g. EMS-ND-8841"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono font-bold rounded-xl border border-rose-300 focus:outline-hidden focus:border-rose-600 bg-rose-50/30"
                  />
                </div>
              </div>

              {/* Quick Select Demo Paramedic Dropdown */}
              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>Quick Select Demo Paramedic Unit:</span>
                  </span>
                  <span className="text-[10px] text-rose-700 font-semibold">Trauma Fast-Pass</span>
                </div>
                <div className="relative">
                  <select
                    value={paramedicBadge}
                    onChange={(e) => setParamedicBadge(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white rounded-xl border border-rose-300 focus:outline-hidden focus:border-rose-600 focus:ring-2 focus:ring-rose-100 appearance-none cursor-pointer"
                  >
                    <option value="EMS-ND-8841">EMS-ND-8841 — Delhi NCR EMS Central Trauma Response Team</option>
                    <option value="EMS-WB-1080">EMS-WB-1080 — Kolkata Critical Care Ambulance Unit 02</option>
                    <option value="EMS-MH-1084">EMS-MH-1084 — Mumbai 108 Advanced Cardiac Life Support (ACLS)</option>
                    <option value="EMS-KA-1120">EMS-KA-1120 — Bengaluru Metro 112 Rapid Paramedic Squad</option>
                    <option value="EMS-TN-1088">EMS-TN-1088 — Chennai Trauma Response Unit 08</option>
                    <option value="EMS-TG-1081">EMS-TG-1081 — Hyderabad GVK EMRI 108 Triage Unit</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-rose-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <div className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>EMERGENCY FAST-PASS ACTIVE</span>
                </div>
                <p>
                  Allows immediate optical scanning of unified Aeva ID QR badges in full offline/online conditions without patient PIN requirements.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <span>Launch Emergency Triage Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-rose-100 flex items-center justify-between text-xs">
                <span className="text-rose-900 font-medium">New first responder or EMS paramedic?</span>
                <button
                  type="button"
                  onClick={() => openRegistration('emergency_staff')}
                  className="font-extrabold text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Register New Paramedic</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
