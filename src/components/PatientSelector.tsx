'use client';

import React, { useState } from 'react';
import { DischargeSummary } from '@/types';

interface PatientSelectorProps {
  patients: DischargeSummary[];
  selectedPatients: number[];
  onSelectionChange: (patientIds: number[]) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  patients,
  selectedPatients,
  onSelectionChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePatientToggle = (patientId: number) => {
    const newSelection = selectedPatients.includes(patientId)
      ? selectedPatients.filter(id => id !== patientId)
      : [...selectedPatients, patientId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(patients.map(p => p.id));
    }
  };

  const getRiskLevel = (riskFactors: string[]) => {
    const count = riskFactors.length;
    if (count >= 3) return { level: 'High', color: 'text-red-600' };
    if (count === 2) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const selectedCount = selectedPatients.length;
  const totalCount = patients.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-gray-900">Patient Selection</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAll();
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
          </button>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Patient List */}
      {isExpanded && (
        <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
          {patients.map((patient) => {
            const isSelected = selectedPatients.includes(patient.id);
            const risk = getRiskLevel(patient.risk_factors);
            
            return (
              <div
                key={patient.id}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                onClick={() => handlePatientToggle(patient.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handlePatientToggle(patient.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.patient}
                      </p>
                      <p className="text-xs text-gray-500">
                        MRN: {patient.mrn} • Age: {patient.age}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${risk.color}`}>
                        {risk.level} Risk
                      </p>
                      <p className="text-xs text-gray-500">
                        {patient.risk_factors.length} factors
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {patient.diagnosis}
                  </p>
                  
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500">
                      Discharged: {new Date(patient.discharge_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {patient.discharge_disposition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientSelector;
