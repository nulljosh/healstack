import { NavLink } from 'react-router-dom';

const icon = d => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const links = [
  { to: '/', label: 'Summary', icon: icon(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>) },
  { to: '/sharing', label: 'Sharing', icon: icon(<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7M21.5 20v-1a5 5 0 0 0-3-4.6"/></>) },
  { to: '/browse', label: 'Browse', icon: icon(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>) },
];

export default function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      {['nav-mobile', 'nav-desktop'].map(cls => (
        <div key={cls} className={cls}>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {link.icon}
              <span className="nav-label">{link.label}</span>
              <span className="nav-dot" />
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
