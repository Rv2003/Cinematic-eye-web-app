import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingScreen } from "../components/loading";
import "./booking.css";
import axios from "axios";

const SESSION_DATA = {
  Portrait: {},
  Graduation: {},
  Event: {},
  Film: {},
};

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  guests: 1,
  date: "",
  time: "",
  notes: "",
  session: "Portrait",
  location: "Studio",
};

const OTP_COOLDOWN = 60;                                    

export function Booking({ token, user, authLoading }) {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

                       
                                                                        
  const [otpStep, setOtpStep] = useState("idle");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const otpInputRefs = useRef([]);

                                
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

                                    
  useEffect(() => {
    if (otpStep !== "idle") {
      setOtpStep("idle");
      setOtpCode(["", "", "", "", "", ""]);
      setOtpError("");
    }
                                                           
  }, [form.email]);

                                                      
  useEffect(() => {
    if (!user) return;
                                                                                       
    const isObj = typeof user === "object";
    const name  = isObj ? (user.name || user.username || "") : String(user);
    const email = isObj ? (user.email || "") : "";
    setForm((prev) => ({
      ...prev,
      name:  prev.name  || name,
      email: prev.email || email,
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectSession = (name) => setForm((prev) => ({ ...prev, session: name }));
  const selectLocation = (value) => setForm((prev) => ({ ...prev, location: value }));

                                      
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;               
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    setOtpError("");
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(""));
      otpInputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

                      
  const sendOtp = async () => {
    if (!form.email) {
      setOtpError("Please enter your email address first.");
      return;
    }
    setOtpStep("sending");
    setOtpError("");
    try {
      await axios.post("http://localhost:5500/api/v1/otp/send", {
        email: form.email,
      });
      setOtpStep("awaiting");
      setOtpCode(["", "", "", "", "", ""]);
      setCooldown(OTP_COOLDOWN);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setOtpStep("idle");
      const msg =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setOtpError(msg);
    }
  };

                        
  const verifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }
    setOtpStep("verifying");
    setOtpError("");
    try {
      await axios.post("http://localhost:5500/api/v1/otp/verify", {
        email: form.email,
        otp: code,
      });
      setOtpStep("verified");
    } catch (err) {
      setOtpStep("awaiting");
      const msg =
        err.response?.data?.message || "Invalid or expired OTP. Please try again.";
      setOtpError(msg);
    }
  };

                                                            
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpStep !== "verified") {
      setOtpError("Please verify your email with OTP before submitting.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await axios.post(
        "http://localhost:5500/api/v1/booking/",
        {
          session: form.session,
          eventdate: form.date,
          bookeddate: form.date,
          fullname: form.name || user?.username || user?.name,
          username: user?.username,
          WhatsappNumber: form.phone,
          Location: form.location,
          Description: form.notes,
          status:"pending",
        },
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("submitted");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setErrorMsg("Your session has expired. Please sign in again.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
      setStatus("idle");
    }
  };

  const selected = SESSION_DATA[form.session];

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="booking-page">
      <section className="booking-intro">
        <div className="booking-content-wrapper">
          <div className="booking-eyebrow-wrapper">
            <span className="booking-eyebrow">
              <span className="eyebrow-dot"></span>
              Reservations
            </span>
          </div>

          <h1 className="booking-title">
            <span className="title-line thin">Book</span>
            <span className="title-line bold-accent">Your Session</span>
          </h1>

          <p className="booking-description">
            Choose a session, tell us where and when, and we'll confirm within
            one business day. A deposit invoice follows once your date is locked
            in.
          </p>
        </div>
      </section>

      <section className="session-select">
        <div className="section-label">Select a session</div>
        <div className="session-grid">
          {Object.entries(SESSION_DATA).map(([name]) => (
            <button
              key={name}
              type="button"
              className={`session-chip ${form.session === name ? "active" : ""}`}
              onClick={() => selectSession(name)}
            >
              <span className="chip-name">{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="booking-layout">
        <form className="booking-form" onSubmit={handleSubmit}>
                                    
          <fieldset className="booking-fieldset">
            <legend>Your details</legend>

            <div className="booking-row">
              <div className="booking-field">
                <label htmlFor="name">Full name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Amaya Perera"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

                                                
              <div className="booking-field">
                <label htmlFor="email">Email</label>
                <div className="otp-email-row">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="amaya@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={otpStep === "verified"}
                    className={otpStep === "verified" ? "otp-email-verified" : ""}
                  />

                                        
                  {otpStep === "verified" && (
                    <span className="otp-badge-verified" title="Email verified">
                      <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                        <circle cx="10" cy="10" r="9" stroke="#d4af37" strokeWidth="1.5" />
                        <path d="M6 10.5l3 3 5-5" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}

                                              
                  {otpStep !== "verified" && (
                    <button
                      type="button"
                      className="otp-send-btn"
                      onClick={sendOtp}
                      disabled={otpStep === "sending" || cooldown > 0}
                    >
                      {otpStep === "sending"
                        ? "Sending…"
                        : cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : otpStep === "awaiting" || otpStep === "verifying"
                        ? "Resend OTP"
                        : "Send OTP"}
                    </button>
                  )}
                </div>
              </div>
            </div>

                                         
            {(otpStep === "awaiting" || otpStep === "verifying") && (
              <div className="otp-panel">
                <p className="otp-instruction">
                  A 6-digit code was sent to <strong>{form.email}</strong>. Enter
                  it below to verify your email.
                </p>
                <div className="otp-digits" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-digit ${otpError ? "otp-digit-error" : ""}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>
                {otpError && <p className="otp-error-msg">{otpError}</p>}
                <button
                  type="button"
                  className="otp-verify-btn"
                  onClick={verifyOtp}
                  disabled={otpStep === "verifying" || otpCode.join("").length !== 6}
                >
                  {otpStep === "verifying" ? "Verifying…" : "Verify Code"}
                </button>
              </div>
            )}

                                                                          
            {otpStep === "idle" && otpError && (
              <p className="otp-error-msg" style={{ marginTop: 8 }}>{otpError}</p>
            )}

            <div className="booking-row" style={{ marginTop: 28 }}>
              <div className="booking-field">
                <label htmlFor="phone">WhatsApp number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+94 77 123 4567"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <div className="booking-hint">
                  We'll send your booking confirmation here.
                </div>
              </div>
              <div className="booking-field">
                <label htmlFor="guests">Number of people</label>
                <input
                  type="number"
                  id="guests"
                  name="guests"
                  min="1"
                  value={form.guests}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </fieldset>

                                       
          <fieldset className="booking-fieldset">
            <legend>Session details</legend>

            <div className="booking-row">
              <div className="booking-field">
                <label htmlFor="date">Preferred date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="booking-field">
                <label htmlFor="time">Preferred time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="booking-field" style={{ marginTop: 28 }}>
              <label>Location</label>
              <div className="location-toggle">
                {["Studio", "On location"].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={form.location === loc ? "active" : ""}
                    onClick={() => selectLocation(loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-field" style={{ marginTop: 28 }}>
              <label htmlFor="notes">Tell us about the shoot</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Mood, references, anything we should know before the day."
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </fieldset>

                                          
          {errorMsg && (
            <p style={{ color: "#d4af37" }}>
              {errorMsg}
              {errorMsg.includes("expired") && (
                <> <Link to="/sign-in">Sign in</Link></>
              )}
            </p>
          )}

                                                               
          {otpStep !== "verified" && otpStep !== "idle" && (
            <p className="otp-hint-submit">
              ✉ Please verify your email above before submitting.
            </p>
          )}

          <div className="booking-submit-row">
            <button
              type="submit"
              className="booking-btn-primary"
              disabled={status === "submitting" || otpStep !== "verified"}
              title={otpStep !== "verified" ? "Verify your email first" : undefined}
            >
              <span>
                {status === "submitting"
                  ? "Sending…"
                  : status === "submitted"
                  ? "Request sent ✓"
                  : "Request booking"}
              </span>
            </button>
            <span className="booking-submit-note">No payment due now</span>
          </div>
        </form>

                                   
        <aside className="booking-summary">
          <div className="booking-summary-inner">
            <h2>Summary</h2>

            <div className="summary-line">
              <span className="k">Session</span>
              <span className="v">{form.session}</span>
            </div>
            <div className="summary-line">
              <span className="k">Location</span>
              <span className="v">{form.location}</span>
            </div>
            <div className="summary-line">
              <span className="k">Duration</span>
              <span className="v">{selected.duration}</span>
            </div>

            <div className="summary-price">
              <span className="k">From</span>
              <span className="v">
                {selected.price}
                <small>Final quote confirmed by email</small>
              </span>
            </div>

                                                        
            <div className="summary-otp-status">
              <span className="k">Email</span>
              <span className={`v otp-status-badge ${otpStep === "verified" ? "verified" : "pending"}`}>
                {otpStep === "verified" ? "✓ Verified" : "Pending verification"}
              </span>
            </div>

            <div className="booking-steps">
              <h3>What happens next</h3>

              <div className="booking-step">
                <span className="step-index">01</span>
                <p>
                  <strong>Email verified</strong>
                  confirm your email with the OTP sent to your inbox.
                </p>
              </div>
              <div className="booking-step">
                <span className="step-index">02</span>
                <p>
                  <strong>Confirmation on WhatsApp</strong>
                  we'll message the number above within a few minutes.
                </p>
              </div>
              <div className="booking-step">
                <span className="step-index">03</span>
                <p>
                  <strong>Deposit invoice</strong>
                  sent by email to hold your date.
                </p>
              </div>
              <div className="booking-step">
                <span className="step-index">04</span>
                <p>
                  <strong>Shoot day details</strong>
                  address, timing and prep notes, two days out.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
