import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Upload,
  Trash2,
  Image,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  ArrowUpDown,
  Sparkles
} from 'lucide-react'

const CATEGORIES = ['All', 'Portrait', 'Graduation', 'Event', 'Film']

export function AdminGallery({ token }) {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest') // Auto-sort newest first

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Portrait')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  function loadCustomItems() {
    try {
      const stored = localStorage.getItem('ce_gallery_custom_items')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveCustomItems(items) {
    try {
      localStorage.setItem('ce_gallery_custom_items', JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('cinematic_gallery_updated'))
    } catch {
      // storage quota or fallback
    }
  }

  async function fetchGallery() {
    setLoading(true)
    setError(null)
    const localItems = loadCustomItems()

    try {
      const res = await axios.get('http://localhost:5500/api/v1/gallery/', { timeout: 2500 })
      const data = res.data?.data?.items ?? res.data?.data ?? res.data ?? []
      const apiItems = Array.isArray(data) ? data : []
      
      const merged = [...localItems, ...apiItems]
      setGalleryItems(sortItems(merged, sortBy))
    } catch (err) {
      // Fallback to local stored items
      setGalleryItems(sortItems(localItems, sortBy))
    } finally {
      setLoading(false)
    }
  }

  function sortItems(list, method) {
    return [...list].sort((a, b) => {
      if (method === 'newest') {
        const timeA = new Date(a.createdAt || a.id || 0).getTime()
        const timeB = new Date(b.createdAt || b.id || 0).getTime()
        return timeB - timeA
      }
      if (method === 'oldest') {
        const timeA = new Date(a.createdAt || a.id || 0).getTime()
        const timeB = new Date(b.createdAt || b.id || 0).getTime()
        return timeA - timeB
      }
      if (method === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }
      return 0
    })
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  useEffect(() => {
    setGalleryItems((prev) => sortItems(prev, sortBy))
  }, [sortBy])

  function handleFileSelect(e) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Read as base64 so it can be previewed and stored persistently
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file && !previewUrl) {
      setUploadError('Please select a photographic image file.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const now = new Date().toISOString()
    const newItem = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Cinematic Still',
      subtitle: subtitle.trim() || `${category} Campaign`,
      category,
      focal: '50mm f/1.4',
      cam: 'Cinematic Camera',
      location: 'Cinematic Eye Studio',
      createdAt: now,
      src: previewUrl,
      imageUrl: previewUrl,
      url: previewUrl,
      featured: true,
    }

    // Try sending to backend
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('title', newItem.title)
      formData.append('category', category)
      formData.append('subtitle', newItem.subtitle)

      await axios.post('http://localhost:5500/api/v1/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 3000,
      })
    } catch (err) {
      // API may be offline; save locally
    }

    // Save locally to persist & auto-sync across app
    const existing = loadCustomItems()
    const updated = [newItem, ...existing]
    saveCustomItems(updated)

    // Auto-sort list immediately with new item at the top
    setGalleryItems((prev) => sortItems([newItem, ...prev], sortBy))
    setShowUploadModal(false)
    resetForm()
    showSuccess('Photograph uploaded & auto-sorted to top of gallery!')
    setIsUploading(false)
  }

  function resetForm() {
    setTitle('')
    setSubtitle('')
    setCategory('Portrait')
    setFile(null)
    setPreviewUrl('')
    setUploadError(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this photograph from the gallery?')) return

    try {
      await axios.delete(`http://localhost:5500/api/v1/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      })
    } catch (err) {
      // continue
    }

    // Remove from local custom storage if present
    const existing = loadCustomItems()
    const updated = existing.filter((item) => (item._id ?? item.id) !== id)
    saveCustomItems(updated)

    setGalleryItems((prev) => prev.filter((item) => (item._id ?? item.id) !== id))
    showSuccess('Photograph removed from gallery.')
  }

  function showSuccess(msg) {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3500)
  }

  const filteredItems = galleryItems.filter((item) => {
    if (selectedCategory === 'All') return true
    return (item.category || '').toLowerCase() === selectedCategory.toLowerCase()
  })

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Portfolio & Showcase</p>
          <h2 className="admin-section-title">Gallery Manager</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="admin-btn admin-btn--outline admin-btn--sm"
            onClick={fetchGallery}
            disabled={loading}
            title="Refresh gallery"
          >
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
          </button>
          <button
            className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={15} /> Upload Media
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="admin-alert-banner">
          <CheckCircle size={15} color="#d4af37" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Tabs & Auto-Sort Controls */}
      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`admin-filter-tab${selectedCategory === cat ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              <span className="admin-filter-count">
                {cat === 'All'
                  ? galleryItems.length
                  : galleryItems.filter((i) => (i.category || '').toLowerCase() === cat.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#5c5852', letterSpacing: '0.1em' }}>
            <ArrowUpDown size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Auto-Sort:
          </span>
          <select
            className="admin-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First (Default)</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
        </div>
      ) : error ? (
        <div className="admin-error">
          <AlertCircle size={36} className="admin-error__icon" />
          <p>{error}</p>
          <button className="admin-btn admin-btn--outline" onClick={fetchGallery}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-empty-state">
          <Image size={48} className="admin-empty-icon" />
          <h3>No gallery photographs found in {selectedCategory}</h3>
          <p>New uploads will automatically appear at the top of the collection.</p>
          <button
            className="admin-btn admin-btn--primary"
            style={{ marginTop: '16px' }}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={14} /> Upload First Image
          </button>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {filteredItems.map((item) => {
            const id = item._id ?? item.id
            const imgUrl = item.src || item.imageUrl || item.url || item.image || '/assets/DSC05561.jpg'
            return (
              <div key={id} className="admin-gallery-card">
                <div className="admin-gallery-thumb-wrap">
                  <img src={imgUrl} alt={item.title || 'Studio Work'} loading="lazy" />
                  <span className="admin-gallery-category-badge">
                    {item.category || 'Visual'}
                  </span>
                  <button
                    className="admin-gallery-delete-btn"
                    title="Delete item"
                    onClick={() => handleDelete(id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="admin-gallery-card-body">
                  <h4 className="admin-gallery-card-title">{item.title || 'Untitled Work'}</h4>
                  <span className="admin-gallery-card-date">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card admin-modal-card--lg">
            <div className="admin-modal-header">
              <h3>Upload Gallery Media</h3>
              <button
                className="admin-close-btn"
                onClick={() => {
                  setShowUploadModal(false)
                  resetForm()
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              {uploadError && (
                <div className="admin-form-error">
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-label">Image File</label>
                <div className="admin-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    id="gallery-file-input"
                    className="admin-file-hidden"
                  />
                  <label htmlFor="gallery-file-input" className="admin-dropzone-label">
                    {previewUrl ? (
                      <div className="admin-dropzone-preview">
                        <img src={previewUrl} alt="Preview" />
                        <span>Click to choose different image</span>
                      </div>
                    ) : (
                      <div className="admin-dropzone-placeholder">
                        <Upload size={32} />
                        <p>Click or drag to select photo</p>
                        <span>JPG, PNG, WEBP high-resolution</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Title / Caption</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Golden Hour Fashion Study"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Subtitle / Sub-theme</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. High Contrast Editorial Film"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Portrait">Portrait</option>
                  <option value="Film">Film</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={14} className="admin-spin" /> Uploading & Auto-sorting...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Complete Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
