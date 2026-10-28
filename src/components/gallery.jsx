
import { useCallback, useEffect, useMemo, useState } from 'react';
import './gallery.css';

const API_URL = 'http://localhost:5500/api/v1/gallery';

function getPhotoTitle(photo) {
  if (photo.title?.trim()) return photo.title.trim();

  return photo.category
    ? `${photo.category.charAt(0).toUpperCase()}${photo.category.slice(1)}`
    : 'Untitled photograph';
}

function formatCategory(category = '') {
  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch every page provided by the API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadGallery() {
      setLoading(true);
      setError('');

      try {
        const firstResponse = await fetch(
          `${API_URL}?page=1`,
          { signal: controller.signal }
        );

        if (!firstResponse.ok) {
          throw new Error(`Gallery request failed (${firstResponse.status})`);
        }

        const firstData = await firstResponse.json();
        const allPhotos = [...(firstData.photos ?? [])];
        const totalPages = Math.max(1, Number(firstData.pages) || 1);

        for (let page = 2; page <= totalPages; page++) {
          const response = await fetch(
            `${API_URL}?page=${page}`,
            { signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error(`Could not load gallery page ${page}`);
          }

          const data = await response.json();
          allPhotos.push(...(data.photos ?? []));
        }

        // Newest photographs first.
        allPhotos.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        setPhotos(allPhotos);
        setCategories(
          [...new Set([
            ...(firstData.categories ?? []),
            ...allPhotos.map((photo) => photo.category).filter(Boolean),
          ])].sort((a, b) => a.localeCompare(b))
        );
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load the gallery.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => controller.abort();
  }, []);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;

    return photos.filter(
      (photo) =>
        photo.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [photos, activeCategory]);

  const openPhoto = (photo) => setActivePhoto(photo);
  const closePhoto = () => setActivePhoto(null);

  const navigatePhoto = useCallback((direction) => {
    setActivePhoto((current) => {
      if (!current || filteredPhotos.length < 2) return current;

      const index = filteredPhotos.findIndex(
        (photo) => photo._id === current._id
      );

      if (index < 0) return current;

      const nextIndex =
        (index + direction + filteredPhotos.length) %
        filteredPhotos.length;

      return filteredPhotos[nextIndex];
    });
  }, [filteredPhotos]);

  // Lightbox keyboard controls.
  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePhoto();
      if (event.key === 'ArrowRight') navigatePhoto(1);
      if (event.key === 'ArrowLeft') navigatePhoto(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhoto, navigatePhoto]);

  return (
    <section id="work" className="gallery-section">
      <div className="gallery-inner">

        <header className="gallery-header">
          <div className="gallery-heading-copy">
          

            <h2 className="gallery-title" id="gallery-title">
              Stories in <span className="gold-accent">frames.</span>
            </h2>

            <p className="gallery-subtitle">
              Photography and film shaped by real moments,
              thoughtful light, and a cinematic point of view.
            </p>
          </div>

         
        </header>

        {!loading && !error && categories.length > 0 && (
          <nav className="gallery-filters" aria-label="Filter photographs">
            <button
              type="button"
              className={`gallery-filter ${
                activeCategory === 'all' ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory('all')}
            >
              All work
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`gallery-filter ${
                  activeCategory === category ? 'is-active' : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {formatCategory(category)}
              </button>
            ))}
          </nav>
        )}

        {loading && (
          <div className="gallery-status" role="status">
            <span className="gallery-spinner" />
            <p>Developing the collection...</p>
          </div>
        )}

        {!loading && error && (
          <div className="gallery-status gallery-error" role="alert">
            <p>We couldn't load the photographs.</p>
            <span>{error}</span>
            <button
              type="button"
              className="gallery-retry"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="gallery-status">
            <p>
              {photos.length === 0
                ? 'The collection is being prepared.'
                : 'No photographs in this category yet.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="gallery-grid" aria-labelledby="gallery-title">
            {filteredPhotos.map((photo, index) => (
              <button
                type="button"
                key={photo._id}
                className={`gallery-item gallery-item--${index % 6}`}
                onClick={() => openPhoto(photo)}
                aria-label={`View ${getPhotoTitle(photo)}`}
              >
                <div className="gallery-image-wrapper">
                  <img
                    src={photo.url}
                    alt={getPhotoTitle(photo)}
                    className="gallery-img"
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                  />

                  <span
                    className="gallery-item-overlay"
                    aria-hidden="true"
                  />

                  <span className="gallery-photo-info">
                    <span className="gallery-photo-category">
                      {formatCategory(photo.category)}
                    </span>
                    <span className="gallery-photo-title">
                      {getPhotoTitle(photo)}
                    </span>
                  </span>

                  <span className="gallery-hover-icon" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activePhoto && (
        <div
          className="lightbox-overlay"
          onClick={closePhoto}
          role="presentation"
        >
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={closePhoto}
            aria-label="Close viewer"
          >
            ×
          </button>

          {filteredPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--prev"
                onClick={(event) => {
                  event.stopPropagation();
                  navigatePhoto(-1);
                }}
                aria-label="Previous photograph"
              >
                ‹
              </button>

              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--next"
                onClick={(event) => {
                  event.stopPropagation();
                  navigatePhoto(1);
                }}
                aria-label="Next photograph"
              >
                ›
              </button>
            </>
          )}

          <div
            className="lightbox-content-wrapper"
            role="dialog"
            aria-modal="true"
            aria-label={getPhotoTitle(activePhoto)}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lightbox-image-column">
              <img
                src={activePhoto.url}
                alt={getPhotoTitle(activePhoto)}
                className="lightbox-img"
              />
            </div>

            <div className="lightbox-details-column">
              <span className="lightbox-category">
                {formatCategory(activePhoto.category)}
              </span>

              <h3 className="lightbox-title">
                {getPhotoTitle(activePhoto)}
              </h3>

              {activePhoto.createdAt && (
                <span className="lightbox-year">
                  {new Date(activePhoto.createdAt).getFullYear()}
                </span>
              )}

              <div className="lightbox-divider" />

              <p className="lightbox-description">
                {activePhoto.title?.trim()
                  ? activePhoto.title
                  : 'A moment captured through a cinematic eye.'}
              </p>

              <button
                type="button"
                className="lightbox-cta-btn"
                onClick={closePhoto}
              >
                Close viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
