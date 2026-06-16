import { useState, useCallback } from 'react';

const KEY = 'dose:lab_results';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('dose: failed to persist lab results', err);
  }
}

export function useLabResults() {
  const [results, setResults] = useState(() => load());

  const addResult = useCallback((data) => {
    const entry = {
      id: generateId(),
      date: data.date || new Date().toISOString().slice(0, 10),
      lab: data.lab || 'Unknown',
      panel: data.panel || 'Custom',
      markers: (data.markers || []).map(m => ({
        name: m.name,
        value: Number(m.value),
        unit: m.unit || '',
        refLow: m.refLow != null ? Number(m.refLow) : null,
        refHigh: m.refHigh != null ? Number(m.refHigh) : null,
        flag: computeFlag(Number(m.value), m.refLow, m.refHigh),
      })),
    };
    setResults(prev => {
      const next = [entry, ...prev];
      persist(next);
      return next;
    });
    return entry;
  }, []);

  const deleteResult = useCallback((id) => {
    setResults(prev => {
      const next = prev.filter(r => r.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const getByMarker = useCallback((markerName) => {
    const rows = [];
    for (const r of results) {
      const m = r.markers.find(mk => mk.name === markerName);
      if (m) rows.push({ date: r.date, lab: r.lab, ...m });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [results]);

  const allMarkerNames = useCallback(() => {
    const names = new Set();
    for (const r of results) r.markers.forEach(m => names.add(m.name));
    return [...names].sort();
  }, [results]);

  const flaggedCount = useCallback((result) => {
    return result.markers.filter(m => m.flag !== 'normal').length;
  }, []);

  return { results, addResult, deleteResult, getByMarker, allMarkerNames, flaggedCount };
}

export function computeFlag(value, refLow, refHigh) {
  if (refLow == null && refHigh == null) return 'normal';
  const lo = refLow != null ? Number(refLow) : -Infinity;
  const hi = refHigh != null ? Number(refHigh) : Infinity;
  if (value < lo * 0.7 || value > hi * 1.5) return 'critical';
  if (value < lo || value > hi) return value < lo ? 'low' : 'high';
  return 'normal';
}

export const PANELS = {
  CBC: [
    { name: 'WBC', unit: '10^9/L', refLow: 4.0, refHigh: 11.0 },
    { name: 'RBC', unit: '10^12/L', refLow: 4.2, refHigh: 5.8 },
    { name: 'Hgb', unit: 'g/L', refLow: 120, refHigh: 175 },
    { name: 'Hct', unit: 'L/L', refLow: 0.36, refHigh: 0.52 },
    { name: 'MCV', unit: 'fL', refLow: 80, refHigh: 100 },
    { name: 'PLT', unit: '10^9/L', refLow: 150, refHigh: 400 },
  ],
  BMP: [
    { name: 'Sodium', unit: 'mmol/L', refLow: 136, refHigh: 145 },
    { name: 'Potassium', unit: 'mmol/L', refLow: 3.5, refHigh: 5.0 },
    { name: 'Creatinine', unit: 'umol/L', refLow: 53, refHigh: 106 },
    { name: 'eGFR', unit: 'mL/min/1.73m2', refLow: 60, refHigh: null },
    { name: 'Glucose', unit: 'mmol/L', refLow: 3.9, refHigh: 5.6 },
    { name: 'CO2', unit: 'mmol/L', refLow: 22, refHigh: 29 },
  ],
  Lipids: [
    { name: 'Total Cholesterol', unit: 'mmol/L', refLow: null, refHigh: 5.2 },
    { name: 'LDL', unit: 'mmol/L', refLow: null, refHigh: 3.4 },
    { name: 'HDL', unit: 'mmol/L', refLow: 1.0, refHigh: null },
    { name: 'Triglycerides', unit: 'mmol/L', refLow: null, refHigh: 1.7 },
  ],
  Thyroid: [
    { name: 'TSH', unit: 'mIU/L', refLow: 0.35, refHigh: 5.0 },
    { name: 'Free T4', unit: 'pmol/L', refLow: 9.0, refHigh: 25.0 },
    { name: 'Free T3', unit: 'pmol/L', refLow: 3.5, refHigh: 6.5 },
  ],
  Vitamins: [
    { name: 'Vitamin D', unit: 'nmol/L', refLow: 75, refHigh: 250 },
    { name: 'B12', unit: 'pmol/L', refLow: 148, refHigh: 738 },
    { name: 'Ferritin', unit: 'ug/L', refLow: 15, refHigh: 200 },
    { name: 'Folate', unit: 'nmol/L', refLow: 7, refHigh: null },
  ],
  HbA1c: [
    { name: 'HbA1c', unit: '%', refLow: null, refHigh: 5.7 },
  ],
};
