import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SimpleFooter from '../components/SimpleFooter';
import StatusBox from '../components/StatusBox';
import { BASE_API_URL, extrairMensagemErroBackend, setUserSession } from '../utils/helpers';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        const userVal = username.trim();
        const passVal = password.trim();

        if (!userVal || !passVal) {
            setStatusType('error');
            setStatusMsg('Por favor, preencha o nome de utilizador e a palavra-passe.');
            return;
        }

        setStatusType('loading');
        setStatusMsg('A autenticar com a base de dados...');
        setLoading(true);

        try {
            const url = `${BASE_API_URL}/api/auth/login`;
            const payload = { username: userVal, password: passVal };

            console.log(`[Database Login] POST Request -> ${url}`, payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log(`[Database Login Response] HTTP Status: ${response.status}`);
            const textResponse = await response.text();
            console.log('[Database Login Payload Recebido]:', textResponse);

            if (response.ok) {
                let jwtToken = textResponse.trim();
                if (jwtToken.startsWith('"') && jwtToken.endsWith('"')) {
                    jwtToken = jwtToken.slice(1, -1);
                }

                const userData = {
                    username: userVal,
                    token: jwtToken,
                    authenticatedAt: new Date().toISOString()
                };
                setUserSession(userData);

                setStatusType('success');
                setStatusMsg('Autenticação concluída! Bem-vindo de volta.');

                setTimeout(() => {
                    navigate('/');
                }, 1200);
            } else {
                const mensagemErro = extrairMensagemErroBackend(textResponse, `Credenciais inválidas. (Código HTTP ${response.status})`);
                setStatusType('error');
                setStatusMsg(mensagemErro);
            }
        } catch (error) {
            console.error('[Database Login Error]', error);
            setStatusType('error');
            setStatusMsg('Erro ao conectar à base de dados. Verifique a sua ligação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            {/* Navbar Minimalista */}
            <Navbar minimal={true} authType="login" />

            {/* Contentor de Autenticação */}
            <main className="auth-section">
                <div className="auth-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>

                <div className="auth-card">
                    <div className="auth-header">
                        <Link to="/" className="back-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            <span>Voltar ao início</span>
                        </Link>
                        <h1 className="auth-title">Bem-vindo de volta!</h1>
                        <p className="auth-subtitle">Introduza as suas credenciais para aceder à plataforma.</p>
                    </div>

                    {/* Caixa de Alerta de Estado */}
                    <StatusBox type={statusType} message={statusMsg} />

                    <form id="form-login" className="auth-form" onSubmit={handleLogin} noValidate>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Nome de Utilizador</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    placeholder="ex: joaosilva"
                                    required
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Palavra-passe</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-password"
                                    id="toggle-password"
                                    aria-label="Mostrar/Esconder palavra-passe"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg className="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" id="btn-login-submit" className="btn btn-auth-submit" disabled={loading}>
                            <span>Iniciar Sessão</span>
                            {loading && (
                                <svg className="btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite', marginLeft: '8px' }}>
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Ainda não tem uma conta? <Link to="/registar" className="auth-link">Registe-se aqui</Link></p>
                    </div>
                </div>
            </main>

            <SimpleFooter />
        </div>
    );
}
