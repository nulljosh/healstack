// Client-side LifeLabs PDF parser using PDF.js loaded from CDN.
// Extracts lab panels and marker values from LifeLabs result PDFs.

const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`;

let _pdfjsLib = null;

async function loadPdfJs() {
  if (_pdfjsLib) return _pdfjsLib;
  // Dynamic import via script tag injection (ESM CDN)
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.onload = () => {
      const lib = window.pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      _pdfjsLib = lib;
      resolve(lib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}

async function extractText(file) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  return pages.join('\n');
}

function parseDate(text) {
  // Patterns: "Collection Date: Apr 10, 2026" or "Collected: 2026-04-10"
  const patterns = [
    /Collection Date:\s*([A-Za-z]+ \d{1,2},\s*\d{4})/i,
    /Collected:\s*(\d{4}-\d{2}-\d{2})/i,
    /Date of Collection:\s*([A-Za-z]+ \d{1,2},\s*\d{4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const d = new Date(m[1]);
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
}

// Panel heading patterns in LifeLabs PDFs
const PANEL_HEADINGS = [
  'COMPLETE BLOOD COUNT', 'CBC', 'THYROID', 'LIPID', 'CHEMISTRY',
  'METABOLIC', 'VITAMIN', 'HEMOGLOBIN A1C', 'LIVER', 'IRON STUDIES',
  'URINALYSIS', 'ELECTROLYTES', 'RENAL',
];

function detectPanel(line) {
  const upper = line.toUpperCase();
  for (const h of PANEL_HEADINGS) {
    if (upper.includes(h)) return line.trim().replace(/[*:]/g, '').trim();
  }
  return null;
}

// LifeLabs row format (approximate):
// "TSH   2.45   mIU/L   0.35 - 5.00   N"
// or columnar PDF extraction produces something like:
// "TSH 2.45 mIU/L 0.35 5.00"
const MARKER_ROW = /^([A-Za-z][A-Za-z0-9 /()\-]{1,40}?)\s{2,}([\d.]+)\s+([\w/%*^]+)\s+([\d.]+)?\s*[-–]?\s*([\d.]+)?/;

function parseMarkerLine(line) {
  const m = line.match(MARKER_ROW);
  if (!m) return null;
  const name = m[1].trim();
  const value = parseFloat(m[2]);
  const unit = m[3].trim();
  const refLow = m[4] ? parseFloat(m[4]) : null;
  const refHigh = m[5] ? parseFloat(m[5]) : null;
  if (isNaN(value)) return null;
  return { name, value, unit, refLow, refHigh };
}

export async function parseLifeLabsPDF(file) {
  const text = await extractText(file);
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

  const date = parseDate(text);
  const panels = [];
  let currentPanel = 'General';
  let currentMarkers = [];

  for (const line of lines) {
    const panelName = detectPanel(line);
    if (panelName) {
      if (currentMarkers.length) {
        panels.push({ panel: currentPanel, markers: currentMarkers });
      }
      currentPanel = panelName;
      currentMarkers = [];
      continue;
    }

    const marker = parseMarkerLine(line);
    if (marker) currentMarkers.push(marker);
  }

  if (currentMarkers.length) {
    panels.push({ panel: currentPanel, markers: currentMarkers });
  }

  // Flatten to one result per panel
  return panels
    .filter(p => p.markers.length > 0)
    .map(p => ({
      date,
      lab: 'LifeLabs',
      panel: p.panel,
      markers: p.markers,
    }));
}

export async function parseGenericLabPDF(file) {
  // Fallback: try to extract any numeric rows from any lab PDF
  const text = await extractText(file);
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  const date = parseDate(text);
  const markers = [];

  for (const line of lines) {
    const marker = parseMarkerLine(line);
    if (marker) markers.push(marker);
  }

  if (!markers.length) return null;
  return [{ date, lab: 'Imported', panel: 'Custom', markers }];
}
