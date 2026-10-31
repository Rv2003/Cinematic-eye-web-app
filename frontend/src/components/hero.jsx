import { useEffect, useState } from 'react';
import './hero.css';
import slide1 from '../assets/2.jpg';
import slide2 from '../assets/1.jpg';
import slide3 from '../assets/3.jpg';
import slide4 from '../assets/4.png';

                                           
const slidesData = [
  {
    id: 1,
    eyebrow: "Independent Film & Creative Studio",
    title: "SHAPING THE ART",
    subtitle: "OF VISUAL STORIES",
    description: "We combine cutting-edge cinematography with deeply human narratives. Crafting raw, emotive, and high-fashion cinematic experiences.",
    image: slide3,
  },
  {
    id: 2,
    eyebrow: "Editorial & Commercial Campaigns",
    title: "CAPTURING MOTION",
    subtitle: "IN RAW ELEMENTS",
    description: "Exploring the boundary between light, shadow, and human performance. Unveiling narratives that resonate across fashion and design.",
    image: slide2,
  },
  {
    id: 3,
    eyebrow: "Documentaries & Soundscapes",
    title: "INTO THE DEPTHS",
    subtitle: "OF SILENT CINEMA",
    description: "A visual study on minimal sound design, atmospheric depth, and immersive environmental cinematography in raw wilderness.",
    image: slide1,
  },
  {
    id: 4,
    eyebrow: "Documentaries & Soundscapes",
    title: "INTO THE DEPTHS",
    subtitle: "OF SILENT CINEMA",
    description: "A visual study on minimal sound design, atmospheric depth, and immersive environmental cinematography in raw wilderness.",
    image: slide4,
  }
];

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideDuration = 6000;                       

  useEffect(() => {
                                          
    const loadTimer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
                                         
    const autoPlayTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, slideDuration);

    return () => clearInterval(autoPlayTimer);
  }, []);

  return (
    <section id="home" className={`hero-section ${loaded ? 'animate-in' : ''}`}>
      <div className="hero-split-container">
        
                                       
        <div className="hero-content-column">
          <div className="hero-content-wrapper" key={currentSlide}>
                                   
            

                                         
            <h1 className="hero-title">
              <span className="title-line thin">{slidesData[currentSlide].title}</span>
              <span className="title-line bold-accent">{slidesData[currentSlide].subtitle}</span>
            </h1>

                                         
            <p className="hero-description">
              {slidesData[currentSlide].description}
            </p>

                                       
            <div className="hero-ctas">
              <a href="#work" className="hero-btn-primary">
                <span>Explore Portfolio</span>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#showreel" className="hero-btn-secondary">
                <div className="play-icon-circle">
                  <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
                <span>Watch Showreel</span>
              </a>
            </div>
          </div>
        </div>

                                               
        <div className="hero-image-column">
          <div className="hero-bg-container">
            {slidesData.map((slide, index) => (
              <div
                key={slide.id}
                className={`hero-slide-bg-wrapper ${index === currentSlide ? 'active' : ''}`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="hero-bg-img" 
                />
              </div>
            ))}
                                                                   
            <div className="hero-image-gradient-left"></div>
            <div className="hero-image-overlay-vignette"></div>
          </div>
        </div>

      </div>

                                   
      <div className="hero-scroll-indicator">
        <span className="scroll-text">Scroll to explore</span>
        <div className="scroll-track">
          <div className="scroll-dot"></div>
        </div>
      </div>
    </section>
  );
}