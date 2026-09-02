import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <span className="brand-name">Market<span>Serviços</span></span>
                    <p>A sua plataforma de confiança para contratação de serviços de excelência.</p>
                </div>
                <div className="footer-links">
                    <a href="#inicio">Início</a>
                    <a href="#servicos">Serviços</a>
                    <Link to="/login">Login</Link>
                    <Link to="/registar">Registar</Link>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 MarketServiços. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
