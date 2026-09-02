/**
 * ============================================================================
 * MarketServices - Application Logic
 * Prepared for clean integration in React + TypeScript projects
 * ============================================================================
 * 
 * TypeScript Type Definitions Reference:
 * 
 * interface Servico {
 *   id?: number;
 *   titulo: string | null;
 *   descricao: string | null;
 *   preco: number | null;
 *   precoComDesconto: number | null;
 *   estaAtivo: boolean | null;
 *   imagemCapa: string | null;
 * }
 * 
 * interface ApiResponse {
 *   content: Servico[];
 *   totalElements?: number;
 *   totalPages?: number;
 *   size?: number;
 *   number?: number;
 * }
 */

// Global Constants
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/servicos?page=0&size=5`;

// DOM Element References
const btnCarregar = document.getElementById('btn-carregar');
const btnHeroCarregar = document.getElementById('btn-hero-carregar');
const statusMensagem = document.getElementById('status-mensagem');
const gridServicos = document.getElementById('grid-servicos');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

/**
 * Escapes special HTML characters to prevent XSS attacks.
 * Escapes: & < > ' "
 * 
 * @param {string | any} str - String to escape
 * @returns {string} Safe escaped string
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

/**
 * Formats monetary values safely with fallback for null/undefined values.
 * 
 * @param {number | null | undefined} valor - Numeric price value
 * @returns {string} Formatted string or 'Não informado'
 */
function formatarPreco(valor) {
    if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) {
        return 'Não informado';
    }
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(valor));
}

/**
 * Validates if an image URL is plausible (not null, empty, or dummy placeholder like "string").
 * 
 * @param {string | null | undefined} url 
 * @returns {boolean}
 */
function isUrlValida(url) {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim().toLowerCase();
    if (cleanUrl === '' || cleanUrl === 'string' || cleanUrl === 'null' || cleanUrl === 'undefined') {
        return false;
    }
    return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:');
}

/**
 * Creates an elegant SVG placeholder for services without valid image.
 * 
 * @returns {string} SVG Data URL with text 'Sem imagem'
 */
function getPlaceholderImageSvg() {
    const svgString = `<svg width="400" height="250" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="100%" stop-color="#94a3b8" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <g transform="translate(176, 90)">
            <rect x="0" y="0" width="48" height="40" rx="4" fill="none" stroke="#475569" stroke-width="3"/>
            <circle cx="15" cy="14" r="5" fill="#475569"/>
            <path d="M6 34 L18 20 L28 30 L36 22 L42 34 Z" fill="#475569"/>
        </g>
        <text x="200" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700" fill="#334155" text-anchor="middle">Sem imagem</text>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);
}

/**
 * Displays feedback status messages (Loading, Empty, Error) in the UI.
 * 
 * @param {'loading' | 'empty' | 'error' | 'clear'} tipo 
 * @param {string} mensagem 
 */
function mostrarMensagemStatus(tipo, mensagem = '') {
    if (!statusMensagem) return;

    if (tipo === 'clear') {
        statusMensagem.innerHTML = '';
        return;
    }

    let iconHtml = '';
    let boxClass = 'status-box';

    if (tipo === 'loading') {
        boxClass += ' loading';
        iconHtml = `<div class="spinner"></div>`;
    } else if (tipo === 'empty') {
        boxClass += ' empty';
        iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (tipo === 'error') {
        boxClass += ' error';
        iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    }

    statusMensagem.innerHTML = `
        <div class="${boxClass}">
            ${iconHtml}
            <span>${escapeHTML(mensagem)}</span>
        </div>
    `;
}

/**
 * Renders the list of service cards into the DOM.
 * 
 * @param {Array<Object>} servicos - Array of service objects from API
 */
function renderizarCards(servicos) {
    if (!gridServicos) return;

    // Clear existing cards
    gridServicos.innerHTML = '';

    if (!servicos || !Array.isArray(servicos) || servicos.length === 0) {
        mostrarMensagemStatus('empty', 'Nenhum serviço encontrado.');
        return;
    }

    // Clear status message when services are successfully loaded
    mostrarMensagemStatus('clear');

    // Create cards for each service item
    servicos.forEach((servico, index) => {
        const card = document.createElement('article');
        card.className = 'card-servico';
        card.style.animationDelay = `${index * 0.08}s`;

        // 1. Process & Sanitize textual data
        const tituloVal = servico.titulo ? servico.titulo.trim() : '';
        const titulo = tituloVal !== '' ? escapeHTML(tituloVal) : 'Não informado';

        const descVal = servico.descricao ? servico.descricao.trim() : '';
        const descricao = descVal !== '' ? escapeHTML(descVal) : 'Não informado';

        // 2. Process Prices
        const temPrecoOriginal = servico.preco !== null && servico.preco !== undefined && servico.preco !== '';
        const temPrecoDesconto = servico.precoComDesconto !== null && servico.precoComDesconto !== undefined && servico.precoComDesconto !== '';

        const precoTexto = formatarPreco(servico.preco);
        const precoDescontoTexto = formatarPreco(servico.precoComDesconto);

        let precoHtml = '';
        if (temPrecoDesconto && temPrecoOriginal && Number(servico.precoComDesconto) < Number(servico.preco)) {
            precoHtml = `
                <div class="price-row">
                    <span class="price-label">Preço:</span>
                    <span class="price-original">${precoTexto}</span>
                </div>
                <div class="price-row">
                    <span class="price-label">Com desconto: <span class="discount-badge">Oferta</span></span>
                    <span class="price-discounted">${precoDescontoTexto}</span>
                </div>
            `;
        } else if (temPrecoDesconto && servico.precoComDesconto !== null) {
            precoHtml = `
                <div class="price-row">
                    <span class="price-label">Preço com desconto:</span>
                    <span class="price-discounted">${precoDescontoTexto}</span>
                </div>
                <div class="price-row">
                    <span class="price-label">Preço normal:</span>
                    <span class="price-original-clean">${precoTexto}</span>
                </div>
            `;
        } else {
            precoHtml = `
                <div class="price-row">
                    <span class="price-label">Preço:</span>
                    <span class="price-discounted">${precoTexto}</span>
                </div>
                <div class="price-row">
                    <span class="price-label">Com desconto:</span>
                    <span class="price-original-clean">${precoDescontoTexto}</span>
                </div>
            `;
        }

        // 3. Process Status Indicator (Green: Ativo, Red: Inativo, Gray: Não informado)
        let statusTexto = 'Não informado';
        let statusClasse = 'status-desconhecido';

        if (servico.estaAtivo === true) {
            statusTexto = 'Ativo';
            statusClasse = 'status-ativo';
        } else if (servico.estaAtivo === false) {
            statusTexto = 'Inativo';
            statusClasse = 'status-inativo';
        }

        // 4. Process Cover Image & Fallback Placeholder
        const placeholder = getPlaceholderImageSvg();
        const imgUrlSrc = isUrlValida(servico.imagemCapa) ? servico.imagemCapa : placeholder;

        // 5. Build HTML structure safely
        card.innerHTML = `
            <div class="card-media">
                <div class="status-pill ${statusClasse}">
                    <span class="dot"></span>
                    <span>${statusTexto}</span>
                </div>
                <img src="${escapeHTML(imgUrlSrc)}" alt="${titulo}" loading="lazy" />
            </div>
            <div class="card-body">
                <h3 class="card-title">${titulo}</h3>
                <p class="card-descricao">${descricao}</p>
                <div class="card-divider"></div>
                <div class="card-price-section">
                    ${precoHtml}
                </div>
            </div>
        `;

        // Attach Image Error Fallback Handler
        const imgElement = card.querySelector('img');
        if (imgElement) {
            imgElement.addEventListener('error', function () {
                this.onerror = null;
                this.src = placeholder;
            });
        }

        gridServicos.appendChild(card);
    });
}

// Pagination State Variables
let paginaAtual = 0;
const TAMANHO_PAGINA = 3;
let totalPaginas = 1;

/**
 * Updates UI pagination controls (Anterior, Seguinte, Página X de Y)
 */
function atualizarControloPaginacao(first, last, totalPages) {
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSeguinte = document.getElementById('btn-pagina-seguinte');
    const infoPaginacao = document.getElementById('info-paginacao');

    totalPaginas = totalPages || 1;

    if (btnAnterior) {
        btnAnterior.disabled = first !== undefined ? first : (paginaAtual === 0);
    }
    if (btnSeguinte) {
        btnSeguinte.disabled = last !== undefined ? last : (paginaAtual >= totalPaginas - 1);
    }
    if (infoPaginacao) {
        infoPaginacao.textContent = `Página ${paginaAtual + 1} de ${totalPaginas}`;
    }
}

/**
 * Fetches services data from the backend API with pagination size 3.
 * 
 * @param {number} page - Current page index (0-based)
 */
async function carregarServicos(page = 0) {
    paginaAtual = page;
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/servicos?page=${paginaAtual}&size=${TAMANHO_PAGINA}`;

    // Show loading state
    mostrarMensagemStatus('loading', `A carregar serviços (Página ${paginaAtual + 1})...`);

    if (gridServicos) {
        gridServicos.innerHTML = '';
    }

    if (btnCarregar) {
        btnCarregar.classList.add('loading');
    }

    try {
        console.log(`[API Pagination Request] Chamada -> ${url}`);

        const response = await fetch(url);

        console.log(`[API Response Status] Code: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        console.log('[API Response Data] Dados recebidos:', data);

        // Handle pagination structure (e.g. data.content) or plain array
        const servicos = (data && Array.isArray(data.content)) ? data.content : (Array.isArray(data) ? data : []);

        renderizarCards(servicos);

        const first = data.first !== undefined ? data.first : (paginaAtual === 0);
        const last = data.last !== undefined ? data.last : (servicos.length < TAMANHO_PAGINA);
        const totalPages = data.totalPages !== undefined ? data.totalPages : Math.ceil((data.totalElements || servicos.length) / TAMANHO_PAGINA);

        atualizarControloPaginacao(first, last, totalPages);

    } catch (error) {
        console.error('[API Error] Falha ao carregar serviços:', error);
        mostrarMensagemStatus('error', 'Não foi possível carregar os serviços.');
    } finally {
        if (btnCarregar) {
            btnCarregar.classList.remove('loading');
        }
    }
}

/**
 * Checks for logged-in user session stored in localStorage and updates navbar UI.
 */
function verificarSessaoUtilizador() {
    const navAuthContainer = document.getElementById('nav-auth-container');
    if (!navAuthContainer) return;

    const userRaw = localStorage.getItem('market_user');
    if (userRaw) {
        try {
            const user = JSON.parse(userRaw);
            const username = user.username || 'Utilizador';
            const initial = username.charAt(0).toUpperCase();

            navAuthContainer.innerHTML = `
                <div class="user-badge">
                    <span class="user-avatar">${escapeHTML(initial)}</span>
                    <span>Olá, ${escapeHTML(username)}</span>
                    <button class="btn-logout" id="btn-logout" title="Terminar Sessão">Sair</button>
                </div>
            `;

            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    localStorage.removeItem('market_user');
                    window.location.reload();
                });
            }
        } catch (e) {
            console.error('Erro ao ler dados da sessão:', e);
        }
    }
}

/**
 * Opens the Create Service Modal after checking logged-in user state.
 */
function abrirModalCriarServico() {
    const userRaw = localStorage.getItem('market_user');
    if (!userRaw) {
        alert('Por favor, inicie sessão para poder criar novos serviços na base de dados.');
        window.location.href = 'login.html';
        return;
    }

    const modal = document.getElementById('modal-criar-servico');
    if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Closes the Create Service Modal.
 */
function fecharModalCriarServico() {
    const modal = document.getElementById('modal-criar-servico');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
    const form = document.getElementById('form-criar-servico');
    if (form) form.reset();
    const statusMsg = document.getElementById('modal-status-msg');
    if (statusMsg) statusMsg.innerHTML = '';
}

/**
 * Submits a new service to the backend Swagger endpoint:
 * POST /api/v1/servicos
 * Requires Authorization Bearer Token.
 * 
 * @param {Event} e 
 */
async function criarNovoServicoBackend(e) {
    e.preventDefault();

    const userRaw = localStorage.getItem('market_user');
    if (!userRaw) {
        alert('Sessão expirada. Por favor, inicie sessão novamente.');
        window.location.href = 'login.html';
        return;
    }

    let token = '';
    try {
        const user = JSON.parse(userRaw);
        token = user.token || '';
    } catch (err) {}

    const titulo = document.getElementById('servico-titulo')?.value.trim();
    const descricao = document.getElementById('servico-descricao')?.value.trim();
    const preco = parseFloat(document.getElementById('servico-preco')?.value);
    const precoDescontoVal = document.getElementById('servico-preco-desconto')?.value;
    const precoComDesconto = precoDescontoVal ? parseFloat(precoDescontoVal) : 0;
    const imagemCapa = document.getElementById('servico-imagem')?.value.trim();
    const estaAtivo = document.getElementById('servico-ativo')?.checked ?? true;

    const modalStatus = document.getElementById('modal-status-msg');
    const btnSubmit = document.getElementById('btn-submeter-servico');

    if (!titulo || !descricao || isNaN(preco)) {
        if (modalStatus) {
            modalStatus.innerHTML = `<div class="status-box error"><span>Por favor, preencha os campos obrigatórios (Título, Descrição e Preço).</span></div>`;
        }
        return;
    }

    if (modalStatus) {
        modalStatus.innerHTML = `<div class="status-box loading"><div class="spinner"></div><span>A guardar serviço na base de dados...</span></div>`;
    }
    if (btnSubmit) btnSubmit.disabled = true;

    try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/servicos`;
        const payload = {
            titulo: titulo,
            descricao: descricao,
            preco: preco,
            precoComDesconto: precoComDesconto,
            estaAtivo: estaAtivo,
            imagemCapa: imagemCapa || ''
        };

        console.log(`[Create Service Request] POST -> ${url}`, payload);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        console.log(`[Create Service Response Status]: ${response.status}`);
        const textResponse = await response.text();
        console.log('[Create Service Response Data]:', textResponse);

        if (response.ok || response.status === 201 || response.status === 200) {
            if (modalStatus) {
                modalStatus.innerHTML = `<div class="status-box success"><span>Serviço guardado com sucesso na base de dados!</span></div>`;
            }
            setTimeout(() => {
                fecharModalCriarServico();
                carregarServicos(0);
            }, 1200);
        } else {
            let errorText = `Erro ao guardar serviço na base de dados (Status ${response.status}).`;
            if (response.status === 401) {
                errorText = 'Sessão inválida ou expirada. Por favor, faça login novamente.';
            }
            if (modalStatus) {
                modalStatus.innerHTML = `<div class="status-box error"><span>${escapeHTML(errorText)}</span></div>`;
            }
        }

    } catch (error) {
        console.error('[Create Service Error]', error);
        if (modalStatus) {
            modalStatus.innerHTML = `<div class="status-box error"><span>Erro de ligação à base de dados.</span></div>`;
        }
    } finally {
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check logged in user state
    verificarSessaoUtilizador();

    // Primary Refresh Button Listener
    if (btnCarregar) {
        btnCarregar.addEventListener('click', () => carregarServicos(0));
    }

    // Hero Section Load Button Listener
    if (btnHeroCarregar) {
        btnHeroCarregar.addEventListener('click', () => {
            const servicosSection = document.getElementById('servicos');
            if (servicosSection) {
                servicosSection.scrollIntoView({ behavior: 'smooth' });
            }
            carregarServicos(0);
        });
    }

    // Create Service Modal Listeners
    const btnAbrirModal = document.getElementById('btn-abrir-modal-servico');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const formCriarServico = document.getElementById('form-criar-servico');

    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', abrirModalCriarServico);
    }
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModalCriarServico);
    }
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', fecharModalCriarServico);
    }
    if (formCriarServico) {
        formCriarServico.addEventListener('submit', criarNovoServicoBackend);
    }

    // Pagination Button Listeners
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSeguinte = document.getElementById('btn-pagina-seguinte');

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 0) {
                carregarServicos(paginaAtual - 1);
            }
        });
    }

    if (btnSeguinte) {
        btnSeguinte.addEventListener('click', () => {
            if (paginaAtual < totalPaginas - 1) {
                carregarServicos(paginaAtual + 1);
            }
        });
    }

    // Mobile Menu Toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Initial page load (page 0, size 3)
    carregarServicos(0);
});

