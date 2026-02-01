
export enum ReportStatus {
  Normal = 'Normal',
  Abnormal = 'Abnormal',
  Pending = 'Pending'
}

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  CheckedIn = 'CheckedIn',
  Completed = 'Completed'
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
}

export interface TestValue {
  test_name: string;
  value: string;
  unit: string;
  normal_range: string;
  flag: 'LOW' | 'HIGH' | 'NORMAL' | 'UNKNOWN';
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  date: string;
  source: string;
  status: ReportStatus;
  fileName: string;
  fileUrl?: string;
  extractedData?: {
    report_metadata: {
      report_type: string;
      date: string;
      lab_name: string;
    };
    test_values: TestValue[];
    summary: string;
    what_is_wrong: string;
    abnormal_findings: string[];
  };
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  phone: string;
  age: string;
  gender: string;
  date: string;
  slot: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface PatientNote {
  id: string;
  patientId: string;
  date: string;
  complaint: string;
  noteText: string;
  vitals: {
    bp: string;
    pulse: string;
    temperature: string;
  };
}
