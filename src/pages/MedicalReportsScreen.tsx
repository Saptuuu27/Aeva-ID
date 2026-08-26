import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Plus,
  Upload,
  ArrowLeft,
  Calendar,
  Building2,
  Stethoscope,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MedicalReport } from '../types';

export const MedicalReportsScreen: React.FC = () => {
  const { medicalReports, addMedicalReport, deleteMedicalReport, setActiveScreen, setNotificationBanner } =
    useApp();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Lab Test' | 'Imaging' | 'Prescription' | 'Discharge Summary'>('Lab Test');
  const [newHospital, setNewHospital] = useState('Apollo Hospitals, New Delhi');
  const [newDoctor, setNewDoctor] = useState('Dr. Rajesh Kumar');
  const [newSummary, setNewSummary] = useState('');

  const categories = ['All', 'Lab Test', 'Imaging', 'Prescription', 'Discharge Summary'];

  const filteredReports = filterCategory === 'All'
    ? medicalReports
    : medicalReports.filter((r) => r.category === filterCategory);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMedicalReport({
      title: newTitle,
      category: newCategory,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hospital: newHospital,
      doctor: newDoctor,
      fileUrl: '#',
      fileType: 'pdf',
      summary: newSummary || 'Report uploaded successfully.',
      doctorNotes: 'Verified and filed into patient electronic health record.',
    });

    setShowUploadModal(false);
    setNewTitle('');
    setNewSummary('');
    setNotificationBanner({
      message: 'Medical report uploaded & encrypted successfully.',
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveScreen('health')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#002D62] tracking-tight">
              Medical Reports & EHR
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Diagnostic tests, scans, and doctor prescriptions
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="w-10 h-10 rounded-full bg-[#002D62] text-white flex items-center justify-center shadow-md hover:bg-[#001D40] transition-colors"
            title="Upload Report"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{report.title}</span>
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {report.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {report.hospital}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMedicalReport(report.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                {report.summary}
              </p>

              {report.doctorNotes && (
                <div className="text-[11px] text-slate-600 italic">
                  <strong>Doctor's Remarks:</strong> {report.doctorNotes}
                </div>
              )}

              {/* View PDF action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Signed by: {report.doctor}
                </span>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span>Preview PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Upload Medical Report</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Report Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lipid Profile & Liver Panel"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:outline-hidden"
                  >
                    <option value="Lab Test">Lab Test</option>
                    <option value="Imaging">Imaging (X-Ray, MRI, CT)</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hospital / Lab</label>
                  <input
                    type="text"
                    value={newHospital}
                    onChange={(e) => setNewHospital(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Summary / Key Findings</label>
                  <textarea
                    rows={3}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="e.g. Total Cholesterol 180 mg/dL (Normal), Fasting Sugar 110 mg/dL..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-hidden"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 cursor-pointer hover:bg-blue-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-700 block">Click to attach PDF / Image</span>
                  <span className="text-[10px] text-slate-400">Max size 25MB (Encrypted storage)</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-slate-100 font-bold py-2.5 rounded-xl text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#002D62] text-white font-bold py-2.5 rounded-xl shadow-xs"
                  >
                    Save & Encrypt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-extrabold text-slate-900">{selectedReport.title}</h3>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Hospital: {selectedReport.hospital}</span>
                  <span>Date: {selectedReport.date}</span>
                </div>
                <div className="text-slate-600">
                  <strong>Attending Doctor:</strong> {selectedReport.doctor}
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <strong>Clinical Summary:</strong>
                  <p className="mt-1 text-slate-800 leading-relaxed">{selectedReport.summary}</p>
                </div>
                {selectedReport.doctorNotes && (
                  <div className="pt-2 border-t border-slate-200">
                    <strong>Doctor Notes & Protocol:</strong>
                    <p className="mt-1 text-slate-800 italic">{selectedReport.doctorNotes}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full bg-[#002D62] text-white font-bold py-3 rounded-xl text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
