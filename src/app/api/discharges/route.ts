import { NextRequest, NextResponse } from 'next/server';
import pt1Data from '@/data/pt-1.json';
import pt2Data from '@/data/pt-2.json';
import pt3Data from '@/data/pt-3.json';
import { RawPatientData, DischargeSummary } from '@/types';

// Transform the new data format to match the expected DischargeSummary interface
function transformPatientData(patientData: RawPatientData, id: number): DischargeSummary {
  const patient = patientData.patient;
  const encounter = patientData.encounter;
  const caseSum = patientData.case_summary;
  const medications = patientData.medications || [];
  const followUps = patientData.follow_ups || [];
  const labTests = patientData.lab_tests || [];
  const laceScore = patientData.lace_score || {};

  // Extract risk factors from various sources
  const riskFactors = [];
  if (patient.age >= 65) riskFactors.push('elderly');
  if (laceScore.risk_level === 'high') riskFactors.push('high_readmission_risk');
  if (laceScore.risk_level === 'moderate') riskFactors.push('moderate_readmission_risk');
  if (medications.length >= 5) riskFactors.push('polypharmacy');
  if (encounter.encounter_type === 'emergency') riskFactors.push('emergency_admission');

  // Check for specific comorbidities
  const comorbidities = laceScore.charlson_comorbidity_index?.comorbidities || [];
  comorbidities.forEach(comorbidity => {
    if (comorbidity.cci_mapping) {
      riskFactors.push(comorbidity.cci_mapping.toLowerCase().replace(/\s+/g, '_'));
    }
  });

  // Build lab results object
  const labResults: Record<string, string> = {};
  labTests.forEach(test => {
    if (test.test_name && test.test_name.trim()) {
      labResults[test.test_name] = test.result || 'Pending';
    }
  });

  // Add LACE score info
  if (laceScore.total_score) {
    labResults['LACE Score'] = `${laceScore.total_score} (${laceScore.risk_level})`;
  }

  // Build medications list
  const medicationList = medications.map(med => {
    const dosage = med.dosage ? ` ${med.dosage}` : '';
    const frequency = med.frequency ? ` ${med.frequency.toLowerCase()}` : '';
    return `${med.generic_name || med.brand_name}${dosage}${frequency}`;
  });

  // Build follow-up string
  const followUpList = followUps.map(fu => {
    const timeframe = fu.timeframe ? ` ${fu.timeframe}` : '';
    return `${fu.follow_up_item}${timeframe}`;
  });

  return {
    id,
    patient: `${patient.first_name} ${patient.last_name}`,
    age: patient.age,
    mrn: encounter.mrn,
    admission_date: encounter.admission_date,
    discharge_date: encounter.discharge_date,
    diagnosis: caseSum.primary_diagnoses || 'Not specified',
    secondary_diagnoses: patientData.discharge_diagnoses?.map(d => d.description) || [],
    medications: medicationList,
    follow_up: followUpList.join(', ') || 'No specific follow-up documented',
    lab_results: labResults,
    notes: encounter.discharge_summary || caseSum.composite_summary || '',
    risk_factors: riskFactors,
    discharge_disposition: encounter.discharged_to || 'Not specified',
  };
}

// Load and transform all patient data
const rawPatientData = [pt1Data, pt2Data, pt3Data] as RawPatientData[];
const dischargeSummaries = rawPatientData.map((data, index) =>
  transformPatientData(data, index + 1)
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const diagnosis = searchParams.get('diagnosis');
    const riskLevel = searchParams.get('riskLevel');

    let filteredData = dischargeSummaries;

    // Filter by patient ID if provided
    if (patientId) {
      filteredData = filteredData.filter(patient => patient.id.toString() === patientId);
    }

    // Filter by diagnosis if provided
    if (diagnosis) {
      filteredData = filteredData.filter(
        patient =>
          patient.diagnosis.toLowerCase().includes(diagnosis.toLowerCase()) ||
          patient.secondary_diagnoses.some((diag: string) =>
            diag.toLowerCase().includes(diagnosis.toLowerCase())
          )
      );
    }

    // Filter by risk level if provided
    if (riskLevel) {
      filteredData = filteredData.filter(patient => {
        const riskFactorCount = patient.risk_factors.length;
        switch (riskLevel.toLowerCase()) {
          case 'high':
            return riskFactorCount >= 3;
          case 'medium':
            return riskFactorCount === 2;
          case 'low':
            return riskFactorCount <= 1;
          default:
            return true;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching discharge summaries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch discharge summaries',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // In a real application, this would save to a database
    // For now, we'll just return the data with a generated ID
    const newDischarge = {
      id: dischargeSummaries.length + 1,
      ...body,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newDischarge,
        message: 'Discharge summary created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating discharge summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create discharge summary',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
