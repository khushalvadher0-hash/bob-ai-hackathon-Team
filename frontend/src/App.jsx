import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import Congestion from './pages/Congestion';
import Routing from './pages/Routing';
import Operations from './pages/Operations';
import Alerts from './pages/Alerts';

export default function App() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar onRefresh={handleRefresh} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/vessels" element={<Vessels />} />
          <Route path="/congestion" element={<Congestion />} />
          <Route path="/routing" element={<Routing />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
