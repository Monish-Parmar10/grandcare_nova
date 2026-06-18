import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ElderDashboard from '../pages/ElderDashboard';
import MedicinePage from '../pages/MedicinePage';
import RoutinePage from '../pages/RoutinePage';
import NewsQuizPage from '../pages/NewsQuizPage';
import HelpConnectPage from '../pages/HelpConnectPage';
import SOSSettingsPage from '../pages/SOSSettingsPage';
import ProfilePage from '../pages/ProfilePage';

const ElderRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<ElderDashboard />} />
      <Route path="medicines" element={<MedicinePage />} />
      <Route path="routine" element={<RoutinePage />} />
      <Route path="news-quiz" element={<NewsQuizPage />} />
      <Route path="help-connect" element={<HelpConnectPage role="elder" />} />
      <Route path="sos-settings" element={<SOSSettingsPage />} />
      <Route path="profile" element={<ProfilePage role="elder" />} />
      <Route path="*" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default ElderRoutes;
