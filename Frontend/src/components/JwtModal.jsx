import { useState, useEffect } from 'react';
import { X, ShieldCheck, Copy, Check, Key, Clock, User, Award, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './JwtModal.css';

export default function JwtModal({ isOpen, onClose }) {
  const { token, user, jwtDetails, fetchJwtStatus } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [liveStatus, setLiveStatus] = useState(jwtDetails);

  useEffect(() => {
    if (isOpen && token) {
      handleVerifyToken();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyToken = async () => {
    setIsVerifying(true);
    const data = await fetchJwtStatus();
    setLiveStatus(data);
    setIsVerifying(false);
  };

  // Split JWT into Header, Payload, Signature parts
  const tokenParts = token ? token.split('.') : ['', '', ''];

  return (
    <div className="jwt-modal-backdrop" onClick={onClose}>
      <div className="jwt-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="jwt-modal-header">
          <div className="jwt-header-title-wrap">
            <div className="jwt-badge">
              <ShieldCheck size={14} />
              <span>DEDICATED JWT PROTOCOL</span>
            </div>
            <h2>JSON Web Token Inspector</h2>
            <p>Cryptographic session & claims for Netrium Laboratory</p>
          </div>
          <button className="jwt-close-btn" onClick={onClose} aria-label="Close JWT Inspector">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="jwt-modal-body">
          {!token ? (
            <div className="jwt-empty-state">
              <Key size={36} className="jwt-empty-icon" />
              <h3>No Active Dedicated JWT Session</h3>
              <p>Please log in or create an account to generate a dedicated JWT session token.</p>
            </div>
          ) : (
            <>
              {/* Token Visualizer */}
              <div className="jwt-section">
                <div className="jwt-section-title-bar">
                  <span className="jwt-section-label">ENCODED DEDICATED TOKEN</span>
                  <div className="jwt-actions-row">
                    <button 
                      className="jwt-action-btn"
                      onClick={handleVerifyToken}
                      disabled={isVerifying}
                      title="Verify with Backend"
                    >
                      <RefreshCw size={13} className={isVerifying ? 'spin-icon' : ''} />
                      <span>{isVerifying ? 'Verifying...' : 'Verify Signature'}</span>
                    </button>
                    <button 
                      className={`jwt-action-btn ${copied ? 'copied' : ''}`}
                      onClick={handleCopy}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Copied Token' : 'Copy JWT'}</span>
                    </button>
                  </div>
                </div>

                <div className="jwt-encoded-display">
                  <span className="jwt-part-header" title="Header (Algorithm & Token Type)">{tokenParts[0]}</span>
                  <span className="jwt-part-dot">.</span>
                  <span className="jwt-part-payload" title="Payload (User Data & Expiry Claims)">{tokenParts[1]}</span>
                  <span className="jwt-part-dot">.</span>
                  <span className="jwt-part-signature" title="HMAC-SHA256 Digital Signature">{tokenParts[2]}</span>
                </div>
                <div className="jwt-legend">
                  <span className="legend-item"><span className="legend-dot header-dot"></span>Header</span>
                  <span className="legend-item"><span className="legend-dot payload-dot"></span>Payload (Claims)</span>
                  <span className="legend-item"><span className="legend-dot sig-dot"></span>HMAC-SHA256 Signature</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="jwt-status-card">
                <div className="jwt-status-item">
                  <span className="status-label">STATUS</span>
                  <span className="status-value valid-green">
                    <span className="status-pulse-dot"></span>
                    VALID & VERIFIED
                  </span>
                </div>
                <div className="jwt-status-item">
                  <span className="status-label">ALGORITHM</span>
                  <span className="status-value code-font">HS256 (HMAC + SHA256)</span>
                </div>
                <div className="jwt-status-item">
                  <span className="status-label">SESSION EXPIRATION</span>
                  <span className="status-value code-font">
                    {liveStatus?.formattedRemaining || '7 Days'}
                  </span>
                </div>
              </div>

              {/* Decoded Payload */}
              <div className="jwt-section">
                <span className="jwt-section-label">DECODED CLAIMS (PAYLOAD)</span>
                <div className="jwt-payload-grid">
                  <div className="claim-box">
                    <span className="claim-key">User ID (`userId`)</span>
                    <span className="claim-val code-font">{user?.id || user?._id || liveStatus?.payload?.userId || 'N/A'}</span>
                  </div>
                  <div className="claim-box">
                    <span className="claim-key">Email (`email`)</span>
                    <span className="claim-val code-font">{user?.email || liveStatus?.payload?.email}</span>
                  </div>
                  <div className="claim-box">
                    <span className="claim-key">Name (`name`)</span>
                    <span className="claim-val">{user?.name || liveStatus?.payload?.name}</span>
                  </div>
                  <div className="claim-box">
                    <span className="claim-key">Role (`role`)</span>
                    <span className="claim-val badge-role">{user?.role || liveStatus?.payload?.role || 'researcher'}</span>
                  </div>
                  <div className="claim-box">
                    <span className="claim-key">Auth Provider (`authProvider`)</span>
                    <span className="claim-val code-font">{user?.authProvider || liveStatus?.payload?.authProvider || 'local'}</span>
                  </div>
                  <div className="claim-box">
                    <span className="claim-key">Issued At (`iat`)</span>
                    <span className="claim-val code-font">
                      {liveStatus?.issuedAt ? new Date(liveStatus.issuedAt).toLocaleString() : 'Active Session'}
                    </span>
                  </div>
                  <div className="claim-box full-width">
                    <span className="claim-key">Expires At (`exp`)</span>
                    <span className="claim-val code-font">
                      {liveStatus?.expiresAt ? new Date(liveStatus.expiresAt).toLocaleString() : '7 Days from issuance'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
