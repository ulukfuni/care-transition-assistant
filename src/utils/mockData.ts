export const mockInsightsResponse = {
  insights: [
    {
      type: "risk_alert",
      title: "High Readmission Risk",
      patient: "John Smith",
      priority: "high",
      recommendation: "Schedule follow-up appointment within 48 hours and assign care coordinator",
      reasoning: "Patient has multiple comorbidities and history of medication non-compliance",
      confidence: "high",
      timeframe: "within_24h"
    },
    {
      type: "medication",
      title: "Potential Drug Interaction",
      patient: "Sarah Johnson",
      priority: "medium",
      recommendation: "Review medication list with pharmacist and adjust warfarin dosage",
      reasoning: "New antibiotic prescription may interact with existing anticoagulant therapy",
      confidence: "medium",
      timeframe: "within_24h"
    },
    {
      type: "follow_up",
      title: "Specialist Consultation Needed",
      patient: "Michael Brown",
      priority: "medium",
      recommendation: "Refer to cardiologist for post-MI follow-up within 1 week",
      reasoning: "Patient discharged after myocardial infarction requires specialized cardiac care",
      confidence: "high",
      timeframe: "within_week"
    },
    {
      type: "care_coordination",
      title: "Home Health Services Required",
      patient: "Multiple patients",
      priority: "medium",
      recommendation: "Arrange home health nursing for wound care and medication management",
      reasoning: "Several patients have complex wound care needs and limited mobility",
      confidence: "medium",
      timeframe: "within_week"
    },
    {
      type: "general",
      title: "Social Determinants Assessment",
      patient: "Multiple patients",
      priority: "low",
      recommendation: "Conduct social work assessment for transportation and housing needs",
      reasoning: "Multiple patients may face barriers to follow-up care due to social factors",
      confidence: "medium",
      timeframe: "routine"
    }
  ],
  summary: "Analysis identified 5 key areas requiring attention: high-risk readmission patient, medication interaction, specialist follow-up, home health coordination, and social determinants assessment."
}; 