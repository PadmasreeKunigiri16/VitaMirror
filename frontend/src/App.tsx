import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import WellnessCheckPage from './pages/WellnessCheckPage';
import HistoryPage from './pages/HistoryPage';
import ResultPage from './pages/ResultPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page – no navbar */}
        <Route path="/" element={<LandingPage />} />

        {/* App pages – with navbar */}
        <Route
          path="/*"
          element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/check" element={<WellnessCheckPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/:id" element={<ResultPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
