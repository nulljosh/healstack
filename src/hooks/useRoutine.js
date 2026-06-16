import { useState } from 'react';

const STORAGE_KEY = 'dose:routine:checked';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function useRoutine() {
  const [checked, setChecked] = useState(load);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayChecks = checked[todayKey] || {};

  function toggle(id) {
    const next = { ...checked, [todayKey]: { ...todayChecks, [id]: !todayChecks[id] } };
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function isChecked(id) {
    return !!todayChecks[id];
  }

  function countForDay(key) {
    return Object.values(checked[key] || {}).filter(Boolean).length;
  }

  const completedToday = Object.values(todayChecks).filter(Boolean).length;

  // Last 7 days for streak display
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (!checked[k] || Object.values(checked[k]).filter(Boolean).length === 0) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return { toggle, isChecked, completedToday, countForDay, streak, todayKey };
}
