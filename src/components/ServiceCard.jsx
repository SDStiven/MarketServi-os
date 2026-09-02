import React, { useState } from 'react';
import { formatarPreco, isUrlValida, getPlaceholderImageSvg } from '../utils/helpers';

export default function ServiceCard({ servico, index = 0 }) {
    const placeholder = getPlaceholderImageSvg();
    const initialImg = isUrlValida(servico.imagemCapa) ? servico.imagemCapa : placeholder;
    const [imgSrc, setImgSrc] = useState(initialImg);

    // Textual data
    const tituloVal = servico.titulo ? servico.titulo.trim() : '';
    const titulo = tituloVal !== '' ? tituloVal : 'Não informado';

    const descVal = servico.descricao ? servico.descricao.trim() : '';
    const descricao = descVal !== '' ? descVal : 'Não informado';

    // Status Indicator
    let statusTexto = 'Não informado';
    let statusClasse = 'status-desconhecido';

    if (servico.estaAtivo === true) {
        statusTexto = 'Ativo';
        statusClasse = 'status-ativo';
    } else if (servico.estaAtivo === false) {
        statusTexto = 'Inativo';
        statusClasse = 'status-inativo';
    }

    // Prices
    const temPrecoOriginal = servico.preco !== null && servico.preco !== undefined && servico.preco !== '';
    const temPrecoDesconto = servico.precoComDesconto !== null && servico.precoComDesconto !== undefined && servico.precoComDesconto !== '';

    const precoTexto = formatarPreco(servico.preco);
    const precoDescontoTexto = formatarPreco(servico.precoComDesconto);

    const handleImgError = () => {
        setImgSrc(placeholder);
    };

    return (
        <article className="card-servico" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="card-media">
                <div className={`status-pill ${statusClasse}`}>
                    <span className="dot"></span>
                    <span>{statusTexto}</span>
                </div>
                <img
                    src={imgSrc}
                    alt={titulo}
                    loading="lazy"
                    onError={handleImgError}
                />
            </div>
            <div className="card-body">
                <h3 className="card-title">{titulo}</h3>
                <p className="card-descricao">{descricao}</p>
                <div className="card-divider"></div>
                <div className="card-price-section">
                    {temPrecoDesconto && temPrecoOriginal && Number(servico.precoComDesconto) < Number(servico.preco) ? (
                        <>
                            <div className="price-row">
                                <span className="price-label">Preço:</span>
                                <span className="price-original">{precoTexto}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">
                                    Com desconto: <span className="discount-badge">Oferta</span>
                                </span>
                                <span className="price-discounted">{precoDescontoTexto}</span>
                            </div>
                        </>
                    ) : temPrecoDesconto && servico.precoComDesconto !== null ? (
                        <>
                            <div className="price-row">
                                <span className="price-label">Preço com desconto:</span>
                                <span className="price-discounted">{precoDescontoTexto}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Preço normal:</span>
                                <span className="price-original-clean">{precoTexto}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="price-row">
                                <span className="price-label">Preço:</span>
                                <span className="price-discounted">{precoTexto}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Com desconto:</span>
                                <span className="price-original-clean">{precoDescontoTexto}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
