// Insight engine -- pure computed analysis, no LLM needed.
// Correlates dose log against biometrics and lab results.

const METRIC_LABELS = {
  sleep: 'sleep', steps: 'steps', heartRate: 'heart rate',
  hrv: 'HRV', bloodOxygen: 'blood oxygen', weight: 'weight',
  activeEnergy: 'active energy', exerciseMin: 'exercise',
};

function dateOf(iso) {
  return iso.slice(0, 10);
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// For a given substance, find biometric entries on days it was taken vs. not.
// Returns { substance, metric, onMean, offMean, delta, pct, direction, confidence }
export function computeCorrelations(doseLog, biometrics) {
  if (!doseLog.length || !biometrics.length) return [];

  const insights = [];
  const substanceIds = [...new Set(doseLog.map(e => e.substanceId))];

  for (const subId of substanceIds) {
    const onDays = new Set(
      doseLog.filter(e => e.substanceId === subId).map(e => dateOf(e.timestamp))
    );

    const onVals = {};
    const offVals = {};

    for (const bio of biometrics) {
      if (!bio.metrics) continue;
      const isOn = onDays.has(bio.date);
      for (const [metric, val] of Object.entries(bio.metrics)) {
        if (val == null || val === '') continue;
        const bucket = isOn ? onVals : offVals;
        (bucket[metric] = bucket[metric] || []).push(Number(val));
      }
    }

    for (const metric of Object.keys(METRIC_LABELS)) {
      const on = onVals[metric] || [];
      const off = offVals[metric] || [];
      // Need at least 3 data points in each group for meaningful insight
      if (on.length < 3 || off.length < 3) continue;

      const onMean = mean(on);
      const offMean = mean(off);
      if (offMean === 0) continue;

      const delta = onMean - offMean;
      const pct = Math.abs(delta / offMean) * 100;
      if (pct < 5) continue; // not meaningful

      const direction = delta > 0 ? 'higher' : 'lower';
      // Confidence: based on sample sizes
      const confidence = Math.min(1, (on.length + off.length) / 20);

      insights.push({
        type: 'correlation',
        substanceId: subId,
        metric,
        metricLabel: METRIC_LABELS[metric] || metric,
        onMean: Math.round(onMean * 10) / 10,
        offMean: Math.round(offMean * 10) / 10,
        delta: Math.round(Math.abs(delta) * 10) / 10,
        pct: Math.round(pct),
        direction,
        sampleSize: on.length + off.length,
        confidence,
      });
    }
  }

  return insights.sort((a, b) => b.confidence * b.pct - a.confidence * a.pct);
}

// Detect biometric readings that deviate >2 SD from personal mean
export function anomalyAlerts(biometrics) {
  if (biometrics.length < 5) return [];

  const alerts = [];
  const metricHistory = {};

  for (const bio of biometrics) {
    if (!bio.metrics) continue;
    for (const [metric, val] of Object.entries(bio.metrics)) {
      if (val == null || val === '') continue;
      (metricHistory[metric] = metricHistory[metric] || []).push({
        date: bio.date, value: Number(val),
      });
    }
  }

  for (const [metric, history] of Object.entries(metricHistory)) {
    if (history.length < 5) continue;
    const values = history.map(h => h.value);
    const m = mean(values);
    const sd = stddev(values);
    const latest = history.sort((a, b) => b.date.localeCompare(a.date))[0];

    if (Math.abs(latest.value - m) > 2 * sd) {
      alerts.push({
        type: 'anomaly',
        metric,
        metricLabel: METRIC_LABELS[metric] || metric,
        value: latest.value,
        mean: Math.round(m * 10) / 10,
        date: latest.date,
        direction: latest.value > m ? 'above' : 'below',
        confidence: 0.85,
      });
    }
  }

  return alerts;
}

// Detect lab markers trending toward out-of-range over 3+ readings
export function detectLabTrends(labResults) {
  if (!labResults.length) return [];

  const markerHistory = {};
  for (const result of labResults) {
    for (const m of result.markers) {
      const key = m.name;
      (markerHistory[key] = markerHistory[key] || []).push({
        date: result.date, ...m,
      });
    }
  }

  const trends = [];
  for (const [name, history] of Object.entries(markerHistory)) {
    if (history.length < 3) continue;
    const sorted = history.sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted.slice(-3);

    // Check if values monotonically increasing or decreasing
    const rising = recent[0].value < recent[1].value && recent[1].value < recent[2].value;
    const falling = recent[0].value > recent[1].value && recent[1].value > recent[2].value;
    if (!rising && !falling) continue;

    const latest = recent[recent.length - 1];
    const hasRef = latest.refLow != null || latest.refHigh != null;
    if (!hasRef) continue;

    // Only flag if trending toward out-of-range
    const hi = latest.refHigh;
    const lo = latest.refLow;
    const nearHigh = hi != null && rising && latest.value > hi * 0.8;
    const nearLow = lo != null && falling && latest.value < lo * 1.2;
    if (!nearHigh && !nearLow) continue;

    trends.push({
      type: 'lab_trend',
      marker: name,
      direction: rising ? 'rising' : 'falling',
      currentValue: latest.value,
      unit: latest.unit,
      refLow: lo,
      refHigh: hi,
      readingCount: recent.length,
      confidence: 0.75,
    });
  }

  return trends;
}

// Flagged lab markers from most recent result
export function flaggedLabMarkers(labResults) {
  if (!labResults.length) return [];
  const sorted = [...labResults].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  return latest.markers
    .filter(m => m.flag !== 'normal')
    .map(m => ({
      type: 'lab_flag',
      marker: m.name,
      value: m.value,
      unit: m.unit,
      flag: m.flag,
      date: latest.date,
      lab: latest.lab,
      confidence: 1.0,
    }));
}

// Top 5 insights, sorted by confidence then impact
export function topInsights(doseLog, biometrics, labResults = []) {
  const all = [
    ...flaggedLabMarkers(labResults),
    ...anomalyAlerts(biometrics),
    ...detectLabTrends(labResults),
    ...computeCorrelations(doseLog, biometrics),
  ];
  return all.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// Human-readable summary for an insight
export function insightText(insight, getName) {
  switch (insight.type) {
    case 'lab_flag':
      return `${insight.marker} is ${insight.flag} (${insight.value} ${insight.unit}) from ${insight.lab} result on ${insight.date}`;
    case 'anomaly':
      return `${insight.metricLabel} was ${insight.direction} normal on ${insight.date} (${insight.value} vs avg ${insight.mean})`;
    case 'lab_trend':
      return `${insight.marker} has been ${insight.direction} across ${insight.readingCount} readings, approaching ${insight.direction === 'rising' ? 'upper' : 'lower'} limit`;
    case 'correlation': {
      const name = getName ? getName(insight.substanceId) : insight.substanceId;
      return `${insight.metricLabel} is ${insight.pct}% ${insight.direction} on days you take ${name}`;
    }
    default:
      return '';
  }
}

export function insightIcon(type) {
  switch (type) {
    case 'lab_flag': return 'flag';
    case 'anomaly': return 'alert';
    case 'lab_trend': return 'trend';
    case 'correlation': return 'link';
    default: return 'info';
  }
}
