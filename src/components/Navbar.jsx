import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout, minimal = false, authType = null }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const handleNavClick = (hash) => {
        setMenuOpen(false);
        if (location.pathname !== '/' && location.pathname !== '/index.html') {
            navigate(`/${hash}`);
        } else {
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <header className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
                    <span className="brand-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            <rect x="2" y="6" width="20" height="14" rx="2"></rect>
                        </svg>
                    </span>
                    <span className="brand-name">Market<span>Serviços</span></span>
                </Link>

                {!minimal && (
                    <button className="menu-toggle" id="menu-toggle" aria-label="Abrir Menu" onClick={toggleMenu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                )}

                {minimal ? (
                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Início</Link>
                        <a href="/#servicos" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#servicos'); }}>Serviços</a>
                        {authType === 'login' ? (
                            <Link to="/registar" className="btn btn-outline">Registar</Link>
                        ) : (
                            <Link to="/login" className="btn btn-outline">Login</Link>
                        )}
                    </nav>
                ) : (
                    <nav className={`nav-links ${menuOpen ? 'show' : ''}`} id="nav-links">
                        <a href="#inicio" className="nav-link active" onClick={(e) => { e.preventDefault(); handleNavClick('#inicio'); }}>Início</a>
                        <a href="#servicos" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#servicos'); }}>Serviços</a>
                        <div className="nav-auth" id="nav-auth-container">
                            {user ? (
                                <div className="user-badge">
                                    <span className="user-avatar">{initial}</span>
                                    <span>Olá, {user.username}</span>
                                    <button className="btn-logout" id="btn-logout" title="Terminar Sessão" onClick={onLogout}>Sair</button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
                                    <Link to="/registar" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Registar</Link>
                                </>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
