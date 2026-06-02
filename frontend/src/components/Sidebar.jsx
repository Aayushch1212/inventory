import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/products', label: 'Products', icon: '◈' },
  { to: '/customers', label: 'Customers', icon: '◉' },
  { to: '/orders', label: 'Orders', icon: '◎' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        IN<span>V</span>ENTORY
      </div>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="icon">{icon}</span>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
