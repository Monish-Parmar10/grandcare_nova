import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElderRoutes from './routes/ElderRoutes';
import HelperRoutes from './routes/HelperRoutes';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Elder Routes */}
          <Route
            path="/elder/*"
            element={
              <ProtectedRoute allowedRole="elder">
                <ElderRoutes />
              </ProtectedRoute>
            }
          />

          {/* Helper Routes */}
          <Route
            path="/helper/*"
            element={
              <ProtectedRoute allowedRole="helper">
                <HelperRoutes />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Bottom Navbar - only visible when logged in */}
        {user && <Navbar />}
      </div>
    </Router>
  );
};

export default App;
