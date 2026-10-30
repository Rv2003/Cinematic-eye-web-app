import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./footer.css";

gsap.registerPlugin(ScrollTrigger);

const EXPLORE = [
  { label: "Home", to: "/" },
  { label: "Selected Works", to: "/#work" },
  { label: "Our Team", to: "/#team" },
  { label: "Book a Session", to: "/booking" },
];

const SESSIONS = [
  { label: "Cinematic Portrait", desc: "Studio & Natural Light" },
  { label: "Graduation Editorial", desc: "Commemorative Films" },
  { label: "Commercial & Fashion", desc: "Brand Visuals" },
  { label: "Documentary & Events", desc: "Live Storytelling" },
];

                                                               
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
  </svg>
);

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com/", Icon: FacebookIcon },
  { label: "WhatsApp", href: "https://wa.me/94771234567", Icon: WhatsAppIcon },
];

export function Footer() {
  const footerRef = useRef(null);
  const headlineRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const gridColsRef = useRef([]);
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
                                       
      gsap.from([headlineRef.current, ctaBtnRef.current], {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

                                       
      if (gridColsRef.current.length > 0) {
        gsap.from(gridColsRef.current, {
          scrollTrigger: {
            trigger: ".footer__grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 35,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" ref={footerRef} className="footer" aria-label="Site Footer">
                                            
      <div className="footer__glow" aria-hidden="true" />

      <div className="footer__container">
                                         
        <div className="footer__cta">
          <div ref={headlineRef} className="footer__cta-text">
            <span className="footer__eyebrow">
              <span className="footer__eyebrow-dot" /> Ready to begin?
            </span>
            <h2 className="footer__headline">
              <span className="footer__thin">Let's make something</span>
              <span className="footer__bold">extraordinary.</span>
            </h2>
          </div>

          <div ref={ctaBtnRef} className="footer__cta-action">
            <Link to="/booking" className="footer__btn">
              <span>Book Your Session</span>
              <ArrowUpRight className="footer__btn-icon" size={16} />
            </Link>
          </div>
        </div>

                                 
        <div className="footer__grid">
                              
          <div
            className="footer__col footer__brand"
            ref={(el) => (gridColsRef.current[0] = el)}
          >
            <Link to="/" className="footer__logo">
              Cinematic <span className="gold-accent">Eye</span>
            </Link>
            <p className="footer__tagline">
              Visual storytelling and film cinematography, crafted with intentional light and refined aesthetic discipline.
            </p>
            <div className="footer__status">
              <span className="footer__status-indicator" />
              <span>Accepting commissions for {year}</span>
            </div>
          </div>

                                   
          <nav
            className="footer__col"
            aria-label="Navigation Links"
            ref={(el) => (gridColsRef.current[1] = el)}
          >
            <h3 className="footer__label">Explore</h3>
            <ul className="footer__list">
              {EXPLORE.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

                                 
          <div
            className="footer__col"
            ref={(el) => (gridColsRef.current[2] = el)}
          >
            <h3 className="footer__label">Sessions</h3>
            <ul className="footer__list">
              {SESSIONS.map((session) => (
                <li key={session.label} className="footer__session-item">
                  <Link to="/booking" className="footer__link">
                    <span className="footer__session-name">{session.label}</span>
                    <span className="footer__session-desc">{session.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

                                    
          <div
            className="footer__col footer__studio"
            ref={(el) => (gridColsRef.current[3] = el)}
          >
            <h3 className="footer__label">Studio</h3>
            <div className="footer__contact-info">
              <p className="footer__location">
                Negombo, Western Province<br />
                Sri Lanka
              </p>
              <div className="footer__contact-links">
                <a
                  href="mailto:hello@cinematiceye.com"
                  className="footer__link"
                >
                  hello@cinematiceye.com
                </a>
                <a
                  href="https://wa.me/94771234567"
                  className="footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +94 77 123 4567
                </a>
              </div>
            </div>
          </div>
        </div>

                                                           
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <p className="footer__copyright">
              © {year} Cinematic Eye Studio. All rights reserved.
            </p>
          </div>

          <div className="footer__bottom-center">
            <ul className="footer__socials">
              {SOCIAL.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer__social-link"
                      aria-label={item.label}
                    >
                      <IconComponent />
                      <span className="footer__social-name">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer__bottom-right">
            <button
              onClick={scrollToTop}
              className="footer__back-to-top"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
      
    </footer>
  );
}