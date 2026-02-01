
import React, { useState, useEffect } from 'react';
import { Patient, Doctor } from './types';
import { PatientSide } from './components/PatientSide';
import { DoctorSide } from './components/DoctorSide';

type View = 'LANDING' | 'PATIENT' | 'DOCTOR';

export default function App() {
  const [view, setView] = useState<View>('LANDING');

  useEffect(() => {
    const pid = localStorage.getItem('medisetu_active_patient_id');
    const did = localStorage.getItem('medisetu_active_doctor_id');
    if (pid) setView('PATIENT');
    else if (did) setView('DOCTOR');
  }, []);

  if (view === 'LANDING') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Medisetu</h1>
            <p className="text-slate-500 font-medium">Your Health, Simplified.</p>
          </div>
          
          <div className="grid gap-4">
            <button 
              onClick={() => setView('PATIENT')}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">I am a Patient</h2>
              <p className="text-sm text-slate-500 text-center mt-2">Access your reports and health history</p>
            </button>

            <button 
              onClick={() => setView('DOCTOR')}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">I am a Doctor</h2>
              <p className="text-sm text-slate-500 text-center mt-2">Manage appointments and patient notes</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {view === 'PATIENT' ? (
        <PatientSide onExit={() => setView('LANDING')} />
      ) : (
        <DoctorSide onExit={() => setView('LANDING')} />
      )}
    </div>
  );
}
