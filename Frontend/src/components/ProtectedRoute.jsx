import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00bf63'
        }}
      >
        <div 
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(0, 191, 99, 0.2)',
            borderTopColor: '#00bf63',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} 
        />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname, 
          message: 'Please sign in to access Netrium laboratory simulations' 
        }} 
      />
    );
  }

  return children;
}
