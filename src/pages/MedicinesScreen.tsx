import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Pill,
  Clock,
  CheckCircle2,
  MoreVertical,
  Sun,
  Sunset,
  Moon,
  Trash2,
  Edit2,
  AlertTriangle,
  Check,
  TrendingUp,
  HardDrive,
} from 'lucide-react';

export const MedicinesScreen: React.FC = () => {
  const {
    medications,
    setActiveScreen,
    markDoseStatus,
    setEditingMedId,
    deleteMedication,
    isOnline,
  } = useApp();

  const [activeMenuMedId, setActiveMenuMedId] = useState<string | null>(null);

  // Group medications by Period: Morning, Afternoon, Evening/Night
  const morningList = medications
    .flatMap((m) =>
      m.scheduledTimes
        .filter((st) => st.period === 'Morning')
        .map((st) => ({ ...m, currentSchedule: st }))
    );

  const afternoonList = medications
    .flatMap((m) =>
      m.scheduledTimes
        .filter((st) => st.period === 'Afternoon')
        .map((st) => ({ ...m, currentSchedule: st }))
    );

  const nightList = medications
    .flatMap((m) =>
      m.scheduledTimes
        .filter((st) => st.period === 'Evening' || st.period === 'Night')
        .map((st) => ({ ...m, currentSchedule: st }))
    );

  const totalDoses = medications.flatMap((m) => m.scheduledTimes).length;
  const takenDoses = medications
    .flatMap((m) => m.scheduledTimes)
    .filter((st) => st.status === 'Taken').length;

  const handleEdit = (medId: string) => {
    setEditingMedId(medId);
    setActiveMenuMedId(null);
    setActiveScreen('add_medicine');
  };

  const handleDelete = (medId: string) => {
    if (confirm('Are you sure you want to remove this medication?')) {
      deleteMedication(medId);
      setActiveMenuMedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Top Header matching screenshot */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Medicines
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {takenDoses} of {totalDoses} doses completed today
            </p>
          </div>

          {/* Blue Circular Add Button matching screenshot */}
          <button
            onClick={() => {
              setEditingMedId(null);
              setActiveScreen('add_medicine');
            }}
            className="w-12 h-12 rounded-full bg-[#002D62] hover:bg-[#001D40] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            aria-label="Add Medicine"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Adherence Compliance Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Today's Adherence Rate</span>
            </span>
            <span className="text-emerald-700 font-extrabold text-sm">
              {Math.round((takenDoses / Math.max(totalDoses, 1)) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((takenDoses / Math.max(totalDoses, 1)) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-blue-600" />
              <span>LocalStorage Cache Active</span>
            </span>
            <span className="font-semibold text-emerald-600">
              {isOnline ? 'Synced' : 'Offline Ready'}
            </span>
          </div>
        </div>

        {/* 1. Morning Section */}
        {morningList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Morning
              </h2>
              <div className="h-px bg-slate-200 flex-1 ml-2" />
            </div>

            <div className="space-y-3">
              {morningList.map((item) => {
                const sch = item.currentSchedule;
                const isTaken = sch.status === 'Taken';
                return (
                  <div
                    key={`${item.id}-${sch.id}`}
                    className={`relative bg-white rounded-3xl p-5 border shadow-2xs transition-all ${
                      isTaken
                        ? 'border-emerald-200 bg-white'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Left vertical green border pill for taken medicines matching screenshot */}
                    {isTaken && (
                      <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-emerald-500 rounded-r-full" />
                    )}

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Pill className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.dosage}</span>
                        </div>
                      </div>

                      {/* 3-dots Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuMedId(
                              activeMenuMedId === item.id ? null : item.id
                            )
                          }
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuMedId === item.id && (
                          <div className="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in">
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit Medicine</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time & Food Badges */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                        <Clock className="w-3 h-3" />
                        {sch.time}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {sch.label}
                      </span>
                    </div>

                    {/* Action Button matching screenshot */}
                    <div className="mt-4">
                      {isTaken ? (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Due')}
                          className="inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Taken</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Taken')}
                          className="w-full bg-white hover:bg-slate-50 border-2 border-[#002D62] text-[#002D62] font-extrabold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-[#002D62]" />
                          <span>Mark as Taken</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Afternoon Section */}
        {afternoonList.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                <Sunset className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Afternoon
              </h2>
              <div className="h-px bg-slate-200 flex-1 ml-2" />
            </div>

            <div className="space-y-3">
              {afternoonList.map((item) => {
                const sch = item.currentSchedule;
                const isTaken = sch.status === 'Taken';
                return (
                  <div
                    key={`${item.id}-${sch.id}`}
                    className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Pill className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.dosage}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-slate-400 hover:text-slate-700 p-1.5"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                        <Clock className="w-3 h-3" />
                        {sch.time}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {sch.label}
                      </span>
                    </div>

                    <div className="mt-4">
                      {isTaken ? (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Due')}
                          className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Taken</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Taken')}
                          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Upcoming</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Night Section */}
        {nightList.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Night
              </h2>
              <div className="h-px bg-slate-200 flex-1 ml-2" />
            </div>

            <div className="space-y-3">
              {nightList.map((item) => {
                const sch = item.currentSchedule;
                const isTaken = sch.status === 'Taken';
                return (
                  <div
                    key={`${item.id}-${sch.id}`}
                    className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Pill className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.dosage}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-slate-400 hover:text-slate-700 p-1.5"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                        <Clock className="w-3 h-3" />
                        {sch.time}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {sch.label}
                      </span>
                    </div>

                    <div className="mt-4">
                      {isTaken ? (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Due')}
                          className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Taken</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markDoseStatus(item.id, sch.id, 'Taken')}
                          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Upcoming</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
