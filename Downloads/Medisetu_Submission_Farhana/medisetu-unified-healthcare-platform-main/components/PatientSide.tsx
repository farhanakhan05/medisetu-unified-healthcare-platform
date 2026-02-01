
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './Layout';
import { db } from '../services/dbService';
import { Patient, MedicalReport, ReportStatus } from '../types';
import { analyzeReport } from '../services/geminiService';

interface PatientSideProps {
  onExit: () => void;
}

export const PatientSide: React.FC<PatientSideProps> = ({ onExit }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [view, setView] = useState<'LOGIN' | 'LIST' | 'DETAILS' | 'UPLOAD'>('LOGIN');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // List State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All'>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<MedicalReport[]>([]);

  // AI Upload State
  const [reportText, setReportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const pid = localStorage.getItem('medisetu_active_patient_id');
    if (pid) {
      const p = db.getPatient(pid);
      if (p) {
        setPatient(p);
        setView('LIST');
        setReports(db.getReports(p.id));
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError('Please enter Patient ID or Phone Number');
      return;
    }
    
    let p = db.getPatient(loginInput);
    if (!p) {
      // Auto-create
      p = db.createPatient({
        name: 'New Patient',
        phone: loginInput.includes('@') ? 'N/A' : loginInput,
        age: '25',
        gender: 'Not specified'
      });
    }
    
    setPatient(p);
    localStorage.setItem('medisetu_active_patient_id', p.id);
    setView('LIST');
    setReports(db.getReports(p.id));
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('medisetu_active_patient_id');
    setPatient(null);
    setView('LOGIN');
    onExit();
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                            r.source.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const handleProcessReport = async () => {
    if (!reportText.trim() || !patient) return;
    setIsProcessing(true);
    try {
      const data = await analyzeReport(reportText);
      const newReport: MedicalReport = {
        id: `REP${Date.now()}`,
        patientId: patient.id,
        title: data.report_metadata.report_type || 'Extracted Report',
        date: data.report_metadata.date || new Date().toISOString().split('T')[0],
        source: data.report_metadata.lab_name || 'Extracted',
        status: data.abnormal_findings.length > 0 ? ReportStatus.Abnormal : ReportStatus.Normal,
        fileName: 'extracted_analysis.pdf',
        extractedData: data
      };
      db.saveReport(newReport);
      setReports(db.getReports(patient.id));
      setView('LIST');
      setReportText('');
    } catch (error) {
      console.error(error);
      alert('Failed to process report. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Medisetu</h1>
            <p className="text-slate-500 mt-2">Patient Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number / Patient ID</label>
              <input 
                type="text" 
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-3 rounded-xl border ${loginError ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {loginError && <p className="text-xs text-red-500 mt-1">{loginError}</p>}
            </div>
            <p className="text-xs text-slate-500 text-center italic">"We use this to fetch your reports securely."</p>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
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

  const selectedReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;

  return (
    <Layout 
      title={patient?.name} 
      subtitle={`ID: ${patient?.id}`}
      onLogout={handleLogout}
      showBack={view !== 'LIST'}
      onBack={() => setView('LIST')}
    >
      {view === 'LIST' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-2xl font-bold text-slate-800">Reports Locker</h2>
            <button 
              onClick={() => setView('UPLOAD')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Report
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-2 relative">
              <input 
                type="text"
                placeholder="Search CBC, X-Ray, Apollo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {(['All', 'Normal', 'Abnormal', 'Pending'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                    statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No reports found.</p>
              <button onClick={() => setView('UPLOAD')} className="mt-4 text-blue-600 font-bold hover:underline">Upload your first report</button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredReports.map(report => (
                <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{report.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      report.status === ReportStatus.Normal ? 'bg-green-100 text-green-700' : 
                      report.status === ReportStatus.Abnormal ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {report.date}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {report.source}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setView('DETAILS');
                    }}
                    className="w-full py-2 bg-slate-50 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'DETAILS' && selectedReport && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedReport.title}</h2>
                <p className="text-slate-500">{selectedReport.date} • {selectedReport.source}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                selectedReport.status === ReportStatus.Normal ? 'bg-green-100 text-green-700' : 
                selectedReport.status === ReportStatus.Abnormal ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedReport.status}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                File Information
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{selectedReport.fileName}</p>
                  <span className="text-xs text-slate-400 uppercase">PDF • 1.2 MB</span>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>
            </div>

            {selectedReport.extractedData ? (
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Patient Friendly Summary</h3>
                  <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line bg-blue-50/50 p-6 rounded-2xl">
                    {selectedReport.extractedData.summary}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">What might be wrong?</h3>
                  <div className="bg-amber-50 p-6 rounded-2xl text-amber-900">
                    <p className="whitespace-pre-line leading-relaxed">
                      {selectedReport.extractedData.what_is_wrong}
                    </p>
                    <p className="mt-4 text-sm font-bold opacity-75">Note: This is not a diagnosis. Please consult a doctor.</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Test Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-2 px-4">Test Name</th>
                          <th className="py-2 px-4">Value</th>
                          <th className="py-2 px-4">Normal Range</th>
                          <th className="py-2 px-4 text-right">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.extractedData.test_values.map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-700">{v.test_name}</td>
                            <td className="py-3 px-4 text-slate-800 font-bold">{v.value} {v.unit}</td>
                            <td className="py-3 px-4 text-slate-500 italic text-sm">{v.normal_range}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.flag === 'LOW' || v.flag === 'HIGH' ? 'bg-red-100 text-red-600' : 
                                v.flag === 'NORMAL' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {v.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-xl">
                <p className="text-slate-500 italic">No structured data available for this report. Use the AI uploader for detailed analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'UPLOAD' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Simulate Report Upload</h2>
            <p className="text-slate-500 mb-6">Paste the text from your medical report (OCR output) to generate an AI analysis.</p>
            
            <div className="space-y-4">
              <textarea 
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Example: Hb - 11.2 (Normal: 12-14)..."
                className="w-full h-48 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
              />
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>AI Note:</strong> Our system will extract patient info, test results, and generate a patient-friendly summary automatically.
                </p>
              </div>

              <button 
                onClick={handleProcessReport}
                disabled={isProcessing || !reportText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing with Gemini...
                  </>
                ) : 'Analyze Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
