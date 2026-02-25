import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import UserDashboard from './pages/UserDashboard';
import PredictionPage from './pages/PredictionPage';
import ResultPage from './pages/ResultPage';

/**
 * HealthPredict - Main App Router
 *
 * Pages:
 *   'landing'          → LandingPage
 *   'login'            → LoginPage
 *   'admin-dashboard'  → AdminDashboard
 *   'staff-dashboard'  → StaffDashboard
 *   'user-dashboard'   → UserDashboard
 *   'prediction'       → PredictionPage
 *   'result'           → ResultPage
 */
function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [riskLevel, setRiskLevel] = useState('high'); // 'low' | 'medium' | 'high'

  const navigate = (page, options = {}) => {
    if (options.riskLevel) {
      setRiskLevel(options.riskLevel);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageProps = { onNavigate: navigate, riskLevel };

  switch (currentPage) {
    case 'landing':
      return <LandingPage {...pageProps} />;
    case 'login':
      return <LoginPage {...pageProps} />;
    case 'admin-dashboard':
      return <AdminDashboard {...pageProps} />;
    case 'staff-dashboard':
      return <StaffDashboard {...pageProps} />;
    case 'user-dashboard':
      return <UserDashboard {...pageProps} />;
    case 'prediction':
      return <PredictionPage {...pageProps} />;
    case 'result':
      return <ResultPage {...pageProps} />;
    default:
      return <LandingPage {...pageProps} />;
  }
}

export default App;
