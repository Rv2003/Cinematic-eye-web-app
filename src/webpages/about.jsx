import { useEffect } from 'react';
import { Link } from 'react-router';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import {
  Film,
  Camera,
  Sparkles,
  Compass,
  ArrowRight,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  Video
} from 'lucide-react';
import './about.css';

// Studio assets
import founderImg from '../assets/DSC05561.jpg';
import studioImg1 from '../assets/DSC_7866.png';
import studioImg2 from '../assets/DSC_9597.jpg';

export function About({ user, setUser, token, setToken, authLoading, setAuthLoading }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PILLARS = [
    {
      number: '01',
      title: 'Intentional Light',
      desc: 'We reject sterile, flat studio lighting. Every scene is sculpted with organic directional light, deep velvety blacks, and golden atmospheric fall-off.',
      icon: Sparkles,
    },
    {
      number: '02',
      title: 'Narrative Truth',
      desc: 'We never force stiff poses or generic smile-at-the-lens tropes. We curate relaxed, cinematic environments where raw, authentic human emotion naturally surfaces.',
      icon: Film,
    },
    {
      number: '03',
      title: 'Theatrical Color Science',
      desc: 'Every still and reel is hand-graded using bespoke color profiles inspired by 35mm film stock, preserving lifelike skin tones and rich tonal depth.',
      icon: Camera,
    },
  ];

  const MILESTONES = [
    { value: '8+', label: 'Years Behind The Lens' },
    { value: '300+', label: 'Bespoke Sessions' },
    { value: '100%', label: 'Handcrafted Grading' },
    { value: 'Negombo', label: 'Western Province, LK' },
  ];

  return (
    <div className="about-page">
      <Navbar
        user={user}
        setUser={setUser}
        token={token}
        setToken={setToken}
        authLoading={authLoading}
        setAuthLoading={setAuthLoading}
      />

      {/* ----------------------------------------------------
          HERO SECTION
          ---------------------------------------------------- */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src={studioImg1} alt="Cinematic background" className="about-hero-bg-img" />
          <div className="about-hero-vignette" />
        </div>

        <div className="about-container about-hero-content">
          <div className="about-eyebrow">
            <span className="about-eyebrow-line" />
            <span className="about-eyebrow-dot" />
            <span>Studio Manifesto</span>
            <span className="about-eyebrow-line" />
          </div>

          <h1 className="about-hero-title">
            SHAPING STORIES IN <br />
            <span className="gold-accent">LIGHT & SHADOW</span>
          </h1>

          <p className="about-hero-sub">
            Cinematic Eye is an independent visual production studio rooted in Negombo, Sri Lanka.
            We blend the poetry of natural light with high-fashion discipline to immortalize human
            connection.
          </p>
        </div>

        <div className="about-scroll-hint">
          <span>Scroll to uncover the philosophy</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ----------------------------------------------------
          FOUNDER & VISION STATEMENT
          ---------------------------------------------------- */}
      <section className="about-section about-vision">
        <div className="about-container about-vision-grid">
          <div className="vision-image-col">
            <div className="vision-frame">
              <img src={founderImg} alt="Rusiru - Founder & Lead Photographer" className="vision-img" />
              <div className="vision-frame-badge">
                <span className="badge-name">Rusiru</span>
                <span className="badge-role">Founder & Director of Photography</span>
              </div>
              <div className="frame-corner frame-corner--tl" />
              <div className="frame-corner frame-corner--br" />
            </div>
          </div>

          <div className="vision-text-col">
            <span className="section-label">Visionary Direction</span>
            <h2 className="about-heading">
              “Cinema is not what is in the frame, but what resonates in your heart long after.”
            </h2>
            <div className="gold-rule" />

            <p className="about-para">
              My journey began behind 35mm cameras, observing how directional sunlight filters through
              the coastal palms of Negombo. I noticed that conventional photography was saturated with
              rehearsed smiles and clinical flashes that drained real feeling out of the moment.
            </p>

            <p className="about-para">
              At Cinematic Eye, we treat every assignment—be it an intimate bridal session, a monumental
              graduation, or a narrative commercial campaign—like an auteur short film. We listen to the
              rhythm of your story before the shutter ever fires.
            </p>

            <div className="vision-creed">
              <CheckCircle2 size={18} color="#d4af37" />
              <span>Authentic emotion over artificial perfection. Always.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          THREE PILLARS OF OUR CRAFT
          ---------------------------------------------------- */}
      <section className="about-section about-pillars-section">
        <div className="about-container">
          <div className="about-center-header">
            <span className="section-label">The Studio Discipline</span>
            <h2 className="about-heading">Three Pillars of Our Craft</h2>
            <p className="about-center-sub">
              Every production is governed by three unwavering principles that define our signature aesthetic.
            </p>
          </div>

          <div className="pillars-grid">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.number} className="pillar-card">
                  <div className="pillar-top">
                    <span className="pillar-num">{p.number}</span>
                    <div className="pillar-icon-wrap">
                      <Icon size={20} color="#d4af37" />
                    </div>
                  </div>
                  <h3 className="pillar-title">{p.title}</h3>
                  <p className="pillar-desc">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          MILESTONES & NUMBERS
          ---------------------------------------------------- */}
      <section className="about-stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {MILESTONES.map((m, i) => (
              <div key={i} className="stat-box">
                <span className="stat-num">{m.value}</span>
                <span className="stat-desc">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          THE STUDIO SPACE & GEAR ETHOS
          ---------------------------------------------------- */}
      <section className="about-section about-craft">
        <div className="about-container about-craft-grid">
          <div className="craft-text-col">
            <span className="section-label">The Arsenal & Discipline</span>
            <h2 className="about-heading">Tools in Service of Human Emotion</h2>
            <div className="gold-rule" />

            <p className="about-para">
              While gear never replaces vision, the optical physics of cinema glass and large-format
              sensors allow us to render organic fall-off and buttery depth that smartphone cameras and
              entry-level bodies simply cannot reproduce.
            </p>

            <div className="gear-list">
              <div className="gear-item">
                <Video size={16} color="#d4af37" />
                <div>
                  <strong>Large-Format Cinema Cameras</strong>
                  <span>Full-frame sensors with 15+ stops of dynamic range for true cinematic DR.</span>
                </div>
              </div>
              <div className="gear-item">
                <Camera size={16} color="#d4af37" />
                <div>
                  <strong>Ultra-Fast Prime Optics</strong>
                  <span>35mm, 50mm, and 85mm T1.2–T1.4 glass producing distinct anamorphic separation.</span>
                </div>
              </div>
              <div className="gear-item">
                <Sparkles size={16} color="#d4af37" />
                <div>
                  <strong>Bespoke Color Profiles</strong>
                  <span>Handcrafted grading LUTs tailored to your unique skin tones and setting.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="craft-image-col">
            <div className="craft-image-wrapper">
              <img src={studioImg2} alt="Studio Lighting Detail" className="craft-img" />
              <div className="craft-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          CALL TO ACTION (BOOKING INVITATION)
          ---------------------------------------------------- */}
      <section className="about-cta-section">
        <div className="about-container about-cta-inner">
          <span className="about-eyebrow">
            <span className="about-eyebrow-dot" />
            Begin Your Chapter
          </span>
          <h2 className="about-cta-title">
            Ready to shape your <span className="gold-accent">visual story?</span>
          </h2>
          <p className="about-cta-sub">
            Whether an editorial portrait, graduation milestone, or full cinematic documentary,
            we accept a strictly limited number of commissions per season.
          </p>

          <div className="about-cta-btns">
            <Link to="/booking" className="btn btn-primary">
              <span>Book Your Session</span>
              <ArrowRight size={15} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/#work" className="btn btn-outline">
              <span>Explore Portfolio</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
