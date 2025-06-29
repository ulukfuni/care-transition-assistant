// Patient discharge summary types
export interface DischargeSummary {
  id: number;
  patient: string;
  age: number;
  mrn: string;
  admission_date: string;
  discharge_date: string;
  diagnosis: string;
  secondary_diagnoses: string[];
  medications: string[];
  follow_up: string;
  lab_results: Record<string, string>;
  notes: string;
  risk_factors: string[];
  discharge_disposition: string;
}

// Raw patient data types from the new JSON structure
export interface RawPatientData {
  patient: {
    age: number;
    sex: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
  encounter: {
    mrn: string;
    admission_date: string;
    discharge_date: string;
    encounter_type: string;
    reason_for_visit: string;
    discharge_summary: string;
    discharged_to: string;
    facility_name: string;
    provider_name: string;
  };
  case_summary: {
    disposition: string;
    demographics: string;
    presentation: string;
    primary_diagnoses: string;
    composite_summary: string;
  };
  medications: Array<{
    generic_name: string;
    brand_name: string;
    dosage: string;
    frequency: string;
    route: string;
    reason: string;
  }>;
  follow_ups: Array<{
    follow_up_item: string;
    timeframe: string;
    date: string;
    additional_info: string;
  }>;
  lab_tests: Array<{
    test_name: string;
    result?: string;
    status: string;
    date_completed: string;
  }>;
  lace_score: {
    total_score: number;
    risk_level: string;
    explanation: string;
    charlson_comorbidity_index?: {
      comorbidities: Array<{
        cci_mapping: string;
        description: string;
        cci_points: number;
      }>;
    };
  };
  discharge_diagnoses: Array<{
    description: string;
    icd_10_code: string;
  }>;
}

// Chat and insight types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  insights?: InsightCard[];
}

export interface InsightCard {
  type:
    | "risk_alert"
    | "follow_up"
    | "medication"
    | "care_coordination"
    | "general";
  title: string;
  patient: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  timeframe: "immediate" | "within_24h" | "within_week" | "routine";
}

export interface ChatResponse {
  insights: InsightCard[];
  summary: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  total?: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Chat request types
export interface ChatRequest {
  message: string;
  patientIds?: number[];
  context?: string;
}

// Filter types for discharge summaries
export interface DischargeFilters {
  patientId?: string;
  diagnosis?: string;
  riskLevel?: "high" | "medium" | "low";
}

// Component prop types
export interface InsightCardProps {
  insight: InsightCard;
  onAction?: (action: string, insight: InsightCard) => void;
}

export interface ChatInterfaceProps {
  onSendMessage: (message: string, patientIds?: number[]) => void;
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface PatientSelectorProps {
  patients: DischargeSummary[];
  selectedPatients: number[];
  onSelectionChange: (patientIds: number[]) => void;
}

// Priority and risk level mappings
export const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
} as const;

export const INSIGHT_TYPE_COLORS = {
  risk_alert: "bg-red-50 border-red-200",
  follow_up: "bg-blue-50 border-blue-200",
  medication: "bg-purple-50 border-purple-200",
  care_coordination: "bg-orange-50 border-orange-200",
  general: "bg-gray-50 border-gray-200",
} as const;

export const TIMEFRAME_URGENCY = {
  immediate: "Immediate",
  within_24h: "Within 24 hours",
  within_week: "Within 1 week",
  routine: "Routine",
} as const;
