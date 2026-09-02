import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/style.css';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/index.html" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login.html" element={<LoginPage />} />
                <Route path="/registar" element={<RegisterPage />} />
                <Route path="/registar.html" element={<RegisterPage />} />
            </Routes>
        </Router>
    );
}
