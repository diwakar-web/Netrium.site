import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GradientWaves from '../components/GradientWaves';
import darkLogo from '../assets/DarkLogo.png';
import authBanner from '../assets/auth_banner.jpg';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    sendOtp,
    verifyAndRegister,
    loginWithGoogle,
    loginWithGithub,
    forgotPasswordSendOtp,
    forgotPasswordVerifyOtp,
    forgotPasswordReset,
    forgotPasswordContinue,
    isAuthenticated
  } = useAuth();

  // Mode: 'login' | 'signup' | 'forgot'
  const initialMode = location.state?.mode || (location.pathname === '/login' ? 'login' : 'signup');
  const [mode, setMode] = useState(initialMode);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // Signup step: 1 (form) -> 2 (OTP verification)
  const [signupStep, setSignupStep] = useState(1);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Options (reset or continue)
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const forgotOtpRefs = useRef([]);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'github'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  // Banner carousel slides
  const bannerSlides = [
    {
      title: 'Capturing Moments, Creating Memories',
      subtitle: 'Real-Time Interactive Systems Laboratory'
    },
    {
      title: 'Architecting Systems, Visualizing Networks',
      subtitle: 'Algorithm Sandboxes & Distributed Meshes'
    },
    {
      title: 'Stateless Cryptography, High-Speed Compute',
      subtitle: 'Multi-Device Laboratory & Dedicated JWT Protocol'
    }
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  const otpInputRefs = useRef([]);

  // Auto-cycle banner slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Countdown timer for 5-minute OTP validity
  useEffect(() => {
    let interval = null;
    const isOtpActive = signupStep === 2 || (mode === 'forgot' && forgotStep === 2);
    if (isOtpActive && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [signupStep, mode, forgotStep, otpTimerSeconds]);

  // Resend cooldown timer
  useEffect(() => {
    let timer = null;
    const isOtpActive = signupStep === 2 || (mode === 'forgot' && forgotStep === 2);
    if (isOtpActive && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupStep, mode, forgotStep, resendCooldown]);

  // Auto redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && successMsg) {
      const timeout = setTimeout(() => {
        navigate('/');
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, successMsg, navigate]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP digit inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // 1. Direct Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      if (!data?.user?.isProfileComplete) {
        setSuccessMsg('Authentication successful. Redirecting to profile setup...');
        setTimeout(() => navigate('/profile?firstTime=true'), 900);
      } else {
        setSuccessMsg('Authentication successful. Welcome to Netrium.');
        setTimeout(() => navigate('/'), 900);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Signup Step 1: Send 5-Minute OTP
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Terms & Conditions to create an account.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setIsLoading(true);
    try {
      const res = await sendOtp(email, fullName);
      setSuccessMsg(`A 6-digit passcode has been mailed to ${email}. Valid for 5 minutes.`);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setSignupStep(2);
      setOtpTimerSeconds(300); // 5 mins
      setResendCooldown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setErrorMsg(err.message || 'Could not send verification OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Signup Step 2: Verify OTP and Register
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (otpTimerSeconds === 0) {
      setErrorMsg('This passcode has expired (5 minute window passed). Please click Resend Code.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setIsLoading(true);
    try {
      await verifyAndRegister({
        name: fullName,
        email,
        password,
        otp: fullOtp
      });
      setSuccessMsg('Account verified! Welcome to Netrium. Please complete your profile...');
      setTimeout(() => navigate('/profile?firstTime=true'), 900);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Researcher';
    try {
      const res = await sendOtp(email, fullName);
      setSuccessMsg(`Fresh 5-minute passcode dispatched to ${email}.`);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setOtpTimerSeconds(300);
      setResendCooldown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Firebase Sign-in
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setOauthLoading('google');
    try {
      const res = await loginWithGoogle();
      if (res?.isNewUser || !res?.user?.isProfileComplete) {
        setSuccessMsg('Google verification complete! Setting up your profile...');
        setTimeout(() => navigate('/profile?firstTime=true'), 900);
      } else {
        setSuccessMsg('Google verification completed. Welcome back!');
        setTimeout(() => navigate('/'), 900);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Firebase Google authentication failed.');
    } finally {
      setOauthLoading(null);
    }
  };

  // GitHub Firebase Sign-in
  const handleGithubLogin = async () => {
    setErrorMsg('');
    setOauthLoading('github');
    try {
      const res = await loginWithGithub();
      if (res?.isNewUser || !res?.user?.isProfileComplete) {
        setSuccessMsg('GitHub verification complete! Setting up your profile...');
        setTimeout(() => navigate('/profile?firstTime=true'), 900);
      } else {
        setSuccessMsg('GitHub verification completed. Welcome back!');
        setTimeout(() => navigate('/'), 900);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Firebase GitHub authentication failed.');
    } finally {
      setOauthLoading(null);
    }
  };

  // ========================================================
  // FORGOT PASSWORD FLOW HANDLERS
  // ========================================================

  const handleForgotOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...forgotOtpDigits];
    newDigits[index] = value.slice(-1);
    setForgotOtpDigits(newDigits);

    if (value && index < 5) {
      forgotOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtpDigits[index] && index > 0) {
      forgotOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setForgotOtpDigits(digits);
      forgotOtpRefs.current[5]?.focus();
    }
  };

  // Step 1: Send OTP to registered email
  const handleForgotSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPasswordSendOtp(forgotEmail.trim());
      setSuccessMsg(`A 6-digit passcode has been mailed to ${forgotEmail.trim()}. Valid for 5 minutes.`);
      if (res?.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setForgotStep(2);
      setOtpTimerSeconds(300);
      setResendCooldown(30);
      setCanResend(false);
      setForgotOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleForgotResendOtp = async () => {
    if (!canResend || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await forgotPasswordSendOtp(forgotEmail.trim());
      setSuccessMsg(`Fresh 5-minute passcode dispatched to ${forgotEmail.trim()}.`);
      if (res?.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setOtpTimerSeconds(300);
      setResendCooldown(30);
      setCanResend(false);
      setForgotOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = forgotOtpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (otpTimerSeconds === 0) {
      setErrorMsg('This passcode has expired (5 minute window passed). Please click Resend Code.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordVerifyOtp(forgotEmail.trim(), fullOtp);
      setSuccessMsg('Passcode verified! You can update your password or continue to your workspace.');
      setForgotStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Update Password and Log In
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both entries.');
      return;
    }

    const fullOtp = forgotOtpDigits.join('');
    setIsLoading(true);
    try {
      await forgotPasswordReset(forgotEmail.trim(), fullOtp, forgotNewPassword);
      setSuccessMsg('Password updated successfully! Logging you in...');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Continue For Now Option
  const handleForgotContinueForNow = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const fullOtp = forgotOtpDigits.join('');
    setIsLoading(true);
    try {
      await forgotPasswordContinue(forgotEmail.trim(), fullOtp);
      setSuccessMsg('Authentication confirmed! Welcome back to Netrium.');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-viewport-wrapper">
      {/* React Bits Raymarched GradientWaves Background (Matches Home Screen) */}
      <GradientWaves
        horizonColor="#000000ff"
        waveColor="#c6c6c6ff"
        crestColor="#ffffff"
        speed={0.4}
        amplitude={2.8}
        waveScale={0.6}
        waveRatio={0.9}
        swell={30}
        turbulence={18}
        tilt={1.11}
        zoom={1.0}
        height={5.0}
        fogDepth={22}
        detail="medium"
        brightness={1.2}
        opacity={0.95}
        mouseInteraction={true}
        parallaxStrength={0.5}
        grain={true}
        grainIntensity={0.04}
      />

      {/* Ambient background glows */}
      <div className="auth-ambient-glow glow-top" />
      <div className="auth-ambient-glow glow-bottom" />

      {/* Main Floating Auth Card */}
      <div className="auth-card-container">
        {/* Left Side: Visual Showcase Banner */}
        <div
          className="auth-banner-side"
          style={{ backgroundImage: `url(${authBanner})` }}
        >
          <div className="auth-banner-overlay" />

          {/* Top Bar inside Left Banner */}
          <div className="auth-banner-header">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="auth-banner-logo-link"
              aria-label="Netrium Home"
            >
              <img src={darkLogo} alt="Netrium" className="auth-banner-logo" />
            </a>

            <button
              type="button"
              className="auth-back-pill-btn"
              onClick={() => navigate('/')}
            >
              <span>Back to website</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Bottom Slogan & Carousel Dots */}
          <div className="auth-banner-footer">
            <h2 className="auth-banner-slogan">
              {bannerSlides[activeSlide].title}
            </h2>

            <div className="auth-banner-dots-row">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`auth-banner-dot ${activeSlide === idx ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form Panel */}
        <div className="auth-form-side">

          {/* Alert Messages */}
          {errorMsg && (
            <div className="auth-status-alert error">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-status-alert success">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {debugOtp && ((signupStep === 2 && mode === 'signup') || (forgotStep === 2 && mode === 'forgot')) && (
            <div className="auth-status-alert dev-otp">
              <Key size={14} />
              <div>
                <strong>Passcode (Dev Mode): </strong>
                <span className="otp-dev-code">{debugOtp}</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIGNUP STEP 1                                            */}
          {/* ======================================================== */}
          {mode === 'signup' && signupStep === 1 && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Create an account</h1>
                <p className="auth-sub-title">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-link-text"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    Log in
                  </button>
                </p>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="auth-input-form">
                {/* First Name & Last Name in 2 columns */}
                <div className="auth-name-grid">
                  <div className="auth-field">
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="auth-field">
                  <input
                    type="email"
                    className="auth-text-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div className="auth-field password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Terms & Conditions Checkbox */}
                <label className="auth-checkbox-row">
                  <input
                    type="checkbox"
                    className="auth-hidden-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className={`auth-styled-checkbox ${agreedToTerms ? 'checked' : ''}`}>
                    {agreedToTerms && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="auth-checkbox-text">
                    I agree to the{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()}>
                      Terms & Conditions
                    </a>
                  </span>
                </label>

                {/* Primary Button */}
                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create account</span>
                  )}
                </button>

                {/* Divider */}
                <div className="auth-divider-line">
                  <span>Or register with</span>
                </div>

                {/* Social Login: Google & GitHub */}
                <div className="auth-social-grid">
                  <button
                    type="button"
                    className="auth-social-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <RefreshCw size={15} className="spin-icon" />
                    ) : (
                      <svg className="social-svg-icon" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="auth-social-button"
                    onClick={handleGithubLogin}
                    disabled={isLoading || oauthLoading !== null}
                  >
                    {oauthLoading === 'github' ? (
                      <RefreshCw size={15} className="spin-icon" />
                    ) : (
                      <svg className="social-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    )}
                    <span>GitHub</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* LOGIN MODE                                               */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Log in to account</h1>
                <p className="auth-sub-title">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="auth-link-text"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setSignupStep(1);
                    }}
                  >
                    Sign up
                  </button>
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="auth-input-form">
                {/* Email Field */}
                <div className="auth-field">
                  <input
                    type="email"
                    className="auth-text-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="auth-field password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="auth-remember-row">
                  <label className="auth-checkbox-row">
                    <input
                      type="checkbox"
                      className="auth-hidden-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className={`auth-styled-checkbox ${rememberMe ? 'checked' : ''}`}>
                      {rememberMe && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="auth-checkbox-text">Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep(1);
                      setForgotEmail(email || '');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Log in</span>
                  )}
                </button>

                {/* Divider */}
                <div className="auth-divider-line">
                  <span>Or log in with</span>
                </div>

                {/* Social Login: Google & GitHub */}
                <div className="auth-social-grid">
                  <button
                    type="button"
                    className="auth-social-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || oauthLoading !== null}
                  >
                    {oauthLoading === 'google' ? (
                      <RefreshCw size={15} className="spin-icon" />
                    ) : (
                      <svg className="social-svg-icon" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="auth-social-button"
                    onClick={handleGithubLogin}
                    disabled={isLoading || oauthLoading !== null}
                  >
                    {oauthLoading === 'github' ? (
                      <RefreshCw size={15} className="spin-icon" />
                    ) : (
                      <svg className="social-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    )}
                    <span>GitHub</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIGNUP STEP 2: 6-DIGIT OTP VERIFICATION                  */}
          {/* ======================================================== */}
          {mode === 'signup' && signupStep === 2 && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Verify passcode</h1>
                <p className="auth-sub-title">
                  Enter the 6-digit code sent to <strong className="auth-target-email">{email}</strong>
                </p>
              </div>

              {/* 5-minute timer indicator */}
              <div className={`auth-otp-timer-badge ${otpTimerSeconds <= 60 ? 'urgent' : ''}`}>
                <Clock size={14} />
                <span>Valid for: <strong>{formatTime(otpTimerSeconds)}</strong></span>
                {otpTimerSeconds === 0 && <span className="auth-expired-tag">EXPIRED</span>}
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="auth-input-form">
                <div className="auth-otp-cells-row" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`auth-otp-box ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading || otpTimerSeconds === 0}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <span>Verify & Launch Account</span>
                  )}
                </button>

                <div className="auth-otp-footer-actions">
                  <button
                    type="button"
                    className="auth-sub-action-btn"
                    onClick={() => setSignupStep(1)}
                  >
                    <ArrowLeft size={13} />
                    <span>Edit details</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-sub-action-btn ${!canResend ? 'disabled' : ''}`}
                    onClick={handleResendOtp}
                    disabled={!canResend || isLoading}
                  >
                    <RefreshCw size={13} />
                    <span>{canResend ? 'Resend code' : `Resend in ${resendCooldown}s`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORGOT PASSWORD STEP 1: ENTER REGISTERED EMAIL          */}
          {/* ======================================================== */}
          {mode === 'forgot' && forgotStep === 1 && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Reset password</h1>
                <p className="auth-sub-title">
                  Enter your registered email address and we'll send a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleForgotSendOtp} className="auth-input-form">
                <div className="auth-field">
                  <input
                    type="email"
                    className="auth-text-input"
                    placeholder="Registered email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <span>Send verification code</span>
                  )}
                </button>

                <div className="auth-otp-footer-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="auth-sub-action-btn"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>Back to log in</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORGOT PASSWORD STEP 2: VERIFY OTP                       */}
          {/* ======================================================== */}
          {mode === 'forgot' && forgotStep === 2 && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Verify passcode</h1>
                <p className="auth-sub-title">
                  Enter the 6-digit code sent to <strong className="auth-target-email">{forgotEmail}</strong>
                </p>
              </div>

              <div className={`auth-otp-timer-badge ${otpTimerSeconds <= 60 ? 'urgent' : ''}`}>
                <Clock size={14} />
                <span>Valid for: <strong>{formatTime(otpTimerSeconds)}</strong></span>
                {otpTimerSeconds === 0 && <span className="auth-expired-tag">EXPIRED</span>}
              </div>

              <form onSubmit={handleForgotVerifyOtp} className="auth-input-form">
                <div className="auth-otp-cells-row" onPaste={handleForgotOtpPaste}>
                  {forgotOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (forgotOtpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`auth-otp-box ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading || otpTimerSeconds === 0}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <span>Verify Passcode</span>
                  )}
                </button>

                <div className="auth-otp-footer-actions">
                  <button
                    type="button"
                    className="auth-sub-action-btn"
                    onClick={() => setForgotStep(1)}
                  >
                    <ArrowLeft size={13} />
                    <span>Change email</span>
                  </button>

                  <button
                    type="button"
                    className={`auth-sub-action-btn ${!canResend ? 'disabled' : ''}`}
                    onClick={handleForgotResendOtp}
                    disabled={!canResend || isLoading}
                  >
                    <RefreshCw size={13} />
                    <span>{canResend ? 'Resend code' : `Resend in ${resendCooldown}s`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORGOT PASSWORD STEP 3: RESET OR CONTINUE FOR NOW        */}
          {/* ======================================================== */}
          {mode === 'forgot' && forgotStep === 3 && (
            <div className="auth-form-inner">
              <div className="auth-heading-group">
                <h1 className="auth-main-title">Password options</h1>
                <p className="auth-sub-title">
                  You've verified access. Choose to update your password now or continue directly to your workspace.
                </p>
              </div>

              <form onSubmit={handleForgotResetPassword} className="auth-input-form">
                <div className="auth-field password-field">
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder="New password (min. 6 chars)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    aria-label={showForgotNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="auth-field password-field">
                  <input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder="Confirm new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    aria-label={showForgotConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showForgotConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="auth-submit-primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update password & Log in</span>
                  )}
                </button>

                <div className="auth-divider-line">
                  <span>Or skip for now</span>
                </div>

                <button
                  type="button"
                  className="auth-continue-btn"
                  onClick={handleForgotContinueForNow}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="spin-icon" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue for now without changing password</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
