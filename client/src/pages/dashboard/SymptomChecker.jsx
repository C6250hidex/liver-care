import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Eye,
  Droplets,
  Thermometer,
  Wind,
  ZapOff,
  Coffee,
  Users,
  Heart,
  Syringe,
  Globe,
  Beaker,
  ChevronRight,
  RotateCcw,
  FileText,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import API from "../../services/api";

// ─── Symptom + History Config (mirrors backend weights) ──────────────────────
const SYMPTOMS_CONFIG = [
  {
    key: "jaundice",
    label: "Jaundice",
    sub: "Yellowing of skin or eyes",
    icon: Eye,
    critical: true,
  },
  {
    key: "dark_urine",
    label: "Dark Urine",
    sub: "Tea or cola-coloured urine",
    icon: Droplets,
    critical: true,
  },
  {
    key: "abdominal_pain",
    label: "Abdominal Pain",
    sub: "Pain in upper-right abdomen",
    icon: Activity,
    critical: true,
  },
  {
    key: "pale_stool",
    label: "Pale Stools",
    sub: "Clay-coloured or whitish stools",
    icon: ZapOff,
    critical: true,
  },
  {
    key: "fever",
    label: "Fever",
    sub: "Temperature above 38°C / 100.4°F",
    icon: Thermometer,
    critical: false,
  },
  {
    key: "nausea",
    label: "Nausea",
    sub: "Feeling sick or vomiting",
    icon: Wind,
    critical: false,
  },
  {
    key: "appetite_loss",
    label: "Appetite Loss",
    sub: "Reduced desire to eat",
    icon: Coffee,
    critical: false,
  },
  {
    key: "fatigue",
    label: "Fatigue",
    sub: "Persistent tiredness or weakness",
    icon: ZapOff,
    critical: false,
  },
  {
    key: "joint_pain",
    label: "Joint Pain",
    sub: "Aching or swollen joints",
    icon: Activity,
    critical: false,
  },
  {
    key: "itching",
    label: "Skin Itching",
    sub: "Generalised pruritus",
    icon: Wind,
    critical: false,
  },
];

const HISTORY_CONFIG = [
  {
    key: "alcohol_use",
    label: "Frequent Alcohol Use",
    sub: "Regular drinking that stresses the liver",
    icon: Coffee,
  },
  {
    key: "previous_exposure",
    label: "Known Hepatitis Exposure",
    sub: "Contact with a diagnosed person",
    icon: Users,
  },
  {
    key: "unprotected_sex",
    label: "Unprotected Sexual Contact",
    sub: "Primary route for Hepatitis B & C",
    icon: Heart,
  },
  {
    key: "iv_drug_use",
    label: "Intravenous Drug Use",
    sub: "Highest-risk route for bloodborne hepatitis",
    icon: Syringe,
  },
  {
    key: "blood_transfusion",
    label: "Blood Transfusion History",
    sub: "Potential exposure if pre-modern screening",
    icon: Droplets,
  },
  {
    key: "family_history",
    label: "Family Liver Disease",
    sub: "Genetic predisposition to liver conditions",
    icon: Users,
  },
  {
    key: "travel_endemic_area",
    label: "Travel to Endemic Region",
    sub: "Areas with poor sanitation or high Hep A/E rates",
    icon: Globe,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildInitialState = (config) =>
  config.reduce((acc, { key }) => ({ ...acc, [key]: false }), {});

const STEPS = [
  { num: 1, label: "Symptoms" },
  { num: 2, label: "History" },
  { num: 3, label: "Results" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const ToggleCard = ({ label, sub, icon: Icon, active, onClick, critical }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group
      ${
        active
          ? "border-medical-primary bg-medical-primary/5 dark:bg-medical-primary/10 shadow-sm"
          : "border-gray-100 dark:border-slate-800 hover:border-medical-primary/40 hover:bg-gray-50 dark:hover:bg-slate-800/50"
      }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
      ${
        active
          ? "bg-medical-primary text-white"
          : "bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-medical-primary/10 group-hover:text-medical-primary"
      }`}
    >
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{label}</span>
        {critical && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-medical-danger bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">
            High Weight
          </span>
        )}
      </div>
      <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted mt-0.5 truncate">
        {sub}
      </p>
    </div>
    <div
      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
      ${active ? "border-medical-primary bg-medical-primary" : "border-gray-300 dark:border-slate-600"}`}
    >
      {active && (
        <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
      )}
    </div>
  </button>
);

const RiskGauge = ({ score, level, color }) => {
  const angle = (score / 100) * 180;
  const tiers = [
    { label: "Low", color: "#22c55e" },
    { label: "Medium", color: "#f59e0b" },
    { label: "High", color: "#ef4444" },
    { label: "Critical", color: "#dc2626" },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc segments */}
        <svg viewBox="0 0 200 100" className="w-full">
          <path
            d="M10,100 A90,90 0 0,1 190,100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />
          <path
            d="M10,100 A90,90 0 0,1 55,22"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="butt"
            opacity="0.3"
          />
          <path
            d="M55,22  A90,90 0 0,1 100,10"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            strokeLinecap="butt"
            opacity="0.3"
          />
          <path
            d="M100,10 A90,90 0 0,1 145,22"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="butt"
            opacity="0.3"
          />
          <path
            d="M145,22 A90,90 0 0,1 190,100"
            fill="none"
            stroke="#dc2626"
            strokeWidth="16"
            strokeLinecap="butt"
            opacity="0.3"
          />
          {/* Needle */}
          <g transform={`rotate(${angle - 90}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="#0284C7" />
          </g>
        </svg>
      </div>
      <div className="text-center -mt-2">
        <span className={`text-5xl font-extrabold ${color}`}>{score}</span>
        <span className={`text-lg font-bold ${color}`}>/100</span>
        <p
          className={`text-sm font-bold uppercase tracking-widest mt-1 ${color}`}
        >
          {level} Risk
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SymptomChecker = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [data, setData] = useState({
    symptoms: buildInitialState(SYMPTOMS_CONFIG),
    history: buildInitialState(HISTORY_CONFIG),
  });

  const handleToggle = (category, field) =>
    setData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: !prev[category][field] },
    }));

  const selectedSymptomCount = Object.values(data.symptoms).filter(
    Boolean,
  ).length;
  const selectedHistoryCount = Object.values(data.history).filter(
    Boolean,
  ).length;

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/ai/analyze", data);
      setResult(res.data);
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message || "Analysis failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setResult(null);
    setError("");
    setData({
      symptoms: buildInitialState(SYMPTOMS_CONFIG),
      history: buildInitialState(HISTORY_CONFIG),
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* ── Progress Stepper ─────────────────────────────────────── */}
      <div className="mb-10 flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-800 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-medical-primary z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {STEPS.map(({ num, label }) => (
          <div key={num} className="flex flex-col items-center z-10 gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
              ${
                step > num
                  ? "bg-medical-primary border-medical-primary text-white"
                  : step === num
                    ? "bg-white dark:bg-slate-900 border-medical-primary text-medical-primary shadow-lg shadow-medical-primary/20"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400"
              }`}
            >
              {step > num ? <CheckCircle2 size={16} /> : num}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:block ${step >= num ? "text-medical-primary" : "text-gray-400"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="card-style p-6 sm:p-10">
        {/* ── STEP 1: Physical Symptoms ─────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-medical-primary/10 flex items-center justify-center">
                  <Activity size={16} className="text-medical-primary" />
                </div>
                <h2 className="text-2xl font-bold">Physical Symptoms</h2>
              </div>
              <p className="text-medical-lightMuted dark:text-medical-darkMuted text-sm">
                Select every symptom you are currently experiencing. "High
                Weight" items carry stronger diagnostic significance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYMPTOMS_CONFIG.map(({ key, label, sub, icon, critical }) => (
                <ToggleCard
                  key={key}
                  label={label}
                  sub={sub}
                  icon={icon}
                  active={data.symptoms[key]}
                  critical={critical}
                  onClick={() => handleToggle("symptoms", key)}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-medical-lightMuted dark:text-medical-darkMuted">
                {selectedSymptomCount} symptom
                {selectedSymptomCount !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setStep(2)}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                Next: Medical History
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Medical History ───────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-medical-accent/10 flex items-center justify-center">
                  <Beaker size={16} className="text-medical-accent" />
                </div>
                <h2 className="text-2xl font-bold">Medical History</h2>
              </div>
              <p className="text-medical-lightMuted dark:text-medical-darkMuted text-sm">
                Your history refines the AI's risk calculation. All information
                is confidential.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HISTORY_CONFIG.map(({ key, label, sub, icon }) => (
                <ToggleCard
                  key={key}
                  label={label}
                  sub={sub}
                  icon={icon}
                  active={data.history[key]}
                  onClick={() => handleToggle("history", key)}
                />
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <ChevronRight size={16} className="rotate-180" /> Back
              </button>
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analysing your profile…
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    Run Clinical Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ───────────────────────────────────── */}
        {step === 3 && result && (
          <div>
            {/* Risk Score Header */}
            <div
              className={`p-6 sm:p-8 rounded-2xl border-2 text-center mb-8 ${result.warning_bg} ${result.warning_border}`}
            >
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">
                Clinical Risk Assessment · {result.urgency}
              </p>
              <RiskGauge
                score={result.risk_score}
                level={result.warning_level}
                color={result.warning_color}
              />
              {result.raw_score > 100 && (
                <p className="mt-3 text-xs text-medical-lightMuted dark:text-medical-darkMuted">
                  Raw compound score: {result.raw_score} — normalised to 100
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              {/* Contributing Factors */}
              <div className="card-style p-5">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm">
                  <Activity size={16} className="text-medical-primary" />
                  Identified Factors
                  <span className="ml-auto text-xs font-normal text-medical-lightMuted dark:text-medical-darkMuted">
                    {result.contributing_factors.total_factors} total
                  </span>
                </h4>

                {result.contributing_factors.symptoms.length === 0 &&
                result.contributing_factors.history.length === 0 ? (
                  <p className="text-sm text-medical-lightMuted dark:text-medical-darkMuted italic">
                    No significant factors identified.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {result.contributing_factors.symptoms.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-medical-lightMuted dark:text-medical-darkMuted mb-1">
                          Symptoms
                        </p>
                        {result.contributing_factors.symptoms.map((f, i) => (
                          <div
                            key={i}
                            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs text-medical-primary">
                                {f.label}
                              </span>
                              <span className="text-[10px] font-bold text-medical-danger bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">
                                +{f.weight}
                              </span>
                            </div>
                            <p className="text-[11px] text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed">
                              {f.detail}
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                    {result.contributing_factors.history.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-medical-lightMuted dark:text-medical-darkMuted mt-3 mb-1">
                          History
                        </p>
                        {result.contributing_factors.history.map((f, i) => (
                          <div
                            key={i}
                            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs text-medical-accent">
                                {f.label}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                                +{f.weight}
                              </span>
                            </div>
                            <p className="text-[11px] text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed">
                              {f.detail}
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Clinical Recommendations */}
              <div className="card-style p-5">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-sm">
                  <ShieldCheck size={16} className="text-medical-accent" />
                  Clinical Actions
                </h4>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-medical-accent/10 text-medical-accent flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <span className="text-medical-lightMuted dark:text-medical-darkMuted leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Possible Hepatitis Types */}
            {result.possible_hepatitis_types?.length > 0 && (
              <div className="mb-6 p-5 border border-dashed border-medical-primary/30 rounded-2xl bg-medical-primary/5 dark:bg-medical-primary/10">
                <h4 className="text-xs font-bold text-medical-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Beaker size={14} />
                  Possible Clinical Patterns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.possible_hepatitis_types.map((type, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-medical-primary text-white text-xs font-bold rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment ID */}
            {result.assessment_id && (
              <p className="text-xs text-medical-lightMuted dark:text-medical-darkMuted mb-6 text-center">
                Assessment ID:{" "}
                <span className="font-mono font-bold">
                  #{result.assessment_id}
                </span>{" "}
                · {new Date(result.timestamp).toLocaleString()}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                className="flex-1 border-2 border-gray-200 dark:border-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> New Assessment
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard/patient")}
                className="flex-1 border-2 border-gray-200 dark:border-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Download Report
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-8 text-[10px] text-gray-400 leading-relaxed text-center italic">
              {result.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
