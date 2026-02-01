
import { Patient, MedicalReport, Appointment, PatientNote, ReportStatus, AppointmentStatus, Doctor } from '../types';

const KEYS = {
  PATIENTS: 'medisetu_patients',
  REPORTS: 'medisetu_reports',
  APPOINTMENTS: 'medisetu_appointments',
  NOTES: 'medisetu_notes',
  DOCTORS: 'medisetu_doctors'
};

// Seed initial data if empty
const seed = () => {
  if (!localStorage.getItem(KEYS.DOCTORS)) {
    localStorage.setItem(KEYS.DOCTORS, JSON.stringify([
      { id: 'DOC001', name: 'Dr. Sameer Sharma', email: 'sameer@medisetu.com' }
    ]));
  }
  if (!localStorage.getItem(KEYS.REPORTS)) {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify([
      {
        id: 'REP101',
        patientId: 'P100',
        title: 'Complete Blood Count (CBC)',
        date: '2024-03-15',
        source: 'Apollo Diagnostics',
        status: ReportStatus.Normal,
        fileName: 'cbc_report.pdf'
      },
      {
        id: 'REP102',
        patientId: 'P100',
        title: 'Liver Function Test',
        date: '2024-03-20',
        source: 'Max Healthcare',
        status: ReportStatus.Abnormal,
        fileName: 'lft_report.pdf'
      }
    ]));
  }
};

seed();

export const db = {
  getPatients: (): Patient[] => JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]'),
  
  getPatient: (idOrPhone: string): Patient | undefined => {
    const patients = db.getPatients();
    return patients.find(p => p.id === idOrPhone || p.phone === idOrPhone);
  },

  createPatient: (patient: Omit<Patient, 'id'>): Patient => {
    const patients = db.getPatients();
    const newPatient = { ...patient, id: `P${Math.floor(Math.random() * 9000) + 1000}` };
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify([...patients, newPatient]));
    return newPatient;
  },

  getReports: (patientId: string): MedicalReport[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]') as MedicalReport[];
    return all.filter(r => r.patientId === patientId);
  },

  getReport: (reportId: string): MedicalReport | undefined => {
    const all = JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]') as MedicalReport[];
    return all.find(r => r.id === reportId);
  },

  saveReport: (report: MedicalReport) => {
    const all = JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]') as MedicalReport[];
    const index = all.findIndex(r => r.id === report.id);
    if (index > -1) {
      all[index] = report;
    } else {
      all.push(report);
    }
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(all));
  },

  getAppointments: (doctorId: string): Appointment[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]') as Appointment[];
    return all.filter(a => a.doctorId === doctorId);
  },

  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]') as Appointment[];
    const newAppt = { 
      ...appointment, 
      id: `APT${Date.now()}`, 
      createdAt: new Date().toISOString() 
    };
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify([...all, newAppt]));
    return newAppt;
  },

  updateAppointmentStatus: (id: string, status: AppointmentStatus) => {
    const all = JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]') as Appointment[];
    const index = all.findIndex(a => a.id === id);
    if (index > -1) {
      all[index].status = status;
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(all));
    }
  },

  getPatientNotes: (patientId: string): PatientNote[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.NOTES) || '[]') as PatientNote[];
    return all.filter(n => n.patientId === patientId);
  },

  saveNote: (note: Omit<PatientNote, 'id'>): PatientNote => {
    const all = JSON.parse(localStorage.getItem(KEYS.NOTES) || '[]') as PatientNote[];
    const newNote = { ...note, id: `NTE${Date.now()}` };
    localStorage.setItem(KEYS.NOTES, JSON.stringify([...all, newNote]));
    return newNote;
  },

  getDoctors: (): Doctor[] => JSON.parse(localStorage.getItem(KEYS.DOCTORS) || '[]'),
  getDoctor: (idOrEmail: string): Doctor | undefined => {
    const docs = db.getDoctors();
    return docs.find(d => d.id === idOrEmail || d.email === idOrEmail);
  }
};
