import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router'
import axios from 'axios'
import {
  LayoutDashboard,
  CalendarDays,
  ImageIcon,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import './admin.css'

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings',  icon: CalendarDays },
  { to: '/admin/gallery',  label: 'Gallery',   icon: ImageIcon },
  { to: '/admin/team',     label: 'Team',      icon: Users },
  { to: '/admin/settings', label: 'Settings',  icon: Settings },
]

const PAGE_TITLES = {
  '/admin':          'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/gallery':  'Gallery',
  '/admin/team':     'Team',
  '/admin/settings': 'Settings',
}

export function AdminLayout({ setUser, setToken }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname
  const pageTitle =
    PAGE_TITLES[currentPath] ??
    Object.entries(PAGE_TITLES).find(([k]) => currentPath.startsWith(k) && k !== '/admin')?.[1] ??
    'Admin'

  function closeSidebar() {
    setSidebarOpen(false)
  }

  async function handleSignOut() {
    try {
      await axios.post('http://localhost:5500/api/v1/auth/sign-out', {}, { withCredentials: true })
    } catch {
      // ignore
    }
    if (setUser) setUser(null)
    if (setToken) setToken(null)
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-root">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* SIDEBAR */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Admin Navigation">
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <Link to="/admin" className="admin-sidebar__brand-text" onClick={closeSidebar}>
            CINEMATIC &middot; <span>ADMIN</span>
          </Link>
          <span className="admin-sidebar__brand-sub">Control Panel</span>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar__nav-item${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__footer-link" onClick={closeSidebar}>
            <ArrowLeft size={15} />
            Back to Site
          </Link>
          <button className="admin-sidebar__signout" onClick={handleSignOut}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="admin-topbar__hamburger"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="admin-topbar__title">{pageTitle}</h1>
          </div>
          <span className="admin-topbar__badge">Admin Panel</span>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
