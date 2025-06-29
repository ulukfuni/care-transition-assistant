"use client";

import { useState, useEffect, useCallback } from "react";
import { DischargeSummary, DischargeFilters, ApiResponse } from "@/types";

export const usePatients = () => {
  const [patients, setPatients] = useState<DischargeSummary[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(
    async (filters?: DischargeFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        if (filters?.patientId) {
          searchParams.append("patientId", filters.patientId);
        }
        if (filters?.diagnosis) {
          searchParams.append("diagnosis", filters.diagnosis);
        }
        if (filters?.riskLevel) {
          searchParams.append("riskLevel", filters.riskLevel);
        }

        const url = `/api/discharges${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
        const response = await fetch(url);

        const data: ApiResponse<DischargeSummary[]> = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch patients");
        }

        if (!data.data) {
          throw new Error("No patient data received");
        }

        setPatients(data.data);

        // If no patients are currently selected, select all by default
        if (selectedPatients.length === 0) {
          setSelectedPatients(data.data.map((p) => p.id));
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch patient data";
        setError(errorMessage);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedPatients.length]
  );

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const getSelectedPatientsData = useCallback(() => {
    return patients.filter((patient) => selectedPatients.includes(patient.id));
  }, [patients, selectedPatients]);

  const getPatientById = useCallback(
    (id: number) => {
      return patients.find((patient) => patient.id === id);
    },
    [patients]
  );

  const getPatientsByRiskLevel = useCallback(
    (riskLevel: "high" | "medium" | "low") => {
      return patients.filter((patient) => {
        const riskFactorCount = patient.risk_factors.length;
        switch (riskLevel) {
          case "high":
            return riskFactorCount >= 3;
          case "medium":
            return riskFactorCount === 2;
          case "low":
            return riskFactorCount <= 1;
          default:
            return false;
        }
      });
    },
    [patients]
  );

  const searchPatients = useCallback(
    (query: string) => {
      if (!query.trim()) return patients;

      const lowercaseQuery = query.toLowerCase();
      return patients.filter(
        (patient) =>
          patient.patient.toLowerCase().includes(lowercaseQuery) ||
          patient.mrn.toLowerCase().includes(lowercaseQuery) ||
          patient.diagnosis.toLowerCase().includes(lowercaseQuery) ||
          patient.secondary_diagnoses.some((diag) =>
            diag.toLowerCase().includes(lowercaseQuery)
          )
      );
    },
    [patients]
  );

  const updateSelectedPatients = useCallback((patientIds: number[]) => {
    setSelectedPatients(patientIds);
  }, []);

  const togglePatientSelection = useCallback((patientId: number) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  }, []);

  const selectAllPatients = useCallback(() => {
    setSelectedPatients(patients.map((p) => p.id));
  }, [patients]);

  const deselectAllPatients = useCallback(() => {
    setSelectedPatients([]);
  }, []);

  return {
    patients,
    selectedPatients,
    isLoading,
    error,
    fetchPatients,
    getSelectedPatientsData,
    getPatientById,
    getPatientsByRiskLevel,
    searchPatients,
    updateSelectedPatients,
    togglePatientSelection,
    selectAllPatients,
    deselectAllPatients,
  };
};
