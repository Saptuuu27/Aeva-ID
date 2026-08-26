import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Pill, Activity, CreditCard, Users, Stethoscope, Building2, Ambulance, FileText, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { role, activeScreen, setActiveScreen } = useApp();

  const getNavItems = () => {
    switch (role) {
      case 'caregiver':
        return [
          { id: 'family', label: 'Overview', icon: Users },
          { id: 'medicines', label: 'Medicines', icon: Pill },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'audit_logs', label: 'Audits', icon: ShieldCheck },
        ];
      case 'doctor':
        return [
          { id: 'doctor_dashboard', label: 'Doctor Suite', icon: Stethoscope },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'audit_logs', label: 'Audits', icon: ShieldCheck },
        ];
      case 'hospital':
        return [
          { id: 'hospital_portal', label: 'ER & Beds', icon: Building2 },
          { id: 'audit_logs', label: 'Audits', icon: ShieldCheck },
        ];
      case 'emergency_staff':
        return [
          { id: 'emergency_gateway', label: 'Trauma Gate', icon: Ambulance },
          { id: 'scan_id', label: 'Scan QR', icon: CreditCard },
        ];
      case 'patient':
      default:
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'medicines', label: 'Medicines', icon: Pill },
          { id: 'health', label: 'Health', icon: Activity },
          { id: 'aeva_id', label: 'Aeva ID', icon: CreditCard },
          { id: 'reports', label: 'Reports', icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeScreen === item.id ||
            (item.id === 'aeva_id' && (activeScreen === 'medi_id' || activeScreen === 'scan_id')) ||
            (item.id === 'medicines' && (activeScreen === 'add_medicine' || activeScreen === 'edit_medicine'));

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'text-[#003882] font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#003882] text-white w-14 h-8 rounded-full shadow-xs'
                    : 'w-10 h-7 text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'text-[#003882] font-bold' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

