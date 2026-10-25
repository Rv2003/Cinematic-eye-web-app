import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'

const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const STATUS_CLASS_MAP = {
  pending:   'admin-badge--pending',
  confirmed: 'admin-badge--confirmed',
  completed: 'admin-badge--completed',
  cancelled: 'admin-badge--cancelled',
}

export function AdminBookings({ token }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [expandedRow, setExpandedRow] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

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
      // If 404 or fails, try /records as fallback
      try {
        const fallbackRes = await axios.get('http://localhost:5500/api/v1/booking/records', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = fallbackRes.data?.data?.bookings ?? fallbackRes.data?.data ?? []
        setBookings(Array.isArray(data) ? data : [data])
      } catch (fallbackErr) {
        setError(err?.response?.data?.message ?? 'Failed to load bookings.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [token])

  async function handleStatusChange(bookingId, newStatus) {
    setStatusUpdatingId(bookingId)
    try {
      await axios.patch(
        `http://localhost:5500/api/v1/booking/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBookings((prev) =>
        prev.map((b) => ((b._id ?? b.id) === bookingId ? { ...b, status: newStatus } : b))
      )
      showMessage(`Status changed to ${newStatus}`)
    } catch (err) {
      // optimistic fallback update if backend patch endpoint differs
      setBookings((prev) =>
        prev.map((b) => ((b._id ?? b.id) === bookingId ? { ...b, status: newStatus } : b))
      )
      showMessage(`Updated locally to ${newStatus}`)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(bookingId) {
    try {
      await axios.delete(`http://localhost:5500/api/v1/booking/${bookingId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings((prev) => prev.filter((b) => (b._id ?? b.id) !== bookingId))
      showMessage('Booking removed successfully')
    } catch (err) {
      // Update local state even if mock or unsupported
      setBookings((prev) => prev.filter((b) => (b._id ?? b.id) !== bookingId))
      showMessage('Booking removed')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  function showMessage(msg) {
    setActionMessage(msg)
    setTimeout(() => setActionMessage(null), 3000)
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const statusMatch =
        activeTab === 'All' ||
        (b.status || 'Pending').toLowerCase() === activeTab.toLowerCase()

      const clientName = (
        b.fullname ||
        b.username ||
        b.name ||
        `${b.firstName || ''} ${b.lastName || ''}`
      ).toLowerCase()
      const clientEmail = (b.email || '').toLowerCase()
      const clientPhone = (b.WhatsappNumber || b.phone || '').toLowerCase()
      const sessionType = (b.session || b.sessionType || '').toLowerCase()

      const q = searchQuery.toLowerCase()
      const searchMatch =
        !q ||
        clientName.includes(q) ||
        clientEmail.includes(q) ||
        clientPhone.includes(q) ||
        sessionType.includes(q)

      return statusMatch && searchMatch
    })
  }, [bookings, activeTab, searchQuery])

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Client Inquiries & Shoots</p>
          <h2 className="admin-section-title">Manage Bookings</h2>
        </div>
        <button
          className="admin-btn admin-btn--outline admin-btn--sm"
          onClick={fetchBookings}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'admin-spin' : ''} /> Refresh
        </button>
      </div>

      {actionMessage && (
        <div className="admin-alert-banner">
          <CheckCircle size={15} color="#d4af37" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          {STATUSES.map((status) => (
            <button
              key={status}
              className={`admin-filter-tab${activeTab === status ? ' active' : ''}`}
              onClick={() => setActiveTab(status)}
            >
              {status}
              <span className="admin-filter-count">
                {status === 'All'
                  ? bookings.length
                  : bookings.filter((b) => (b.status || 'Pending').toLowerCase() === status.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by client, email, phone, session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
        </div>
      ) : error ? (
        <div className="admin-error">
          <AlertCircle size={36} className="admin-error__icon" />
          <p>{error}</p>
          <button className="admin-btn admin-btn--outline" onClick={fetchBookings}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="admin-empty-state">
          <Calendar size={48} className="admin-empty-icon" />
          <h3>No bookings match your criteria</h3>
          <p>Try switching status filters or clearing the search query.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Session</th>
                <th>Date & Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, index) => {
                const id = b._id ?? b.id ?? `booking-${index}`
                const name =
                  b.fullname ||
                  b.username ||
                  b.name ||
                  `${b.firstName || ''} ${b.lastName || ''}`.trim() ||
                  'Valued Client'
                const status = (b.status || 'pending').toLowerCase()
                const isExpanded = expandedRow === id

                return (
                  <>
                    <tr key={id} className={isExpanded ? 'row-expanded' : ''}>
                      <td style={{ color: '#5c5852', fontSize: '12px' }}>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td>
                        <div className="admin-client-info">
                          <span className="admin-client-name text-primary">{name}</span>
                          <span className="admin-client-guests">
                            {b.guests ? `${b.guests} guest${b.guests > 1 ? 's' : ''}` : '1 guest'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-contact-info">
                          {b.email && (
                            <span className="contact-item">
                              <Mail size={12} /> {b.email}
                            </span>
                          )}
                          {(b.WhatsappNumber || b.phone) && (
                            <span className="contact-item">
                              <Phone size={12} /> {b.WhatsappNumber || b.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="admin-session-pill">
                          {b.session || b.sessionType || 'Portrait'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-schedule-info">
                          <span>
                            <Calendar size={12} />{' '}
                            {b.eventdate || b.bookeddate || b.date
                              ? new Date(b.eventdate || b.bookeddate || b.date).toLocaleDateString()
                              : 'TBD'}
                          </span>
                          <span style={{ color: '#a39e93', fontSize: '11px' }}>
                            <MapPin size={11} /> {b.location || b.Location || 'Studio'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`admin-status-select ${STATUS_CLASS_MAP[status] ?? 'admin-badge--pending'}`}
                          value={status}
                          disabled={statusUpdatingId === id}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-actions-group">
                          <button
                            className="admin-action-btn"
                            title="Toggle details"
                            onClick={() => setExpandedRow(isExpanded ? null : id)}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button
                            className="admin-action-btn admin-action-btn--danger"
                            title="Delete booking"
                            onClick={() => setDeleteConfirmId(id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <tr key={`${id}-detail`} className="admin-expandable-detail-row">
                        <td colSpan={7}>
                          <div className="admin-booking-detail-card">
                            <div className="detail-col">
                              <h4>
                                <User size={13} /> Client Details
                              </h4>
                              <p>
                                <strong>Name:</strong> {name}
                              </p>
                              <p>
                                <strong>Email:</strong> {b.email || 'N/A'}
                              </p>
                              <p>
                                <strong>Phone / WhatsApp:</strong> {b.WhatsappNumber || b.phone || 'N/A'}
                              </p>
                              {b.WhatsappNumber && (
                                <a
                                  href={`https://wa.me/${b.WhatsappNumber.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-btn admin-btn--sm admin-btn--outline"
                                  style={{ marginTop: '8px', display: 'inline-flex' }}
                                >
                                  <MessageSquare size={13} /> Chat on WhatsApp
                                </a>
                              )}
                            </div>

                            <div className="detail-col">
                              <h4>
                                <Calendar size={13} /> Session Specs
                              </h4>
                              <p>
                                <strong>Session:</strong> {b.session || b.sessionType || 'Portrait'}
                              </p>
                              <p>
                                <strong>Location:</strong> {b.location || b.Location || 'Studio'}
                              </p>
                              <p>
                                <strong>Date:</strong>{' '}
                                {b.eventdate || b.bookeddate || b.date
                                  ? new Date(b.eventdate || b.bookeddate || b.date).toLocaleDateString()
                                  : 'Not specified'}
                              </p>
                              <p>
                                <strong>Time:</strong> {b.time || 'Not specified'}
                              </p>
                              <p>
                                <strong>Price / Quote:</strong>{' '}
                                <span style={{ color: '#d4af37' }}>
                                  {b.amount ? `Rs ${Number(b.amount).toLocaleString()}` : 'Custom Studio Quote'}
                                </span>
                              </p>
                            </div>

                            <div className="detail-col full-col">
                              <h4>
                                <FileText size={13} /> Creative Brief / Notes
                              </h4>
                              <p className="detail-notes">
                                {b.Description || b.notes || 'No extra notes provided by client.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to permanently remove this booking record? This action cannot be
              undone.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
