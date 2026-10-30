import { useEffect, useState} from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from '@react-oauth/google';
                                     
import "./login.css";
import axios from "axios";
import slide1 from "../assets/1.jpg";
import slide2 from "../assets/2.jpg";
import slide3 from "../assets/3.jpg";
import { LoadingScreen } from "../components/loading";

const slides = [slide1, slide2, slide3];



export function Login({user,setUser,token,setToken}) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
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



  async function handleLogin(e) {
    setIsLoading(true);
    e.preventDefault(); 
    try {
      const res = await axios.post('http://localhost:5500/api/v1/auth/sign-in', {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      },{ withCredentials: true });
      if (res.data.success) {
        setUser(res.data.data.user)
        setToken(res.data.data.token)
        console.log("success")
        navigate("/")
     
      }
    } catch (error) {

      console.error("Login failed:", error.response ? error.response.data : error.message);

      return alert("Login failed: " + (error.response ? error.response.data.message : error.message));
    } finally {
      setIsLoading(false);
    }
    
  
  
  }
  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <div className={`login-page ${loaded ? "animate-in" : ""}`}>

                                               
      <div className="login-visual-panel">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`login-slide-bg ${i === currentSlide ? "active" : ""}`}
          >
            <img src={src} alt="Cinematic work" className="login-slide-img" />
          </div>
        ))}

                             
        <div className="login-visual-vignette"></div>

                                              
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

                                           
      <div className="login-form-panel">
        <div className="login-form-inner">

                                          
          <Link to="/" className="login-brand-mobile">
            <span className="brand-light">CINEMATIC</span>
            <span className="login-brand-dot"></span>
            <span className="brand-bold">EYE</span>
          </Link>

                             
          <div className="login-form-header">
            <span className="login-eyebrow">
              <span className="eyebrow-dot"></span>
              Secure Access
            </span>
            <h1 className="login-heading">WELCOME<br /><span className="gold-accent">BACK</span></h1>
            <p className="login-subtext">Sign in to continue to your creative workspace.</p>
          </div>

                      
          <form className="login-form" onSubmit={handleLogin}>

            <div className="form-field-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-field-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="form-remember">
              <label className="remember-label">
                <input type="checkbox" className="remember-checkbox" />
                <span className="remember-custom-box"></span>
                <span className="remember-text">Remember me</span>
              </label>
            </div>

            <button type="submit" className="login-submit-btn" >
              <span>Sign In</span>
              <svg className="submit-arrow" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
           <GoogleLogin
             className="google-signin-btn"
             text="continue_with"
             size="large"
             shape="pill"
             theme="filled_black"
             onSuccess={async (credentialResponse) => {
               try {
                 const res = await axios.post(
                   'http://localhost:5500/api/v1/auth/google-signup',
                   { credential: credentialResponse.credential },
                   { withCredentials: true }
                 );
                 if (res.data.success) {
                   setUser(res.data.data.user);
                   setToken(res.data.data.token);
                   navigate('/');
                 }
               } catch (error) {
                 console.error('Google sign-in failed:', error);
               }
             }}
           />
          </form>

                         
          <div className="login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">or</span>
            <span className="divider-line"></span>
            
          </div>
         
          <p className="login-signup-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-signup-link">Create Account</Link>
          </p>

        </div>
      </div>

    </div>
  );
}