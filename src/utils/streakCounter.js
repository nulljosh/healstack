export function calculateStreak(checkIns) {
  if (!checkIns || checkIns.length === 0) return 0;

  const dates = checkIns
    .map(c => new Date(c.date || c.timestamp).toISOString().slice(0, 10))
    .filter(Boolean);

  const unique = [...new Set(dates)].sort().reverse();
  if (unique.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}
