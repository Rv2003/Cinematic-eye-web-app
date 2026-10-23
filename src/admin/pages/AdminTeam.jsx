import { useState } from 'react'
import {
  Users,
  Edit2,
  Check,
  Info,
  UserCheck,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react'

const InstagramIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const INITIAL_TEAM = [
  { id: 1, name: 'Rusiru', role: 'Founder & Lead Photographer', instagram: 'https://instagram.com/' },
  { id: 2, name: 'Team Member', role: 'Cinematographer', instagram: 'https://instagram.com/' },
  { id: 3, name: 'Team Member', role: 'Editor & Colourist', instagram: 'https://instagram.com/' },
  { id: 4, name: 'Team Member', role: 'Studio Coordinator', instagram: '' },
]

export function AdminTeam() {
  const [team, setTeam] = useState(INITIAL_TEAM)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '', instagram: '' })
  const [notice, setNotice] = useState(null)

  function startEdit(member) {
    setEditingId(member.id)
    setEditForm({ name: member.name, role: member.role, instagram: member.instagram })
  }

  function saveEdit(id) {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...editForm } : m))
    )
    setEditingId(null)
    showNotice('Member details updated in preview.')
  }

  function deleteMember(id) {
    if (!window.confirm('Remove this member from active team roster?')) return
    setTeam((prev) => prev.filter((m) => m.id !== id))
    showNotice('Member removed from active roster.')
  }

  function addMember() {
    const newId = Date.now()
    const newMember = {
      id: newId,
      name: 'New Artist',
      role: 'Cinematographer',
      instagram: '',
    }
    setTeam((prev) => [...prev, newMember])
    startEdit(newMember)
  }

  function showNotice(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  const initials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Studio Personnel</p>
          <h2 className="admin-section-title">Team Roster</h2>
        </div>
        <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addMember}>
          <Plus size={15} /> Add Team Member
        </button>
      </div>

      {notice && (
        <div className="admin-alert-banner">
          <Check size={15} color="#d4af37" />
          <span>{notice}</span>
        </div>
      )}

      {/* Info notice about static file */}
      <div className="admin-info-banner">
        <Info size={18} className="admin-info-icon" />
        <div>
          <strong>Codebase Synchronization:</strong>
          <p>
            The production team section on the homepage is rendered via{' '}
            <code>src/components/members.jsx</code>. Changes made here preview the studio crew and allow
            exporting or updating your team roster.
          </p>
        </div>
      </div>

      <div className="admin-team-grid">
        {team.map((member, index) => {
          const isEditing = editingId === member.id

          return (
            <div key={member.id} className="admin-team-card">
              <div className="admin-team-card-header">
                <span className="admin-team-card-idx">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <div className="admin-team-card-actions">
                  <button
                    className="admin-action-btn"
                    title={isEditing ? 'Cancel Edit' : 'Edit Member'}
                    onClick={() => (isEditing ? setEditingId(null) : startEdit(member))}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn--danger"
                    title="Remove Member"
                    onClick={() => deleteMember(member.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="admin-team-avatar">
                <span>{initials(member.name || 'CE')}</span>
              </div>

              {isEditing ? (
                <div className="admin-team-edit-form">
                  <div className="admin-form-group">
                    <label className="admin-label">Full Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Studio Role</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Instagram Link</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="https://instagram.com/handle"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                    />
                  </div>

                  <button
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => saveEdit(member.id)}
                  >
                    <Check size={14} /> Save Changes
                  </button>
                </div>
              ) : (
                <div className="admin-team-details">
                  <h3 className="admin-team-name">{member.name}</h3>
                  <p className="admin-team-role">{member.role}</p>
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-team-social"
                    >
                      <InstagramIcon /> View Instagram
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
