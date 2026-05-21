const db = require("../config/db");
const logActivity = require("../utils/logger");

// ─── Clinical Scoring Constants ───────────────────────────────────────────────
const SYMPTOM_WEIGHTS = {
  jaundice: {
    score: 45,
    label: "Icterus (Jaundice) detected",
    detail:
      "Significant indicator of liver dysfunction — suggests hyperbilirubinemia.",
  },
  dark_urine: {
    score: 20,
    label: "Bilirubinuria (Dark Urine)",
    detail:
      "Excess bilirubin in the bloodstream — highly specific to hepatic disease.",
  },
  abdominal_pain: {
    score: 15,
    label: "Right Upper Quadrant Pain",
    detail: "Possible hepatomegaly or liver inflammation.",
  },
  pale_stool: {
    score: 15,
    label: "Acholic (Pale) Stools",
    detail:
      "Absence of bile pigment — strong indicator of biliary obstruction or hepatitis.",
  },
  fever: {
    score: 10,
    label: "Febrile Response",
    detail: "Indicates active viral replication or inflammatory process.",
  },
  nausea: {
    score: 8,
    label: "Nausea",
    detail: "Common gastrointestinal symptom in early-stage hepatitis.",
  },
  appetite_loss: {
    score: 8,
    label: "Anorexia (Appetite Loss)",
    detail:
      "Systemic metabolic disruption associated with hepatocellular damage.",
  },
  fatigue: {
    score: 5,
    label: "Malaise / Fatigue",
    detail:
      "Generalised weakness — non-specific but relevant in constellation of symptoms.",
  },
  joint_pain: {
    score: 8,
    label: "Arthralgia (Joint Pain)",
    detail: "Immune-complex deposition — associated with Hepatitis B.",
  },
  itching: {
    score: 10,
    label: "Pruritus (Itching)",
    detail:
      "Bile salt accumulation in skin — specific indicator of cholestasis.",
  },
};

const HISTORY_WEIGHTS = {
  previous_exposure: {
    score: 15,
    label: "Documented Exposure",
    detail:
      "High epidemiological risk — prior contact with infected individual or contaminated source.",
  },
  alcohol_use: {
    score: 10,
    label: "Alcohol Consumption",
    detail:
      "Known hepatotoxin — directly exacerbates hepatic stress and inflammation.",
  },
  unprotected_sex: {
    score: 10,
    label: "Unprotected Sexual Contact",
    detail: "Primary transmission route for Hepatitis B and C.",
  },
  iv_drug_use: {
    score: 20,
    label: "Intravenous Drug Use",
    detail: "Highest risk factor for bloodborne hepatitis transmission.",
  },
  blood_transfusion: {
    score: 12,
    label: "Recent Blood Transfusion",
    detail:
      "Potential Hepatitis C exposure if transfusion pre-dates modern screening.",
  },
  family_history: {
    score: 8,
    label: "Family History of Liver Disease",
    detail: "Genetic predisposition increases susceptibility.",
  },
  travel_endemic_area: {
    score: 8,
    label: "Travel to Endemic Area",
    detail: "Hepatitis A/E risk elevated in regions with poor sanitation.",
  },
};

const RISK_TIERS = [
  {
    minScore: 75,
    level: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    urgency: "IMMEDIATE",
    recommendations: [
      "Proceed to the nearest Emergency Department immediately.",
      "Request a full hepatic panel: ALT, AST, ALP, GGT, Total & Direct Bilirubin.",
      "Request a viral hepatitis serology screen: HBsAg, Anti-HCV, Anti-HAV IgM.",
      "Avoid all alcohol, paracetamol, and hepatotoxic medications.",
      "Do not eat or drink until assessed by a physician (in case surgical intervention is needed).",
    ],
  },
  {
    minScore: 45,
    level: "High",
    color: "text-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-400",
    urgency: "URGENT",
    recommendations: [
      "Book an urgent appointment with a Hepatologist within 24–48 hours.",
      "Request liver function tests (LFTs) and a viral hepatitis panel.",
      "Begin documenting symptoms daily — note severity, time, and triggers.",
      "Strictly avoid alcohol and NSAIDs (ibuprofen, aspirin).",
      "Maintain hydration and a low-fat, high-carbohydrate diet.",
    ],
  },
  {
    minScore: 25,
    level: "Medium",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    urgency: "MONITOR",
    recommendations: [
      "Schedule a routine GP appointment within the next 5–7 days.",
      "Request a basic liver function test and CBC.",
      "Monitor your temperature twice daily and log results.",
      "Reduce alcohol intake and maintain a balanced diet.",
      "Return immediately if jaundice, dark urine, or severe pain develops.",
    ],
  },
  {
    minScore: 0,
    level: "Low",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
    urgency: "ROUTINE",
    recommendations: [
      "Your current symptom profile suggests low hepatic risk.",
      "Maintain a balanced diet rich in vegetables and low in saturated fats.",
      "Limit alcohol consumption to within recommended guidelines.",
      "Stay hydrated and maintain regular physical activity.",
      "Schedule a routine annual health check with your GP.",
    ],
  },
];

const safeParse = (value, fallback) => {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

/**
 * AI Symptom Analysis Engine
 */
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, history } = req.body;
    const userId = req.userId;

    if (!symptoms || typeof symptoms !== "object")
      return res.status(400).json({ message: "Symptom data required." });
    if (!history || typeof history !== "object")
      return res.status(400).json({ message: "History data required." });

    let score = 0;
    const symptomFactors = [];
    const historyFactors = [];

    // Scoring Loop
    for (const [key, config] of Object.entries(SYMPTOM_WEIGHTS)) {
      if (symptoms[key] === true) {
        score += config.score;
        symptomFactors.push({
          label: config.label,
          detail: config.detail,
          weight: config.score,
        });
      }
    }
    for (const [key, config] of Object.entries(HISTORY_WEIGHTS)) {
      if (history[key] === true) {
        score += config.score;
        historyFactors.push({
          label: config.label,
          detail: config.detail,
          weight: config.score,
        });
      }
    }

    const rawScore = score;
    if (score > 100) score = 100;
    const tier = RISK_TIERS.find((t) => score >= t.minScore);

    // Persist Assessment
    const analysisPayload = {
      symptoms,
      history,
      symptomFactors,
      historyFactors,
      rawScore,
    };
    let assessmentId = null;

    if (userId) {
      const [result] = await db.execute(
        `INSERT INTO ai_results (user_id, risk_score, warning_level, symptoms_analyzed, recommendations) VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          score,
          tier.level,
          JSON.stringify(analysisPayload),
          JSON.stringify(tier.recommendations),
        ],
      );
      assessmentId = result.insertId;

      // ✅ ADDED: GLOBAL ACTIVITY LOGGING for Admin Panel
      await logActivity(
        userId,
        "ai_checkup",
        `Patient completed assessment with ${score}% risk score (${tier.level})`,
        score > 70 ? "critical" : "info",
      );
    }

    return res.status(200).json({
      assessment_id: assessmentId,
      risk_score: score,
      raw_score: rawScore,
      warning_level: tier.level,
      urgency: tier.urgency,
      warning_color: tier.color,
      warning_bg: tier.bgColor,
      warning_border: tier.borderColor,
      contributing_factors: {
        symptoms: symptomFactors,
        history: historyFactors,
        total_factors: symptomFactors.length + historyFactors.length,
      },
      recommendations: tier.recommendations,
      timestamp: new Date().toISOString(),
      disclaimer:
        "DISCLAIMER: This AI analysis is a risk assessment tool, not a medical diagnosis.",
    });
  } catch (error) {
    console.error("AI Analysis Engine Error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during AI analysis." });
  }
};

/**
 * Get Assessment History
 */
exports.getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50,
    );
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const [rows] = await db.execute(
      `SELECT id, risk_score, warning_level, recommendations, created_at FROM ai_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      [userId],
    );

    const [countResult] = await db.execute(
      "SELECT COUNT(*) AS total FROM ai_results WHERE user_id = ?",
      [userId],
    );

    return res.status(200).json({
      assessments: rows.map((row) => ({
        ...row,
        recommendations: safeParse(row.recommendations, []),
      })),
      pagination: {
        total: countResult[0].total,
        limit,
        offset,
        hasMore: offset + limit < countResult[0].total,
      },
    });
  } catch (error) {
    console.error("Assessment History Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve assessment history." });
  }
};

/**
 * Get Single Assessment by ID
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT * FROM ai_results WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Assessment not found." });

    const assessment = rows[0];
    return res.status(200).json({
      ...assessment,
      symptoms_json: safeParse(assessment.symptoms_analyzed, {}),
      recommendations: safeParse(assessment.recommendations, []),
    });
  } catch (error) {
    console.error("Get Assessment Error:", error);
    return res.status(500).json({ message: "Failed to retrieve assessment." });
  }
};
