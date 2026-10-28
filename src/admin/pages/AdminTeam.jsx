import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  Users,
  Edit2,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  ImagePlus,
} from 'lucide-react'

const API_URL = 'http://localhost:5500/api/v1/members'
const DRAFT_PREFIX = 'draft-'
const MAX_PHOTO_DATA_URI_SIZE = 70 * 1024
const CROP_OUTPUT_SIZE = 1200

function getMembers(responseData) {
  const data = responseData?.data
  const members = Array.isArray(data)
    ? data
    : Array.isArray(data?.members)
      ? data.members
      : Array.isArray(responseData?.members)
        ? responseData.members
        : null

  if (!members) {
    throw new Error('The members response did not contain a member list.')
  }

  return members
}

function getMemberId(member) {
  return member._id ?? member.id
}

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

export function AdminTeam({ token }) {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    instagram: '',
    photo: '',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [cropImageUrl, setCropImageUrl] = useState('')
  const [cropImageDimensions, setCropImageDimensions] = useState(null)
  const [cropStageSize, setCropStageSize] = useState(320)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [cropError, setCropError] = useState('')
  const [processingCrop, setProcessingCrop] = useState(false)
  const cropImageRef = useRef(null)
  const cropStageRef = useRef(null)
  const cropUrlRef = useRef('')
  const dragStartRef = useRef(null)

  useEffect(() => () => {
    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
  }, [])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(API_URL, { timeout: 10000 })
      setTeam(getMembers(response.data))
      return true
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to load team members.'
      )
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialMembers() {
      try {
        const response = await axios.get(API_URL, { timeout: 10000 })
        const members = getMembers(response.data)
        if (!cancelled) setTeam(members)
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Unable to load team members.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialMembers()
    return () => {
      cancelled = true
    }
  }, [])

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  function startEdit(member) {
    setEditingId(getMemberId(member))
    setEditForm({
      name: member.name || '',
      role: member.role || '',
      instagram: member.instagram || '',
      photo: member.photo || '',
    })
    setError('')
  }

  function cancelEdit(member) {
    const id = getMemberId(member)
    if (member._isDraft) {
      setTeam((previous) => previous.filter((item) => getMemberId(item) !== id))
    }
    setEditingId(null)
    setEditForm({ name: '', role: '', instagram: '', photo: '' })
  }

  async function handlePhotoSelect(event) {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ''

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the member photo.')
      return
    }

    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    const imageUrl = URL.createObjectURL(file)
    cropUrlRef.current = imageUrl
    setCropImageUrl(imageUrl)
    setCropImageDimensions(null)
    setCropStageSize(320)
    setCropZoom(1)
    setCropOffset({ x: 0, y: 0 })
    setCropError('')
    setError('')
  }

  function closeCrop() {
    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    cropUrlRef.current = ''
    setCropImageUrl('')
    setCropImageDimensions(null)
    setCropError('')
    setProcessingCrop(false)
    dragStartRef.current = null
  }

  function clampCropOffset(offset, zoom = cropZoom) {
    const stageSize = cropStageRef.current?.getBoundingClientRect().width || 320
    const dimensions = cropImageDimensions
    if (!dimensions) return offset

    const coverScale = Math.max(
      stageSize / dimensions.width,
      stageSize / dimensions.height
    )
    const maxX = Math.max(0, (dimensions.width * coverScale * zoom - stageSize) / 2)
    const maxY = Math.max(0, (dimensions.height * coverScale * zoom - stageSize) / 2)

    return {
      x: Math.max(-maxX, Math.min(maxX, offset.x)),
      y: Math.max(-maxY, Math.min(maxY, offset.y)),
    }
  }

  function handleCropPointerDown(event) {
    if (!cropImageDimensions) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    }
  }

  function handleCropPointerMove(event) {
    if (!dragStartRef.current) return
    setCropOffset(clampCropOffset({
      x: dragStartRef.current.offsetX + event.clientX - dragStartRef.current.pointerX,
      y: dragStartRef.current.offsetY + event.clientY - dragStartRef.current.pointerY,
    }))
  }

  function handleCropPointerUp(event) {
    dragStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  async function saveCroppedPhoto() {
    const image = cropImageRef.current
    const stageSize = cropStageRef.current?.getBoundingClientRect().width
    if (!image || !stageSize || !cropImageDimensions) {
      setCropError('Wait for the photo to finish loading before cropping.')
      return
    }

    setProcessingCrop(true)
    setCropError('')

    try {
      const coverScale = Math.max(
        stageSize / cropImageDimensions.width,
        stageSize / cropImageDimensions.height
      )
      const sourceScale = coverScale * cropZoom
      const sourceSize = stageSize / sourceScale
      const sourceX = Math.max(
        0,
        Math.min(
          cropImageDimensions.width - sourceSize,
          (cropImageDimensions.width - sourceSize) / 2 - cropOffset.x / sourceScale
        )
      )
      const sourceY = Math.max(
        0,
        Math.min(
          cropImageDimensions.height - sourceSize,
          (cropImageDimensions.height - sourceSize) / 2 - cropOffset.y / sourceScale
        )
      )
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Your browser could not prepare the cropped photo.')

      let outputSize = CROP_OUTPUT_SIZE
      let photo = ''
      while (outputSize >= 128) {
        canvas.width = outputSize
        canvas.height = outputSize
        context.clearRect(0, 0, outputSize, outputSize)
        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          outputSize,
          outputSize
        )

        for (const quality of [0.84, 0.72, 0.6, 0.48, 0.36]) {
          photo = canvas.toDataURL('image/jpeg', quality)
          if (photo.length <= MAX_PHOTO_DATA_URI_SIZE) break
        }
        if (photo.length <= MAX_PHOTO_DATA_URI_SIZE) break
        outputSize = Math.floor(outputSize * 0.8)
      }

      if (!photo || photo.length > MAX_PHOTO_DATA_URI_SIZE) {
        throw new Error('This image could not be compressed enough. Try a simpler or smaller image.')
      }

      setEditForm((previous) => ({ ...previous, photo }))
      closeCrop()
      showNotice('Photo cropped and compressed for reliable upload.')
    } catch (cropFailure) {
      setCropError(cropFailure.message || 'Unable to crop this photo.')
      setProcessingCrop(false)
    }
  }

  async function saveEdit(member) {
    const id = getMemberId(member)
    const payload = {
      name: editForm.name.trim(),
      role: editForm.role.trim(),
      instagram: editForm.instagram.trim(),
    }
    if (member._isDraft || editForm.photo !== (member.photo || '')) {
      payload.photo = editForm.photo
    }

    if (!payload.name || !payload.role) {
      setError('Name and role are required.')
      return
    }
    if (!token) {
      setError('Your admin session is missing. Please sign in again.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const authConfig = {
        headers: { Authorization: `Bearer ${token}` },
      }

      if (member._isDraft) {
        await axios.post(API_URL, payload, authConfig)
      } else {
        await axios.patch(`${API_URL}/${id}`, payload, authConfig)
      }

      setEditingId(null)
      setEditForm({ name: '', role: '', instagram: '', photo: '' })
      const refreshed = await fetchMembers()
      showNotice(
        refreshed
          ? member._isDraft
            ? 'Team member added successfully.'
            : 'Member details updated successfully.'
          : 'Changes saved, but the roster could not be refreshed.'
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to save member details.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteMember(member) {
    const id = getMemberId(member)

    if (member._isDraft) {
      cancelEdit(member)
      return
    }
    if (!id) {
      setError('Cannot remove this member because its ID is missing.')
      return
    }
    if (!window.confirm(`Remove ${member.name || 'this member'} from the team?`)) {
      return
    }
    if (!token) {
      setError('Your admin session is missing. Please sign in again.')
      return
    }

    setDeletingId(id)
    setError('')
    setNotice('')

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTeam((previous) =>
        previous.filter((item) => getMemberId(item) !== id)
      )
      if (editingId === id) setEditingId(null)
      showNotice('Team member removed successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to remove team member.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  function addMember() {
    if (team.some((member) => member._isDraft)) return

    const draft = {
      id: `${DRAFT_PREFIX}${Date.now()}`,
      name: '',
      role: '',
      instagram: '',
      _isDraft: true,
    }
    setTeam((previous) => [...previous, draft])
    setEditingId(draft.id)
    setEditForm({ name: '', role: '', instagram: '', photo: '' })
    setError('')
  }

  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CE'

  const cropImageStyle = cropImageDimensions
    ? (() => {
        const coverScale = Math.max(
          cropStageSize / cropImageDimensions.width,
          cropStageSize / cropImageDimensions.height
        )
        return {
          width: cropImageDimensions.width * coverScale,
          height: cropImageDimensions.height * coverScale,
          transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`,
        }
      })()
    : undefined

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Studio Personnel</p>
          <h2 className="admin-section-title">Team Roster</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="admin-btn admin-btn--sm"
            onClick={fetchMembers}
            disabled={loading || saving}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={addMember}
            disabled={team.some((member) => member._isDraft) || saving}
          >
            <Plus size={15} /> Add Team Member
          </button>
        </div>
      </div>

      {notice && (
        <div className="admin-alert-banner">
          <Check size={15} color="#d4af37" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="admin-alert-banner" role="alert">
          <AlertCircle size={15} color="#e55353" />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-info-banner">
        <Users size={18} className="admin-info-icon" />
        <div>
          <strong>Live team roster</strong>
          <p>Changes made here are saved to the studio team API.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-info-banner" role="status">
          <RefreshCw size={18} className="admin-info-icon" />
          <div><p>Loading team members...</p></div>
        </div>
      ) : team.length === 0 ? (
        <div className="admin-info-banner">
          <Users size={18} className="admin-info-icon" />
          <div><p>No team members yet. Add one to get started.</p></div>
        </div>
      ) : (
        <div className="admin-team-grid">
          {team.map((member, index) => {
            const id = getMemberId(member)
            const isEditing = editingId === id
            const isDeleting = deletingId === id

            return (
              <div key={id} className="admin-team-card">
                <div className="admin-team-card-header">
                  <span className="admin-team-card-idx">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="admin-team-card-actions">
                    {isEditing ? (
                      <button
                        className="admin-action-btn"
                        title="Cancel Edit"
                        onClick={() => cancelEdit(member)}
                        disabled={saving}
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <button
                        className="admin-action-btn"
                        title="Edit Member"
                        onClick={() => startEdit(member)}
                        disabled={saving || Boolean(editingId)}
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button
                      className="admin-action-btn admin-action-btn--danger"
                      title="Remove Member"
                      onClick={() => deleteMember(member)}
                      disabled={saving || isDeleting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="admin-team-avatar">
                  {(isEditing ? editForm.photo : member.photo) ? (
                    <img
                      src={isEditing ? editForm.photo : member.photo}
                      alt={`${isEditing ? editForm.name : member.name || 'Team member'} photo`}
                    />
                  ) : (
                    <span>{initials(isEditing ? editForm.name : member.name)}</span>
                  )}
                </div>

                {isEditing ? (
                  <div className="admin-team-edit-form">
                    <div className="admin-form-group">
                      <label className="admin-label" htmlFor={`member-name-${id}`}>Full Name</label>
                      <input
                        id={`member-name-${id}`}
                        type="text"
                        className="admin-input"
                        value={editForm.name}
                        onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label" htmlFor={`member-role-${id}`}>Studio Role</label>
                      <input
                        id={`member-role-${id}`}
                        type="text"
                        className="admin-input"
                        value={editForm.role}
                        onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label" htmlFor={`member-instagram-${id}`}>Instagram Link</label>
                      <input
                        id={`member-instagram-${id}`}
                        type="url"
                        className="admin-input"
                        placeholder="https://instagram.com/handle"
                        value={editForm.instagram}
                        onChange={(event) => setEditForm({ ...editForm, instagram: event.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label" htmlFor={`member-photo-${id}`}>
                        <ImagePlus size={14} /> Member Photo
                      </label>
                      <input
                        id={`member-photo-${id}`}
                        type="file"
                        className="admin-input admin-team-photo-input"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        disabled={saving}
                      />
                      <span className="admin-team-photo-help">
                        Choose a crop for every photo. Images are compressed before upload to keep the request small.
                      </span>
                      {editForm.photo && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm"
                          onClick={() => {
                            setEditForm((previous) => ({ ...previous, photo: '' }))
                          }}
                          disabled={saving}
                        >
                          <X size={14} /> Remove Photo
                        </button>
                      )}
                    </div>

                    <button
                      className="admin-btn admin-btn--primary admin-btn--sm"
                      style={{ width: '100%', marginTop: '8px' }}
                      onClick={() => saveEdit(member)}
                      disabled={saving}
                    >
                      {saving ? <RefreshCw size={14} /> : <Check size={14} />}
                      {saving ? 'Saving...' : 'Save Changes'}
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
                    {isDeleting && <p className="admin-team-role">Removing...</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {cropImageUrl && (
        <div className="admin-team-crop-overlay" role="presentation">
          <section
            className="admin-team-crop-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-crop-title"
          >
            <header className="admin-team-crop-header">
              <div>
                <p className="admin-section-eyebrow">Photo too large</p>
                <h3 id="team-crop-title">Crop member photo</h3>
              </div>
              <button
                type="button"
                className="admin-action-btn"
                aria-label="Cancel photo crop"
                onClick={closeCrop}
                disabled={processingCrop}
              >
                <X size={16} />
              </button>
            </header>

            <p className="admin-team-crop-copy">
              Drag the image to choose the crop, then adjust the zoom. We’ll save a compressed square photo to avoid oversized requests.
            </p>

            <div
              ref={cropStageRef}
              className={`admin-team-crop-stage ${cropImageDimensions ? 'is-ready' : ''}`}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
            >
              <img
                ref={cropImageRef}
                src={cropImageUrl}
                alt="Position the image within the square crop area"
                draggable="false"
                onLoad={(event) => {
                  setCropImageDimensions({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                  setCropStageSize(
                    cropStageRef.current?.getBoundingClientRect().width || 320
                  )
                  setCropOffset({ x: 0, y: 0 })
                  setCropZoom(1)
                }}
                onError={() => setCropError('Could not open this image. Choose a different photo.')}
                style={cropImageStyle}
              />
              {!cropImageDimensions && <span>Loading photo...</span>}
              <div className="admin-team-crop-frame" aria-hidden="true" />
            </div>

            <label className="admin-team-crop-zoom" htmlFor="team-photo-zoom">
              <span>Zoom</span>
              <input
                id="team-photo-zoom"
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={cropZoom}
                onChange={(event) => {
                  const zoom = Number(event.target.value)
                  setCropZoom(zoom)
                  setCropOffset((offset) => clampCropOffset(offset, zoom))
                }}
                disabled={!cropImageDimensions || processingCrop}
              />
              <span>{cropZoom.toFixed(1)}×</span>
            </label>

            {cropError && (
              <p className="admin-team-crop-error" role="alert">{cropError}</p>
            )}

            <footer className="admin-team-crop-actions">
              <button
                type="button"
                className="admin-btn admin-btn--sm"
                onClick={closeCrop}
                disabled={processingCrop}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--sm"
                onClick={saveCroppedPhoto}
                disabled={!cropImageDimensions || processingCrop}
              >
                {processingCrop ? <RefreshCw size={14} /> : <Check size={14} />}
                {processingCrop ? 'Processing...' : 'Use Cropped Photo'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
