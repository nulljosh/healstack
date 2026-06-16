import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dose:biometrics';

const METRIC_TARGETS = {
  sleep: 8,
  steps: 10000,
  heartRate: 60,
  activeEnergy: 500,
  exerciseMin: 30,
  standHours: 12,
  hrv: 50,
  bloodOxygen: 98,
  weight: null,
  bodyFat: null,
  mindfulness: 15,
  water: 80,
};

const METRIC_LABELS = {
  sleep: 'Sleep (hrs)',
  steps: 'Steps',
  heartRate: 'Resting HR (bpm)',
  activeEnergy: 'Active Energy (kcal)',
  exerciseMin: 'Exercise (min)',
  standHours: 'Stand (hrs)',
  hrv: 'HRV (ms)',
  bloodOxygen: 'Blood O2 (%)',
  weight: 'Weight (lbs)',
  bodyFat: 'Body Fat (%)',
  mindfulness: 'Mindfulness (min)',
  water: 'Water (oz)',
};

// Metrics where lower = better (inverse scoring)
const INVERSE_METRICS = new Set(['weight', 'bodyFat', 'heartRate']);

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function persistEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('dose: failed to persist biometrics', err);
    throw new Error('Storage full -- could not save entry');
  }
}

function loadTargets() {
  try {
    const raw = localStorage.getItem('dose:biometrics:targets');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persistTargets(targets) {
  try {
    localStorage.setItem('dose:biometrics:targets', JSON.stringify(targets));
  } catch {
    console.warn('dose: failed to persist biometric targets');
  }
}

function normalizeMetric(key, value, targets) {
  const target = targets[key] ?? METRIC_TARGETS[key];
  if (!target || value == null) return 0;

  if (INVERSE_METRICS.has(key)) {
    // For inverse metrics, being at or below target = 100
    if (value <= target) return 100;
    // Over target scales down. 2x target = 0
    return Math.max(0, Math.round(100 * (2 - value / target)));
  }

  // Normal metrics: at or above target = 100
  return Math.min(100, Math.round((value / target) * 100));
}

export function useBiometrics() {
  const [entries, setEntries] = useState(() => loadEntries());
  const [userTargets, setUserTargets] = useState(() => loadTargets());

  const addEntry = useCallback((data) => {
    const entry = {
      id: generateId(),
      date: data.date || new Date().toISOString().slice(0, 10),
      metrics: data.metrics || {},
      screenshots: data.screenshots || [],
      notes: data.notes?.trim() || '',
    };

    setEntries(prev => {
      const next = [entry, ...prev];
      persistEntries(next);
      return next;
    });
    return entry;
  }, []);

  const updateEntry = useCallback((id, updates) => {
    if (!id) throw new Error('Entry id is required');
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx === -1) throw new Error(`Entry "${id}" not found`);
      const next = [...prev];
      next[idx] = { ...prev[idx], ...updates };
      persistEntries(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    if (!id) throw new Error('Entry id is required');
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      persistEntries(next);
      return next;
    });
  }, []);

  const setTarget = useCallback((key, value) => {
    setUserTargets(prev => {
      const next = { ...prev, [key]: Number(value) };
      persistTargets(next);
      return next;
    });
  }, []);

  const getTargets = useCallback(() => {
    return Object.fromEntries(
      Object.keys(METRIC_TARGETS).map(k => [k, userTargets[k] ?? METRIC_TARGETS[k]])
    );
  }, [userTargets]);

  const getRadarData = useCallback((entry) => {
    if (!entry?.metrics) return { labels: [], values: [] };
    const targets = getTargets();
    const filled = Object.entries(entry.metrics).filter(([, v]) => v != null && v !== '');
    return {
      labels: filled.map(([k]) => METRIC_LABELS[k] || k),
      values: filled.map(([k, v]) => normalizeMetric(k, Number(v), targets)),
    };
  }, [getTargets]);

  const getEntries = useCallback((filters = {}) => {
    let result = [...entries];
    if (filters.since) {
      result = result.filter(e => e.date >= filters.since);
    }
    if (filters.until) {
      result = result.filter(e => e.date <= filters.until);
    }
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [entries]);

  const getLatest = useCallback(() => {
    return entries.length > 0
      ? [...entries].sort((a, b) => b.date.localeCompare(a.date))[0]
      : null;
  }, [entries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    setTarget,
    getTargets,
    getRadarData,
    getEntries,
    getLatest,
    METRIC_TARGETS,
    METRIC_LABELS,
    INVERSE_METRICS,
  };
}
