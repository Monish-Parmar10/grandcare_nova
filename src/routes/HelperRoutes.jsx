import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HelperDashboard from '../pages/HelperDashboard';
import HelpConnectPage from '../pages/HelpConnectPage';
import ProfilePage from '../pages/ProfilePage';

const HelperRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<HelperDashboard />} />
      <Route path="help-connect" element={<HelpConnectPage role="helper" />} />
      <Route path="profile" element={<ProfilePage role="helper" />} />
      <Route path="*" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default HelperRoutes;
