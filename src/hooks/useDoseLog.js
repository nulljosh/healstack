import { useState, useCallback } from 'react';

const LOG_KEY = 'dose:log';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
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
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('dose: failed to persist log', err);
    throw new Error('Storage full — could not save entry');
  }
}

function validateEntry(entry) {
  const errors = [];
  if (!entry?.substanceId?.trim()) errors.push('Substance is required');
  if (entry?.dose == null || isNaN(Number(entry.dose)) || Number(entry.dose) <= 0) {
    errors.push('Dose must be a positive number');
  }
  if (Number(entry.dose) > 10000) errors.push('Dose seems unusually high');
  if (!entry?.route?.trim()) errors.push('Route of administration is required');
  if (entry?.rating != null && entry.rating !== 0 && (Number(entry.rating) < 1 || Number(entry.rating) > 5)) {
    errors.push('Rating must be between 1 and 5');
  }
  return errors;
}

export function useDoseLog() {
  const [entries, setEntries] = useState(() => loadEntries());

  const addEntry = useCallback((data) => {
    const errors = validateEntry(data);
    if (errors.length > 0) throw new Error(errors.join('; '));

    const entry = {
      id: generateId(),
      substanceId: data.substanceId.trim(),
      dose: Number(data.dose),
      unit: data.unit || 'mg',
      route: data.route.trim(),
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
      notes: data.notes?.trim() || '',
      rating: data.rating ? Number(data.rating) : null,
    };

    setEntries(prev => {
      const next = [entry, ...prev];
      persistEntries(next);
      return next;
    });

    return entry;
  }, []);

  const deleteEntry = useCallback((id) => {
    if (!id) throw new Error('Entry id is required');
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      persistEntries(next);
      return next;
    });
  }, []);

  const updateEntry = useCallback((id, updates) => {
    if (!id) throw new Error('Entry id is required');
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx === -1) throw new Error(`Entry "${id}" not found`);

      const merged = { ...prev[idx], ...updates };
      const errors = validateEntry(merged);
      if (errors.length > 0) throw new Error(errors.join('; '));

      const next = [...prev];
      next[idx] = merged;
      persistEntries(next);
      return next;
    });
  }, []);

  const getEntries = useCallback((filters = {}) => {
    let result = [...entries];

    if (filters.substanceId) {
      result = result.filter(e => e.substanceId === filters.substanceId);
    }
    if (filters.route) {
      result = result.filter(e => e.route === filters.route);
    }
    if (filters.since) {
      const cutoff = new Date(filters.since).getTime();
      result = result.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    }
    if (filters.until) {
      const cutoff = new Date(filters.until).getTime();
      result = result.filter(e => new Date(e.timestamp).getTime() <= cutoff);
    }

    // Sort newest first by default
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return result;
  }, [entries]);

  const getActive = useCallback(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return getEntries({ since: cutoff });
  }, [getEntries]);

  const clearAll = useCallback(() => {
    // removeItem inside the state setter to ensure it runs after any queued persistEntries calls
    setEntries(() => {
      localStorage.removeItem(LOG_KEY);
      return [];
    });
  }, []);

  return { entries, addEntry, deleteEntry, updateEntry, getEntries, getActive, clearAll };
}
