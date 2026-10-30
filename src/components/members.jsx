import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./members.css";

gsap.registerPlugin(ScrollTrigger);

const MEMBERS_API_URL = "http://localhost:5500/api/v1/members";

const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                                                                                  
function splitToChars(el) {
  const text = el.textContent;
  el.innerHTML = text
    .split("")
    .map((c) =>
      c === " "
        ? `<span style="display:inline-block;white-space:pre"> </span>`
        : `<span class="team__char" style="display:inline-block;overflow:hidden">${c}</span>`
    )
    .join("");
  return Array.from(el.querySelectorAll(".team__char"));
}

export function TeamSection() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sectionRef    = useRef(null);
  const spotlightRef  = useRef(null);
  const scanLineRef   = useRef(null);
  const lbTopRef      = useRef(null);
  const lbBottomRef   = useRef(null);
  const titleThinRef  = useRef(null);
  const titleBoldRef  = useRef(null);
  const dividerRef    = useRef(null);
  const eyebrowRef    = useRef(null);
  const gridRef       = useRef(null);
  const cardsRef      = useRef([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMembers() {
      try {
        const response = await fetch(MEMBERS_API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Members request failed (${response.status})`);
        }

        const payload = await response.json();
        const records = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.members)
            ? payload.members
            : Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload.data?.members)
                ? payload.data.members
                : null;

        if (!records) {
          throw new Error("Members response did not contain a member list.");
        }

        setMembers(
          records.map((member, index) => ({
            ...member,
            id: member.id ?? member._id ?? index,
            photo: member.photo ?? member.image ?? "",
          }))
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load team members.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadMembers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const section   = sectionRef.current;
    const evCleans  = [];                                

                                                                        
                                                                       
                                                                        
    const ctx = gsap.context(() => {

                                                                          
      gsap.set(lbTopRef.current,    { transformOrigin: "top center",    scaleY: 1 });
      gsap.set(lbBottomRef.current, { transformOrigin: "bottom center", scaleY: 1 });

      gsap.to([lbTopRef.current, lbBottomRef.current], {
        scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" },
        scaleY: 0,
        duration: 1.6,
        ease: "expo.inOut",
        stagger: 0.05,
      });

                                                                          
      gsap.fromTo(
        scanLineRef.current,
        { y: 0, opacity: 1 },
        {
          scrollTrigger: { trigger: section, start: "top 78%", toggleActions: "play none none none" },
          y: section.offsetHeight,
          opacity: 0,
          duration: 1.6,
          ease: "power2.inOut",
        }
      );

                                                                          
      gsap.from(eyebrowRef.current, {
        scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none none" },
        opacity: 0,
        y: 14,
        letterSpacing: "0.5em",
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });

                                                                          
      const thinChars = splitToChars(titleThinRef.current);
      const boldChars = splitToChars(titleBoldRef.current);

      const titleTl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 68%", toggleActions: "play none none none" },
      });

      titleTl
        .from(thinChars, {
          y: "110%",
          opacity: 0,
          rotateX: -90,
          transformOrigin: "50% 100%",
          duration: 0.65,
          ease: "back.out(1.6)",
          stagger: 0.04,
        })
        .from(boldChars, {
          y: "110%",
          opacity: 0,
          rotateX: -90,
          transformOrigin: "50% 100%",
          duration: 0.65,
          ease: "back.out(1.6)",
          stagger: 0.04,
        }, "-=0.45")
        .from(dividerRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1,
          ease: "expo.out",
        }, "-=0.3");

                                                                          
      gsap.from(cardsRef.current, {
        scrollTrigger: { trigger: gridRef.current, start: "top 84%", toggleActions: "play none none none" },
        y: 110,
        opacity: 0,
        rotateX: 28,
        transformPerspective: 1200,
        transformOrigin: "top center",
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.3,
        ease: "expo.out",
        stagger: { amount: 0.7, from: "start" },
        onComplete: () => {
                                                                   
          gsap.set(cardsRef.current, { clipPath: "none" });
        },
      });

                                                                          
      gsap.to(".team__title-wrapper", {
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.8 },
        y: -55,
        ease: "none",
      });

                                                                         
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.to(card.querySelector(".team__photo"), {
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 2 },
          y: -35,
          ease: "none",
        });
      });

    }, sectionRef);

                                                                        
                                                                     
                                                                        
    const onSectionMove = (e) => {
      const { left, top } = section.getBoundingClientRect();
      gsap.to(spotlightRef.current, {
        x: e.clientX - left,
        y: e.clientY - top,
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
      });
    };
    const onSectionLeave = () => {
      gsap.to(spotlightRef.current, { opacity: 0, duration: 0.7, ease: "power2.in" });
    };
    section.addEventListener("mousemove", onSectionMove);
    section.addEventListener("mouseleave", onSectionLeave);
    evCleans.push(() => {
      section.removeEventListener("mousemove", onSectionMove);
      section.removeEventListener("mouseleave", onSectionLeave);
    });

                                                                        
                                  
                                                                        
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const photo   = card.querySelector(".team__photo");
      const img     = card.querySelector(".team__photo img");
      const nameEl  = card.querySelector(".team__name");
      const roleEl  = card.querySelector(".team__role");
      const overlay = card.querySelector(".team__photo-overlay");
      const numEl   = card.querySelector(".team__card-num");

                                                             
      const onEnter = () => {
                                       
        cardsRef.current.forEach((c, j) => {
          if (c && j !== i) {
            gsap.to(c, {
              opacity: 0.18,
              scale: 0.96,
              filter: "blur(2px) brightness(0.5)",
              duration: 0.55,
              ease: "power3.out",
            });
          }
        });

                                    
        gsap.to(photo, {
          scale: 1.04,
          boxShadow: "0 28px 80px rgba(212,175,55,0.38), 0 0 0 1px rgba(212,175,55,0.25)",
          duration: 0.6,
          ease: "power2.out",
        });

                                                              
        if (img) {
          gsap.to(img, {
            filter: "grayscale(0) contrast(1.12) brightness(1.06)",
            scale: 1.08,
            duration: 0.9,
            ease: "power2.out",
          });
        }

                                                 
        gsap.to(nameEl, {
          letterSpacing: "0.09em",
          color: "#fff",
          duration: 0.45,
          ease: "power2.out",
        });

                                                          
        gsap.to(roleEl, {
          y: -7,
          color: "var(--accent, #d4af37)",
          letterSpacing: "0.24em",
          duration: 0.45,
          ease: "power2.out",
        });

                                
        if (numEl) {
          gsap.to(numEl, {
            opacity: 0.9,
            color: "var(--accent, #d4af37)",
            duration: 0.35,
            ease: "power2.out",
          });
        }

                                                           
        gsap.to(overlay, { opacity: 0.2, duration: 0.5 });
      };

                                              
      const onLeave = () => {
        cardsRef.current.forEach((c) => {
          if (c) {
            gsap.to(c, {
              opacity: 1,
              scale: 1,
              filter: "blur(0px) brightness(1)",
              duration: 0.55,
              ease: "power3.out",
            });
          }
        });

        gsap.to(photo, {
          scale: 1,
          boxShadow: "none",
          duration: 0.6,
          ease: "power2.out",
        });

        if (img) {
          gsap.to(img, {
            filter: "grayscale(1) contrast(1.05) brightness(1)",
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
          });
        }

        gsap.to(nameEl, {
          letterSpacing: "normal",
          color: "var(--text-primary, #fff)",
          duration: 0.45,
          ease: "power2.out",
        });

        gsap.to(roleEl, {
          y: 0,
          color: "var(--text-secondary, #9a9a9a)",
          letterSpacing: "0.14em",
          duration: 0.45,
          ease: "power2.out",
        });

        if (numEl) {
          gsap.to(numEl, {
            opacity: 0.15,
            color: "var(--text-secondary, #9a9a9a)",
            duration: 0.35,
            ease: "power2.out",
          });
        }

        gsap.to(overlay, { opacity: 1, duration: 0.5 });

                                             
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.45)",
        });
      };

                                            
      const onMove = (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const nx = (e.clientX - left) / width  - 0.5;              
        const ny = (e.clientY - top)  / height - 0.5;
        gsap.to(card, {
          rotateY:             nx * 16,
          rotateX:            -ny * 12,
          transformPerspective: 900,
          duration: 0.35,
          ease: "power2.out",
        });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove",  onMove);
      evCleans.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove",  onMove);
      });
    });

                       
    return () => {
      ctx.revert();
      evCleans.forEach((fn) => fn());
    };
  }, [isLoading]);

                                                                        
  return (
    <section ref={sectionRef} className="team" aria-labelledby="team-title">

                                      
      <div ref={lbTopRef}    className="team__letterbox team__letterbox--top"    aria-hidden="true" />
      <div ref={lbBottomRef} className="team__letterbox team__letterbox--bottom" aria-hidden="true" />

                                       
      <div ref={spotlightRef} className="team__spotlight" aria-hidden="true" />

                            
      <div ref={scanLineRef} className="team__scanline" aria-hidden="true" />

      <div className="team__title-wrapper">
        <p ref={eyebrowRef} className="team__eyebrow" aria-hidden="true">
          — our crew
        </p>

        <h2 id="team-title" className="team__title">
          <span ref={titleThinRef} className="team__title-thin">The people</span>
          <span ref={titleBoldRef} className="team__title-bold">behind the lens</span>
        </h2>

        <div ref={dividerRef} className="team__divider" aria-hidden="true" />
      </div>

        {isLoading && (
          <p className="team__status" role="status">Loading our crew...</p>
        )}
        {!isLoading && error && (
          <p className="team__status team__status--error" role="alert">{error}</p>
        )}
        {!isLoading && !error && members.length === 0 && (
          <p className="team__status">Team details are coming soon.</p>
        )}

        <ul ref={gridRef} className="team__grid">
          {members.map((m, i) => (
          <li
            key={m.id}
            className="team__card"
            ref={(el) => (cardsRef.current[i] = el)}
          >
                                   
            <span className="team__card-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="team__photo">
              {m.photo ? (
                <img src={m.photo} alt={m.name || "Team member"} loading="lazy" />
              ) : (
                <span className="team__initials" aria-hidden="true">
                  {initials(m.name || "Team member")}
                </span>
              )}
              <div className="team__photo-overlay" aria-hidden="true" />
            </div>

            <h3 className="team__name">{m.name || "Team member"}</h3>
            <p className="team__role">{m.role}</p>

            {m.instagram && (
              <a
                className="team__link"
                href={m.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${m.name} on Instagram`}
              >
                Instagram
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}