import { jsPDF } from "jspdf";

/**
 * Generate and download a PDF report for a single prediction result.
 *
 * @param {Object} opts
 * @param {string} opts.riskLevel   - "low" | "moderate" | "high"
 * @param {number|null} opts.probability   - e.g. 42.01
 * @param {number|null} opts.diabetesResult - 0 or 1
 * @param {string} [opts.patientName]
 * @param {string} [opts.date]      - formatted date string
 * @param {Object} [opts.vitals]    - { bmi, blood_glucose_level, HbA1c_level, age, gender, ... }
 */
export default function downloadPredictionPDF({
  riskLevel = "low",
  probability = null,
  diabetesResult = null,
  patientName = "",
  date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  vitals = {},
}) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;

  const riskColors = {
    high: [220, 38, 38],
    moderate: [202, 138, 4],
    low: [22, 163, 74],
  };
  const color = riskColors[riskLevel] || riskColors.low;

  // ── Header ──────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Glucogu Health Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Diabetes Risk Prediction Report", 14, 26);
  doc.text(`Generated: ${date}`, 14, 34);
  y = 50;

  // ── Patient Info ────────────────────────────────────────────────
  if (patientName) {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Patient:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(patientName, 42, y);
    y += 10;
  }

  // ── Risk Result ─────────────────────────────────────────────────
  doc.setFillColor(...color);
  doc.roundedRect(14, y, pageW - 28, 36, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${riskLevel.toUpperCase()} RISK`, pageW / 2, y + 14, {
    align: "center",
  });
  doc.setFontSize(26);
  doc.text(probability !== null ? `${probability}%` : "—", pageW / 2, y + 28, {
    align: "center",
  });
  y += 46;

  // Diabetes result line
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const resultText =
    diabetesResult === 1
      ? "Diabetes Indicated by Model"
      : diabetesResult === 0
        ? "No Diabetes Indicated by Model"
        : "";
  if (resultText) {
    doc.text(resultText, pageW / 2, y, { align: "center" });
    y += 10;
  }

  // ── Vitals Table ────────────────────────────────────────────────
  const vitalRows = [];
  if (vitals.age) vitalRows.push(["Age", `${vitals.age}`]);
  if (vitals.gender) vitalRows.push(["Gender", vitals.gender]);
  if (vitals.bmi) vitalRows.push(["BMI", `${vitals.bmi}`]);
  if (vitals.blood_glucose_level)
    vitalRows.push(["Blood Glucose", `${vitals.blood_glucose_level} mg/dL`]);
  if (vitals.HbA1c_level)
    vitalRows.push(["HbA1c Level", `${vitals.HbA1c_level}%`]);
  if (vitals.hypertension !== undefined)
    vitalRows.push(["Hypertension", vitals.hypertension ? "Yes" : "No"]);
  if (vitals.heart_disease !== undefined)
    vitalRows.push(["Heart Disease", vitals.heart_disease ? "Yes" : "No"]);
  if (vitals.smoking_history)
    vitalRows.push(["Smoking History", vitals.smoking_history]);

  if (vitalRows.length > 0) {
    y += 4;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Health Indicators", 14, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    vitalRows.forEach(([label, value]) => {
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 4, pageW - 28, 8, "F");
      doc.setTextColor(80, 80, 80);
      doc.text(label, 18, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(value, pageW - 18, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 10;
    });
  }

  // ── Recommendations ─────────────────────────────────────────────
  const recommendations = {
    high: [
      "Consult a healthcare provider urgently — within 1–2 weeks",
      "Undergo a formal fasting glucose and HbA1c blood test",
      "Begin a structured diet plan limiting sugars and processed foods",
      "Aim for at least 150 min of moderate exercise per week",
      "Monitor blood glucose levels regularly at home",
    ],
    moderate: [
      "Schedule a check-up within the next month",
      "Reduce sugary drinks and high-glycaemic foods",
      "Increase daily physical activity — 30 min walking is a start",
      "Maintain a healthy weight through balanced nutrition",
      "Track your blood pressure regularly",
    ],
    low: [
      "Continue your current healthy lifestyle habits",
      "Get an annual general health check-up",
      "Stay hydrated and maintain a balanced diet",
      "Stay physically active and manage stress",
      "Re-assess diabetes risk annually",
    ],
  };

  const recs = recommendations[riskLevel] || recommendations.low;
  y += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Recommendations", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  recs.forEach((rec, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${i + 1}. ${rec}`, 18, y);
    y += 7;
  });

  // ── Disclaimer ──────────────────────────────────────────────────
  y += 8;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, y - 4, pageW - 28, 16, 3, 3, "F");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Disclaimer: This report is for informational purposes only and does not constitute medical advice.",
    pageW / 2,
    y + 2,
    { align: "center" },
  );
  doc.text(
    "Please consult a qualified healthcare professional for diagnosis and treatment.",
    pageW / 2,
    y + 7,
    { align: "center" },
  );

  // ── Save ────────────────────────────────────────────────────────
  const safeName = patientName
    ? patientName.replace(/[^a-zA-Z0-9]/g, "_")
    : "report";
  doc.save(`Glucogu_Report_${safeName}_${riskLevel}.pdf`);
}
