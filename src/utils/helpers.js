/**
 * ============================================================================
 * MarketServices - Helper Functions & API Utilities
 * ============================================================================
 */

export const BASE_API_URL = import.meta.env.VITE_AUTH_BASE_URL || '';

/**
 * Escapes special HTML characters.
 * @param {string | any} str 
 * @returns {string}
 */
export function escapeHTML(str) {
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
 * Formats monetary values safely in EUR.
 * @param {number | string | null | undefined} valor 
 * @returns {string}
 */
export function formatarPreco(valor) {
    if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) {
        return 'Não informado';
    }
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(valor));
}

/**
 * Validates if an image URL is plausible.
 * @param {string | null | undefined} url 
 * @returns {boolean}
 */
export function isUrlValida(url) {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim().toLowerCase();
    if (cleanUrl === '' || cleanUrl === 'string' || cleanUrl === 'null' || cleanUrl === 'undefined') {
        return false;
    }
    return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:');
}

/**
 * Creates SVG placeholder Data URL for services without valid image.
 * @returns {string}
 */
export function getPlaceholderImageSvg() {
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
 * Extracts error message from API response text/json.
 * @param {string} textResponse 
 * @param {string} fallbackMsg 
 * @returns {string}
 */
export function extrairMensagemErroBackend(textResponse, fallbackMsg) {
    if (!textResponse || typeof textResponse !== 'string') {
        return fallbackMsg;
    }

    try {
        const json = JSON.parse(textResponse);
        if (!json) return fallbackMsg;

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
        const clean = textResponse.trim();
        if (clean.length > 0 && clean.length < 150 && !clean.includes('<!DOCTYPE')) {
            return clean;
        }
    }

    return fallbackMsg;
}

/**
 * Retrieves logged in user session from localStorage.
 * @returns {{ username: string, token: string, authenticatedAt: string } | null}
 */
export function getUserSession() {
    try {
        const raw = localStorage.getItem('market_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Saves user session in localStorage.
 * @param {object} data 
 */
export function setUserSession(data) {
    localStorage.setItem('market_user', JSON.stringify(data));
}

/**
 * Clears user session from localStorage.
 */
export function clearUserSession() {
    localStorage.removeItem('market_user');
}
