import { DischargeSummary } from '@/types';

export interface FilterCriteria {
  keywords: string[];
  riskLevels?: ('high' | 'medium' | 'low')[];
  diagnoses?: string[];
  medications?: string[];
  timeframes?: string[];
  ageRange?: { min?: number; max?: number };
}

// Define common query patterns and their filter criteria
const QUERY_PATTERNS: Record<string, FilterCriteria> = {
  'complex discharge needs': {
    keywords: ['complex', 'discharge', 'needs', 'complicated'],
    riskLevels: ['high'],
  },
  'readmission risk': {
    keywords: ['readmission', 'risk', 'readmit'],
    riskLevels: ['high', 'medium'],
  },
  medication: {
    keywords: ['medication', 'drug', 'prescription', 'pharmacy'],
  },
  'follow up': {
    keywords: ['follow up', 'follow-up', 'followup', 'appointment'],
  },
  elderly: {
    keywords: ['elderly', 'senior', 'aged', 'older'],
    ageRange: { min: 65 },
  },
  cardiology: {
    keywords: ['cardiology', 'cardiac', 'heart', 'cardiovascular'],
    diagnoses: ['heart', 'cardiac', 'cardiovascular', 'CHF', 'MI', 'arrhythmia'],
  },
  diabetes: {
    keywords: ['diabetes', 'diabetic', 'glucose', 'insulin'],
    diagnoses: ['diabetes', 'diabetic'],
  },
  'immediate attention': {
    keywords: ['immediate', 'urgent', 'emergency', 'critical'],
    riskLevels: ['high'],
  },
  'social determinants': {
    keywords: ['social', 'determinants', 'housing', 'transportation', 'insurance'],
  },
  'medication compliance': {
    keywords: ['compliance', 'adherence', 'medication', 'drug'],
  },
};

export function analyzeUserQuery(message: string): FilterCriteria {
  const lowerMessage = message.toLowerCase();
  const criteria: FilterCriteria = { keywords: [] };

  // Check for specific patterns
  for (const [pattern, patternCriteria] of Object.entries(QUERY_PATTERNS)) {
    if (lowerMessage.includes(pattern)) {
      criteria.keywords.push(...patternCriteria.keywords);
      if (patternCriteria.riskLevels) {
        criteria.riskLevels = patternCriteria.riskLevels;
      }
      if (patternCriteria.diagnoses) {
        criteria.diagnoses = patternCriteria.diagnoses;
      }
      if (patternCriteria.medications) {
        criteria.medications = patternCriteria.medications;
      }
      if (patternCriteria.timeframes) {
        criteria.timeframes = patternCriteria.timeframes;
      }
      if (patternCriteria.ageRange) {
        criteria.ageRange = patternCriteria.ageRange;
      }
    }
  }

  // Extract additional keywords from the message
  const words = lowerMessage.split(/\s+/);
  const additionalKeywords = words.filter(
    word =>
      word.length > 3 &&
      ![
        'the',
        'and',
        'with',
        'for',
        'that',
        'this',
        'have',
        'been',
        'will',
        'should',
        'need',
        'show',
        'patients',
        'patient',
      ].includes(word)
  );
  criteria.keywords.push(...additionalKeywords);

  return criteria;
}

export function filterPatientsByCriteria(
  patients: DischargeSummary[],
  criteria: FilterCriteria
): DischargeSummary[] {
  return patients.filter(patient => {
    // Check if patient matches any of the criteria

    // Check keywords in various fields
    const patientText = [
      patient.patient,
      patient.diagnosis,
      patient.follow_up,
      patient.notes,
      patient.discharge_disposition,
      ...patient.secondary_diagnoses,
      ...patient.medications,
      ...patient.risk_factors,
    ]
      .join(' ')
      .toLowerCase();

    const hasMatchingKeywords = criteria.keywords.some(keyword =>
      patientText.includes(keyword.toLowerCase())
    );

    // Check risk factors (if specified)
    const hasMatchingRiskLevel =
      !criteria.riskLevels ||
      criteria.riskLevels.some(level =>
        patient.risk_factors.some(factor => factor.toLowerCase().includes(level))
      );

    // Check diagnoses (if specified)
    const hasMatchingDiagnosis =
      !criteria.diagnoses ||
      criteria.diagnoses.some(
        diagnosis =>
          patient.diagnosis.toLowerCase().includes(diagnosis.toLowerCase()) ||
          patient.secondary_diagnoses.some(secondary =>
            secondary.toLowerCase().includes(diagnosis.toLowerCase())
          )
      );

    // Check medications (if specified)
    const hasMatchingMedication =
      !criteria.medications ||
      criteria.medications.some(medication =>
        patient.medications.some(med => med.toLowerCase().includes(medication.toLowerCase()))
      );

    // Check age range (if specified)
    const hasMatchingAge =
      !criteria.ageRange ||
      ((criteria.ageRange.min === undefined || patient.age >= criteria.ageRange.min) &&
        (criteria.ageRange.max === undefined || patient.age <= criteria.ageRange.max));

    return (
      hasMatchingKeywords &&
      hasMatchingRiskLevel &&
      hasMatchingDiagnosis &&
      hasMatchingMedication &&
      hasMatchingAge
    );
  });
}

export function getRelevantPatients(
  allPatients: DischargeSummary[],
  userMessage: string
): DischargeSummary[] {
  // If the message is very general or asks for "all patients", return all
  const generalTerms = ['all patients', 'everyone', 'overview', 'summary', 'analyze all'];
  const isGeneralQuery = generalTerms.some(term => userMessage.toLowerCase().includes(term));

  if (isGeneralQuery) {
    return allPatients;
  }

  // Analyze the query and filter patients
  const criteria = analyzeUserQuery(userMessage);
  const filteredPatients = filterPatientsByCriteria(allPatients, criteria);

  // If no patients match the criteria, return a subset for analysis
  if (filteredPatients.length === 0) {
    console.log('No patients matched specific criteria, returning top 5 patients for analysis');
    return allPatients.slice(0, 5);
  }

  // If too many patients match, limit to top 10 most relevant
  if (filteredPatients.length > 10) {
    console.log(`Too many patients matched (${filteredPatients.length}), limiting to top 10`);
    return filteredPatients.slice(0, 10);
  }

  return filteredPatients;
}
