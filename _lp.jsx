import { createRoot } from 'react-dom/client';
import './src/index.css';
import Landing from './src/pages/Landing';
const t = new URLSearchParams(location.search).get('theme');
if (t) document.documentElement.setAttribute('data-theme', t);
createRoot(document.getElementById('root')).render(<Landing onGetStarted={() => {}} />);
setTimeout(() => {
  const de = document.documentElement;
  const bad = [...document.querySelectorAll('*')]
    .filter(e => e.getBoundingClientRect().right > de.clientWidth + 1)
    .slice(0, 12)
    .map(e => `${e.tagName}.${(e.className||'').toString().slice(0,20)}[${Math.round(e.getBoundingClientRect().left)}..${Math.round(e.getBoundingClientRect().right)}] "${(e.textContent||'').trim().slice(0,25)}"`);
  const out = document.createElement('pre');
  out.id = 'measure';
  out.textContent = `VIEW=${de.clientWidth} SCROLLW=${de.scrollWidth} OVERFLOW=${de.scrollWidth - de.clientWidth}\n` + bad.join('\n');
  document.body.prepend(out);
}, 1200);
