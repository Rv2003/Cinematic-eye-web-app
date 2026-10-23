import { useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import {
  Settings,
  Building,
  Mail,
  Phone,
  MapPin,
  Camera,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Server,
  KeyRound,
  ExternalLink
} from 'lucide-react'

export function AdminSettings({ token, setUser, setToken }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [serverStatus, setServerStatus] = useState('online')

  async function handleSignOut() {
    setLoggingOut(true)
    try {
      await axios.post(
        'http://localhost:5500/api/v1/auth/sign-out',
        {},
        { withCredentials: true }
      )
    } catch (e) {
      // proceed anyway
    } finally {
      if (setUser) setUser(null)
      if (setToken) setToken(null)
      navigate('/login', { replace: true })
    }
  }

  const SESSIONS = [
    { title: 'Portrait & Editorial', duration: '1–2 Hours', price: 'Rs 25,000' },
    { title: 'Graduation Sessions', duration: '2 Hours', price: 'Rs 30,000' },
    { title: 'Event & Wedding Story', duration: 'Full Day Coverage', price: 'Custom Quote' },
    { title: 'Cinematic Film', duration: 'Full Day / Multi-Day', price: 'Custom Quote' },
  ]

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Studio Configuration</p>
          <h2 className="admin-section-title">Settings & System Info</h2>
        </div>
      </div>

      <div className="admin-settings-layout">
        {/* Left Column: Studio Profile & API config */}
        <div className="admin-settings-col">
          <div className="admin-card">
            <div className="admin-card-header">
              <Building size={16} color="#d4af37" />
              <h3>Studio Information</h3>
            </div>
            <p className="admin-card-sub">
              Information publicly displayed across the website header and footer.
            </p>

            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <span className="field-label">Studio Brand</span>
                <span className="field-val">Cinematic Eye Studio</span>
              </div>
              <div className="admin-settings-field">
                <span className="field-label">
                  <MapPin size={12} /> Studio Location
                </span>
                <span className="field-val">Negombo, Western Province, Sri Lanka</span>
              </div>
              <div className="admin-settings-field">
                <span className="field-label">
                  <Mail size={12} /> Contact Email
                </span>
                <span className="field-val">hello@cinematiceye.com</span>
              </div>
              <div className="admin-settings-field">
                <span className="field-label">
                  <Phone size={12} /> WhatsApp Helpline
                </span>
                <span className="field-val">+94 77 123 4567</span>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: '20px' }}>
            <div className="admin-card-header">
              <Server size={16} color="#d4af37" />
              <h3>Backend & Environment</h3>
            </div>
            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <span className="field-label">API Gateway</span>
                <span className="field-val" style={{ fontFamily: 'monospace' }}>
                  http://localhost:5500/api/v1
                </span>
              </div>
              <div className="admin-settings-field">
                <span className="field-label">Authentication Strategy</span>
                <span className="field-val">JWT Bearer + HTTP-Only Refresh Cookie</span>
              </div>
              <div className="admin-settings-field">
                <span className="field-label">Client Role</span>
                <span className="field-val" style={{ color: '#d4af37' }}>
                  Administrator (Elevated Privileges)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions Overview & Danger Zone */}
        <div className="admin-settings-col">
          <div className="admin-card">
            <div className="admin-card-header">
              <Camera size={16} color="#d4af37" />
              <h3>Configured Session Types</h3>
            </div>
            <p className="admin-card-sub">
              Photography and filmmaking packages available on the booking page.
            </p>

            <div className="admin-session-config-list">
              {SESSIONS.map((item) => (
                <div key={item.title} className="session-config-item">
                  <div>
                    <span className="session-name">{item.title}</span>
                    <span className="session-dur">{item.duration}</span>
                  </div>
                  <span className="session-price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="admin-card admin-card--danger" style={{ marginTop: '20px' }}>
            <div className="admin-card-header">
              <ShieldAlert size={16} color="#e55353" />
              <h3 style={{ color: '#e55353' }}>Administrative Actions</h3>
            </div>
            <p className="admin-card-sub">
              Securely sign out of this administrative terminal or refresh your session tokens.
            </p>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleSignOut}
                disabled={loggingOut}
              >
                <LogOut size={15} />
                {loggingOut ? 'Signing out...' : 'Sign Out of Admin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
