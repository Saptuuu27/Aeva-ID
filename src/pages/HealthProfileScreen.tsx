import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Stethoscope,
  PhoneCall,
  BriefcaseMedical,
  Pill,
  Scissors,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Heart,
  Plus,
  ShieldCheck,
  Edit,
} from 'lucide-react';

export const HealthProfileScreen: React.FC = () => {
  const { patient, medications, setActiveScreen, updatePatientProfile } = useApp();

  const [medicalOverviewOpen, setMedicalOverviewOpen] = useState(true);
  const [activeMedsOpen, setActiveMedsOpen] = useState(false);
  const [surgeriesOpen, setSurgeriesOpen] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Title Header matching screenshot */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002D62] tracking-tight">
            Health Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your personal and medical information.
          </p>
        </div>

        {/* 1. Patient Info Card matching screenshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3.5">
            {/* Initials Avatar Badge with no profile photo as requested */}
            <div className="w-14 h-14 rounded-full bg-[#003882] text-white flex items-center justify-center font-black text-xl tracking-tight shadow-sm border-2 border-blue-100">
              {patient.initials}
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {patient.name}
              </h2>
              <div className="text-xs font-semibold text-slate-500">
                Patient ID: {patient.patientIdNumber}
              </div>
              <div className="text-[11px] font-mono text-blue-700 font-bold">
                Aeva ID: {patient.aevaId}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Date of Birth</span>
              <span className="font-extrabold text-slate-800">{patient.dob}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Gender</span>
              <span className="font-extrabold text-slate-800">{patient.gender}</span>
            </div>

            <div className="flex items-center justify-between items-center">
              <span className="text-slate-500 font-medium">Blood Group</span>
              <span className="bg-red-100 text-rose-700 font-extrabold text-base px-3 py-0.5 rounded-full">
                {patient.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Primary Doctor Card matching screenshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Stethoscope className="w-5 h-5 text-[#002D62]" />
            <span>Primary Doctor</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#003882] flex items-center justify-center font-bold text-base shadow-2xs">
              {patient.primaryDoctor.initials}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base">
                {patient.primaryDoctor.name}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {patient.primaryDoctor.specialty} • {patient.primaryDoctor.hospital}
              </div>
            </div>
          </div>

          <a
            href={`tel:${patient.primaryDoctor.phone}`}
            className="w-full bg-white hover:bg-slate-50 border-2 border-[#002D62] text-[#002D62] font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all block text-center"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Contact Doctor ({patient.primaryDoctor.phone})</span>
          </a>
        </div>

        {/* 3. Medical Overview Accordion matching screenshot */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            onClick={() => setMedicalOverviewOpen(!medicalOverviewOpen)}
            className="w-full p-5 flex items-center justify-between text-left font-extrabold text-slate-900 text-base"
          >
            <div className="flex items-center gap-2.5">
              <BriefcaseMedical className="w-5 h-5 text-[#002D62]" />
              <span>Medical Overview</span>
            </div>
            {medicalOverviewOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {medicalOverviewOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-3 space-y-4">
              {/* Allergies */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Allergies
                </label>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((alg) => (
                    <span
                      key={alg.id}
                      className="inline-flex items-center gap-1.5 bg-red-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full border border-red-200"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>{alg.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Chronic Conditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {patient.chronicConditions.map((cond) => (
                    <span
                      key={cond.id}
                      className="bg-blue-50 text-blue-900 text-xs font-bold px-3 py-1 rounded-full border border-blue-200"
                    >
                      {cond.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Instructions Note */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Emergency Note:</span>
                {patient.specialInstructions}
              </div>
            </div>
          )}
        </div>

        {/* 4. Active Medicines (3) Accordion matching screenshot */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            onClick={() => setActiveMedsOpen(!activeMedsOpen)}
            className="w-full p-5 flex items-center justify-between text-left font-extrabold text-slate-900 text-base"
          >
            <div className="flex items-center gap-2.5">
              <Pill className="w-5 h-5 text-[#002D62]" />
              <span>Active Medicines ({medications.length})</span>
            </div>
            {activeMedsOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {activeMedsOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-3 space-y-2">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{m.name}</span>
                    <span className="text-slate-500">{m.dosage} • {m.frequency}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                    Active
                  </span>
                </div>
              ))}
              <button
                onClick={() => setActiveScreen('medicines')}
                className="text-xs text-[#003882] font-bold hover:underline block pt-1"
              >
                Manage Medication Regimen →
              </button>
            </div>
          )}
        </div>

        {/* 5. Surgeries & Procedures Accordion matching screenshot */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <button
            onClick={() => setSurgeriesOpen(!surgeriesOpen)}
            className="w-full p-5 flex items-center justify-between text-left font-extrabold text-slate-900 text-base"
          >
            <div className="flex items-center gap-2.5">
              <Scissors className="w-5 h-5 text-[#002D62]" />
              <span>Surgeries & Procedures ({patient.pastSurgeries.length})</span>
            </div>
            {surgeriesOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {surgeriesOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-3 space-y-3">
              {patient.pastSurgeries.map((surg) => (
                <div
                  key={surg.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{surg.procedure}</span>
                    <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {surg.date}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {surg.doctor} • {surg.hospital}
                  </div>
                  {surg.notes && <div className="text-slate-500 italic">{surg.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Medical Reports Row matching screenshot */}
        <div
          onClick={() => setActiveScreen('reports')}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#003882] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 group-hover:text-[#002D62]">
                Medical Reports
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                View lab results and imaging.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#002D62]" />
        </div>

        {/* Consent & Access Preferences link */}
        <div className="text-center pt-2">
          <button
            onClick={() => setActiveScreen('consent')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manage Access & Privacy Permissions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
