import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import StatusBox from '../components/StatusBox';
import CreateServiceModal from '../components/CreateServiceModal';
import { BASE_API_URL, getUserSession, clearUserSession } from '../utils/helpers';

export default function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUserSession());

    const [servicos, setServicos] = useState([]);
    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [loadingRefresh, setLoadingRefresh] = useState(false);

    // Pagination
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [isFirst, setIsFirst] = useState(true);
    const [isLast, setIsLast] = useState(true);
    const TAMANHO_PAGINA = 3;

    // Modal
    const [modalOpen, setModalOpen] = useState(false);

    const handleLogout = () => {
        clearUserSession();
        setUser(null);
    };

    const carregarServicos = useCallback(async (page = 0) => {
        setPaginaAtual(page);
        const url = `${BASE_API_URL}/api/v1/servicos?page=${page}&size=${TAMANHO_PAGINA}`;

        setStatusType('loading');
        setStatusMsg(`A carregar serviços (Página ${page + 1})...`);
        setServicos([]);
        setLoadingRefresh(true);

        try {
            console.log(`[API Pagination Request] Chamada -> ${url}`);
            const response = await fetch(url);
            console.log(`[API Response Status] Code: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[API Response Data] Dados recebidos:', data);

            const listaServicos = (data && Array.isArray(data.content)) ? data.content : (Array.isArray(data) ? data : []);

            if (listaServicos.length === 0) {
                setServicos([]);
                setStatusType('empty');
                setStatusMsg('Nenhum serviço encontrado.');
            } else {
                setServicos(listaServicos);
                setStatusType(null);
                setStatusMsg('');
            }

            const first = data.first !== undefined ? data.first : (page === 0);
            const last = data.last !== undefined ? data.last : (listaServicos.length < TAMANHO_PAGINA);
            const total = data.totalPages !== undefined ? data.totalPages : Math.max(1, Math.ceil((data.totalElements || listaServicos.length) / TAMANHO_PAGINA));

            setIsFirst(first);
            setIsLast(last);
            setTotalPaginas(total || 1);
        } catch (error) {
            console.error('[API Error] Falha ao carregar serviços:', error);
            setServicos([]);
            setStatusType('error');
            setStatusMsg('Não foi possível carregar os serviços.');
        } finally {
            setLoadingRefresh(false);
        }
    }, [TAMANHO_PAGINA]);

    useEffect(() => {
        carregarServicos(0);
    }, [carregarServicos]);

    const handleAbrirModal = () => {
        if (!user) {
            alert('Por favor, inicie sessão para poder criar novos serviços na base de dados.');
            navigate('/login');
            return;
        }
        setModalOpen(true);
    };

    const handleHeroCarregar = () => {
        const servicosSection = document.getElementById('servicos');
        if (servicosSection) {
            servicosSection.scrollIntoView({ behavior: 'smooth' });
        }
        carregarServicos(0);
    };

    return (
        <>
            <Navbar user={user} onLogout={handleLogout} />

            {/* Hero Section */}
            <section className="hero-section" id="inicio">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            Plataforma Oficial de Serviços
                        </div>
                        <h1 className="hero-title">Encontre o serviço ideal para si</h1>
                        <p className="hero-subtitle">
                            Conecte-se com os melhores profissionais e descubra soluções inovadoras para transformar as suas ideias em realidade com total segurança e eficiência.
                        </p>
                        <div className="hero-actions">
                            <a href="#servicos" className="btn btn-hero-primary" id="btn-explorar" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                <span>Explorar Serviços</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                            <button className="btn btn-hero-secondary" id="btn-hero-carregar" onClick={handleHeroCarregar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6"></path>
                                    <path d="M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                                </svg>
                                <span>Carregar Serviços</span>
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Verificado</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">24/7</span>
                                <span className="stat-label">Suporte Ativo</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-number">4.9★</span>
                                <span className="stat-label">Avaliação Média</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <main className="services-section" id="servicos">
                <div className="container">
                    <div className="section-header">
                        <div className="header-text">
                            <span className="section-tag">Catálogo Online</span>
                            <h2 className="section-title">Serviços disponíveis</h2>
                            <p className="section-description">Navegue pelas opções disponíveis e escolha a oferta perfeita para o seu projeto.</p>
                        </div>
                        <div className="header-controls">
                            <button id="btn-abrir-modal-servico" className="btn btn-primary btn-criar-servico" onClick={handleAbrirModal}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Criar Serviço</span>
                            </button>
                            <button id="btn-carregar" className={`btn btn-refresh ${loadingRefresh ? 'loading' : ''}`} onClick={() => carregarServicos(0)}>
                                <svg className="refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6"></path>
                                    <path d="M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                                </svg>
                                <span>Carregar Serviços</span>
                            </button>
                        </div>
                    </div>

                    {/* Area para mensagens de estado */}
                    <StatusBox type={statusType} message={statusMsg} />

                    {/* Grid responsivo de cards */}
                    <div id="grid-servicos" className="grid-servicos">
                        {servicos.map((servico, index) => (
                            <ServiceCard key={servico.id || index} servico={servico} index={index} />
                        ))}
                    </div>

                    {/* Controlo de Paginação (3 serviços por página) */}
                    <div id="container-paginacao" className="pagination-container">
                        <button
                            id="btn-pagina-anterior"
                            className="btn-pagination"
                            disabled={isFirst}
                            aria-label="Página Anterior"
                            onClick={() => {
                                if (paginaAtual > 0) carregarServicos(paginaAtual - 1);
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            <span>Anterior</span>
                        </button>

                        <div id="info-paginacao" className="pagination-info">
                            Página {paginaAtual + 1} de {totalPaginas}
                        </div>

                        <button
                            id="btn-pagina-seguinte"
                            className="btn-pagination"
                            disabled={isLast || paginaAtual >= totalPaginas - 1}
                            aria-label="Página Seguinte"
                            onClick={() => {
                                if (paginaAtual < totalPaginas - 1) carregarServicos(paginaAtual + 1);
                            }}
                        >
                            <span>Seguinte</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal Criar Serviço */}
            <CreateServiceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => carregarServicos(0)}
                user={user}
            />

            <Footer />
        </>
    );
}
