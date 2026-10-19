import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider, signInWithPopup, signOut } from '../lib/firebase';

const AuthContext = createContext(null);

const TOKEN_KEY = 'netrium_dedicated_jwt_token';
const USER_KEY = 'netrium_user_profile';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [jwtDetails, setJwtDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session and retrieve current user/JWT status on mount
  useEffect(() => {
    const initAuth = async () => {
      const activeToken = localStorage.getItem(TOKEN_KEY);
      if (activeToken) {
        try {
          const res = await fetch('/api/auth/jwt-status', {
            headers: {
              'Authorization': `Bearer ${activeToken}`
            }
          });
          const data = await res.json();
          if (data.isValid) {
            setJwtDetails(data);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.warn('[Auth Initialization Notice]', err.message);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const saveAuthSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  /**
   * Send 6-digit OTP to user email (First-time account creation ONLY)
   */
  const sendOtp = async (email, name) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to dispatch verification OTP');
    }
    return data;
  };

  /**
   * Verify OTP and complete registration, storing user in MongoDB and issuing dedicated JWT
   */
  const verifyAndRegister = async ({ name, email, password, otp }) => {
    const res = await fetch('/api/auth/verify-and-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration verification failed');
    }

    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
      fetchJwtStatus(data.token);
    }
    return data;
  };

  /**
   * Direct Login with Email and Password (NO OTP on login)
   */
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to sign in');
    }

    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
      fetchJwtStatus(data.token);
    }
    return data;
  };

  /**
   * Google Sign-In using Firebase OAuth, synced with MongoDB & dedicated JWT
   */
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          firebaseUid: firebaseUser.uid,
          avatar: firebaseUser.photoURL,
          authProvider: 'google'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google authentication synchronization failed');
      }

      if (data.token && data.user) {
        saveAuthSession(data.token, data.user);
        fetchJwtStatus(data.token);
      }
      return data;
    } catch (err) {
      console.error('[Firebase Google Sign In Error]', err);
      throw err;
    }
  };

  /**
   * GitHub Sign-In using Firebase OAuth, synced with MongoDB & dedicated JWT
   */
  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user;

      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.reloadUserInfo?.screenName || 'GitHub Engineer',
          firebaseUid: firebaseUser.uid,
          avatar: firebaseUser.photoURL,
          authProvider: 'github'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'GitHub authentication synchronization failed');
      }

      if (data.token && data.user) {
        saveAuthSession(data.token, data.user);
        fetchJwtStatus(data.token);
      }
      return data;
    } catch (err) {
      console.error('[Firebase GitHub Sign In Error]', err);
      throw err;
    }
  };

  /**
   * Inspect and retrieve status of dedicated JWT token
   */
  const fetchJwtStatus = async (overrideToken) => {
    const activeToken = overrideToken || token || localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return null;

    try {
      const res = await fetch('/api/auth/jwt-status', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      setJwtDetails(data);
      return data;
    } catch (err) {
      console.error('[JWT Status Fetch Error]', err);
      return null;
    }
  };

  /**
   * Fetch current authenticated profile details
   */
  const fetchProfile = async () => {
    const activeToken = token || localStorage.getItem(TOKEN_KEY);
    if (!activeToken) return null;

    try {
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('[Fetch Profile Error]', err);
      return null;
    }
  };

  /**
   * Update authenticated profile details
   */
  const updateProfile = async (profileData) => {
    const activeToken = token || localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    if (data.user) {
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  };

  /**
   * Secure Logout
   */
  const logout = async () => {
    setToken(null);
    setUser(null);
    setJwtDetails(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
  };

  /**
   * Request 6-digit OTP for Forgot Password
   */
  const forgotPasswordSendOtp = async (email) => {
    const res = await fetch('/api/auth/forgot-password/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to dispatch recovery code.');
    }
    return data;
  };

  /**
   * Verify recovery OTP
   */
  const forgotPasswordVerifyOtp = async (email, otp) => {
    const res = await fetch('/api/auth/forgot-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Passcode verification failed.');
    }
    return data;
  };

  /**
   * Update password with verified OTP and login
   */
  const forgotPasswordReset = async (email, otp, newPassword) => {
    const res = await fetch('/api/auth/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update password.');
    }

    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
      fetchJwtStatus(data.token);
    }
    return data;
  };

  /**
   * Continue without updating password using verified OTP
   */
  const forgotPasswordContinue = async (email, otp) => {
    const res = await fetch('/api/auth/forgot-password/continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to authenticate session.');
    }

    if (data.token && data.user) {
      saveAuthSession(data.token, data.user);
      fetchJwtStatus(data.token);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        jwtDetails,
        login,
        sendOtp,
        verifyAndRegister,
        loginWithGoogle,
        loginWithGithub,
        logout,
        fetchJwtStatus,
        fetchProfile,
        updateProfile,
        forgotPasswordSendOtp,
        forgotPasswordVerifyOtp,
        forgotPasswordReset,
        forgotPasswordContinue
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
