import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  ImagePlus,
  ListChecks,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

const STATUS_COLORS = {
  pending:   'admin-badge--pending',
  confirmed: 'admin-badge--confirmed',
  completed: 'admin-badge--completed',
  cancelled: 'admin-badge--cancelled',
}

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="admin-stat-card">
      <Icon size={22} className="admin-stat-card__icon" />
      <p className="admin-stat-card__label">{label}</p>
      <p className="admin-stat-card__value">
        {loading ? '—' : value}
      </p>
    </div>
  )
}

export function AdminDashboard({ token }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchBookings() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:5500/api/v1/booking/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data?.data?.bookings ?? res.data?.data ?? []
      setBookings(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [token])

  const total     = bookings.length
  const pending   = bookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length
  const confirmed = bookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length
  const completed = bookings.filter((b) => (b.status || '').toLowerCase() === 'completed').length
  const recent    = [...bookings].reverse().slice(0, 5)

  if (error) {
    return (
      <div className="admin-error">
        <AlertCircle size={40} className="admin-error__icon" />
        <p>{error}</p>
        <button className="admin-btn admin-btn--outline" onClick={fetchBookings}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <p className="admin-section-eyebrow">Overview</p>

      {/* Stats */}
      <div className="admin-stats-grid">
        <StatCard label="Total Bookings" value={total}     icon={CalendarDays} loading={loading} />
        <StatCard label="Pending"        value={pending}   icon={Clock}        loading={loading} />
        <StatCard label="Confirmed"      value={confirmed} icon={CheckCircle}  loading={loading} />
        <StatCard label="Completed"      value={completed} icon={XCircle}      loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <Link to="/admin/gallery" className="admin-btn admin-btn--primary">
          <ImagePlus size={15} /> New Gallery Upload
        </Link>
        <Link to="/admin/bookings" className="admin-btn admin-btn--outline">
          <ListChecks size={15} /> View All Bookings
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Recent Bookings</h2>
        <Link to="/admin/bookings" className="admin-btn admin-btn--ghost admin-btn--sm">
          View all &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Session</th>
                <th>Date</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#5c5852' }}>
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                recent.map((b) => {
                  const statusKey = (b.status || 'pending').toLowerCase()
                  return (
                    <tr key={b._id ?? b.id ?? Math.random()}>
                      <td className="text-primary">
                        {b.fullname || b.username || b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Client'}
                      </td>
                      <td>{b.session || b.sessionType || '—'}</td>
                      <td>{b.eventdate || b.bookeddate || b.date ? new Date(b.eventdate || b.bookeddate || b.date).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`admin-badge ${STATUS_COLORS[statusKey] ?? 'admin-badge--pending'}`}>
                          {b.status ?? 'pending'}
                        </span>
                      </td>
                      <td>{b.location || b.Location || 'Studio'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
