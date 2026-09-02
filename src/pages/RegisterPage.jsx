import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SimpleFooter from '../components/SimpleFooter';
import StatusBox from '../components/StatusBox';
import { BASE_API_URL } from '../utils/helpers';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        const userVal = username.trim();
        const emailVal = email.trim();
        const passVal = password.trim();

        if (!userVal || !emailVal || !passVal) {
            setStatusType('error');
            setStatusMsg('Por favor, preencha todos os campos do formulário.');
            return;
        }

        if (passVal.length < 3) {
            setStatusType('error');
            setStatusMsg('A palavra-passe é demasiado curta.');
            return;
        }

        setStatusType('loading');
        setStatusMsg('A registar utilizador na base de dados...');
        setLoading(true);

        try {
            const url = `${BASE_API_URL}/api/auth/registar`;
            const payload = { username: userVal, email: emailVal, password: passVal };

            console.log(`[Database Registration] POST Request -> ${url}`, payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log(`[Database Registration Response] HTTP Status: ${response.status}`);
            const textResponse = await response.text();
            console.log('[Database Registration Payload Recebido]:', textResponse);

            if (response.ok || response.status === 201 || response.status === 200) {
                setStatusType('success');
                setStatusMsg('Conta registada com sucesso na base de dados! A redirecionar para o login...');

                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setStatusType('error');
                setStatusMsg('Erro ao criar utilizador neste momento.');
            }
        } catch (error) {
            console.error('[Database Registration Error]', error);
            setStatusType('error');
            setStatusMsg('Erro ao criar utilizador neste momento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            {/* Navbar Minimalista */}
            <Navbar minimal={true} authType="registar" />

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
                        <h1 className="auth-title">Crie a sua conta</h1>
                        <p className="auth-subtitle">Preencha os campos abaixo para se juntar ao MarketServiços.</p>
                    </div>

                    {/* Caixa de Alerta de Estado */}
                    <StatusBox type={statusType} message={statusMsg} />

                    <form id="form-registar" className="auth-form" onSubmit={handleRegister} noValidate>
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
                            <label htmlFor="email" className="form-label">Endereço de E-mail</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="ex: joao@exemplo.com"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    placeholder="Mínimo 6 carateres"
                                    required
                                    autoComplete="new-password"
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

                        <button type="submit" id="btn-registar-submit" className="btn btn-auth-submit" disabled={loading}>
                            <span>Criar Conta</span>
                            {loading && (
                                <svg className="btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite', marginLeft: '8px' }}>
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Já tem uma conta? <Link to="/login" className="auth-link">Inicie sessão aqui</Link></p>
                    </div>
                </div>
            </main>

            <SimpleFooter />
        </div>
    );
}
