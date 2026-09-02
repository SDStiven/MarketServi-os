import React, { useState, useEffect } from 'react';
import { BASE_API_URL } from '../utils/helpers';

export default function CreateServiceModal({ isOpen, onClose, onSuccess, user }) {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [precoDesconto, setPrecoDesconto] = useState('');
    const [imagemCapa, setImagemCapa] = useState('');
    const [estaAtivo, setEstaAtivo] = useState(true);

    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitulo('');
            setDescricao('');
            setPreco('');
            setPrecoDesconto('');
            setImagemCapa('');
            setEstaAtivo(true);
            setStatusType(null);
            setStatusMsg('');
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.token) {
            alert('Sessão expirada. Por favor, inicie sessão novamente.');
            onClose();
            window.location.href = '/login';
            return;
        }

        const precoNum = parseFloat(preco);
        const precoDescontoNum = precoDesconto ? parseFloat(precoDesconto) : 0;

        if (!titulo.trim() || !descricao.trim() || isNaN(precoNum)) {
            setStatusType('error');
            setStatusMsg('Por favor, preencha os campos obrigatórios (Título, Descrição e Preço).');
            return;
        }

        setStatusType('loading');
        setStatusMsg('A guardar serviço na base de dados...');
        setLoading(true);

        try {
            const url = `${BASE_API_URL}/api/v1/servicos`;
            const payload = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                preco: precoNum,
                precoComDesconto: precoDescontoNum,
                estaAtivo: estaAtivo,
                imagemCapa: imagemCapa.trim() || ''
            };

            console.log(`[Create Service Request] POST -> ${url}`, payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            console.log(`[Create Service Response Status]: ${response.status}`);
            const textResponse = await response.text();
            console.log('[Create Service Response Data]:', textResponse);

            if (response.ok || response.status === 201 || response.status === 200) {
                setStatusType('success');
                setStatusMsg('Serviço guardado com sucesso na base de dados!');

                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess();
                }, 1200);
            } else {
                let errorText = `Erro ao guardar serviço na base de dados (Status ${response.status}).`;
                if (response.status === 401) {
                    errorText = 'Sessão inválida ou expirada. Por favor, faça login novamente.';
                }
                setStatusType('error');
                setStatusMsg(errorText);
            }
        } catch (error) {
            console.error('[Create Service Error]', error);
            setStatusType('error');
            setStatusMsg('Erro de ligação à base de dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="modal-criar-servico" className={`modal-overlay ${isOpen ? 'show' : ''}`} aria-hidden={!isOpen}>
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Criar Novo Serviço</h3>
                    <button id="btn-fechar-modal" className="btn-close-modal" aria-label="Fechar" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <form id="form-criar-servico" className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="servico-titulo">Título do Serviço *</label>
                        <input
                            type="text"
                            id="servico-titulo"
                            className="form-input"
                            placeholder="Ex: Desenvolvimento Web Frontend"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="servico-descricao">Descrição *</label>
                        <textarea
                            id="servico-descricao"
                            className="form-input form-textarea"
                            rows="3"
                            placeholder="Descreva o serviço..."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label htmlFor="servico-preco">Preço Normal (€) *</label>
                            <input
                                type="number"
                                id="servico-preco"
                                className="form-input"
                                step="0.01"
                                min="0"
                                placeholder="100.00"
                                value={preco}
                                onChange={(e) => setPreco(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="servico-preco-desconto">Preço com Desconto (€)</label>
                            <input
                                type="number"
                                id="servico-preco-desconto"
                                className="form-input"
                                step="0.01"
                                min="0"
                                placeholder="80.00"
                                value={precoDesconto}
                                onChange={(e) => setPrecoDesconto(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="servico-imagem">URL da Imagem de Capa</label>
                        <input
                            type="url"
                            id="servico-imagem"
                            className="form-input"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={imagemCapa}
                            onChange={(e) => setImagemCapa(e.target.value)}
                        />
                    </div>

                    <div className="form-group form-checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id="servico-ativo"
                                checked={estaAtivo}
                                onChange={(e) => setEstaAtivo(e.target.checked)}
                            />
                            <span>Marcar Serviço como Ativo</span>
                        </label>
                    </div>

                    {statusType && (
                        <div id="modal-status-msg" className="modal-status">
                            <div className={`status-box ${statusType}`}>
                                {statusType === 'loading' && <div className="spinner"></div>}
                                <span>{statusMsg}</span>
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" id="btn-cancelar-modal" className="btn btn-secondary" onClick={onClose} style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                            Cancelar
                        </button>
                        <button type="submit" id="btn-submeter-servico" className="btn btn-primary" disabled={loading}>
                            Guardar na Base de Dados
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
