# 🏥 Medisetu: Unified Healthcare Platform

**Medisetu** is a comprehensive, dual-sided healthcare ecosystem designed to bridge the communication gap between patients and healthcare professionals. It simplifies medical record management through **AI-driven analysis** and streamlines clinical workflows with integrated appointment and patient history tracking.

🚀 **[Live Demo](https://farhanakhan05.github.io/medisetu-unified-healthcare-platform/)**

---

## 🌟 Key Features

### 👤 Patient Portal
*   **Medical Report Locker:** A centralized, searchable repository for all clinical documents stored securely via local persistence.
*   **AI Report Analysis:** Powered by **Google Gemini-1.5-Flash**, patients can upload or paste raw lab results to receive:
    *   A simplified, patient-friendly summary.
    *   Contextual explanations of abnormal findings.
    *   Suggested next steps (e.g., "Consult a specialist").
*   **Smart Filtering:** Quickly sort reports by status (Normal vs. Abnormal) or lab source.

### 🩺 Doctor Portal
*   **Appointment Management:** Real-time scheduling, check-ins, and status tracking for daily consultations.
*   **Patient 360° Profile:** Access complete patient history, including past clinical notes, AI-analyzed reports, and vitals (BP, Pulse, Temperature).
*   **Digital Prescriptions/Notes:** A specialized interface for recording complaints and clinical observations during visits.
*   **Conflict Detection:** Built-in logic to prevent double-booking of time slots.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS (Modern, responsive utility-first design) |
| **AI Intelligence** | `@google/generative-ai` (Gemini-1.5-flash) |
| **Icons** | Lucide React |
| **Storage** | Browser LocalStorage (Persistence simulation) |

---

## 🔐 Access Credentials

Use the following pre-seeded credentials to explore the platform:

### For Doctors
*   **Doctor ID:** `DOC001`
*   **Email:** `sameer@medisetu.com`

### For Patients
*   **Existing Patient:** Use ID `P100` to see pre-loaded sample data.
*   **New Patients:** Enter any phone number; the system will automatically create a secure profile.

---

## 🧠 AI Capabilities & Prompt Engineering

The platform utilizes structured prompt engineering to ensure safety and data integrity:

1.  **JSON Schema Extraction:** The AI is instructed to return a strict JSON format to allow the UI to highlight abnormal values automatically.
2.  **Probability Language:** Prompts are designed to ensure the AI uses phrases like *"indicates potential"* or *"suggests"* to maintain a supportive (non-diagnostic) role.
3.  **Mandatory Disclaimers:** Every AI-generated summary includes a medical disclaimer emphasizing that the output is for informational purposes only.

---

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/farhanakhan05/medisetu-unified-healthcare-platform.git
    cd medisetu-unified-healthcare-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_google_gemini_api_key
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

---

## 📊 Evaluation & Methodology

*   **Approach:** Built a modular pipeline where raw text is sanitized, sent to Gemini for structured extraction, and stored in a local-first architecture for high-speed retrieval.
*   **Evaluation:** Tested against 10+ varying lab report formats (Blood work, Lipid profiles, Urinalysis) to ensure parameter extraction accuracy.
*   **Limitations:** Currently relies on `LocalStorage`. Clearing browser cache will wipe data.
*   **Next Steps:** Implement **OCR (Tesseract.js)** for direct image-to-data scanning and **Supabase/Firebase** for cloud data persistence.

---

**Developed with ❤️ by Farhana Khan**  
*Empowering patients and doctors through AI-driven innovation.*