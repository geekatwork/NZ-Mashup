import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@components/LandingPage';
import AboutPage from '@components/AboutPage';
import App from '@components/App';

export default function MainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/map" element={<App />} />
      </Routes>
    </Router>
  );
}
