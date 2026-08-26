import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HospitalProfile, PatientProfile, DoctorProfile } from '../types';
import {
  Building2,
  Users,
  Search,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  UserCheck,
  Award,
  FileText,
  AlertCircle,
  Eye,
  X,
  PhoneCall,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const HospitalPortalScreen: React.FC = () => {
  const {
    hospitalsList = [],
    activeHospital,
    selectHospitalById,
    patientsList = [],
    selectPatientById,
    doctorsList = [],
    setActiveScreen,
    logAuditAccess,
    triggerPortalTestAlert,
  } = useApp();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Active Tab: 'doctors' (default) or 'patients'
  const [activeTab, setActiveTab] = useState<'doctors' | 'patients'>('doctors');

  // Safe fallback hospital
  const currentHospital: HospitalProfile = activeHospital || (hospitalsList.length > 0 ? hospitalsList[0] : {
    id: 'hosp_apollo_delhi',
    name: 'Apollo Indraprastha Hospital',
    licenseNumber: 'NABH-DL-2024-0091',
    type: 'Multispecialty',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
    emergencyHelpline: '+91 11 2692 5858 / 1066',
    erBedsTotal: 36,
    erBedsAvailable: 12,
    icuBedsAvailable: 8,
    bloodBankUnitsAvailable: 142,
    traumaLevel: 'Level 1 Apex Trauma Center',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Nephrology', 'Internal Medicine'],
    medicalDirectorName: 'Dr. Sanjay Sachdeva (Medical Director)',
    activeDoctorsCount: 18,
    registeredPatientsCount: 142,
  });

  // Doctor Filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');

  // Patient Filters
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedBloodFilter, setSelectedBloodFilter] = useState('All');

  // Modal / Quick View States
  const [inspectingPatient, setInspectingPatient] = useState<PatientProfile | null>(null);
  const [inspectingDoctor, setInspectingDoctor] = useState<DoctorProfile | null>(null);

  // Day names helper
  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Current day of week for "Available Today" detection
  const todayDayName = useMemo(() => {
    const d = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[d] || 'Mon';
  }, []);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const q = doctorSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(q)) ||
        (doc.opdTimings && doc.opdTimings.toLowerCase().includes(q));

      const matchesDept = selectedDept === 'All' || doc.department.toLowerCase().includes(selectedDept.toLowerCase()) || doc.specialty.toLowerCase().includes(selectedDept.toLowerCase());

      const docDays = doc.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const matchesDay =
        selectedDayFilter === 'All' ||
        (selectedDayFilter === 'Today' && docDays.includes(todayDayName)) ||
        docDays.includes(selectedDayFilter);

      return matchesQuery && matchesDept && matchesDay;
    });
  }, [doctorsList, doctorSearch, selectedDept, selectedDayFilter, todayDayName]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    doctorsList.forEach((d) => {
      if (d.specialty) depts.add(d.specialty.split('&')[0].trim());
    });
    return ['All', ...Array.from(depts)];
  }, [doctorsList]);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patientsList.filter((p) => {
      const q = patientSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.aevaId.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.primaryDoctor && p.primaryDoctor.name.toLowerCase().includes(q)) ||
        (p.chronicConditions && p.chronicConditions.some(c => c.name.toLowerCase().includes(q)));

      const matchesBlood = selectedBloodFilter === 'All' || p.bloodGroup === selectedBloodFilter;

      return matchesQuery && matchesBlood;
    });
  }, [patientsList, patientSearch, selectedBloodFilter]);

  // Handle viewing a patient's EHR
  const handleOpenFullEHR = (patient: PatientProfile) => {
    selectPatientById(patient.id);
    logAuditAccess(
      `Hospital Admin (${currentHospital.licenseNumber})`,
      'Hospital Staff',
      currentHospital.name,
      `Inspected EHR records for ${patient.name} (${patient.aevaId})`
    );
    setActiveScreen('doctor_dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hospital Header & Facility Switcher */}
        <div className="bg-gradient-to-r from-[#002D62] via-[#003882] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <Building2 className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-400/30">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HOSPITAL MANAGEMENT PORTAL</span>
                </span>
                <span className="bg-white/15 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full">
                  NABH License: {currentHospital.licenseNumber}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentHospital.name}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentHospital.address}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>Helpline: <strong>{currentHospital.emergencyHelpline}</strong></span>
                </div>
                {currentHospital.medicalDirectorName && (
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Director: <strong>{currentHospital.medicalDirectorName}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital Switcher */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3 min-w-[260px]">
              <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Active Facility:</span>
                </span>
                <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
                  ONLINE
                </span>
              </div>

              <select
                value={currentHospital.id}
                onChange={(e) => selectHospitalById(e.target.value)}
                className="w-full bg-slate-900/90 text-white font-bold text-xs p-2.5 rounded-xl border border-blue-300/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                {hospitalsList.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-white font-medium">
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white/10 p-2 rounded-xl">
                  <div className="text-[10px] text-blue-200">Active Doctors</div>
                  <div className="font-mono font-bold text-emerald-300">{doctorsList.length} Doctors</div>
                </div>
                <div className="bg-white/10 p-2 rounded-xl">
                  <div className="text-[10px] text-blue-200">Total Patients</div>
                  <div className="font-mono font-bold text-indigo-300">{patientsList.length} Registered</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerPortalTestAlert('hospital')}
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/40 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Test real-time trauma alert popup for hospital ER"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                <span>Test Live Ambulance / ER Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Primary Tabs: Doctors Details & Availability Schedule vs All Patients Record */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'doctors'
                ? 'bg-[#002D62] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Details & Availability Schedule</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'doctors' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {doctorsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patients')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'patients'
                ? 'bg-[#002D62] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Patients Records</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'patients' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {patientsList.length}
            </span>
          </button>
        </div>

        {/* ================= VIEW 1: DOCTORS DETAILS & AVAILABILITY SCHEDULE ================= */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Doctor */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name, specialty, reg..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#002D62] focus:border-transparent"
                  />
                  {doctorSearch && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Specialty:</span>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full md:w-auto text-xs font-semibold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability Day Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-2 shrink-0 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#002D62]" />
                  <span>Available on Day:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDayFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayFilter === 'All'
                      ? 'bg-[#002D62] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Days
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDayFilter('Today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    selectedDayFilter === 'Today'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Today ({todayDayName})</span>
                </button>

                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayFilter(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDayFilter === day
                        ? 'bg-[#002D62] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards Grid */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No doctors match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing the search query or selecting "All Days" in the schedule filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDoctorSearch('');
                    setSelectedDept('All');
                    setSelectedDayFilter('All');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDoctors.map((doc) => {
                  const docDays = doc.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                  const isAvailableToday = docDays.includes(todayDayName);

                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header: Doctor Avatar & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl ${doc.avatarColor || 'bg-[#002D62]'} text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}>
                              {doc.initials || doc.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                                {doc.name}
                              </h3>
                              <div className="text-xs text-slate-500 font-medium">
                                {doc.degrees}
                              </div>
                            </div>
                          </div>

                          {/* Today Availability Badge */}
                          {isAvailableToday ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300 shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>IN HOSPITAL TODAY</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                              Off-Duty Today
                            </span>
                          )}
                        </div>

                        {/* Speciality & Department */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                          <div className="text-xs font-bold text-[#002D62]">
                            {doc.specialty}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {doc.department} • Exp: {doc.experienceYears} Years
                          </div>
                          {doc.registrationNumber && (
                            <div className="text-[10px] font-mono text-slate-500">
                              Reg: {doc.registrationNumber}
                            </div>
                          )}
                        </div>

                        {/* Availability Schedule & Days */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#002D62]" />
                              <span>Visiting Days:</span>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {doc.opdTimings || '09:00 AM - 01:00 PM'}
                            </span>
                          </div>

                          {/* Day badges (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {DAYS_OF_WEEK.map((day) => {
                              const isAvail = docDays.includes(day);
                              const isToday = day === todayDayName;
                              return (
                                <span
                                  key={day}
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                    isAvail
                                      ? isToday
                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs font-extrabold'
                                        : 'bg-[#002D62]/10 text-[#002D62] border-[#002D62]/30'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-medium">{doc.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[11px] font-medium text-slate-500">{doc.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setInspectingDoctor(doc)}
                          className="w-full bg-slate-100 hover:bg-[#002D62] hover:text-white text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Profile & Schedule</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: ALL PATIENT RECORDS ================= */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Patient */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search patient name, Aeva ID, phone, condition..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#002D62] focus:border-transparent"
                  />
                  {patientSearch && (
                    <button
                      type="button"
                      onClick={() => setPatientSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Blood Group Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Blood Group:</span>
                  <select
                    value={selectedBloodFilter}
                    onChange={(e) => setSelectedBloodFilter(e.target.value)}
                    className="w-full sm:w-auto text-xs font-semibold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="All">All Blood Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Patients List Grid */}
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No patient records found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the search keywords or selecting all blood groups.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPatientSearch('');
                    setSelectedBloodFilter('All');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Reset Patient Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#002D62] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                            {patient.initials || patient.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                              {patient.name}
                            </h3>
                            <div className="text-xs font-mono text-slate-500 font-bold">
                              {patient.aevaId}
                            </div>
                          </div>
                        </div>

                        <span className="bg-rose-100 text-rose-800 text-xs font-black font-mono px-2.5 py-1 rounded-xl border border-rose-200 shrink-0">
                          {patient.bloodGroup}
                        </span>
                      </div>

                      {/* Vital Specs */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Age / Gender</span>
                          <span className="font-bold text-slate-800">{patient.age} Yrs • {patient.gender}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Avg BP</span>
                          <span className="font-bold text-slate-800">{patient.avgBp || '120/80'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Status</span>
                          <span className="font-bold text-emerald-700">{patient.status || 'Stable'}</span>
                        </div>
                      </div>

                      {/* Primary Doctor & Hospital */}
                      {patient.primaryDoctor && (
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-[#002D62] shrink-0" />
                          <span>Primary Care: <strong>{patient.primaryDoctor.name}</strong> ({patient.primaryDoctor.hospital})</span>
                        </div>
                      )}

                      {/* Allergies & Conditions */}
                      <div className="space-y-1 text-xs">
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="text-rose-700 font-medium flex items-center gap-1 truncate">
                            <span className="font-bold">Allergies:</span>
                            <span>{patient.allergies.map(a => a.name).join(', ')}</span>
                          </div>
                        )}

                        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                          <div className="text-slate-600 flex items-center gap-1 truncate">
                            <span className="font-bold text-slate-700">Conditions:</span>
                            <span>{patient.chronicConditions.map(c => c.name).join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact info */}
                      <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{patient.phone}</span>
                        </span>
                        {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
                          <span className="text-[11px] text-slate-600 font-medium truncate">
                            ICE: {patient.emergencyContacts[0].name} ({patient.emergencyContacts[0].relationship})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingPatient(patient)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenFullEHR(patient)}
                        className="flex-1 bg-[#002D62] hover:bg-[#001D40] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Full EHR Record</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODAL 1: DOCTOR FULL PROFILE & SCHEDULE ================= */}
        {inspectingDoctor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#002D62] to-slate-900 text-white p-6 relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${inspectingDoctor.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0`}>
                    {inspectingDoctor.initials || inspectingDoctor.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-white">
                      {inspectingDoctor.name}
                    </h3>
                    <p className="text-xs text-blue-200 font-medium">
                      {inspectingDoctor.degrees}
                    </p>
                    <span className="inline-block mt-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Reg No: {inspectingDoctor.registrationNumber || 'NMC-VERIFIED'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingDoctor(null)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Visiting Schedule Box */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#002D62] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>OPD Visiting Days & Schedule</span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {inspectingDoctor.opdTimings || '09:00 AM - 01:00 PM'}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const docDays = inspectingDoctor.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                      const isAvail = docDays.includes(day);
                      const isToday = day === todayDayName;
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded-xl text-center border text-xs ${
                            isAvail
                              ? isToday
                                ? 'bg-emerald-600 text-white border-emerald-700 font-extrabold'
                                : 'bg-[#002D62] text-white border-[#002D62] font-bold'
                              : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="font-extrabold text-[11px]">{day}</div>
                          <div className="text-[9px] mt-0.5">{isAvail ? (isToday ? 'Today' : 'Open') : 'Off'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specialty & Bio */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Specialization</h4>
                  <div className="text-sm font-extrabold text-slate-900">{inspectingDoctor.specialty}</div>
                  {inspectingDoctor.subSpecialty && (
                    <div className="text-xs text-slate-600 font-medium">Sub-Specialty: {inspectingDoctor.subSpecialty}</div>
                  )}
                  <div className="text-xs text-slate-600">{inspectingDoctor.department} • {inspectingDoctor.hospital}</div>
                  {inspectingDoctor.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-2">
                      {inspectingDoctor.bio}
                    </p>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Experience</span>
                    <span className="font-bold text-slate-900 text-sm">{inspectingDoctor.experienceYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Consultation</span>
                    <span className="font-bold text-slate-900 text-sm">{inspectingDoctor.consultationFee || '₹1,500'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rating</span>
                    <span className="font-bold text-amber-600 text-sm">★ {inspectingDoctor.rating || 4.9} / 5</span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 text-xs text-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Contact</h4>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#002D62]" />
                    <span className="font-semibold">{inspectingDoctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#002D62]" />
                    <span className="font-semibold">{inspectingDoctor.email}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingDoctor(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: PATIENT QUICK DETAILS ================= */}
        {inspectingPatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#002D62] to-slate-900 text-white p-6 relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {inspectingPatient.initials || inspectingPatient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">
                      {inspectingPatient.name}
                    </h3>
                    <div className="text-xs font-mono text-blue-200">
                      {inspectingPatient.aevaId}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingPatient(null)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Blood Group</span>
                    <span className="font-extrabold text-rose-700 text-sm">{inspectingPatient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Age / Gender</span>
                    <span className="font-bold text-slate-800 text-sm">{inspectingPatient.age} Yrs • {inspectingPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Phone</span>
                    <span className="font-semibold text-slate-800">{inspectingPatient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Email</span>
                    <span className="font-semibold text-slate-800">{inspectingPatient.email}</span>
                  </div>
                </div>

                {inspectingPatient.allergies && inspectingPatient.allergies.length > 0 && (
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 space-y-1">
                    <span className="font-black text-rose-800 block">Known Allergies</span>
                    {inspectingPatient.allergies.map((alg, idx) => (
                      <div key={idx} className="text-rose-700">
                        • <strong>{alg.name}</strong>: {alg.reaction} ({alg.severity})
                      </div>
                    ))}
                  </div>
                )}

                {inspectingPatient.chronicConditions && inspectingPatient.chronicConditions.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">Chronic Conditions</span>
                    {inspectingPatient.chronicConditions.map((cond, idx) => (
                      <div key={idx} className="text-slate-700">
                        • <strong>{cond.name}</strong> ({cond.diagnosedSince || cond.diagnosedYear}) - {cond.status}
                      </div>
                    ))}
                  </div>
                )}

                {inspectingPatient.emergencyContacts && inspectingPatient.emergencyContacts.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Emergency ICE Contact</span>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-800">
                      <strong>{inspectingPatient.emergencyContacts[0].name}</strong> ({inspectingPatient.emergencyContacts[0].relationship}) - {inspectingPatient.emergencyContacts[0].phone}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingPatient(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = inspectingPatient;
                    setInspectingPatient(null);
                    handleOpenFullEHR(p);
                  }}
                  className="bg-[#002D62] hover:bg-[#001D40] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full EHR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
