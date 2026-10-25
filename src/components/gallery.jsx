import { useCallback, useEffect, useMemo, useState } from 'react';
import './gallery.css';

// Automatically import all images from src/assets using Vite's glob import
const assetModules = import.meta.glob('../assets/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

// Editorial project metadata tailored for Cinematic Eye assets
const CURATED_PROJECTS = {
  'DSC_0056': {
    title: 'CHASING LIGHT',
    category: 'Narrative Short',
    year: '2026',
    sizeClass: 'grid-item-tall',
    description:
      'An intimate character study exploring visual loneliness, illuminated exclusively by natural ambient light leaks and street lamps.',
  },
  'DSC_7866': {
    title: 'SILENT VOWS',
    category: 'Editorial Campaign',
    year: '2025',
    sizeClass: 'grid-item-wide',
    description:
      'A high-fashion cinematic campaign investigating form, shadow, and minimal structural design in abandoned architecture.',
  },
  'DSC00144': {
    title: 'ETHEREAL SHADOWS',
    category: 'Studio Portrait',
    year: '2026',
    sizeClass: 'grid-item-compact',
    description:
      'A high-contrast chiaroscuro portrait series capturing contemplative stillness and sculptural light play.',
  },
  'DSC00153': {
    title: 'VIVID NOIR',
    category: 'Cinematic Film',
    year: '2026',
    sizeClass: 'grid-item-compact',
    description:
      'Exploration of rich cinematic tones, dynamic movement, and evocative human expression under theatrical lighting.',
  },
  'DSC02878': {
    title: 'KINETIC DRIFT',
    category: 'Fashion Editorial',
    year: '2025',
    sizeClass: 'grid-item-compact',
    description:
      'Fluid textures in motion, capturing the raw synergy between contemporary tailoring and spontaneous gesture.',
  },
  'DSC05561': {
    title: 'ANALOG REFLECTIONS',
    category: 'Documentary Short',
    year: '2025',
    sizeClass: 'grid-item-wide',
    description:
      'A quiet visual poem observing fleeting urban vignettes, nostalgic color palettes, and reflective surfaces.',
  },
  'DSC_9597': {
    title: 'ECHOES OF DUST',
    category: 'Experimental Film',
    year: '2026',
    sizeClass: 'grid-item-tall',
    description:
      'A sensory audio-visual exploration of dry landscapes, wind textures, and geological time scales in the high desert.',
  },
};

// Rhythmic size class cadence to ensure 12-column grid rows always balance evenly
const SIZE_CYCLE = [
  'grid-item-tall',    // span 5
  'grid-item-wide',    // span 7 (5 + 7 = 12)
  'grid-item-compact', // span 4
  'grid-item-compact', // span 4
  'grid-item-compact', // span 4 (4 + 4 + 4 = 12)
  'grid-item-wide',    // span 7
  'grid-item-tall',    // span 5 (7 + 5 = 12)
];

/**
 * Automatically load and assemble all photography pictures from the assets folder
 */
function loadAssetsGallery() {
  const list = [];
  let index = 0;

  for (const [path, url] of Object.entries(assetModules)) {
    const filename = path.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Skip non-gallery UI / branding assets
    if (/^(hero|hero_bg|react|vite|logo|banner)/i.test(filename)) {
      continue;
    }

    const curated = CURATED_PROJECTS[nameWithoutExt] || {};
    const fallbackTitle = nameWithoutExt.replace(/[-_]/g, ' ').toUpperCase();
    const fallbackSize = SIZE_CYCLE[index % SIZE_CYCLE.length];

    list.push({
      id: nameWithoutExt,
      filename,
      image: url,
      title: curated.title || fallbackTitle,
      category: curated.category || 'Curated Portfolio',
      year: curated.year || '2026',
      sizeClass: curated.sizeClass || fallbackSize,
      description:
        curated.description ||
        'An artistic exploration of cinematic light, atmosphere, and visual narrative craft.',
    });

    index++;
  }

  return list;
}

const DEFAULT_PROJECTS = loadAssetsGallery();

export function Gallery() {
  const [activeProject, setActiveProject] = useState(null);

  const projects = useMemo(() => DEFAULT_PROJECTS, []);

  const openLightbox = (project) => {
    setActiveProject(project);
  };

  const closeLightbox = () => {
    setActiveProject(null);
  };

  const activeIndex = useMemo(() => {
    if (!activeProject) return -1;
    return projects.findIndex((p) => p.id === activeProject.id);
  }, [activeProject, projects]);

  const navigateLightbox = useCallback(
    (direction) => {
      if (activeIndex === -1 || projects.length === 0) return;
      const nextIndex = (activeIndex + direction + projects.length) % projects.length;
      setActiveProject(projects[nextIndex]);
    },
    [activeIndex, projects]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!activeProject) return;

    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeProject, navigateLightbox]);

  return (
    <section id="work" className="gallery-section">
      <div className="gallery-inner">
        {/* Section Header Title */}
        <div className="gallery-header">
          <span className="gallery-eyebrow">
            <span className="eyebrow-dot"></span>
            Curated Portfolio
          </span>
          <h2 className="gallery-title">
            SELECTED <span className="gold-accent">WORKS</span>
          </h2>
          <p className="gallery-subtitle">
            A showcase of raw emotion, meticulous lighting, and deliberate storytelling across cinema and editorial photography.
          </p>
        </div>

        {/* Edge-to-Edge 12-Column Editorial Grid */}
        <div className="gallery-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`gallery-item ${project.sizeClass}`}
              onClick={() => openLightbox(project)}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="gallery-img"
                  loading="lazy"
                />
                <div className="gallery-item-overlay"></div>

                {/* Visual Arrow CTA on Hover */}
                <div className="gallery-hover-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>

                {/* Hover Meta Information Card */}
                <div className="gallery-item-meta">
                  <div className="meta-top">
                    <span className="meta-category">{project.category}</span>
                    <span className="meta-year">{project.year}</span>
                  </div>
                  <h3 className="meta-title">{project.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal View */}
      {activeProject && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button
            className="lightbox-close-btn"
            onClick={closeLightbox}
            aria-label="Close modal"
          >
            <span className="close-line top-line"></span>
            <span className="close-line bot-line"></span>
          </button>

          {/* Navigation Arrows */}
          {projects.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox(-1);
                }}
                aria-label="Previous photograph"
              >
                &#8249;
              </button>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-nav-btn--next"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox(1);
                }}
                aria-label="Next photograph"
              >
                &#8250;
              </button>
            </>
          )}

          <div
            className="lightbox-content-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-image-column">
              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="lightbox-img"
              />
            </div>

            <div className="lightbox-details-column">
              <div className="lightbox-details-inner">
                <span className="lightbox-category">{activeProject.category}</span>
                <h3 className="lightbox-title">{activeProject.title}</h3>
                <span className="lightbox-year">Release: {activeProject.year}</span>
                <div className="lightbox-divider"></div>
                <p className="lightbox-description">{activeProject.description}</p>
                <div className="lightbox-cta-wrap">
                  <button className="lightbox-cta-btn" onClick={closeLightbox}>
                    <span>Close Viewer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
