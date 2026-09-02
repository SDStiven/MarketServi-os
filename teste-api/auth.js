/**
 * ============================================================================
 * MarketServices - Authentication Logic (Direct Database Integration)
 * Prepared for clean integration in React + TypeScript projects
 * ============================================================================
 * 
 */

const AUTH_BASE_URL = `${import.meta.env.VITE_AUTH_BASE_URL}/api/auth`;

/**
 * Escapes special HTML characters to prevent XSS attacks.
 * 
 * @param {string | any} str 
 * @returns {string}
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
 * Parses and extracts exact error messages returned by the backend database/API.
 * Handles structures like:
 * - { "mensagem": "Este username já está em uso, por favor escolha outro." }
 * - { "Erro": "...", "Detalhes": "..." }
 * - { "message": "..." } / { "error": "..." }
 * 
 * @param {string} textResponse - Raw text response from server
 * @param {string} fallbackMsg - Default error message if parsing fails
 * @returns {string} Clean error message to present to user
 */
function extrairMensagemErroBackend(textResponse, fallbackMsg) {
    if (!textResponse || typeof textResponse !== 'string') {
        return fallbackMsg;
    }

    try {
        const json = JSON.parse(textResponse);
        if (!json) return fallbackMsg;

        // Backend swagger return fields: { "detalhes": "...", "mensagem": "...", "erro": "..." }
        if (json.detalhes && typeof json.detalhes === 'string') {
            return json.detalhes;
        }
        if (json.mensagem && typeof json.mensagem === 'string') {
            return json.mensagem;
        }
        if (json.erro && typeof json.erro === 'string') {
            return json.erro;
        }
        if (json.Erro && typeof json.Erro === 'string') {
            return json.Erro;
        }
        if (json.message && typeof json.message === 'string') {
            return json.message;
        }
        if (json.error && typeof json.error === 'string') {
            return json.error;
        }
        if (Array.isArray(json.errors) && json.errors.length > 0) {
            return json.errors.map(e => e.defaultMessage || e.message || e).join(', ');
        }
    } catch {
        // Not a JSON object, use plain string if concise
        const clean = textResponse.trim();
        if (clean.length > 0 && clean.length < 150 && !clean.includes('<!DOCTYPE')) {
            return clean;
        }
    }

    return fallbackMsg;
}

/**
 * Displays status messages (loading, success, error) in the auth form UI.
 * 
 * @param {'loading' | 'success' | 'error' | 'clear'} tipo 
 * @param {string} mensagem 
 */
function mostrarMensagemStatus(tipo, mensagem = '') {
    const statusContainer = document.getElementById('auth-status');
    if (!statusContainer) return;

    if (tipo === 'clear') {
        statusContainer.innerHTML = '';
        return;
    }

    let boxClass = 'status-box';
    let iconHtml = '';

    if (tipo === 'loading') {
        boxClass += ' loading';
        iconHtml = `<div class="spinner"></div>`;
    } else if (tipo === 'success') {
        boxClass += ' success';
        iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (tipo === 'error') {
        boxClass += ' error';
        iconHtml = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    statusContainer.innerHTML = `
        <div class="${boxClass}">
            ${iconHtml}
            <span>${escapeHTML(mensagem)}</span>
        </div>
    `;
}

/**
 * Toggles password field visibility.
 * 
 * @param {HTMLInputElement} inputEl 
 * @param {HTMLButtonElement} buttonEl 
 */
function togglePasswordVisibility(inputEl, buttonEl) {
    if (!inputEl) return;
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';

    if (buttonEl) {
        buttonEl.innerHTML = isPassword ? `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        ` : `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

/**
 * Executes User Login calling backend database authentication endpoint.
 * POST /api/auth/login
 * 
 * @param {Event} e 
 */
async function efetuarLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnSubmit = document.getElementById('btn-login-submit');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
        mostrarMensagemStatus('error', 'Por favor, preencha o nome de utilizador e a palavra-passe.');
        return;
    }

    // Set UI Loading
    mostrarMensagemStatus('loading', 'A autenticar com a base de dados...');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
        const url = `${AUTH_BASE_URL}/login`;
        const payload = { username, password };

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
            // Process JWT string or JSON token
            let jwtToken = textResponse.trim();
            if (jwtToken.startsWith('"') && jwtToken.endsWith('"')) {
                jwtToken = jwtToken.slice(1, -1);
            }

            // Save authenticated user session
            const userData = {
                username: username,
                token: jwtToken,
                authenticatedAt: new Date().toISOString()
            };
            localStorage.setItem('market_user', JSON.stringify(userData));

            mostrarMensagemStatus('success', 'Autenticação concluída! Bem-vindo de volta.');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);

        } else {
            const mensagemErro = extrairMensagemErroBackend(textResponse, `Credenciais inválidas. (Código HTTP ${response.status})`);
            mostrarMensagemStatus('error', mensagemErro);
        }

    } catch (error) {
        console.error('[Database Login Error]', error);
        mostrarMensagemStatus('error', 'Erro ao conectar à base de dados. Verifique a sua ligação.');
    } finally {
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

/**
 * Executes User Registration persisting user directly to the backend database.
 * POST /api/auth/registar
 * 
 * @param {Event} e 
 */
async function efetuarRegisto(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnSubmit = document.getElementById('btn-registar-submit');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !email || !password) {
        mostrarMensagemStatus('error', 'Por favor, preencha todos os campos do formulário.');
        return;
    }

    if (password.length < 3) {
        mostrarMensagemStatus('error', 'A palavra-passe é demasiado curta.');
        return;
    }

    // Set UI Loading
    mostrarMensagemStatus('loading', 'A registar utilizador na base de dados...');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
        const url = `${AUTH_BASE_URL}/registar`;
        const payload = { username, email, password };

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
            mostrarMensagemStatus('success', 'Conta registada com sucesso na base de dados! A redirecionar para o login...');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } else {
            // Quando o utilizador já existe na base de dados (ou ocorre outro erro)
            mostrarMensagemStatus('error', 'Erro ao criar utilizador neste momento.');
        }

    } catch (error) {
        console.error('[Database Registration Error]', error);
        mostrarMensagemStatus('error', 'Erro ao criar utilizador neste momento.');
    } finally {
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

// Attach Event Listeners on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Login Form Listener
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', efetuarLogin);
    }

    // Register Form Listener
    const formRegistar = document.getElementById('form-registar');
    if (formRegistar) {
        formRegistar.addEventListener('submit', efetuarRegisto);
    }

    // Password Toggle Listener
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            togglePasswordVisibility(passwordInput, toggleBtn);
        });
    }
});
