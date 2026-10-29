import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import "./login.css";
import axios from "axios";
import slide1 from "../assets/1.jpg";
import slide2 from "../assets/2.jpg";
import slide3 from "../assets/3.jpg";
import { LoadingScreen } from "../components/loading";

const slides = [slide1, slide2, slide3];

export function Register({ user, setUser, token, setToken }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5500/api/v1/auth/sign-up",
        {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        // If the backend returns auth data directly, set session
        if (res.data.data?.token && res.data.data?.user) {
          if (setUser) setUser(res.data.data.user.username || res.data.data.user);
          if (setToken) setToken(res.data.data.token);
          navigate("/login");
        } else {
          alert("Account created successfully! Please sign in.");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Registration failed: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`login-page ${loaded ? "animate-in" : ""}`}>
      {/* ── Left: Cinematic Image Panel ── */}
      <div className="login-visual-panel">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`login-slide-bg ${i === currentSlide ? "active" : ""}`}
          >
            <img src={src} alt="Cinematic work" className="login-slide-img" />
          </div>
        ))}

        {/* Edge vignette */}
        <div className="login-visual-vignette"></div>

        {/* Brand overlay inside the image */}
        <div className="login-visual-brand">
          <Link to="/" className="login-brand-logo">
            <span className="brand-light">CINEMATIC</span>
            <span className="login-brand-dot"></span>
            <span className="brand-bold">EYE</span>
          </Link>
          <p className="login-visual-tagline">
            "Every frame is a decision. Every shadow, intentional."
          </p>
        </div>

        {/* Slide progress dots */}
        <div className="login-slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`login-dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Register Form Panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          {/* Mobile-only brand header */}
          <Link to="/" className="login-brand-mobile">
            <span className="brand-light">CINEMATIC</span>
            <span className="login-brand-dot"></span>
            <span className="brand-bold">EYE</span>
          </Link>

          {/* Header text */}
          <div className="login-form-header">
            <span className="login-eyebrow">
              <span className="eyebrow-dot"></span>
              New Membership
            </span>
            <h1 className="login-heading">
              CREATE<br />
              <span className="gold-accent">ACCOUNT</span>
            </h1>
            <p className="login-subtext">
              Join Cinematic Eye to begin your creative journey.
            </p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-field-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Choose a username"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••••"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Create Account</span>
              <svg className="submit-arrow" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <GoogleLogin
              className="google-signin-btn"
              text="signup_with"
              size="large"
              shape="pill"
              theme="filled_black"
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await axios.post(
                    "http://localhost:5500/api/v1/auth/google-signup",
                    { credential: credentialResponse.credential },
                    { withCredentials: true }
                  );
                  if (res.data.success) {
                    if (setUser) setUser(res.data.data.user.username);

                    if (setToken) setToken(res.data.data.token);
                    console.log(res.data.data.token)
                    navigate("/");
                  }
                } catch (error) {
                  console.error("Google sign-up failed:", error);
                  alert(
                    "Google sign-up failed: " +
                      (error.response?.data?.message || error.message)
                  );
                }
              }}
            />
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">or</span>
            <span className="divider-line"></span>
          </div>

          <p className="login-signup-text">
            Already have an account?{" "}
            <Link to="/login" className="login-signup-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
