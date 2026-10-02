import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Check, X, Sparkles, Film, Tv, Clapperboard, Music, Disc, BookOpen, Gamepad2 } from 'lucide-react';
import { MEDIA_TYPES, GLOBAL_SEARCHABLE_CATALOG } from '../types/contentTypes';

export default function AddContentModal({ isOpen, onClose, onAddContent, currentCatalogIds = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addedIds, setAddedIds] = useState(new Set(currentCatalogIds));

  // Sincroniza sempre com as obras já presentes na biblioteca/acervo
  useEffect(() => {
    setAddedIds(new Set(currentCatalogIds));
  }, [currentCatalogIds, isOpen]);

  if (!isOpen) return null;

  // Filtragem e busca em tempo real tipo Letterboxd
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    return GLOBAL_SEARCHABLE_CATALOG.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.typeId === selectedFilter;
      if (!matchesFilter) return false;

      if (!term) return true; // Mostra sugestões recomendadas se campo estiver vazio

      const matchTitle = item.title.toLowerCase().includes(term);
      const matchCreator = item.creator.toLowerCase().includes(term);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(term));
      const matchYear = item.year.includes(term);
      const matchType = (MEDIA_TYPES[item.typeId]?.label || '').toLowerCase().includes(term);

      return matchTitle || matchCreator || matchTags || matchYear || matchType;
    });
  }, [searchTerm, selectedFilter]);

  const handleToggleAdd = (work) => {
    if (addedIds.has(work.id)) return; // Já está na biblioteca

    onAddContent(work);
    setAddedIds((prev) => new Set(prev).add(work.id));
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="letterboxd-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="letterboxd-modal-header">
          <div className="modal-title-group">
            <Sparkles size={20} style={{ color: 'var(--scena-primary)' }} />
            <div>
              <h3>Adicionar à Minha Biblioteca</h3>
              <p className="modal-subtitle">Pesquise por qualquer filme, série, anime, livro, música, álbum ou jogo</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Barra de Pesquisa Instantânea estilo Letterboxd */}
        <div className="letterboxd-search-bar">
          <Search size={20} className="search-bar-icon" />
          <input
            type="text"
            className="letterboxd-search-input"
            placeholder="Digite o nome de qualquer obra (ex: Interestelar, The Beatles, Harry Potter, Percy Jackson)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filtros Rápidos de Categoria */}
        <div className="modal-filter-pills">
          <button
            className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            Tudo
          </button>
          {Object.values(MEDIA_TYPES).map((type) => {
            const Icon = type.icon;
            const isActive = selectedFilter === type.id;
            return (
              <button
                key={type.id}
                className={`filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedFilter(type.id)}
              >
                <Icon size={13} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de Resultados Encontrados em Tempo Real */}
        <div className="letterboxd-results-container">
          <div className="results-count-label">
            {searchResults.length} obra(s) encontrada(s)
          </div>

          {searchResults.length === 0 ? (
            <div className="no-results-box">
              <p>Nenhuma obra encontrada para "{searchTerm}".</p>
              <span>Tente pesquisar por outro título, artista, diretor ou gênero.</span>
            </div>
          ) : (
            <div className="letterboxd-results-grid">
              {searchResults.map((work) => {
                const typeConfig = MEDIA_TYPES[work.typeId] || MEDIA_TYPES.filmes;
                const isAlreadyAdded = addedIds.has(work.id);

                return (
                  <div key={work.id} className="letterboxd-item-card">
                    {/* Capa / Pôster */}
                    <div className="item-poster-wrapper">
                      <img
                        src={work.coverUrl}
                        alt={`Pôster de ${work.title}`}
                        className="item-poster-img"
                        loading="lazy"
                      />
                      <span className="item-type-badge">{typeConfig.singularLabel}</span>
                    </div>

                    {/* Informações Básicas da Obra */}
                    <div className="item-info-wrapper">
                      <div className="item-main-details">
                        <h4 className="item-title">{work.title}</h4>
                        <p className="item-creator-year">
                          {work.creator} • <span>{work.year}</span>
                        </p>
                      </div>

                      <p className="item-synopsis-mini">{work.synopsis}</p>

                      <div className="item-meta-tags">
                        <span className="item-metric">{work.metric}</span>
                        {work.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="item-tag-pill">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Botão de Adicionar com transição para Adicionado */}
                    <button
                      className={`add-work-action-btn ${isAlreadyAdded ? 'added' : ''}`}
                      onClick={() => handleToggleAdd(work)}
                      disabled={isAlreadyAdded}
                      title={isAlreadyAdded ? 'Já está na sua biblioteca' : 'Adicionar à biblioteca'}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check size={15} />
                          <span>Adicionado</span>
                        </>
                      ) : (
                        <>
                          <Plus size={15} />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
