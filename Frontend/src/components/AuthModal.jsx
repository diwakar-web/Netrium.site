import { useState } from 'react'
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react'
import { GithubIcon } from './SocialIcons'

export default function AuthModal({ initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-logo-badge">
            <span>Netrium Account</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close auth modal">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="auth-success-screen">
            <div className="success-icon-wrap">✓</div>
            <h3>Welcome to Netrium</h3>
            <p>Your systems laboratory environment is being initialized...</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-tabs">
              <button 
                type="button" 
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Create Account
              </button>
            </div>

            <div className="auth-inputs">
              {mode === 'signup' && (
                <div className="input-group">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}

              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@university.edu or company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>{mode === 'login' ? 'Sign In to Laboratory' : 'Start Free Experimentation'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button 
              type="button" 
              className="oauth-btn"
              onClick={() => {
                setIsSuccess(true)
                setTimeout(() => onClose(), 1200)
              }}
            >
              <GithubIcon size={18} />
              <span>GitHub Single Sign-On</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
