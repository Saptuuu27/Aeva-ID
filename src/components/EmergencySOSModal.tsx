import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  ShieldCheck,
  X,
  CheckCircle2,
  Radio,
  Share2,
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const { patient, activeSos, triggerSOS, resolveSOS } = useApp();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => (c ? c - 1 : 0));
      }, 1000);
    } else if (countdown === 0) {
      triggerSOS();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-red-200 overflow-hidden text-center relative">
        {/* Modal Close Button (Prominent & High Z-Index) */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 text-white hover:text-white bg-black/30 hover:bg-black/50 p-2.5 rounded-full transition-all hover:scale-105 border border-white/30 shadow-md"
          title="Close Modal (Esc)"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Red Header */}
        <div className="bg-rose-600 text-white py-6 px-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40 shadow-inner">
            <AlertOctagon className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Emergency SOS Protocols</h2>
          <p className="text-rose-100 text-sm mt-1 max-w-xs mx-auto">
            Instantly alert family, emergency contacts, and authorize hospital ER responders.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {activeSos ? (
            /* Active SOS State */
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-base mb-1">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <span>EMERGENCY SOS IS ACTIVE</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Broadcasted at {activeSos.triggeredAt}. GPS location shared with emergency contacts.
                </p>

                <div className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-red-100 mb-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Current Geo-Location:</span>
                    <p className="text-slate-600">{activeSos.location.address}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 mt-3">
                  <span className="font-semibold text-slate-700">Notified Contacts:</span>
                  {patient.emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-800">{contact.name} ({contact.relationship})</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    resolveSOS();
                    onClose();
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm"
                >
                  Mark Safe / Resolve SOS
                </button>
                <a
                  href={`tel:112`}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Dial 112 (National ER)</span>
                </a>
              </div>
            </div>
          ) : countdown !== null ? (
            /* Countdown State */
            <div className="py-6 space-y-4">
              <div className="w-24 h-24 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto text-4xl font-extrabold border-4 border-rose-500 animate-pulse">
                {countdown}
              </div>
              <p className="text-base font-bold text-slate-800">
                Triggering Emergency SOS in {countdown} seconds...
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Will auto-send GPS location and emergency medical card link to all registered caregivers.
              </p>
              <button
                onClick={handleCancelCountdown}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          ) : (
            /* Ready to Trigger State */
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>What happens when you trigger SOS?</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Sends immediate SMS & push alerts to <strong>{patient.emergencyContacts[0]?.name}</strong> ({patient.emergencyContacts[0]?.phone}).</li>
                  <li>Opens direct high-priority access to your Emergency Medical Profile for first responders.</li>
                  <li>Attaches your device GPS location & 12-digit Aeva ID (<strong>{patient.aevaId}</strong>).</li>
                </ul>
              </div>

              {/* Direct Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleStartCountdown}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-4 px-6 rounded-2xl text-base tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform active:scale-98"
                >
                  <AlertOctagon className="w-5 h-5" />
                  <span>ACTIVATE EMERGENCY SOS</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${patient.emergencyContacts[0]?.phone}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                    <span>Call Primary Contact</span>
                  </a>
                  <a
                    href="tel:108"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
                    <span>Call 108 (Ambulance)</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
