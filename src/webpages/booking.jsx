import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ADDED
import { LoadingScreen } from "../components/loading";
import "./booking.css";
import axios from "axios";
const SESSION_DATA = {
  Portrait: { },
  Graduation: { },
  Event: {  },
  Film: { },
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

export  function Booking({token,user,authLoading}) {
   
   const config = {
    headers: { Authorization: `Bearer ${token}` }
};
  const navigate = useNavigate(); // ADDED
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState(""); // ADDED

  const displayName = form.name || user?.username || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectSession = (name) => {
    setForm((prev) => ({ ...prev, session: name }));
  };

  const selectLocation = (value) => {
    setForm((prev) => ({ ...prev, location: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(""); // ADDED
console.log(config)
console.log(form)
    try {
      await axios.post("http://localhost:5500/api/v1/booking/",{
      session:form.session,
      eventdate:form.date,
      bookeddate:form.date,
      fullname:form.name || user.username||user.name,
      username:user.username,
      WhatsappNumber:form.phone,
      Location:form.location,
      Description:form.notes,
      headers: {
            Authorization: `Bearer ${token}`,
          },


      },config);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("submitted");
      setTimeout(() => navigate("/"), 1500); // ADDED: go home after success
    } catch (err) {
      console.error(err);
      // ADDED: show an error message
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
            Choose a session, tell us where and when, and we'll confirm
            within one business day. A deposit invoice follows once your
            date is locked in.
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
                  value={displayName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="booking-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="amaya@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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

          {/* ADDED: error message */}
          {errorMsg && (
            <p style={{ color: "#d4af37" }}>
              {errorMsg}
              {errorMsg.includes("expired") && (
                <> <Link to="/sign-in">Sign in</Link></>
              )}
            </p>
          )}

          <div className="booking-submit-row">
            <button
              type="submit"
              className="booking-btn-primary"
              disabled={status === "submitting"}
            >
              <span>
                {status === "submitting"
                  ? "Sending"
                  : status === "submitted"
                  ? "Request sent"
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

            <div className="booking-steps">
              <h3>What happens next</h3>

              <div className="booking-step">
                <span className="step-index">01</span>
                <p>
                  <strong>Confirmation on WhatsApp</strong>
                  we'll message the number above within a few minutes.
                </p>
              </div>
              <div className="booking-step">
                <span className="step-index">02</span>
                <p>
                  <strong>Deposit invoice</strong>
                  sent by email to hold your date.
                </p>
              </div>
              <div className="booking-step">
                <span className="step-index">03</span>
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