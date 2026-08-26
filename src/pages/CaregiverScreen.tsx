import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PatientOfflineQRModal } from '../components/PatientOfflineQRModal';
import {
  Users,
  HeartHandshake,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  ShieldCheck,
  Plus,
  Send,
  MessageSquare,
  QrCode,
  WifiOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { EmergencySOSModal } from '../components/EmergencySOSModal';

export const CaregiverScreen: React.FC = () => {
  const {
    patient,
    medications,
    caregiverAlerts,
    caregiverNotes,
    addCaregiverNote,
    activeSos,
    setActiveScreen,
    setNotificationBanner,
    speakText,
    stopSpeaking,
    isSpeaking,
    speakingNoteId,
    triggerPortalTestAlert,
  } = useApp();

  const [newNote, setNewNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech API SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setNewNote((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setNotificationBanner({
        message: 'Voice recording finished and transcribed.',
        type: 'success',
      });
    } else {
      // Start recording
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          console.warn('Could not start recognition, using mock voice memo mode:', err);
          setIsRecording(true);
        }
      } else {
        // Fallback simulation for browsers without Web Speech API
        setIsRecording(true);
        setTimeout(() => {
          setNewNote((prev) =>
            prev
              ? `${prev} Patient took all morning medications on time and blood pressure was 122/78 mmHg.`
              : 'Patient walked 30 minutes in the garden, reported good appetite, and vitals are normal.'
          );
        }, 1800);
      }

      setNotificationBanner({
        message: 'Microphone active: Dictating voice note for medical record...',
        type: 'info',
      });
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const hadVoice = recordSeconds > 0 || isRecording;
    const durationStr = recordSeconds > 0 ? `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds}` : '0:35';

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    addCaregiverNote(newNote, hadVoice, durationStr, 'voice_dictation');
    setNewNote('');
    setRecordSeconds(0);
  };

  const takenDoses = medications
    .flatMap((m) => m.scheduledTimes)
    .filter((st) => st.status === 'Taken').length;
  const totalDoses = medications.flatMap((m) => m.scheduledTimes).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Top Header */}
        <div className="pt-2 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-sm">
            AS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Family & Caregiver Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitoring health status for <strong>{patient.name}</strong> ({patient.aevaId})
          </p>
        </div>

        {/* Active Emergency Alert if Active */}
        {activeSos && (
          <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-5 shadow-md animate-pulse space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-black text-base">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span>EMERGENCY SOS ALERT RECEIVED!</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              {patient.name} triggered an Emergency SOS at {activeSos.triggeredAt}.
              Location: <strong>{activeSos.location.address}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${patient.emergencyContacts[0]?.phone}`}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Patient Now</span>
              </a>
              <button
                onClick={() => setShowSosModal(true)}
                className="bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold py-2.5 px-3 rounded-xl text-xs"
              >
                View SOS Details
              </button>
            </div>
          </div>
        )}

        {/* Quick Patient Status Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Patient Live Status
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Normal & Active</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-black text-slate-900">{patient.name}</div>
              <div className="text-xs text-slate-500">
                Blood Group: <strong>{patient.bloodGroup}</strong> • Aeva ID: <span className="font-mono text-[#002D62] font-bold">{patient.aevaId}</span>
              </div>
            </div>
            <a
              href="tel:+919876543210"
              className="bg-[#002D62] hover:bg-[#001D40] text-white p-3 rounded-2xl shadow-xs transition-colors"
              title="Call Father"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          {/* Today's Dose Compliance */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
              <span>Today's Medicine Compliance</span>
              <span className="text-emerald-700">{takenDoses} of {totalDoses} taken</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(takenDoses / Math.max(totalDoses, 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Caregiver Offline QR & Alert Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">Unified Aeva QR Badge</span>
                <span className="text-[10px] text-slate-600 block font-medium">Offline/online emergency dossier</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => triggerPortalTestAlert('caregiver')}
                className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Test real-time caregiver alert popup"
              >
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Test Alert</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>View QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Caregiver Daily Notes & Voice Mail Observations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#002D62]" />
              <span>Notes & Voice Observations</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Voice-to-Text & TTS
            </span>
          </div>

          {/* Voice Input & Text Form */}
          <form onSubmit={handleAddNote} className="space-y-2.5">
            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type or click the microphone to dictate voice observations..."
                rows={3}
                className="w-full p-3.5 pr-12 rounded-2xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#002D62] bg-slate-50/50"
              />

              {/* Prominent Mic Button inside textarea */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`absolute right-3 top-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse scale-110 shadow-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Live recording indicator banner */}
            {isRecording && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>Recording voice memo (0:{recordSeconds < 10 ? '0' : ''}{recordSeconds})... Speak now!</span>
                </div>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className="text-xs text-rose-900 underline font-extrabold"
                >
                  Done
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-rose-600" />
                <span>{isRecording ? 'Stop Dictating' : 'Voice Dictate Note'}</span>
              </button>

              <button
                type="submit"
                className="flex-1 bg-[#002D62] hover:bg-[#001D40] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* List of Notes with Hands-Free Audio Playback */}
          <div className="space-y-2.5 pt-2 divide-y divide-slate-100">
            {caregiverNotes.map((n) => {
              const isThisSpeaking = isSpeaking && speakingNoteId === n.id;
              return (
                <div key={n.id} className="pt-2.5 first:pt-0 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="font-bold text-slate-900">{n.author}</span>
                    <div className="flex items-center gap-2">
                      {n.hasAudio && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Radio className="w-3 h-3 text-rose-600" />
                          <span>Voice Note {n.audioDuration ? `(${n.audioDuration})` : ''}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    "{n.text}"
                  </p>

                  {/* Audio Listen Button for Busy Doctors/Family */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => {
                        if (isThisSpeaking) {
                          stopSpeaking();
                        } else {
                          speakText(n.text, n.id);
                        }
                      }}
                      className="text-[11px] font-bold text-[#002D62] hover:text-[#001D40] flex items-center gap-1.5 bg-blue-50/70 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                    >
                      {isThisSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span className="text-rose-700">Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#002D62]" />
                          <span>Listen (Voice Note)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Caregiver Alerts Feed */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#002D62]" />
            <span>Recent Health & Access Alerts</span>
          </h2>

          <div className="space-y-2">
            {caregiverAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      alert.severity === 'critical'
                        ? 'text-rose-600'
                        : alert.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {alert.title}
                  </span>
                  <span className="text-slate-400 text-[10px]">{alert.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-snug">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EmergencySOSModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
      
      {/* Offline Emergency QR Modal */}
      <PatientOfflineQRModal
        patient={patient}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};
