import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { 
  Clapperboard, 
  Sparkles, 
  Compass, 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  TrendingUp, 
  Layers, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowRight, 
  Flame, 
  Home, 
  User, 
  Share2, 
  Heart,
  Bookmark,
  Bot
} from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import AddContentModal from './components/AddContentModal';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import { MEDIA_TYPES, CATEGORY_LIST, INITIAL_CULTURAL_ITEMS } from './types/contentTypes';

// Configuração do marked
marked.setOptions({
  breaks: true,
  gfm: true
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const NAV_TABS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'chat', label: 'Suporte IA', icon: Bot },
  { id: 'descobrir', label: 'Descobrir', icon: Compass },
  { id: 'buscar', label: 'Buscar', icon: Search },
  { id: 'perfil', label: 'Meu Perfil', icon: User },
];

const COMMUNITY_FEED = [
  {
    id: 'f1',
    user: 'Helena Ramos',
    handle: '@helenaramos',
    userAvatar: 'HR',
    time: 'Há 15 min',
    action: 'adicionou ao acervo',
    categoryLabel: 'Filme',
    title: 'Blade Runner 2049 (2017)',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
    review: 'Uma experiência sensorial cinematográfica surreal. A fotografia de Roger Deakins e o design de som te transportam direto para a distopia.',
    likes: 48,
    comments: 12
  },
  {
    id: 'f2',
    user: 'Matheus Costa',
    handle: '@matheus_c',
    userAvatar: 'MC',
    time: 'Há 45 min',
    action: 'criou a coleção',
    categoryLabel: 'Coleção Literária',
    title: 'Livros que expandem a percepção do tempo',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
    review: 'Organizei 8 obras essenciais entre ficção científica filosófica, realismo mágico e ensaios sobre arte e tempo.',
    likes: 83,
    comments: 19
  }
];

const USER_PROFILE_PREVIEW = {
  name: 'Mari Oliveira',
  handle: '@mari.scena',
  bio: 'Cinéfila em busca de roteiros autorais, apaixonada por animes clássicos, RPGs atmosféricos, jazz e literatura.',
  avatar: 'MO',
  bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
  stats: {
    filmes: 184,
    series: 42,
    animes: 35,
    livros: 68,
    musicas_albuns: 112,
    jogos: 26,
    listas: 14
  }
};

export default function App() {
  const [activeNav, setActiveNav] = useState('inicio');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [catalogItems, setCatalogItems] = useState(INITIAL_CULTURAL_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curationResults, setCurationResults] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  // Monitoramento de saúde da API (Health Check)
  const [isApiOnline, setIsApiOnline] = useState(true);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkApiHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`, {
        method: 'GET',
        cache: 'no-cache',
      });
      if (response.ok) {
        setIsApiOnline(true);
      } else {
        setIsApiOnline(false);
      }
    } catch (error) {
      console.warn('Backend FastAPI indisponível:', error);
      setIsApiOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    // Checagem imediata ao montar
    checkApiHealth();

    // Verificação periódica a cada 15 segundos
    const interval = setInterval(() => {
      checkApiHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const curatedChips = [
    'Me recomende um jogo com narrativa cinematográfica',
    'Quais animes imperdíveis dos anos 90?',
    'Indique 3 livros clássicos e envolventes',
    'Melhores álbuns de Jazz e MPB para ouvir à noite',
    'Filmes de ficção científica cult e imersivos'
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAddNewContent = (newItem) => {
    setCatalogItems((prev) => [newItem, ...prev]);
  };

  const handleCulturalExplore = async (customPrompt) => {
    const query = (customPrompt || searchQuery).trim();
    if (!query || isLoading) return;

    const queryEntryId = `query-${Date.now()}`;
    const newEntry = {
      id: queryEntryId,
      query: query,
      timestamp: Date.now(),
      reply: null,
      source: null,
      loading: true
    };

    setCurationResults((prev) => [newEntry, ...prev]);
    setSearchQuery('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          session_id: 'session-scena-cultural'
        })
      });

      if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

      const data = await response.json();

      setCurationResults((prev) =>
        prev.map((item) =>
          item.id === queryEntryId
            ? {
                ...item,
                reply: data.reply,
                source: data.source,
                loading: false
              }
            : item
        )
      );
    } catch (error) {
      console.error('Falha ao obter curadoria:', error);
      setCurationResults((prev) =>
        prev.map((item) =>
          item.id === queryEntryId
            ? {
                ...item,
                reply: '⚠️ **Não foi possível sincronizar com o catálogo da SCENA.**\n\nVerifique se o backend está rodando na porta 8000.',
                source: 'offline',
                loading: false
              }
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setSearchQuery(transcript);
    handleCulturalExplore(transcript);
  };

  const toggleLikePost = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeedback = async (id, isPositive) => {
    setFeedbacks((prev) => ({ ...prev, [id]: isPositive ? 'like' : 'dislike' }));
    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: id, is_positive: isPositive })
      });
    } catch (e) {
      console.warn('Erro ao registrar feedback:', e);
    }
  };

  const filteredCatalog =
    activeCategory === 'all'
      ? catalogItems
      : catalogItems.filter((item) => item.typeId === activeCategory);

  return (
    <div className="scena-app">
      {/* 0. Cabeçalho Institucional com Status da API */}
      <Header
        isApiOnline={isApiOnline}
        isChecking={isCheckingHealth}
        onCheckHealth={checkApiHealth}
      />

      {/* 1. Barra Superior Principal */}
      <header className="scena-navbar glass-card">
        <div className="nav-brand" onClick={() => setActiveNav('inicio')} style={{ cursor: 'pointer' }}>
          <div className="brand-badge">
            <Clapperboard size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-logo-text">SCENA</span>
            <span className="brand-tagline">Rede Social Cultural</span>
          </div>
        </div>

        {/* 5 Abas Principais (Início, Chat IA, Descobrir, Buscar, Perfil) */}
        <nav className="nav-main-tabs">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                className={`main-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-actions">
          {/* Botão de Adicionar Nova Obra Cultural */}
          <button 
            className="add-content-header-btn" 
            onClick={() => setIsModalOpen(true)}
            title="Adicionar Novo Conteúdo Cultural"
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Modo Editorial Claro' : 'Modo Noturno Cinematográfico'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div 
            className={`user-avatar-badge ${activeNav === 'perfil' ? 'active-avatar' : ''}`}
            onClick={() => setActiveNav('perfil')}
            title="Meu Perfil Cultural"
          >
            <span>MO</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          ABA 1: INÍCIO (Hero de Descoberta & Acervo)
          ========================================================================= */}
      {activeNav === 'inicio' && (
        <>
          <section className="scena-hero glass-card">
            <div className="hero-content">
              <div className="hero-pill">
                <Sparkles size={14} />
                <span>Curadoria Cultural & Plataforma Social</span>
              </div>
              <h1 className="hero-title">
                Descubra e organize <em>filmes, séries, animes, livros, músicas e jogos</em>.
              </h1>
              <p className="hero-subtitle">
                O espaço definitivo e expansível para catalogar e explorar o universo das artes e do entretenimento.
              </p>

              {/* Barra de Busca e Exploração */}
              <div className="hero-search-bar">
                <div className="search-input-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="hero-input"
                    placeholder="Peça uma indicação ou análise cultural por texto ou microfone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCulturalExplore();
                    }}
                    disabled={isLoading}
                  />
                  <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
                </div>
                <button
                  className="explore-btn"
                  onClick={() => handleCulturalExplore()}
                  disabled={!searchQuery.trim() || isLoading}
                >
                  <span>Explorar</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Chips Rápidos */}
              <div className="hero-chips">
                <span className="chips-label">Sugestões:</span>
                {curatedChips.slice(0, 3).map((chip, idx) => (
                  <button
                    key={idx}
                    className="curated-chip"
                    onClick={() => handleCulturalExplore(chip)}
                    disabled={isLoading}
                  >
                    <Compass size={13} />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Painel de Resultados de Curadoria Ativa */}
          {curationResults.length > 0 && (
            <section className="curation-panel">
              <div className="section-header">
                <div className="section-title-group">
                  <Sparkles size={18} className="text-burgundy" />
                  <h2>Curadoria & Análise Cultural SCENA</h2>
                </div>
                <button className="clear-curation-btn" onClick={() => setCurationResults([])}>
                  Limpar Análises
                </button>
              </div>

              <div className="curation-cards-list">
                {curationResults.map((item) => (
                  <article key={item.id} className="curation-card glass-card">
                    <div className="curation-header">
                      <div className="curation-query">
                        <span className="query-tag">Consulta Cultural</span>
                        <h3>"{item.query}"</h3>
                      </div>
                    </div>
                    <div className="curation-body">
                      {item.loading ? (
                        <div className="curation-loading">
                          <p>Consultando acervo cultural e gerando curadoria...</p>
                        </div>
                      ) : (
                        <div
                          className="markdown-body"
                          dangerouslySetInnerHTML={{ __html: marked.parse(item.reply || '') }}
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Grid Principal */}
          <main className="scena-main-grid">
            <section className="highlights-section">
              <div className="section-header">
                <div className="section-title-group">
                  <Flame size={18} className="text-burnt-red" />
                  <h2>Acervo Cultural no SCENA</h2>
                </div>
                <button className="see-more-link" onClick={() => setActiveNav('descobrir')}>
                  Explorar catálogo completo →
                </button>
              </div>

              <div className="cultural-poster-grid">
                {catalogItems.slice(0, 4).map((work) => {
                  const typeConfig = MEDIA_TYPES[work.typeId] || MEDIA_TYPES.filmes;
                  return (
                    <article key={work.id} className="poster-card glass-card">
                      <div className="poster-media-container">
                        <img src={work.coverUrl} alt={work.title} className="poster-image" loading="lazy" />
                        <div className="poster-overlay">
                          <span className="poster-badge">{work.badge}</span>
                        </div>
                        <span className="poster-category-tag">{typeConfig.singularLabel}</span>
                      </div>

                      <div className="poster-details">
                        <div className="poster-header-info">
                          <h3 className="poster-title">{work.title}</h3>
                          <p className="poster-creator">{work.creator} • <span>{work.year}</span></p>
                        </div>
                        <p className="poster-synopsis">{work.synopsis}</p>
                        <div className="poster-tags">
                          {work.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="work-tag">{tag}</span>
                          ))}
                        </div>
                        <div className="poster-footer">
                          <span className="work-metric-info">{work.metric}</span>
                          <button
                            className="poster-action-btn"
                            onClick={() => handleCulturalExplore(`Conte-me mais sobre ${work.title} (${typeConfig.singularLabel}) de ${work.creator}`)}
                          >
                            <span>Análise</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Diário da Comunidade */}
            <aside className="community-aside">
              <div className="section-header">
                <div className="section-title-group">
                  <TrendingUp size={18} className="text-warm-brown" />
                  <h2>Diário da Comunidade</h2>
                </div>
              </div>

              <div className="feed-list">
                {COMMUNITY_FEED.map((post) => (
                  <article key={post.id} className="feed-card glass-card">
                    <div className="feed-user-row">
                      <div className="feed-avatar">{post.userAvatar}</div>
                      <div className="feed-user-info">
                        <strong>{post.user}</strong>
                        <span>{post.action} • {post.time}</span>
                      </div>
                    </div>

                    <div className="feed-content-layout">
                      {post.coverUrl && (
                        <img src={post.coverUrl} alt={post.title} className="feed-mini-thumb" loading="lazy" />
                      )}
                      <div className="feed-text-group">
                        <span className="feed-cat-label">{post.categoryLabel}</span>
                        <h4>{post.title}</h4>
                      </div>
                    </div>

                    <p className="feed-review-text">"{post.review}"</p>

                    <div className="feed-interactions">
                      <button
                        onClick={() => toggleLikePost(post.id)}
                        className={`feed-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                      >
                        <Heart size={14} />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>
                      <button className="feed-action-btn">
                        <Share2 size={14} />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </article>
                ))}

                <div className="create-list-cta glass-card">
                  <Layers size={22} className="cta-icon" />
                  <h3>Cadastre Novos Conteúdos</h3>
                  <p>Adicione filmes, livros, jogos, animes, músicas ou séries ao acervo geral do SCENA.</p>
                  <button className="cta-btn" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} />
                    <span>Adicionar Conteúdo</span>
                  </button>
                </div>
              </div>
            </aside>
          </main>
        </>
      )}

      {/* =========================================================================
          ABA CHAT: ATENDIMENTO INTELIGENTE & SUPORTE IA
          ========================================================================= */}
      {activeNav === 'chat' && (
        <section className="chat-tab-container">
          <ChatWindow />
        </section>
      )}

      {/* =========================================================================
          ABA 2: DESCOBRIR (Categorias Expansíveis)
          ========================================================================= */}
      {activeNav === 'descobrir' && (
        <section className="discover-section glass-card">
          <div className="section-header-large" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Descobrir no SCENA</h2>
              <p className="section-desc">Explore todas as mídias: Filmes, Séries, Desenhos/Animes, Livros, Músicas, Álbuns e Jogos.</p>
            </div>
            <button className="add-content-header-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Novo Conteúdo</span>
            </button>
          </div>

          {/* Barra de Filtro de Mídias */}
          <div className="category-filter-bar">
            {CATEGORY_LIST.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-pill ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid de Pôsteres Dinâmico */}
          <div className="cultural-poster-grid" style={{ marginTop: '24px' }}>
            {filteredCatalog.map((work) => {
              const typeConfig = MEDIA_TYPES[work.typeId] || MEDIA_TYPES.filmes;
              return (
                <article key={work.id} className="poster-card glass-card">
                  <div className="poster-media-container">
                    <img src={work.coverUrl} alt={work.title} className="poster-image" loading="lazy" />
                    <div className="poster-overlay">
                      <span className="poster-badge">{work.badge}</span>
                    </div>
                    <span className="poster-category-tag">{typeConfig.singularLabel}</span>
                  </div>

                  <div className="poster-details">
                    <div className="poster-header-info">
                      <h3 className="poster-title">{work.title}</h3>
                      <p className="poster-creator">{work.creator} • <span>{work.year}</span></p>
                    </div>

                    <p className="poster-synopsis">{work.synopsis}</p>

                    <div className="poster-tags">
                      {work.tags.map((tag, idx) => (
                        <span key={idx} className="work-tag">{tag}</span>
                      ))}
                    </div>

                    <div className="poster-footer">
                      <span className="work-metric-info">{work.metric}</span>
                      <button
                        className="poster-action-btn"
                        onClick={() => handleCulturalExplore(`Quais as principais análises sobre ${work.title} (${typeConfig.singularLabel})?`)}
                      >
                        <span>Curadoria</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          ABA 3: BUSCAR
          ========================================================================= */}
      {activeNav === 'buscar' && (
        <section className="search-section glass-card">
          <div className="section-header-large">
            <div>
              <h2>Buscar & Curadoria Cultural</h2>
              <p className="section-desc">Pesquise por títulos, diretores, autores, bandas, estúdios ou jogos por texto e voz.</p>
            </div>
          </div>

          <div className="hero-search-bar" style={{ maxWidth: '100%' }}>
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="hero-input"
                placeholder="Ex: Jogos de RPG clássicos, filmes sci-fi dos anos 80, álbuns de MPB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCulturalExplore();
                }}
                disabled={isLoading}
                autoFocus
              />
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
            </div>
            <button
              className="explore-btn"
              onClick={() => handleCulturalExplore()}
              disabled={!searchQuery.trim() || isLoading}
            >
              <span>Consultar</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="hero-chips" style={{ justifyContent: 'flex-start', marginTop: '14px' }}>
            <span className="chips-label">Sugestões de Pesquisa:</span>
            {curatedChips.map((chip, idx) => (
              <button
                key={idx}
                className="curated-chip"
                onClick={() => handleCulturalExplore(chip)}
                disabled={isLoading}
              >
                <Compass size={13} />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {curationResults.length > 0 && (
            <div className="curation-cards-list" style={{ marginTop: '24px' }}>
              {curationResults.map((item) => (
                <article key={item.id} className="curation-card glass-card">
                  <div className="curation-header">
                    <div className="curation-query">
                      <span className="query-tag">Resultado de Busca Cultural</span>
                      <h3>"{item.query}"</h3>
                    </div>
                  </div>
                  <div className="curation-body">
                    {item.loading ? (
                      <div className="curation-loading">
                        <p>Processando pesquisa cultural com IA...</p>
                      </div>
                    ) : (
                      <div
                        className="markdown-body"
                        dangerouslySetInnerHTML={{ __html: marked.parse(item.reply || '') }}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          ABA 4: MEU PERFIL
          ========================================================================= */}
      {activeNav === 'perfil' && (
        <section className="profile-section">
          <div className="profile-header-card glass-card">
            <div 
              className="profile-banner"
              style={{ backgroundImage: `linear-gradient(rgba(17, 16, 15, 0.4), rgba(17, 16, 15, 0.8)), url(${USER_PROFILE_PREVIEW.bannerUrl})` }}
            >
              <div className="profile-avatar-large">{USER_PROFILE_PREVIEW.avatar}</div>
            </div>
            <div className="profile-info-body">
              <div className="profile-user-titles">
                <h2>{USER_PROFILE_PREVIEW.name}</h2>
                <span className="profile-handle">{USER_PROFILE_PREVIEW.handle}</span>
              </div>
              <p className="profile-bio">{USER_PROFILE_PREVIEW.bio}</p>

              {/* Estatísticas com todas as categorias suportadas */}
              <div className="profile-stats-grid">
                {Object.values(MEDIA_TYPES).map((type) => (
                  <div key={type.id} className="stat-box">
                    <strong>{USER_PROFILE_PREVIEW.stats[type.id] || 12}</strong>
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal de Busca Instantânea estilo Letterboxd */}
      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddContent={handleAddNewContent}
        currentCatalogIds={catalogItems.map((item) => item.id)}
      />

      {/* Footer Editorial */}
      <footer className="scena-footer glass-card">
        <div className="footer-left">
          <span className="footer-brand">SCENA</span>
          <span>Rede Social Cultural • Filmes • Séries • Desenhos/Animes • Músicas • Álbuns • Livros • Jogos</span>
        </div>
        <div className="footer-right">
          <span>Curadoria Expansível por IA & Voz</span>
        </div>
      </footer>
    </div>
  );
}
