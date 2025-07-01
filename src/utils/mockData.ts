export const mockInsightsResponse = {
  response_type: 'insights',
  insights: [
    {
      type: 'risk_alert',
      title: 'High Readmission Risk',
      patient: 'John Smith',
      priority: 'high',
      recommendation:
        'Schedule follow-up appointment within 48 hours, assign care coordinator for daily check-ins, arrange home health for medication management, coordinate with social work for transportation assistance',
      reasoning: 'Patient has multiple comorbidities and history of medication non-compliance',
      confidence: 'high',
      timeframe: 'within_24h',
    },
    {
      type: 'medication',
      title: 'Potential Drug Interaction',
      patient: 'Sarah Johnson',
      priority: 'medium',
      recommendation:
        'Review medication list with pharmacist within 24 hours, adjust warfarin dosage, schedule INR monitoring within 3 days, provide patient education on interaction signs',
      reasoning: 'New antibiotic prescription may interact with existing anticoagulant therapy',
      confidence: 'medium',
      timeframe: 'within_24h',
    },
    {
      type: 'follow_up',
      title: 'Specialist Consultation Needed',
      patient: 'Michael Brown',
      priority: 'medium',
      recommendation:
        'Refer to cardiologist for post-MI follow-up within 1 week, schedule cardiac rehabilitation assessment, arrange stress test within 1 month, coordinate with primary care for ongoing monitoring',
      reasoning: 'Patient discharged after myocardial infarction requires specialized cardiac care',
      confidence: 'high',
      timeframe: 'within_week',
    },
    {
      type: 'care_coordination',
      title: 'Home Health Services Required',
      patient: 'Multiple patients',
      priority: 'medium',
      recommendation:
        'Arrange home health nursing for wound care and medication management, coordinate with wound care specialist, schedule weekly nursing visits, provide family caregiver training',
      reasoning: 'Several patients have complex wound care needs and limited mobility',
      confidence: 'medium',
      timeframe: 'within_week',
    },
    {
      type: 'general',
      title: 'Social Determinants Assessment',
      patient: 'Multiple patients',
      priority: 'low',
      recommendation:
        'Conduct social work assessment for transportation and housing needs, connect patients with community resources, arrange follow-up phone calls within 1 week, coordinate with case management',
      reasoning: 'Multiple patients may face barriers to follow-up care due to social factors',
      confidence: 'medium',
      timeframe: 'routine',
    },
  ],
  summary:
    'Analysis identified 5 key areas requiring attention: high-risk readmission patient requiring immediate follow-up, medication interaction needing pharmacist review, specialist follow-up for cardiac care, home health coordination for wound management, and social determinants assessment for care barriers. Next steps include immediate care coordinator assignment, 24-hour medication review, and 1-week specialist referrals.',
};
