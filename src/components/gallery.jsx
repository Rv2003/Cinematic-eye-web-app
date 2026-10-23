import { useCallback, useEffect, useRef, useState } from 'react';
import './gallery.css';

const DEFAULT_CLOUD_NAME = 'kongszas';
const DEFAULT_TAG = 'gallery';
const FADE_MS = 600;

const rand = (n) => Math.floor(Math.random() * n);

export function Gallery({
  cloudName = DEFAULT_CLOUD_NAME,
  tag = DEFAULT_TAG,
  slots = 8,
  animated = true,
  interval = 3500,
  imageWidth = 900,
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slotMap, setSlotMap] = useState([]);
  const [fading, setFading] = useState({});
  const [lightbox, setLightbox] = useState(null);

  const slotMapRef = useRef([]);
  const touchX = useRef(null);
  slotMapRef.current = slotMap;

  /* ----------------------------------------------------
     Fetch and Auto-Sort Images from Cloudinary
     Auto-sorts by created_at (newest uploaded images first)
     ---------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();

    async function loadImages() {
      setLoading(true);
      setError(null);

      try {
        const url = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Failed to load gallery (status ${res.status})`);
        }

        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.resources || [];

        // Auto-sort: Newest uploaded images automatically come first
        const sorted = [...rawList].sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setImages(sorted);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gallery loading error:', err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadImages();
    return () => controller.abort();
  }, [cloudName, tag]);

  const thumbUrl = useCallback(
    (img) =>
      `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_limit,w_${imageWidth}/${img.public_id}.${img.format}`,
    [cloudName, imageWidth]
  );

  const fullUrl = useCallback(
    (img) =>
      `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_limit,w_1920/${img.public_id}.${img.format}`,
    [cloudName]
  );

  /* ----------------------------------------------------
     Assign Slots for the Cinematic Grid
     ---------------------------------------------------- */
  const tileCount = animated ? Math.min(slots, images.length) : images.length;

  useEffect(() => {
    setSlotMap(Array.from({ length: tileCount }, (_, i) => i));
    setFading({});
  }, [images, tileCount]);

  /* ----------------------------------------------------
     Cinematic Dissolve Transition (Auto-Rotate Tiles)
     ---------------------------------------------------- */
  const paused = lightbox !== null;

  useEffect(() => {
    if (!animated || images.length <= tileCount || tileCount < 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timeout;
    let cancelled = false;

    const runSwap = (tile, toIndex) => {
      setFading((f) => ({ ...f, [tile]: true }));

      setTimeout(() => {
        if (cancelled) return;
        setSlotMap((prev) => {
          const next = [...prev];
          next[tile] = toIndex;
          return next;
        });
        setFading((f) => {
          const next = { ...f };
          delete next[tile];
          return next;
        });
      }, FADE_MS);
    };

    const tick = () => {
      if (document.hidden) return;
      const current = slotMapRef.current;
      if (!current.length) return;

      const tile = rand(current.length);
      const offscreen = [];
      images.forEach((_, i) => {
        if (!current.includes(i)) offscreen.push(i);
      });

      if (offscreen.length > 0) {
        const to = offscreen[rand(offscreen.length)];
        const preload = new Image();
        preload.onload = () => {
          if (!cancelled) runSwap(tile, to);
        };
        preload.src = thumbUrl(images[to]);
      }
    };

    const schedule = () => {
      timeout = setTimeout(() => {
        tick();
        schedule();
      }, interval);
    };

    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [animated, images, tileCount, paused, interval, thumbUrl]);

  /* ----------------------------------------------------
     Lightbox Navigation
     ---------------------------------------------------- */
  const go = useCallback(
    (dir) => {
      setLightbox((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (lightbox === null) return;

    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, go]);

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  /* Helper to auto-assign cinematic shape based on aspect ratio */
  const getShape = (img, index) => {
    if (!img) return '';
    const ratio = img.width && img.height ? img.width / img.height : 1.33;
    if (ratio > 1.45 && index % 3 === 0) return ' gx-tile--wide';
    if (ratio < 0.85) return ' gx-tile--tall';
    if (index % 5 === 0) return ' gx-tile--wide';
    return '';
  };

  return (
    <section id="work" className="gx-section">
      <div className="gx-container">
        {/* Cinematic Clean Header */}
        <div className="gx-header">
          <span className="gx-eyebrow">
            <span className="gx-eyebrow-dot" />
            Curated Portfolio
          </span>
          <h2 className="gx-title">
            SELECTED <span className="gx-accent">WORKS</span>
          </h2>
          <div className="gx-divider" />
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="gx-status">
            <span className="gx-spinner" />
          </div>
        )}

        {error && (
          <div className="gx-status gx-status--error">
            <p>Unable to load gallery stream: {error}</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && images.length > 0 && (
          <div className="gx-grid">
            {slotMap.map((imgIndex, tile) => {
              const img = images[imgIndex];
              if (!img) return null;
              const shapeClass = getShape(img, tile);

              return (
                <button
                  key={tile}
                  type="button"
                  className={`gx-tile${shapeClass}`}
                  onClick={() => setLightbox(imgIndex)}
                  aria-label="View photograph"
                >
                  <img
                    className={`gx-img${fading[tile] ? ' is-fading' : ''}`}
                    src={thumbUrl(img)}
                    alt={img.public_id.split('/').pop()}
                    loading="lazy"
                    draggable="false"
                  />
                  <div className="gx-tile-overlay" />
                  <span className="gx-tile-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="gx-status">
            <p>No photographs found for tag "{tag}".</p>
          </div>
        )}
      </div>

      {/* Cinematic Clean Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="gx-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          <div className="gx-lightbox-matte gx-lightbox-matte--top" />
          <div className="gx-lightbox-matte gx-lightbox-matte--bottom" />

          {/* Close button */}
          <button
            type="button"
            className="gx-btn gx-btn--close"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <span>&times;</span>
          </button>

          {/* Navigation Controls */}
          <button
            type="button"
            className="gx-btn gx-btn--prev"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
          >
            &#8249;
          </button>

          <div className="gx-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <img
              key={lightbox}
              className="gx-lightbox-img"
              src={fullUrl(images[lightbox])}
              alt={images[lightbox].public_id.split('/').pop()}
            />
          </div>

          <button
            type="button"
            className="gx-btn gx-btn--next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
          >
            &#8250;
          </button>

          <div className="gx-lightbox-footer">
            <span className="gx-count">
              {String(lightbox + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
