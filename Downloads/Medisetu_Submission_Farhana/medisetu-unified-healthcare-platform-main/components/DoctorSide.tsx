
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './Layout';
import { db } from '../services/dbService';
import { Doctor, Appointment, AppointmentStatus, Patient, PatientNote } from '../types';

interface DoctorSideProps {
  onExit: () => void;
}

export const DoctorSide: React.FC<DoctorSideProps> = ({ onExit }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [view, setView] = useState<'LOGIN' | 'APPOINTMENTS' | 'BOOK' | 'PATIENT_PROFILE'>('LOGIN');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');

  // Book Appt Form
  const [apptForm, setApptForm] = useState({
    patientName: '',
    phone: '',
    age: '',
    gender: 'Male',
    date: new Date().toISOString().split('T')[0],
    slot: '10:00 AM',
    reason: ''
  });

  // Patient Note Form
  const [noteForm, setNoteForm] = useState({
    complaint: '',
    noteText: '',
    vitals: { bp: '', pulse: '', temperature: '' }
  });
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);

  useEffect(() => {
    const did = localStorage.getItem('medisetu_active_doctor_id');
    if (did) {
      const d = db.getDoctor(did);
      if (d) {
        setDoctor(d);
        setView('APPOINTMENTS');
        setAppointments(db.getAppointments(d.id));
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const d = db.getDoctor(loginInput);
    if (!d) {
      setLoginError('Invalid Doctor ID or Email');
      return;
    }
    setDoctor(d);
    localStorage.setItem('medisetu_active_doctor_id', d.id);
    setView('APPOINTMENTS');
    setAppointments(db.getAppointments(d.id));
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('medisetu_active_doctor_id');
    setDoctor(null);
    setView('LOGIN');
    onExit();
  };

  const filteredAppts = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || 
                            a.phone.includes(search);
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    // Check conflict
    const conflict = appointments.find(a => a.date === apptForm.date && a.slot === apptForm.slot);
    if (conflict) {
      alert("This slot is already booked");
      return;
    }

    db.createAppointment({
      ...apptForm,
      doctorId: doctor.id,
      status: AppointmentStatus.Scheduled
    });
    setAppointments(db.getAppointments(doctor.id));
    setView('APPOINTMENTS');
    alert("Appointment booked successfully");
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    db.saveNote({
      patientId: selectedPatientId,
      date: new Date().toLocaleString(),
      ...noteForm
    });
    setPatientNotes(db.getPatientNotes(selectedPatientId));
    setNoteForm({
      complaint: '',
      noteText: '',
      vitals: { bp: '', pulse: '', temperature: '' }
    });
    alert("Patient info saved successfully");
  };

  const openPatientProfile = (patientIdOrName: string) => {
    // For demo, we search for patient or create dummy
    let p = db.getPatients().find(p => p.id === patientIdOrName || p.name === patientIdOrName);
    if (!p) {
        // Find by appointment if patient not explicitly in DB
        const appt = appointments.find(a => a.patientName === patientIdOrName);
        if (appt) {
            p = { id: `P_TEMP_${appt.id}`, name: appt.patientName, phone: appt.phone, age: appt.age, gender: appt.gender };
        }
    }
    
    if (p) {
      setSelectedPatientId(p.id);
      setPatientNotes(db.getPatientNotes(p.id));
      setView('PATIENT_PROFILE');
    }
  };

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-600">Medisetu</h1>
            <p className="text-slate-500 mt-2">Doctor Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Doctor ID / Email</label>
              <input 
                type="text" 
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. DOC001 or sameer@medisetu.com"
                className={`w-full px-4 py-3 rounded-xl border ${loginError ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-green-500 focus:outline-none`}
              />
              {loginError && <p className="text-xs text-red-500 mt-1">{loginError}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              Continue
            </button>
            <button 
              type="button"
              onClick={onExit}
              className="w-full text-sm text-slate-400 font-medium py-2"
            >
              Back to selection
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activePatient = selectedPatientId ? (db.getPatient(selectedPatientId) || { id: selectedPatientId, name: 'Patient' } as Patient) : null;

  return (
    <Layout 
      title={doctor?.name} 
      subtitle="Healthcare Professional"
      onLogout={handleLogout}
      showBack={view !== 'APPOINTMENTS'}
      onBack={() => setView('APPOINTMENTS')}
    >
      {view === 'APPOINTMENTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Today's Appointments</h2>
            <button 
              onClick={() => setView('BOOK')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              New Appointment
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value={AppointmentStatus.Scheduled}>Scheduled</option>
              <option value={AppointmentStatus.CheckedIn}>Checked In</option>
              <option value={AppointmentStatus.Completed}>Completed</option>
            </select>
          </div>

          {filteredAppts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">No appointments today.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAppts.map(appt => (
                <div key={appt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{appt.patientName}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        appt.status === AppointmentStatus.Completed ? 'bg-green-100 text-green-700' : 
                        appt.status === AppointmentStatus.CheckedIn ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{appt.age} yrs • {appt.gender} • {appt.phone}</p>
                    <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {appt.slot}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openPatientProfile(appt.patientName)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                      Patient Profile
                    </button>
                    {appt.status !== AppointmentStatus.Completed && (
                      <button 
                        onClick={() => {
                          db.updateAppointmentStatus(appt.id, AppointmentStatus.Completed);
                          setAppointments(db.getAppointments(doctor!.id));
                        }}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors border border-green-200"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'BOOK' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Book Appointment</h2>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
                <input required type="text" value={apptForm.patientName} onChange={e => setApptForm({...apptForm, patientName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input required type="tel" value={apptForm.phone} onChange={e => setApptForm({...apptForm, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Age *</label>
                <input required type="number" value={apptForm.age} onChange={e => setApptForm({...apptForm, age: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select value={apptForm.gender} onChange={e => setApptForm({...apptForm, gender: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input required type="date" value={apptForm.date} onChange={e => setApptForm({...apptForm, date: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot *</label>
                <select value={apptForm.slot} onChange={e => setApptForm({...apptForm, slot: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500">
                  <option>10:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>11:30 AM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
              <textarea value={apptForm.reason} onChange={e => setApptForm({...apptForm, reason: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 h-24" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100">
              Confirm Appointment
            </button>
          </form>
        </div>
      )}

      {view === 'PATIENT_PROFILE' && activePatient && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Profile</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Name</p>
                <p className="font-semibold text-slate-800">{activePatient.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Age / Gender</p>
                <p className="font-semibold text-slate-800">{activePatient.age} / {activePatient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                <p className="font-semibold text-slate-800">{activePatient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Patient ID</p>
                <p className="font-semibold text-slate-800">{activePatient.id}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Patient History</h3>
                {patientNotes.length === 0 ? (
                  <p className="text-slate-400 italic">No notes recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {patientNotes.map(note => (
                      <div key={note.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">{note.date}</p>
                        <p className="font-bold text-slate-700 mb-1">{note.complaint}</p>
                        <p className="text-sm text-slate-600 mb-3">{note.noteText}</p>
                        <div className="flex gap-4 text-xs font-bold text-green-600">
                          <span>BP: {note.vitals.bp}</span>
                          <span>Pulse: {note.vitals.pulse}</span>
                          <span>Temp: {note.vitals.temperature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Save New Info</h3>
                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complaint</label>
                    <input required value={noteForm.complaint} onChange={e => setNoteForm({...noteForm, complaint: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Cough for 3 days" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea value={noteForm.noteText} onChange={e => setNoteForm({...noteForm, noteText: e.target.value})} className="w-full px-3 py-2 border rounded-lg h-24" placeholder="Enter clinical notes..." />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">BP</label>
                      <input value={noteForm.vitals.bp} onChange={e => setNoteForm({...noteForm, vitals: {...noteForm.vitals, bp: e.target.value}})} className="w-full px-2 py-1 border rounded" placeholder="120/80" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Pulse</label>
                      <input value={noteForm.vitals.pulse} onChange={e => setNoteForm({...noteForm, vitals: {...noteForm.vitals, pulse: e.target.value}})} className="w-full px-2 py-1 border rounded" placeholder="72" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Temp</label>
                      <input value={noteForm.vitals.temperature} onChange={e => setNoteForm({...noteForm, vitals: {...noteForm.vitals, temperature: e.target.value}})} className="w-full px-2 py-1 border rounded" placeholder="98.6" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors">
                    Save Info
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
