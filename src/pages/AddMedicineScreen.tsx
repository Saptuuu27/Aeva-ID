import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Pill,
  Clock,
  Utensils,
  Calendar,
  Bell,
  Check,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import { MedicationScheduleItem } from '../types';

export const AddMedicineScreen: React.FC = () => {
  const {
    medications,
    editingMedId,
    setEditingMedId,
    addMedication,
    updateMedication,
    setActiveScreen,
    patient,
  } = useApp();

  const isEditing = Boolean(editingMedId);
  const existingMed = medications.find((m) => m.id === editingMedId);

  const [name, setName] = useState(existingMed?.name || '');
  const [dosage, setDosage] = useState(existingMed?.dosage || '1 tablet (500mg)');
  const [frequency, setFrequency] = useState<'Once daily' | 'Twice daily' | 'Thrice daily' | 'As needed' | 'Weekly'>(
    existingMed?.frequency || 'Once daily'
  );
  const [timeOfDay, setTimeOfDay] = useState(
    existingMed?.scheduledTimes[0]?.time || '08:00 AM'
  );
  const [foodInstruction, setFoodInstruction] = useState<'Before food' | 'With food' | 'After food'>(
    existingMed?.foodInstruction || 'After food'
  );
  const [startDate, setStartDate] = useState(
    existingMed?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(existingMed?.endDate || '');
  const [reminderEnabled, setReminderEnabled] = useState(
    existingMed?.reminderEnabled ?? true
  );

  const handleClose = () => {
    setEditingMedId(null);
    setActiveScreen('medicines');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (existingMed) {
      setName(existingMed.name);
      setDosage(existingMed.dosage);
      setFrequency(existingMed.frequency);
      setTimeOfDay(existingMed.scheduledTimes[0]?.time || '08:00 AM');
      setFoodInstruction(existingMed.foodInstruction);
      setStartDate(existingMed.startDate);
      setEndDate(existingMed.endDate || '');
      setReminderEnabled(existingMed.reminderEnabled);
    }
  }, [existingMed]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a medicine name.');
      return;
    }

    // Determine period from timeOfDay
    const hour = parseInt(timeOfDay.split(':')[0] || '8', 10);
    const isPM = timeOfDay.toLowerCase().includes('pm');
    let period: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
    if (isPM) {
      if (hour < 5 || hour === 12) period = 'Afternoon';
      else if (hour < 8) period = 'Evening';
      else period = 'Night';
    } else {
      period = 'Morning';
    }

    const scheduledTimes: MedicationScheduleItem[] = [
      {
        id: `st_${Date.now()}`,
        time: timeOfDay,
        period,
        label: foodInstruction,
        status: 'Upcoming',
      },
    ];

    if (frequency === 'Twice daily') {
      scheduledTimes.push({
        id: `st_${Date.now()}_2`,
        time: '08:00 PM',
        period: 'Night',
        label: foodInstruction,
        status: 'Upcoming',
      });
    }

    if (isEditing && editingMedId) {
      updateMedication(editingMedId, {
        name,
        dosage,
        frequency,
        foodInstruction,
        startDate,
        endDate: endDate || undefined,
        reminderEnabled,
        scheduledTimes,
      });
    } else {
      addMedication({
        name,
        dosage,
        form: 'tablet',
        frequency,
        foodInstruction,
        startDate,
        endDate: endDate || undefined,
        reminderEnabled,
        active: true,
        isHighRisk: name.toLowerCase().includes('aspirin') || name.toLowerCase().includes('warfarin'),
        scheduledTimes,
      });
    }

    setEditingMedId(null);
    setActiveScreen('medicines');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-colors"
            title="Back (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#002D62] tracking-tight">
            {isEditing ? 'Edit Medicine' : 'Add Medicine'}
          </h1>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#003882] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              {patient.initials}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Card 1: Main details matching screenshot */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            {/* Medicine Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                MEDICINE NAME
              </label>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-[#003882] focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <div className="bg-slate-50 px-3.5 py-3 text-slate-400 border-r border-slate-200 flex items-center">
                  <Pill className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="w-full px-3.5 py-3 text-slate-800 font-bold text-sm focus:outline-hidden"
                />
              </div>
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                DOSAGE
              </label>
              <div className="rounded-xl border border-slate-300 overflow-hidden focus-within:border-[#003882] focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 tablet (500mg)"
                  className="w-full px-3.5 py-3 text-slate-800 font-medium text-sm focus:outline-hidden"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                FREQUENCY
              </label>
              <div className="relative rounded-xl border border-slate-300 overflow-hidden bg-white">
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3.5 py-3 text-slate-800 font-semibold text-sm focus:outline-hidden appearance-none bg-transparent pr-10"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Thrice daily">Thrice daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As needed">As needed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Time of Day */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                TIME OF DAY
              </label>
              <div className="relative rounded-xl border border-slate-300 overflow-hidden bg-white">
                <input
                  type="text"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full px-3.5 py-3 text-slate-800 font-bold text-sm focus:outline-hidden pr-10"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Card 2: Food Instructions matching screenshot */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Food Instructions
            </h2>

            <div className="space-y-2">
              {(['Before food', 'With food', 'After food'] as const).map((opt) => {
                const isSelected = foodInstruction === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFoodInstruction(opt)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#002D62] bg-blue-50/70 text-[#002D62] font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Utensils className={`w-4 h-4 ${isSelected ? 'text-[#002D62]' : 'text-slate-400'}`} />
                      <span>{opt}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#002D62] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Dates & Daily Reminder toggle matching screenshot */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-slate-800 font-medium text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                END DATE (OPTIONAL)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-slate-800 font-medium text-sm focus:outline-hidden"
              />
            </div>

            {/* Daily Reminder Toggle from screenshot */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Daily Reminder</div>
                  <div className="text-xs text-slate-500">Get notified when it's time</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  reminderEnabled ? 'bg-[#002D62]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Action Buttons matching screenshot */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditingMedId(null);
                setActiveScreen('medicines');
              }}
              className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-sm transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full bg-[#002D62] hover:bg-[#001D40] text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-98"
            >
              Save Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
