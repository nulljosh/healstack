import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const primaryLinks = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/insights',
    label: 'Insights',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: '/body',
    label: 'Body',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3"/><path d="M12 8v8m-4-6h8m-7 6l-3 4m10-4l3 4"/>
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

// Secondary tabs shown in More sheet (mobile) and inline (desktop)
const secondaryLinks = [
  {
    to: '/substances',
    label: 'Library',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    to: '/lab-results',
    label: 'Labs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v7l3 9H6l3-9V3z"/><line x1="9" y1="3" x2="15" y2="3"/>
      </svg>
    ),
  },
  {
    to: '/routine',
    label: 'Routine',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

const moreIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
);

export default function Nav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const sheetRef = useRef(null);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Close sheet on outside click
  useEffect(() => {
    if (!sheetOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setSheetOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sheetOpen]);

  const secondaryActive = secondaryLinks.some(l => {
    if (l.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(l.to);
  });

  return (
    <>
      {/* Backdrop for More sheet */}
      {sheetOpen && (
        <div
          className="nav-sheet-backdrop"
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More bottom sheet */}
      <div
        ref={sheetRef}
        className={`nav-sheet${sheetOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
      >
        <div className="nav-sheet-handle" />
        <div className="nav-sheet-items">
          {secondaryLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-sheet-item${isActive ? ' active' : ''}`}
              onClick={() => setSheetOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="nav">
        {/* Mobile: 4 primary + More */}
        <div className="nav-mobile">
          {primaryLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.icon}
              <span className="nav-label">{link.label}</span>
              <span className="nav-dot" />
            </NavLink>
          ))}
          <button
            className={`nav-link nav-more-btn${secondaryActive && !sheetOpen ? ' secondary-active' : ''}${sheetOpen ? ' active' : ''}`}
            onClick={() => setSheetOpen(v => !v)}
            aria-expanded={sheetOpen}
            aria-haspopup="dialog"
          >
            {moreIcon}
            <span className="nav-label">More</span>
            <span className="nav-dot" />
          </button>
        </div>

        {/* Desktop: all tabs inline (sidebar layout handled by CSS) */}
        <div className="nav-desktop">
          {[...primaryLinks, ...secondaryLinks].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.icon}
              <span className="nav-label">{link.label}</span>
              <span className="nav-dot" />
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
