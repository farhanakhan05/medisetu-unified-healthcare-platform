# Medisetu: Unified Healthcare Platform

Medisetu is a comprehensive, dual-sided healthcare portal designed to bridge the gap between patients and healthcare professionals. It simplifies medical record management through AI-driven analysis and streamlines clinical workflows with integrated appointment and patient history tracking.

##Live Demo
 https://farhanakhan05.github.io/medisetu-unified-healthcare-platform/


## 🚀 Key Features

### 👤 Patient Portal
*   **Medical Report Locker:** A centralized, searchable repository for all clinical documents.
*   **AI Report Analysis:** Powered by **Google Gemini**, patients can upload raw lab results to receive:
    *   A simplified, patient-friendly summary.
    *   Contextual explanations of abnormal findings.
    *   Suggested next steps (e.g., "Consult a specialist").
*   **Smart Filtering:** Quickly sort reports by status (Normal vs. Abnormal) or lab source.

### 🩺 Doctor Portal
*   **Appointment Management:** Real-time scheduling, check-ins, and status tracking for daily consultations.
*   **Patient 360° Profile:** Access complete patient history, including past clinical notes and vitals (BP, Pulse, Temperature).
*   **Digital Prescriptions/Notes:** A specialized interface for recording complaints and clinical observations during visits.
*   **Conflict Detection:** Built-in logic to prevent double-booking of time slots.

## 🛠️ Tech Stack

*   **Frontend:** React (v19), TypeScript.
*   **Styling:** Tailwind CSS (Modern, responsive utility-first design).
*   **AI Intelligence:** `@google/genai` (utilizing the `gemini-3-flash-preview` model).
*   **Storage:** Browser LocalStorage (Local DB simulation for persistence during testing).

## 🔐 Access Credentials

### For Doctors
To access the professional dashboard, use the following pre-seeded credentials:
*   **Doctor ID:** `DOC001`
*   **Email:** `sameer@medisetu.com`

### For Patients
*   **New Patients:** Enter any phone number or unique ID; the system will automatically create a secure profile for you.
*   **Existing Patients:** Use ID `P100` to see pre-loaded sample data.

## 🧠 AI Capabilities
The app uses a structured JSON output schema from Gemini to ensure medical data is extracted reliably. The prompt engineering focuses on safety, utilizing "probability language" and mandatory medical disclaimers to ensure the AI acts as an assistant, not a diagnostic replacement.

## ⚙️ Environment Requirements
*   **API Key:** Requires a valid Google Gemini API key provided via `process.env.API_KEY`.
*   **Permissions:** Request for Camera access (intended for future OCR/Scanning features).

