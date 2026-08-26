import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NotificationBanner } from './components/NotificationBanner';
import { RealtimeAlertPopup } from './components/RealtimeAlertPopup';

// Pages
import { LoginScreen } from './pages/LoginScreen';
import { RegisterScreen } from './pages/RegisterScreen';
import { PatientDashboard } from './pages/PatientDashboard';
import { MedicinesScreen } from './pages/MedicinesScreen';
import { AddMedicineScreen } from './pages/AddMedicineScreen';
import { HealthProfileScreen } from './pages/HealthProfileScreen';
import { AevaIdScreen } from './pages/AevaIdScreen';
import { ScanIdScreen } from './pages/ScanIdScreen';
import { EmergencyProfileScreen } from './pages/EmergencyProfileScreen';
import { DoctorDashboardScreen } from './pages/DoctorDashboardScreen';
import { CaregiverScreen } from './pages/CaregiverScreen';
import { ConsentScreen } from './pages/ConsentScreen';
import { AuditLogsScreen } from './pages/AuditLogsScreen';
import { MedicalReportsScreen } from './pages/MedicalReportsScreen';
import { EmergencyGatewayScreen } from './pages/EmergencyGatewayScreen';
import { HospitalPortalScreen } from './pages/HospitalPortalScreen';

const MainApp: React.FC = () => {
  const { isAuthenticated, activeScreen } = useApp();

  // Scroll to top immediately whenever screen changes or user logs in
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeScreen, isAuthenticated]);

  // If not logged in and not registering or viewing emergency public profile, show Login
  if (
    !isAuthenticated &&
    activeScreen !== 'register' &&
    activeScreen !== 'emergency_profile' &&
    activeScreen !== 'emergency_gateway' &&
    activeScreen !== 'scan_id'
  ) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-[#002D62]">
        <RealtimeAlertPopup />
        <NotificationBanner />
        <LoginScreen />
      </div>
    );
  }

  // Registration Flow
  if (activeScreen === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-[#002D62]">
        <RealtimeAlertPopup />
        <NotificationBanner />
        <RegisterScreen />
      </div>
    );
  }

  // Render Screen Content
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <PatientDashboard />;
      case 'medicines':
        return <MedicinesScreen />;
      case 'add_medicine':
      case 'edit_medicine':
        return <AddMedicineScreen />;
      case 'health':
        return <HealthProfileScreen />;
      case 'aeva_id':
      case 'medi_id':
        return <AevaIdScreen />;
      case 'scan_id':
        return <ScanIdScreen />;
      case 'emergency_profile':
        return <EmergencyProfileScreen />;
      case 'doctor_dashboard':
        return <DoctorDashboardScreen />;
      case 'family':
        return <CaregiverScreen />;
      case 'hospital_portal':
        return <HospitalPortalScreen />;
      case 'consent':
        return <ConsentScreen />;
      case 'audit_logs':
        return <AuditLogsScreen />;
      case 'reports':
        return <MedicalReportsScreen />;
      case 'emergency_gateway':
        return <EmergencyGatewayScreen />;
      case 'login':
        return <LoginScreen />;
      default:
        return <PatientDashboard />;
    }
  };

  // Determine whether to show bottom nav and top navbar
  const hideBottomNav =
    activeScreen === 'scan_id' ||
    activeScreen === 'emergency_profile' ||
    activeScreen === 'add_medicine' ||
    activeScreen === 'edit_medicine' ||
    activeScreen === 'doctor_dashboard' ||
    activeScreen === 'hospital_portal' ||
    activeScreen === 'emergency_gateway';

  const hideTopNav = activeScreen === 'scan_id';

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-[#002D62] flex flex-col">
      <RealtimeAlertPopup />
      {!hideTopNav && <Navbar />}
      <NotificationBanner />

      <main className="flex-1">{renderScreen()}</main>

      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
