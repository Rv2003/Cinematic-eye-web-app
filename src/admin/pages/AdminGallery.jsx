
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  Pencil,
} from 'lucide-react';

const API_URL = 'http://localhost:5500/api/v1/gallery';

const DEFAULT_CATEGORIES = [
  'Portrait',
  'Graduation',
  'Events',
  'Film',
];

const getPhotoId = (photo) => photo._id;

const getPhotoUrl = (photo) =>
  photo.url || photo.src || photo.imageUrl || photo.image || '';

const formatCategory = (value = '') =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function AdminGallery({ token }) {
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Events');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Events');
  const [isSaving, setIsSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const sortItems = useCallback((items, method) => {
    return [...items].sort((a, b) => {
      if (method === 'newest') {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      if (method === 'oldest') {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }

      if (method === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }

      return 0;
    });
  }, []);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL, {
        timeout: 10000,
      });

      const data = response.data;

      // API response: { photos, categories, page, pages, total }
      const photos = Array.isArray(data.photos)
        ? data.photos
        : Array.isArray(data.data?.photos)
          ? data.data.photos
          : [];

      setGalleryItems(sortItems(photos, sortBy));

      if (Array.isArray(data.categories)) {
        setCategories((previous) => [
          ...new Set([...DEFAULT_CATEGORIES, ...data.categories]),
        ]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load gallery.'
      );
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortItems]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    setGalleryItems((previous) => sortItems(previous, sortBy));
  }, [sortBy, sortItems]);

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(null), 3500);
  }

  function resetUploadForm() {
    setFiles([]);
    setPreviewUrls([]);
    setTitle('');
    setCategory('Events');
    setUploadError(null);
  }

  function closeUploadModal() {
    setShowUploadModal(false);
    resetUploadForm();
  }

  function handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 20) {
      setUploadError('You can upload a maximum of 20 images at once.');
      event.target.value = '';
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith('image/')
    );

    if (invalidFile) {
      setUploadError('Please select image files only.');
      event.target.value = '';
      return;
    }

    setUploadError(null);
    setFiles(selectedFiles);

    setPreviewUrls(
      selectedFiles.map((file) => URL.createObjectURL(file))
    );
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!token) {
      setUploadError('Please log in with an admin account.');
      return;
    }

    if (files.length === 0) {
      setUploadError('Please select at least one image.');
      return;
    }

    if (!category.trim()) {
      setUploadError('Category is required.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();

      // Must match upload.array("images", 20)
      files.forEach((file) => {
        formData.append('images', file);
      });

      formData.append('category', category.trim());

      if (title.trim()) {
        formData.append('title', title.trim());
      }

      await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 120000,
      });

      closeUploadModal();
      await fetchGallery();

      showSuccess(
        `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully.`
      );
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          err.message ||
          'Upload failed.'
      );
    } finally {
      setIsUploading(false);
    }
  }

  function openEditModal(photo) {
    setEditingPhoto(photo);
    setEditTitle(photo.title || '');
    setEditCategory(photo.category || 'Events');
  }

  function closeEditModal() {
    setEditingPhoto(null);
    setEditTitle('');
    setEditCategory('Events');
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!token || !editingPhoto) return;

    setIsSaving(true);

    try {
      const id = getPhotoId(editingPhoto);

      // PATCH /api/v1/gallery/:id
      await axios.patch(
        `${API_URL}/${id}`,
        {
          title: editTitle.trim(),
          category: editCategory,
        },
        authConfig
      );

      closeEditModal();
      await fetchGallery();
      showSuccess('Photograph updated successfully.');
    } catch (err) {
      showSuccess(
        err.response?.data?.message || 'Failed to update photograph.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(photo) {
    const id = getPhotoId(photo);

    if (!id) {
      showSuccess('Cannot delete: photo ID is missing.');
      return;
    }

    if (
      !window.confirm(
        `Delete "${photo.title || 'this photograph'}" permanently?`
      )
    ) {
      return;
    }

    try {
      // DELETE /api/v1/gallery/:id
      await axios.delete(`${API_URL}/${id}`, authConfig);

      setGalleryItems((previous) =>
        previous.filter((item) => getPhotoId(item) !== id)
      );

      showSuccess('Photograph deleted successfully.');
    } catch (err) {
      showSuccess(
        err.response?.data?.message || 'Failed to delete photograph.'
      );
    }
  }

  const filteredItems = galleryItems.filter((item) => {
    if (selectedCategory === 'All') return true;

    return (
      (item.category || '').toLowerCase() ===
      selectedCategory.toLowerCase()
    );
  });

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-eyebrow">Portfolio & Showcase</p>
          <h2 className="admin-section-title">Gallery Manager</h2>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="admin-btn admin-btn--outline admin-btn--sm"
            onClick={fetchGallery}
            disabled={loading}
            title="Refresh gallery"
          >
            <RefreshCw
              size={14}
              className={loading ? 'admin-spin' : ''}
            />
          </button>

          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={15} /> Upload Media
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="admin-alert-banner" role="status">
          <CheckCircle size={15} color="#d4af37" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          {['All', ...categories].map((cat) => (
            <button
              type="button"
              key={cat}
              className={`admin-filter-tab${
                selectedCategory === cat ? ' active' : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              <span className="admin-filter-count">
                {cat === 'All'
                  ? galleryItems.length
                  : galleryItems.filter(
                      (item) =>
                        (item.category || '').toLowerCase() ===
                        cat.toLowerCase()
                    ).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#5c5852',
              letterSpacing: '0.1em',
            }}
          >
            <ArrowUpDown
              size={12}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />
            Sort:
          </span>

          <select
            className="admin-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-spinner-wrap">
          <div className="admin-spinner" />
        </div>
      ) : error ? (
        <div className="admin-error" role="alert">
          <AlertCircle size={36} className="admin-error__icon" />
          <p>{error}</p>
          <button
            type="button"
            className="admin-btn admin-btn--outline"
            onClick={fetchGallery}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-empty-state">
          <Image size={48} className="admin-empty-icon" />
          <h3>No photographs found</h3>
          <p>Upload photographs to add them to your collection.</p>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={14} /> Upload Image
          </button>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {filteredItems.map((item) => (
            <div key={getPhotoId(item)} className="admin-gallery-card">
              <div className="admin-gallery-thumb-wrap">
                <img
                  src={getPhotoUrl(item)}
                  alt={item.title || 'Gallery photograph'}
                  loading="lazy"
                />

                <span className="admin-gallery-category-badge">
                  {formatCategory(item.category || 'Visual')}
                </span>

                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    display: 'flex',
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    className="admin-gallery-delete-btn"
                    title="Edit photograph"
                    aria-label="Edit photograph"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    className="admin-gallery-delete-btn"
                    title="Delete photograph"
                    aria-label="Delete photograph"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="admin-gallery-card-body">
                <h4 className="admin-gallery-card-title">
                  {item.title || 'Untitled Work'}
                </h4>
                <span className="admin-gallery-card-date">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card admin-modal-card--lg">
            <div className="admin-modal-header">
              <h3>Upload Gallery Media</h3>
              <button
                type="button"
                className="admin-close-btn"
                onClick={closeUploadModal}
                aria-label="Close upload modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              {uploadError && (
                <div className="admin-form-error" role="alert">
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="gallery-files">
                  Images (up to 20)
                </label>

                <input
                  id="gallery-files"
                  type="file"
                  accept="image/*"
                  multiple
                  className="admin-input"
                  onChange={handleFileSelect}
                />

                {files.length > 0 && (
                  <p>{files.length} image(s) selected</p>
                )}

                <div className="admin-upload-previews">
                  {previewUrls.map((url, index) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Selected preview ${index + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        margin: 4,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="gallery-title">
                  Title / Caption
                </label>
                <input
                  id="gallery-title"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Graduation Day"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="gallery-category">
                  Category
                </label>
                <select
                  id="gallery-category"
                  className="admin-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                >
                  {[...new Set([...categories, category])].map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={closeUploadModal}
                  disabled={isUploading}
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
                      <RefreshCw size={14} className="admin-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload Images
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingPhoto && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Edit Photograph</h3>
              <button
                type="button"
                className="admin-close-btn"
                onClick={closeEditModal}
                aria-label="Close edit modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="edit-photo-title">
                  Title
                </label>
                <input
                  id="edit-photo-title"
                  type="text"
                  className="admin-input"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="edit-photo-category">
                  Category
                </label>
                <select
                  id="edit-photo-category"
                  className="admin-select"
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  required
                >
                  {[...new Set([...categories, editCategory])].map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminGallery;
