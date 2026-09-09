import { useState } from 'react';

const KEY = 'dose:supplements';
export const SUPPLEMENT_CATEGORIES = ['supplement', 'vitamin', 'mineral', 'herb', 'nootropic'];

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { stack: Array.isArray(raw.stack) ? raw.stack : [], taken: raw.taken || {} };
  } catch {
    return { stack: [], taken: {} };
  }
}

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// Reusable day-level adherence: fraction of stack taken over the last `days` days.
export function adherence(stack, taken, days = 7, now = new Date()) {
  if (stack.length === 0) return 0;
  let hit = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = taken[dayKey(d)] || {};
    hit += stack.filter(id => day[id]).length;
  }
  return Math.round((hit / (stack.length * days)) * 100);
}

// ponytail: supplements are a per-day checklist over substance ids, not dose-log entries.
// Upgrade path: write a dose:log entry on toggle if dose amounts ever matter.
export function useSupplements() {
  const [state, setState] = useState(load);
  const today = dayKey();
  const todayTaken = state.taken[today] || {};

  function save(next) {
    setState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function add(id) {
    if (!id || state.stack.includes(id)) return;
    save({ ...state, stack: [...state.stack, id] });
  }

  function remove(id) {
    save({ ...state, stack: state.stack.filter(s => s !== id) });
  }

  function toggle(id) {
    save({ ...state, taken: { ...state.taken, [today]: { ...todayTaken, [id]: !todayTaken[id] } } });
  }

  return {
    stack: state.stack,
    add,
    remove,
    toggle,
    isTaken: id => !!todayTaken[id],
    takenToday: state.stack.filter(id => todayTaken[id]).length,
    weekAdherence: adherence(state.stack, state.taken, 7),
  };
}
