import { useState } from 'react';
import './gallery.css';
import project1 from '../assets/DSC_0056.jpg';
import project2 from '../assets/DSC_7866.png';
import project3 from '../assets/DSC_9597.jpg';

const galleryProjects = [
  {
    id: 1,
    title: "CHASING LIGHT",
    category: "Narrative Short",
    year: "2026",
    image: project1,
    sizeClass: "grid-item-tall",
    description: "An intimate character study exploring visual loneliness, illuminated exclusively by natural ambient light leaks and street lamps."
  },
  {
    id: 2,
    title: "SILENT VOWS",
    category: "Editorial Campaign",
    year: "2025",
    image: project2,
    sizeClass: "grid-item-wide",
    description: "A high-fashion cinematic campaign investigating form, shadow, and minimal structural design in abandoned architecture."
  },
  {
    id: 3,
    title: "ECHOES OF DUST",
    category: "Experimental Film",
    year: "2026",
    image: project3,
    sizeClass: "grid-item-normal",
    description: "A sensory audio-visual exploration of dry landscapes, wind textures, and geological time scales in the high desert."
  }
];

export function Gallery() {
  const [activeProject, setActiveProject] = useState(null);

  const openLightbox = (project) => {
    setActiveProject(project);
  };

  const closeLightbox = () => {
    setActiveProject(null);
  };

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

        {/* Asymmetric Editorial Grid */}
        <div className="gallery-grid">
          {galleryProjects.map((project) => (
            <div
              key={project.id}
              className={`gallery-item ${project.sizeClass}`}
              onClick={() => openLightbox(project)}
            >
              <div className="gallery-image-wrapper">
                <img src={project.image} alt={project.title} className="gallery-img" />
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
          <button className="lightbox-close-btn" onClick={closeLightbox} aria-label="Close modal">
            <span className="close-line top-line"></span>
            <span className="close-line bot-line"></span>
          </button>
          
          <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-column">
              <img src={activeProject.image} alt={activeProject.title} className="lightbox-img" />
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