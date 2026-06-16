import { useEffect, useRef } from 'react';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default function RadarChart({ labels, values, size = 320 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || labels.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4e9cd7';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fafafa';
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#a3a3a3';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#262626';

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: accent + '22',
          borderColor: accent,
          borderWidth: 2,
          pointBackgroundColor: accent,
          pointBorderColor: 'var(--bg)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 10,
            callbacks: { label: (ctx) => `${ctx.parsed.r}% of target` },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, color: mutedColor, backdropColor: 'transparent', font: { size: 10 } },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { color: textColor, font: { size: 10, weight: 500 } },
          },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [labels, values]);

  if (labels.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No metrics to display. Add an entry to see your radar chart.</div>;
  }

  return <div style={{ maxWidth: size, margin: '0 auto' }}><canvas ref={canvasRef} /></div>;
}
