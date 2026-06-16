import { useRef, useState } from 'react';

export default function ScreenshotGallery({ screenshots = [], onAdd, onRemove }) {
  const fileRef = useRef(null);
  const [viewing, setViewing] = useState(null);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('Screenshot must be under 1MB'); return; }
    const reader = new FileReader();
    reader.onload = () => onAdd(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div>
      <div className="gallery-grid">
        <div className="gallery-upload" onClick={() => fileRef.current?.click()}>+ Screenshot</div>
        {screenshots.map((src, i) => (
          <div key={i} className="gallery-item" style={{ position: 'relative' }}>
            <img src={src} alt={`Screenshot ${i + 1}`} className="gallery-thumb" onClick={() => setViewing(src)} />
            {onRemove && <button className="gallery-delete" onClick={() => onRemove(i)}>x</button>}
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      {viewing && (
        <div className="gallery-overlay" onClick={() => setViewing(null)}>
          <img src={viewing} alt="Full screenshot" className="gallery-full" />
        </div>
      )}
    </div>
  );
}
