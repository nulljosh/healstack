import { useState, useCallback } from 'react';
import { SUBSTANCES } from '../data/substances';

const CUSTOM_KEY = 'dose:custom_substances';

function loadCustom() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustom(customs) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs));
  } catch (err) {
    console.warn('dose: failed to persist custom substances', err);
  }
}

export function useSubstances() {
  const [custom, setCustom] = useState(() => loadCustom());

  const all = [...SUBSTANCES, ...custom];

  const getById = useCallback((id) => {
    return all.find(s => s.id === id) ?? null;
  }, [custom]);

  const addCustom = useCallback((substance) => {
    if (!substance?.id || !substance?.name) {
      throw new Error('Custom substance requires id and name');
    }
    if (all.find(s => s.id === substance.id)) {
      throw new Error(`Substance with id "${substance.id}" already exists`);
    }
    const next = [...custom, { ...substance, custom: true }];
    setCustom(next);
    saveCustom(next);
  }, [custom, all]);

  const removeCustom = useCallback((id) => {
    const next = custom.filter(s => s.id !== id);
    setCustom(next);
    saveCustom(next);
  }, [custom]);

  const search = useCallback((query) => {
    if (!query?.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [custom]);

  return { substances: all, builtIn: SUBSTANCES, custom, getById, addCustom, removeCustom, search };
}
