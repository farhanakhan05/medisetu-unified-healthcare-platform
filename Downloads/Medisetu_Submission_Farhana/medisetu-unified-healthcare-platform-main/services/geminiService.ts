
import { GoogleGenAI, Type } from "@google/genai";

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    report_metadata: {
      type: Type.OBJECT,
      properties: {
        report_type: { type: Type.STRING },
        date: { type: Type.STRING },
        lab_name: { type: Type.STRING }
      },
      required: ["report_type", "date", "lab_name"]
    },
    test_values: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          test_name: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING },
          normal_range: { type: Type.STRING },
          flag: { type: Type.STRING, description: "LOW, HIGH, NORMAL, or UNKNOWN" }
        },
        required: ["test_name", "value", "unit", "normal_range", "flag"]
      }
    },
    summary: { type: Type.STRING, description: "A patient-friendly summary with 5 required sections: What this report is, What is normal, What is not normal, Next steps, Safety Disclaimer." },
    what_is_wrong: { type: Type.STRING, description: "Detailed explanation of potential issues inferred from abnormal values, using safe probability language." },
    abnormal_findings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["report_metadata", "test_values", "summary", "what_is_wrong", "abnormal_findings"]
};

export async function analyzeReport(reportText: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this medical report text and extract structured data. 
    Text: "${reportText}"
    
    Ensure the summary is patient-friendly (not too technical) and includes:
    1) What this report is
    2) What is normal
    3) What is not normal
    4) What you should do next (3 steps)
    5) Safety Disclaimer
    
    For "What might be wrong", use probability language like "may indicate" or "can be due to". 
    DO NOT claim a diagnosis. ALWAYS suggest consulting a doctor.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: reportSchema
    }
  });

  const response = await model;
  return JSON.parse(response.text);
}
