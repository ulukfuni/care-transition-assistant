import { DischargeSummary } from "@/types";

export const createSystemPrompt = (
  role: "physician" | "nurse" | "case_manager" = "physician"
) => {
  const basePrompt = `You are an expert healthcare AI assistant specializing in care transition management. Your role is to analyze patient discharge summaries and provide actionable insights for healthcare providers.

Key responsibilities:
1. Identify high-risk patients who may need immediate attention
2. Suggest appropriate follow-up care and interventions
3. Flag potential medication issues or drug interactions
4. Recommend care coordination strategies
5. Assess readmission risk factors

When analyzing patient data, consider:
- Medical complexity and comorbidities
- Social determinants of health (living situation, support systems)
- Medication compliance risks
- Follow-up care requirements and timing
- Discharge disposition appropriateness
- Risk factors for readmission

Always provide specific, actionable recommendations with clear clinical reasoning. Format your response as structured insights that can be displayed as cards.`;

  const roleSpecificPrompts = {
    physician: `
Focus on:
- Clinical decision-making and medical management
- Medication adjustments and interactions
- Specialist referrals and follow-up timing
- Diagnostic considerations and monitoring needs`,

    nurse: `
Focus on:
- Patient education and self-care management
- Medication compliance and administration
- Symptom monitoring and when to seek care
- Discharge planning and home care needs`,

    case_manager: `
Focus on:
- Care coordination across providers
- Resource allocation and utilization
- Insurance and authorization requirements
- Social services and community resources`,
  };

  return basePrompt + roleSpecificPrompts[role];
};

export const createAnalysisPrompt = (
  message: string,
  patients: DischargeSummary[],
  analysisType?:
    | "risk_assessment"
    | "medication_review"
    | "follow_up_planning"
    | "general"
) => {
  const patientData = JSON.stringify(patients, null, 2);

  const analysisPrompts = {
    risk_assessment: `
Perform a comprehensive risk assessment focusing on:
- Readmission risk factors
- Medication compliance risks
- Social and environmental factors
- Clinical complexity and comorbidities
Prioritize patients by risk level and provide specific interventions.`,

    medication_review: `
Conduct a thorough medication review focusing on:
- Drug interactions and contraindications
- Dosing appropriateness for age and kidney function
- Compliance challenges and simplification opportunities
- Monitoring requirements and follow-up labs
Identify medication-related problems and solutions.`,

    follow_up_planning: `
Develop comprehensive follow-up plans focusing on:
- Timing and urgency of appointments
- Specialist referrals and care coordination
- Patient education and self-monitoring
- Warning signs and when to seek immediate care
Ensure continuity of care and prevent gaps.`,

    general: `
Provide a comprehensive analysis covering all aspects of care transition management.`,
  };

  const specificPrompt = analysisType
    ? analysisPrompts[analysisType]
    : analysisPrompts.general;

  return `${message}

${specificPrompt}

Patient Data Context:
${patientData}

Please analyze the provided patient data and generate actionable insights. Structure your response as JSON with the following format:
{
  "insights": [
    {
      "type": "risk_alert" | "follow_up" | "medication" | "care_coordination" | "general",
      "title": "Brief descriptive title",
      "patient": "Patient name or 'Multiple patients'",
      "priority": "high" | "medium" | "low",
      "recommendation": "Specific actionable recommendation",
      "reasoning": "Clinical reasoning behind the recommendation",
      "confidence": "high" | "medium" | "low",
      "timeframe": "immediate" | "within_24h" | "within_week" | "routine"
    }
  ],
  "summary": "Brief overall summary of key findings and recommendations"
}`;
};

export const createQuickAnalysisPrompts = () => {
  return {
    riskAssessment:
      "Analyze all patients for readmission risk factors and identify those requiring immediate attention.",
    medicationReview:
      "Review all patient medications for potential issues, interactions, and compliance risks.",
    followUpPlanning:
      "Assess follow-up care needs and create prioritized appointment schedules for all patients.",
    careCoordination:
      "Identify opportunities for improved care coordination and resource utilization.",
    complexCases:
      "Highlight the most complex cases requiring multidisciplinary care team involvement.",
  };
};

export const extractKeyInsights = (patients: DischargeSummary[]) => {
  const insights = {
    totalPatients: patients.length,
    highRiskPatients: patients.filter((p) => p.risk_factors.length >= 3).length,
    averageAge: Math.round(
      patients.reduce((sum, p) => sum + p.age, 0) / patients.length
    ),
    commonDiagnoses: getTopDiagnoses(patients, 3),
    urgentFollowUps: patients.filter(
      (p) =>
        p.follow_up.toLowerCase().includes("day") &&
        parseInt(p.follow_up.match(/\d+/)?.[0] || "0") <= 7
    ).length,
    complexMedications: patients.filter((p) => p.medications.length >= 4)
      .length,
  };

  return insights;
};

const getTopDiagnoses = (patients: DischargeSummary[], limit: number) => {
  const diagnosisCount: Record<string, number> = {};

  patients.forEach((patient) => {
    const diagnosis = patient.diagnosis.split(" ")[0]; // Get first word for grouping
    diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
  });

  return Object.entries(diagnosisCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([diagnosis, count]) => ({ diagnosis, count }));
};

export const validateInsightResponse = (response: unknown): boolean => {
  if (!response || typeof response !== "object") return false;

  const typedResponse = response as Record<string, unknown>;
  if (!Array.isArray(typedResponse.insights)) return false;
  if (typeof typedResponse.summary !== "string") return false;

  return typedResponse.insights.every((insight: unknown) => {
    if (!insight || typeof insight !== "object") return false;
    const typedInsight = insight as Record<string, unknown>;

    return (
      typeof typedInsight.type === "string" &&
      typeof typedInsight.title === "string" &&
      typeof typedInsight.patient === "string" &&
      typeof typedInsight.priority === "string" &&
      typeof typedInsight.recommendation === "string" &&
      typeof typedInsight.reasoning === "string" &&
      typeof typedInsight.confidence === "string" &&
      typeof typedInsight.timeframe === "string"
    );
  });
};
