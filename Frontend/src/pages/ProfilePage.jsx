import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  ShieldCheck,
  Edit3,
  Camera,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GradientWaves from '../components/GradientWaves';
import darkLogo from '../assets/DarkLogo.png';
import './ProfilePage.css';

const QUALIFICATION_OPTIONS = [
  'High School / Pre-University',
  'Diploma / Polytechnic',
  'Bachelor of Technology (B.Tech / B.E.)',
  'Bachelor of Science (B.S. / B.Sc / B.C.A.)',
  'Master of Technology (M.Tech / M.E.)',
  'Master of Science (M.S. / M.Sc / M.C.A.)',
  'Ph.D. / Doctorate Candidate',
  'Doctor of Philosophy (Ph.D.)',
  'Post-Doctoral Fellow',
  'Self-Taught / Industry Certified Specialist',
  'Other'
];

const POSITION_OPTIONS = [
  'Student / Undergraduate',
  'Graduate / Master’s Student',
  'Ph.D. Scholar / Doctoral Researcher',
  'Professor / Faculty Member',
  'Assistant / Associate Professor',
  'Lab Instructor / Technical Assistant',
  'Research Scientist',
  'Software Engineer / Systems Developer',
  'Systems Architect',
  'Cybersecurity Analyst',
  'Data Scientist / AI Researcher',
  'Other'
];

const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-Binary',
  'Other',
  'Prefer not to say'
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('firstTime') === 'true';

  const { user, token, isAuthenticated, updateProfile, fetchProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(isFirstTime || false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    gender: '',
    age: '',
    qualifications: '',
    position: '',
    institution: '',
    avatar: ''
  });

  // Sync state with authenticated user
  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age !== null && user.age !== undefined ? user.age : '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || '');

      // If user hasn't completed their profile yet, default to editing mode
      if (!user.isProfileComplete || isFirstTime) {
        setIsEditing(true);
      }
    }
  }, [user, isFirstTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Image Upload / Preview Handling (Base64 file or direct Cloudinary URL)
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setAvatarPreview(base64Url);
        setFormData((prev) => ({ ...prev, avatar: base64Url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, avatar: url }));
    setAvatarPreview(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      setSuccessMsg('Profile successfully saved!');

      // Redirect to home screen with changes saved message
      setTimeout(() => {
        navigate('/', { state: { profileSaved: true } });
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isFirstTime || !user?.isProfileComplete) {
      // Return to home screen if user skips on initial signup
      navigate('/');
    } else {
      // Revert edits and switch back to view mode
      setFormData({
        name: user?.name || '',
        phoneNumber: user?.phoneNumber || '',
        gender: user?.gender || '',
        age: user?.age !== null && user?.age !== undefined ? user.age : '',
        qualifications: user?.qualifications || '',
        position: user?.position || '',
        avatar: user?.avatar || ''
      });
      setAvatarPreview(user?.avatar || '');
      setErrorMsg('');
      setIsEditing(false);
    }
  };

  return (
    <div className="netrium-profile-viewport">
      {/* Raymarched GradientWaves Background (Identical to Home Screen) */}
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

      {/* Ambient Radial Highlights */}
      <div className="profile-ambient-glow glow-1" />
      <div className="profile-ambient-glow glow-2" />

      {/* Top Navigation Bar */}
      <header className="profile-header-bar">
        <button
          type="button"
          className="profile-back-btn"
          onClick={() => navigate('/')}
          aria-label="Back to website"
        >
          <ArrowLeft size={16} />
          <span>Back to Laboratory</span>
        </button>

        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="profile-logo-link">
          <img src={darkLogo} alt="Netrium" className="profile-logo-img" />
        </a>
      </header>

      {/* Main Container */}
      <main className="profile-card-container">
        {/* Top Header Card */}
        <div className="profile-banner-card">
          <div className="profile-banner-left">
            <div className="profile-avatar-large">
              {avatarPreview ? (
                <img src={avatarPreview} alt={formData.name || 'User'} />
              ) : (
                <div className="profile-avatar-placeholder">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {isEditing && (
                <label className="profile-avatar-upload-overlay" htmlFor="avatar-file-input" title="Upload avatar">
                  <Camera size={18} />
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            <div className="profile-identity-info">
              <div className="profile-badge-row">
                {user?.isProfileComplete ? (
                  <span className="profile-status-badge complete">
                    <Check size={12} />
                    <span>Profile Verified</span>
                  </span>
                ) : (
                  <span className="profile-status-badge pending">
                    <Sparkles size={12} />
                    <span>Setup Required</span>
                  </span>
                )}
              </div>

              <h1 className="profile-user-fullname">{formData.name || 'Netrium Researcher'}</h1>
              <p className="profile-user-email">
                <Mail size={14} />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          {/* Edit Button on Top Right (in View Mode) */}
          {!isEditing && (
            <button
              type="button"
              className="profile-top-edit-btn"
              onClick={() => setIsEditing(true)}
              title="Edit Profile Information"
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* First-time Welcome Notice */}
        {isFirstTime && (
          <div className="profile-firsttime-alert">
            <Sparkles size={18} className="text-emerald-400" />
            <div>
              <strong>Welcome to Netrium Systems Platform!</strong>
              <p>Please complete your profile details below to personalize your research simulations and access credentials.</p>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="profile-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="profile-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Content: Edit Mode Form vs View Mode Grid */}
        {isEditing ? (
          <form className="profile-form-body" onSubmit={handleSave}>
            <div className="profile-section-heading">
              <h2>Researcher Credentials & Details</h2>
              <p>Update your personal information, qualifications, and role designation in the laboratory.</p>
            </div>

            <div className="profile-fields-grid">
              {/* Full Name */}
              <div className="profile-input-group">
                <label htmlFor="name">
                  <User size={14} />
                  <span>Full Name <strong className="required">*</strong></span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Diwakar Rajesh Nagar"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="profile-input-group">
                <label htmlFor="phoneNumber">
                  <Phone size={14} />
                  <span>Phone Number</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Gender */}
              <div className="profile-input-group">
                <label htmlFor="gender">
                  <User size={14} />
                  <span>Gender</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Age */}
              <div className="profile-input-group">
                <label htmlFor="age">
                  <Calendar size={14} />
                  <span>Age</span>
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  min="12"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 23"
                />
              </div>

              {/* Qualifications (Dropdown) */}
              <div className="profile-input-group">
                <label htmlFor="qualifications">
                  <GraduationCap size={14} />
                  <span>Qualifications</span>
                </label>
                <select
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                >
                  <option value="">Select Qualification</option>
                  {QUALIFICATION_OPTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Position (Dropdown) */}
              <div className="profile-input-group">
                <label htmlFor="position">
                  <Briefcase size={14} />
                  <span>Position / Role</span>
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="">Select Position / Designation</option>
                  {POSITION_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Institution Name */}
              <div className="profile-input-group full-width">
                <label htmlFor="institution">
                  <Building2 size={14} />
                  <span>Institution / University / Organization</span>
                </label>
                <input
                  id="institution"
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder="e.g. Stanford University, MIT, Indian Institute of Technology, or Google Research"
                />
              </div>
            </div>

            {/* Bottom Actions: Save or Cancel */}
            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-btn-cancel"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="profile-btn-save"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="profile-view-body">
            <div className="profile-section-heading">
              <h2>Credentials & Research Information</h2>
              <p>Your current laboratory credentials registered in the Netrium database.</p>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-card">
                <div className="info-icon-box">
                  <User size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{formData.name || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <Mail size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user?.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <Phone size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{formData.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <User size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{formData.gender || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <Calendar size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Age</span>
                  <span className="info-value">
                    {formData.age ? `${formData.age} years` : 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <GraduationCap size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Qualification</span>
                  <span className="info-value">{formData.qualifications || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <Briefcase size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Position / Designation</span>
                  <span className="info-value">{formData.position || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <Building2 size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Institution / Organization</span>
                  <span className="info-value">{formData.institution || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Authentication Type</span>
                  <span className="info-value text-emerald-400 capitalize">
                    {user?.authProvider || 'Local'} &bull; Database Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
