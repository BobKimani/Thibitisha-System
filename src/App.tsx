import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ValidatorPage from './pages/validator';
import DashboardPage from './pages/dashboard';
import ReportsPage from './pages/reports';
import SettingsPage from './pages/settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/validate" element={<ValidatorPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>  
  );
}

export default App;