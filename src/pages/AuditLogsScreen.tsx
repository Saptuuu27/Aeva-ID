import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  FileCheck,
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Lock,
} from 'lucide-react';

export const AuditLogsScreen: React.FC = () => {
  const { auditLogs, setActiveScreen, role } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.accessedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveScreen(role === 'doctor' ? 'doctor_dashboard' : 'health')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#002D62] tracking-tight">
              Access & Security Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Immutable audit ledger of all Aeva ID data queries
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by accessor, hospital, or reason..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-[#002D62] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Audit Log Entries List */}
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2.5 transition-all hover:border-blue-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-extrabold text-slate-900 text-sm">{log.accessedBy}</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                    {log.role}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hospital / Entity: <strong>{log.hospital}</strong></span>
                </div>
                <div className="text-slate-800 font-medium">
                  <strong>Action:</strong> {log.reason}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Status: {log.verified ? 'Cryptographically Verified' : 'Logged'}</span>
                </span>
                <span className="font-mono text-[10px]">ID: {log.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
