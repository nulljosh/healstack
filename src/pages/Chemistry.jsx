import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SUBSTANCE_LINKS = {
  3:  { id: 'lithium', label: 'Mood stabilizer (bipolar)' },
  6:  { id: 'cannabis', label: 'Carbon backbone of cannabinoids' },
  7:  { id: 'nac', label: 'N-Acetyl Cysteine (nitrogen compound)' },
  8:  { id: 'omega-3', label: 'Omega-3 fatty acids' },
  12: { id: 'magnesium', label: 'Magnesium supplement' },
  15: { id: 'modafinil', label: 'Phosphorus in modafinil' },
  19: { id: 'potassium', label: 'Potassium supplement' },
  20: { id: 'vitamin-d', label: 'Calcium + Vitamin D' },
  26: { id: 'iron', label: 'Iron supplement' },
  29: { id: 'copper', label: 'Copper supplement' },
  30: { id: 'zinc', label: 'Zinc supplement' },
  34: { id: 'selenium', label: 'Selenium supplement' },
  53: { id: 'niacin', label: 'Iodine (thyroid, often in multivitamins)' },
};

const CATEGORIES = {
  'alkali-metal':       { color: '#c96b6b', label: 'Alkali Metal' },
  'alkaline-earth':     { color: '#b8607a', label: 'Alkaline Earth' },
  'transition-metal':   { color: '#4e9cd7', label: 'Transition Metal' },
  'post-transition':    { color: '#5d8ab0', label: 'Post-Transition' },
  'metalloid':          { color: '#8b6b9e', label: 'Metalloid' },
  'nonmetal':           { color: '#5d9e6f', label: 'Nonmetal' },
  'halogen':            { color: '#c9a04e', label: 'Halogen' },
  'noble-gas':          { color: '#7b7eae', label: 'Noble Gas' },
  'lanthanide':         { color: '#4d9e8f', label: 'Lanthanide' },
  'actinide':           { color: '#9e6b5c', label: 'Actinide' },
};

// Compact periodic table: [atomicNumber, symbol, name, mass, category, row, col]
// Row/col are 1-indexed grid positions in the standard 18-column layout
const ELEMENTS = [
  [1,'H','Hydrogen',1.008,'nonmetal',1,1],[2,'He','Helium',4.003,'noble-gas',1,18],
  [3,'Li','Lithium',6.941,'alkali-metal',2,1],[4,'Be','Beryllium',9.012,'alkaline-earth',2,2],
  [5,'B','Boron',10.81,'metalloid',2,13],[6,'C','Carbon',12.01,'nonmetal',2,14],
  [7,'N','Nitrogen',14.01,'nonmetal',2,15],[8,'O','Oxygen',16.00,'nonmetal',2,16],
  [9,'F','Fluorine',19.00,'halogen',2,17],[10,'Ne','Neon',20.18,'noble-gas',2,18],
  [11,'Na','Sodium',22.99,'alkali-metal',3,1],[12,'Mg','Magnesium',24.31,'alkaline-earth',3,2],
  [13,'Al','Aluminium',26.98,'post-transition',3,13],[14,'Si','Silicon',28.09,'metalloid',3,14],
  [15,'P','Phosphorus',30.97,'nonmetal',3,15],[16,'S','Sulfur',32.07,'nonmetal',3,16],
  [17,'Cl','Chlorine',35.45,'halogen',3,17],[18,'Ar','Argon',39.95,'noble-gas',3,18],
  [19,'K','Potassium',39.10,'alkali-metal',4,1],[20,'Ca','Calcium',40.08,'alkaline-earth',4,2],
  [21,'Sc','Scandium',44.96,'transition-metal',4,3],[22,'Ti','Titanium',47.87,'transition-metal',4,4],
  [23,'V','Vanadium',50.94,'transition-metal',4,5],[24,'Cr','Chromium',52.00,'transition-metal',4,6],
  [25,'Mn','Manganese',54.94,'transition-metal',4,7],[26,'Fe','Iron',55.85,'transition-metal',4,8],
  [27,'Co','Cobalt',58.93,'transition-metal',4,9],[28,'Ni','Nickel',58.69,'transition-metal',4,10],
  [29,'Cu','Copper',63.55,'transition-metal',4,11],[30,'Zn','Zinc',65.38,'transition-metal',4,12],
  [31,'Ga','Gallium',69.72,'post-transition',4,13],[32,'Ge','Germanium',72.63,'metalloid',4,14],
  [33,'As','Arsenic',74.92,'metalloid',4,15],[34,'Se','Selenium',78.97,'nonmetal',4,16],
  [35,'Br','Bromine',79.90,'halogen',4,17],[36,'Kr','Krypton',83.80,'noble-gas',4,18],
  [37,'Rb','Rubidium',85.47,'alkali-metal',5,1],[38,'Sr','Strontium',87.62,'alkaline-earth',5,2],
  [39,'Y','Yttrium',88.91,'transition-metal',5,3],[40,'Zr','Zirconium',91.22,'transition-metal',5,4],
  [41,'Nb','Niobium',92.91,'transition-metal',5,5],[42,'Mo','Molybdenum',95.95,'transition-metal',5,6],
  [43,'Tc','Technetium',98,'transition-metal',5,7],[44,'Ru','Ruthenium',101.1,'transition-metal',5,8],
  [45,'Rh','Rhodium',102.9,'transition-metal',5,9],[46,'Pd','Palladium',106.4,'transition-metal',5,10],
  [47,'Ag','Silver',107.9,'transition-metal',5,11],[48,'Cd','Cadmium',112.4,'transition-metal',5,12],
  [49,'In','Indium',114.8,'post-transition',5,13],[50,'Sn','Tin',118.7,'post-transition',5,14],
  [51,'Sb','Antimony',121.8,'metalloid',5,15],[52,'Te','Tellurium',127.6,'metalloid',5,16],
  [53,'I','Iodine',126.9,'halogen',5,17],[54,'Xe','Xenon',131.3,'noble-gas',5,18],
  [55,'Cs','Caesium',132.9,'alkali-metal',6,1],[56,'Ba','Barium',137.3,'alkaline-earth',6,2],
  // Lanthanides (row 9 = separated row below)
  [57,'La','Lanthanum',138.9,'lanthanide',9,3],[58,'Ce','Cerium',140.1,'lanthanide',9,4],
  [59,'Pr','Praseodymium',140.9,'lanthanide',9,5],[60,'Nd','Neodymium',144.2,'lanthanide',9,6],
  [61,'Pm','Promethium',145,'lanthanide',9,7],[62,'Sm','Samarium',150.4,'lanthanide',9,8],
  [63,'Eu','Europium',152.0,'lanthanide',9,9],[64,'Gd','Gadolinium',157.3,'lanthanide',9,10],
  [65,'Tb','Terbium',158.9,'lanthanide',9,11],[66,'Dy','Dysprosium',162.5,'lanthanide',9,12],
  [67,'Ho','Holmium',164.9,'lanthanide',9,13],[68,'Er','Erbium',167.3,'lanthanide',9,14],
  [69,'Tm','Thulium',168.9,'lanthanide',9,15],[70,'Yb','Ytterbium',173.0,'lanthanide',9,16],
  [71,'Lu','Lutetium',175.0,'lanthanide',9,17],
  [72,'Hf','Hafnium',178.5,'transition-metal',6,4],[73,'Ta','Tantalum',180.9,'transition-metal',6,5],
  [74,'W','Tungsten',183.8,'transition-metal',6,6],[75,'Re','Rhenium',186.2,'transition-metal',6,7],
  [76,'Os','Osmium',190.2,'transition-metal',6,8],[77,'Ir','Iridium',192.2,'transition-metal',6,9],
  [78,'Pt','Platinum',195.1,'transition-metal',6,10],[79,'Au','Gold',197.0,'transition-metal',6,11],
  [80,'Hg','Mercury',200.6,'transition-metal',6,12],[81,'Tl','Thallium',204.4,'post-transition',6,13],
  [82,'Pb','Lead',207.2,'post-transition',6,14],[83,'Bi','Bismuth',209.0,'post-transition',6,15],
  [84,'Po','Polonium',209,'metalloid',6,16],[85,'At','Astatine',210,'halogen',6,17],
  [86,'Rn','Radon',222,'noble-gas',6,18],
  [87,'Fr','Francium',223,'alkali-metal',7,1],[88,'Ra','Radium',226,'alkaline-earth',7,2],
  // Actinides (row 10 = separated row below)
  [89,'Ac','Actinium',227,'actinide',10,3],[90,'Th','Thorium',232.0,'actinide',10,4],
  [91,'Pa','Protactinium',231.0,'actinide',10,5],[92,'U','Uranium',238.0,'actinide',10,6],
  [93,'Np','Neptunium',237,'actinide',10,7],[94,'Pu','Plutonium',244,'actinide',10,8],
  [95,'Am','Americium',243,'actinide',10,9],[96,'Cm','Curium',247,'actinide',10,10],
  [97,'Bk','Berkelium',247,'actinide',10,11],[98,'Cf','Californium',251,'actinide',10,12],
  [99,'Es','Einsteinium',252,'actinide',10,13],[100,'Fm','Fermium',257,'actinide',10,14],
  [101,'Md','Mendelevium',258,'actinide',10,15],[102,'No','Nobelium',259,'actinide',10,16],
  [103,'Lr','Lawrencium',266,'actinide',10,17],
  [104,'Rf','Rutherfordium',267,'transition-metal',7,4],[105,'Db','Dubnium',268,'transition-metal',7,5],
  [106,'Sg','Seaborgium',269,'transition-metal',7,6],[107,'Bh','Bohrium',270,'transition-metal',7,7],
  [108,'Hs','Hassium',277,'transition-metal',7,8],[109,'Mt','Meitnerium',278,'transition-metal',7,9],
  [110,'Ds','Darmstadtium',281,'transition-metal',7,10],[111,'Rg','Roentgenium',282,'transition-metal',7,11],
  [112,'Cn','Copernicium',285,'transition-metal',7,12],[113,'Nh','Nihonium',286,'post-transition',7,13],
  [114,'Fl','Flerovium',289,'post-transition',7,14],[115,'Mc','Moscovium',290,'post-transition',7,15],
  [116,'Lv','Livermorium',293,'post-transition',7,16],[117,'Ts','Tennessine',294,'halogen',7,17],
  [118,'Og','Oganesson',294,'noble-gas',7,18],
];

function DetailPanel({ el, onClose }) {
  const [z, sym, name, mass, cat] = el;
  const catInfo = CATEGORIES[cat];
  const link = SUBSTANCE_LINKS[z];
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={panelRef} className="chem-detail" style={{ animation: 'fadeUp 0.25s ease' }}>
      <button className="chem-detail-close" onClick={onClose} aria-label="Close">&times;</button>
      <div className="chem-detail-header">
        <div className="chem-detail-symbol" style={{ color: catInfo.color }}>{sym}</div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{name}</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{z}</span>
        </div>
      </div>
      <div className="chem-detail-grid">
        <div className="chem-detail-stat">
          <span className="chem-detail-label">Atomic Mass</span>
          <span>{mass}</span>
        </div>
        <div className="chem-detail-stat">
          <span className="chem-detail-label">Category</span>
          <span style={{ color: catInfo.color }}>{catInfo.label}</span>
        </div>
        <div className="chem-detail-stat">
          <span className="chem-detail-label">Atomic Number</span>
          <span>{z}</span>
        </div>
      </div>
      {link && (
        <Link to={`/substances/${link.id}`} className="chem-substance-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          {link.label}
        </Link>
      )}
    </div>
  );
}

export default function Chemistry() {
  const [selected, setSelected] = useState(null);
  const [highlight, setHighlight] = useState(null);

  const el = selected ? ELEMENTS.find(e => e[0] === selected) : null;

  return (
    <main className="page">
      <h1 className="page-title">Chemistry</h1>
      <p className="page-subtitle">
        Periodic table. Elements linked to tracked substances are marked.
      </p>

      <div className="chem-legend">
        {Object.entries(CATEGORIES).map(([key, { color, label }]) => (
          <button
            key={key}
            className={`chem-legend-item${highlight === key ? ' active' : ''}`}
            onClick={() => setHighlight(highlight === key ? null : key)}
          >
            <span className="chem-legend-dot" style={{ background: color }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="chem-table-wrap">
        <div className="chem-table">
          {ELEMENTS.map(([z, sym, , , cat, row, col]) => {
            const catInfo = CATEGORIES[cat];
            const hasLink = !!SUBSTANCE_LINKS[z];
            const dimmed = highlight && cat !== highlight;
            return (
              <button
                key={z}
                className={`chem-cell${selected === z ? ' selected' : ''}${hasLink ? ' linked' : ''}${dimmed ? ' dimmed' : ''}`}
                style={{
                  gridRow: row,
                  gridColumn: col,
                  '--cell-color': catInfo.color,
                }}
                onClick={() => setSelected(selected === z ? null : z)}
                title={`${z} - ${sym}`}
              >
                <span className="chem-cell-z">{z}</span>
                <span className="chem-cell-sym">{sym}</span>
              </button>
            );
          })}
          {/* Lanthanide/Actinide gap labels */}
          <div className="chem-series-label" style={{ gridRow: 6, gridColumn: 3 }}>*</div>
          <div className="chem-series-label" style={{ gridRow: 7, gridColumn: 3 }}>**</div>
          <div className="chem-series-label" style={{ gridRow: 9, gridColumn: 2 }}>*</div>
          <div className="chem-series-label" style={{ gridRow: 10, gridColumn: 2 }}>**</div>
        </div>
      </div>

      {el && <DetailPanel el={el} onClose={() => setSelected(null)} />}

      <style>{`
        .chem-legend { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px; }
        .chem-legend-item { display:flex; align-items:center; gap:5px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:100px; padding:4px 10px; cursor:pointer; font-size:0.7rem; color:var(--text-secondary); transition:all 0.2s ease; }
        .chem-legend-item:hover,.chem-legend-item.active { border-color:var(--accent); color:var(--text-primary); }
        .chem-legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .chem-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; margin:0 -16px; padding:0 16px 16px; }
        .chem-table { display:grid; grid-template-columns:repeat(18,1fr); grid-template-rows:repeat(10,auto); gap:2px; min-width:560px; }
        .chem-cell { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; background:color-mix(in srgb,var(--cell-color) 12%,var(--bg-secondary)); border:1px solid color-mix(in srgb,var(--cell-color) 25%,transparent); border-radius:4px; padding:2px 1px; cursor:pointer; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); min-height:36px; aspect-ratio:1; }
        .chem-cell:hover { transform:scale(1.15); z-index:2; border-color:var(--cell-color); background:color-mix(in srgb,var(--cell-color) 22%,var(--bg-secondary)); }
        .chem-cell.selected { border-color:var(--cell-color); background:color-mix(in srgb,var(--cell-color) 28%,var(--bg-secondary)); }
        .chem-cell.linked::after { content:''; position:absolute; top:2px; right:2px; width:4px; height:4px; border-radius:50%; background:var(--accent); }
        .chem-cell.dimmed { opacity:0.2; }
        .chem-cell-z { font-size:0.5rem; color:var(--text-secondary); line-height:1; }
        .chem-cell-sym { font-size:0.8rem; font-weight:700; color:var(--cell-color); line-height:1.2; }
        .chem-series-label { display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--text-secondary); font-weight:600; }
        .chem-detail { position:fixed; bottom:72px; left:12px; right:12px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:16px; padding:20px; z-index:50; max-width:420px; }
        @media(min-width:768px) { .chem-detail { left:auto; right:24px; bottom:24px; } }
        .chem-detail-close { position:absolute; top:12px; right:14px; background:none; border:none; color:var(--text-secondary); font-size:1.4rem; cursor:pointer; line-height:1; }
        .chem-detail-header { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
        .chem-detail-symbol { font-size:2.4rem; font-weight:500; line-height:1; }
        .chem-detail-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px; }
        .chem-detail-stat { display:flex; flex-direction:column; gap:2px; font-size:0.88rem; }
        .chem-detail-label { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-secondary); }
        .chem-substance-link { display:inline-flex; align-items:center; gap:6px; background:var(--accent-muted); border:1px solid var(--accent-border); border-radius:100px; padding:8px 14px; color:var(--accent); font-size:0.82rem; font-weight:600; text-decoration:none; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .chem-substance-link:hover { background:var(--accent-border); transform:translateY(-1px); }
        @media(max-width:480px) { .chem-cell { min-height:28px; } .chem-cell-z { font-size:0.4rem; } .chem-cell-sym { font-size:0.6rem; } .chem-detail-grid { grid-template-columns:1fr 1fr; } }
      `}</style>
    </main>
  );
}
