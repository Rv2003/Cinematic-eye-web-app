import { useState } from 'react';
import { ExternalLink, ThumbsUp, MessageCircle, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import './facebook.css';

const FacebookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function FacebookFeed({
  pageUrl = 'https://www.facebook.com/facebook',
  pageName = 'Cinematic Eye Studio',
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Encode URL for the official Facebook Page Plugin
  const encodedUrl = encodeURIComponent(pageUrl);
  const pluginSrc = `https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <section className="fb-section">
      <div className="fb-container">
        
        {/* Section Header */}
        <div className="fb-header">
          <div className="fb-eyebrow">
            <span className="fb-dot" />
            Live Studio Dispatch
          </div>
          <h2 className="fb-title">
            CONNECT ON <span className="gold-accent">FACEBOOK</span>
          </h2>
          <p className="fb-sub">
            Follow our latest productions, behind-the-scenes cinema reels, and client previews.
          </p>
        </div>

        {/* Studio Social Grid */}
        <div className="fb-grid">
          
          {/* Left Column: Studio Social Profile & Highlights */}
          <div className="fb-info-card">
            <div className="fb-badge-row">
              <span className="fb-pill">
                <ShieldCheck size={13} color="#d4af37" /> Official Page
              </span>
              <span className="fb-status-pulse">Active Today</span>
            </div>

            <div className="fb-brand-header">
              <div className="fb-logo-wrap">
                <FacebookIcon />
              </div>
              <div>
                <h3 className="fb-brand-title">{pageName}</h3>
                <span className="fb-brand-sub">Film & Visual Storytelling Studio</span>
              </div>
            </div>

            <p className="fb-bio">
              We regularly publish full wedding highlight reels, high-fashion editorials, graduation teasers,
              and photography tips on our Facebook community page. Join over 5,000+ patrons following our journey.
            </p>

            <div className="fb-perks">
              <div className="fb-perk">
                <ThumbsUp size={15} color="#d4af37" />
                <span>Sneak Peeks & First Look Stills</span>
              </div>
              <div className="fb-perk">
                <MessageCircle size={15} color="#d4af37" />
                <span>Direct Consultation via Messenger</span>
              </div>
              <div className="fb-perk">
                <Share2 size={15} color="#d4af37" />
                <span>Behind-The-Scenes Filmmaking Stories</span>
              </div>
            </div>

            <div className="fb-action-row">
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary fb-cta"
              >
                <span>Visit Facebook Page</span>
                <ExternalLink size={14} style={{ marginLeft: '6px' }} />
              </a>
              <a
                href="https://m.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline fb-msg-btn"
              >
                <span>Send Message</span>
              </a>
            </div>
          </div>

          {/* Right Column: Embedded Facebook Page Plugin Frame */}
          <div className="fb-embed-wrapper">
            <div className="fb-embed-chrome">
              <div className="chrome-dots">
                <span className="chrome-dot red" />
                <span className="chrome-dot yellow" />
                <span className="chrome-dot green" />
              </div>
              <span className="chrome-title">facebook.com / {pageName}</span>
            </div>

            <div className="fb-iframe-container">
              {!iframeLoaded && (
                <div className="fb-loading-placeholder">
                  <div className="fb-spinner" />
                  <span>Connecting to Facebook Dispatch...</span>
                </div>
              )}

              <iframe
                title="Cinematic Eye Facebook Page"
                src={pluginSrc}
                width="100%"
                height="500"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                onLoad={() => setIframeLoaded(true)}
                className={`fb-iframe ${iframeLoaded ? 'loaded' : ''}`}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default FacebookFeed;
