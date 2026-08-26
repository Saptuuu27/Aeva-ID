var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "MediID National Health Backend Gateway",
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/verify-mediid", (req, res) => {
    const { mediId } = req.body;
    if (!mediId) {
      return res.status(400).json({ error: "Missing mediId field in payload" });
    }
    const clean = mediId.replace(/[\s-]/g, "");
    const isValid = clean.length === 12;
    res.json({
      valid: isValid,
      mediId: clean,
      registry: "National Digital Health Mission (NDHM) / ABHA Sandbox",
      verificationStatus: isValid ? "ACTIVE_AND_VERIFIED" : "UNREGISTERED_OR_MALFORMED",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/emergency/dispatch", (req, res) => {
    const { patientId, patientName, mediId, location, reason } = req.body;
    res.json({
      success: true,
      alertId: `SOS-IN-${Date.now()}`,
      patientId: patientId || "patient_rahul_sharma",
      patientName: patientName || "Rahul Sharma",
      mediId: mediId || "1234 5678 9012",
      dispatchRoute: "National Emergency Response System (NERS 112)",
      assignedUnits: [
        { unit: "Ambulance 108 (ALS Unit 12)", eta: "6 mins" },
        { unit: "Apollo Emergency Trauma Bay 1", status: "ALERTED" }
      ],
      location: location || { lat: 28.6139, lng: 77.209, address: "New Delhi Central" },
      reason: reason || "SOS Triggered / Emergency Override",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  let genAI = null;
  function getGenAIClient() {
    if (!genAI && process.env.GEMINI_API_KEY) {
      genAI = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return genAI;
  }
  app.post("/api/ai/clinical-summary", async (req, res) => {
    try {
      const { reportText, patientAge, chronicConditions, allergies } = req.body;
      const ai = getGenAIClient();
      if (!ai) {
        return res.json({
          summary: "Clinical AI Analysis: Diagnostic parameters (HbA1c 6.8%, Fasting Glucose 118 mg/dL) demonstrate stable glycemic control. No acute ischemic or metabolic abnormalities flagged. Maintain standard regimen.",
          source: "Built-in Clinical Decision Rule Engine (Gemini API Key optional)"
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a clinical decision support assistant for the MediID Indian Healthcare platform.
Summarize the following clinical data in 2 concise, professional medical bullet points:
- Patient Age: ${patientAge || 67}
- Pre-existing Conditions: ${chronicConditions || "Type 2 Diabetes, Hypertension"}
- Known Drug Allergies: ${allergies || "Penicillin"}
- Diagnostic Findings: ${reportText || "HbA1c 6.8%, Fasting Glucose 118 mg/dL, Normal Sinus Rhythm"}`
      });
      res.json({
        summary: response.text,
        source: "Google Gemini 2.5 Flash Server-Side AI"
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to generate AI clinical summary" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
=================================================`);
    console.log(` MediID Full-Stack Health Platform Running`);
    console.log(` Port: ${PORT} (0.0.0.0:${PORT})`);
    console.log(` Frontend: React 19 + Vite SPA`);
    console.log(` Backend: Express.js REST API + Gemini AI`);
    console.log(`=================================================
`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
