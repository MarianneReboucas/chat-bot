import { 
  Film, 
  Tv, 
  Clapperboard, 
  Music, 
  Disc, 
  BookOpen, 
  Gamepad2, 
  Sparkles
} from 'lucide-react';

/**
 * Registro Universal de Categorias Culturais do SCENA.
 */
export const MEDIA_TYPES = {
  filmes: {
    id: 'filmes',
    label: 'Filmes',
    singularLabel: 'Filme',
    icon: Film,
    colorAccent: '#59030B',
    creatorLabel: 'Direção / Cineasta',
    unitLabel: 'Duração',
    placeholderQuery: 'Indique um filme clássico cult ou suspense psicológico...'
  },
  series: {
    id: 'series',
    label: 'Séries',
    singularLabel: 'Série',
    icon: Tv,
    colorAccent: '#59030B',
    creatorLabel: 'Criador(a) / Showrunner',
    unitLabel: 'Temporadas',
    placeholderQuery: 'Séries com roteiro impecável e atuações brilhantes...'
  },
  animes: {
    id: 'animes',
    label: 'Desenhos & Animes',
    singularLabel: 'Anime / Desenho',
    icon: Clapperboard,
    colorAccent: '#59030B',
    creatorLabel: 'Estúdio / Autor(a)',
    unitLabel: 'Episódios',
    placeholderQuery: 'Animes clássicos com trilha marcante e estética noir...'
  },
  musicas: {
    id: 'musicas',
    label: 'Músicas',
    singularLabel: 'Música',
    icon: Music,
    colorAccent: '#59030B',
    creatorLabel: 'Artista / Compositor',
    unitLabel: 'Duração',
    placeholderQuery: 'Canções poéticas de MPB, Jazz, Bossa Nova ou Rock...'
  },
  albuns: {
    id: 'albuns',
    label: 'Álbuns',
    singularLabel: 'Álbum',
    icon: Disc,
    colorAccent: '#59030B',
    creatorLabel: 'Artista / Banda',
    unitLabel: 'Faixas / Duração',
    placeholderQuery: 'Álbuns conceituais imperdíveis da história da música...'
  },
  livros: {
    id: 'livros',
    label: 'Livros',
    singularLabel: 'Livro',
    icon: BookOpen,
    colorAccent: '#59030B',
    creatorLabel: 'Autor(a) / Escritor(a)',
    unitLabel: 'Páginas',
    placeholderQuery: 'Livros clássicos de realismo mágico ou distopia...'
  },
  jogos: {
    id: 'jogos',
    label: 'Jogos',
    singularLabel: 'Jogo / Game',
    icon: Gamepad2,
    colorAccent: '#59030B',
    creatorLabel: 'Estúdio / Direção',
    unitLabel: 'Plataformas',
    placeholderQuery: 'Jogos com narrativa profunda, arte única e imersão...'
  }
};

export const CATEGORY_LIST = [
  { id: 'all', label: 'Todas as Mídias', icon: Sparkles },
  ...Object.values(MEDIA_TYPES)
];

/**
 * Catálogo Amplo de Busca Rápida (Acervo Global SCENA tipo Letterboxd)
 */
export const GLOBAL_SEARCHABLE_CATALOG = [
  // FILMES
  {
    id: 'film-1',
    typeId: 'filmes',
    title: 'Blade Runner 2049',
    creator: 'Denis Villeneuve',
    year: '2017',
    metric: '2h 44m',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'Cyberpunk', 'Cult'],
    badge: 'Obra-Prima',
    synopsis: 'Trinta anos após os eventos do primeiro filme, um novo Blade Runner desenterra um segredo enterrado que pode mergulhar a sociedade no caos.'
  },
  {
    id: 'film-2',
    typeId: 'filmes',
    title: 'Interestelar',
    creator: 'Christopher Nolan',
    year: '2014',
    metric: '2h 49m',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'Espaço', 'Hans Zimmer'],
    badge: 'Épico Moderno',
    synopsis: 'Um grupo de astronautas viaja através de um buraco de minhoca em busca de um novo lar para a humanidade.'
  },
  {
    id: 'film-3',
    typeId: 'filmes',
    title: 'Harry Potter e o Prisioneiro de Azkaban',
    creator: 'Alfonso Cuarón',
    year: '2004',
    metric: '2h 22m',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Fantasia', 'Magia', 'Mistério'],
    badge: 'Aclamado',
    synopsis: 'No seu terceiro ano em Hogwarts, Harry, Ron e Hermione investigam Sirius Black, um prisioneiro fugitivo de Azkaban.'
  },
  {
    id: 'film-4',
    typeId: 'filmes',
    title: 'Duna: Parte 2',
    creator: 'Denis Villeneuve',
    year: '2024',
    metric: '2h 46m',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'Épico', 'Arrakis'],
    badge: 'Sucesso Global',
    synopsis: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.'
  },
  {
    id: 'film-5',
    typeId: 'filmes',
    title: 'Pulp Fiction: Tempo de Violência',
    creator: 'Quentin Tarantino',
    year: '1994',
    metric: '2h 34m',
    coverUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    tags: ['Crime', 'Cult', 'Diálogos'],
    badge: 'Palma de Ouro',
    synopsis: 'Histórias entrelaçadas de criminosos, um boxeador e gangsters em Los Angeles com narrativa não-linear brilhante.'
  },

  // SÉRIES
  {
    id: 'series-1',
    typeId: 'series',
    title: 'Succession',
    creator: 'Jesse Armstrong',
    year: '2018–2023',
    metric: '4 Temporadas',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    tags: ['Drama', 'Corporativo', 'Sátira'],
    badge: 'Aclamação Crítica',
    synopsis: 'A família Roy controla o maior conglomerado de mídia do mundo enquanto os filhos disputam o controle da empresa.'
  },
  {
    id: 'series-2',
    typeId: 'series',
    title: 'Severance (Ruptura)',
    creator: 'Dan Erickson / Ben Stiller',
    year: '2022–Atual',
    metric: '2 Temporadas',
    coverUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'Suspense Psicológico', 'Distopia'],
    badge: 'Imperdível',
    synopsis: 'Funcionários de uma misteriosa corporação passam por um procedimento cirúrgico que divide memórias pessoais e de trabalho.'
  },
  {
    id: 'series-3',
    typeId: 'series',
    title: 'Percy Jackson e os Olimpianos',
    creator: 'Rick Riordan / Jonathan E. Steinberg',
    year: '2023–Atual',
    metric: '1 Temporada',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['Fantasia', 'Mitologia Grega', 'Aventura'],
    badge: 'Popular',
    synopsis: 'O semideus Percy Jackson é acusado por Zeus de roubar seu raio mestre e parte em uma jornada pelos Estados Unidos para encontrá-lo.'
  },
  {
    id: 'series-4',
    typeId: 'series',
    title: 'Dark',
    creator: 'Baran bo Odar & Jantje Friese',
    year: '2017–2020',
    metric: '3 Temporadas',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'Viagem no Tempo', 'Mistério'],
    badge: 'Cult Alemão',
    synopsis: 'O desaparecimento de duas crianças em uma pequena cidade alemã revela segredos e conexões temporais entre quatro famílias.'
  },

  // DESENHOS / ANIMES
  {
    id: 'anime-1',
    typeId: 'animes',
    title: 'Cowboy Bebop',
    creator: 'Shinichiro Watanabe',
    year: '1998',
    metric: '26 Episódios',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['Space Western', 'Jazz', 'Noir'],
    badge: 'Marco Histórico',
    synopsis: 'Em 2071, caçadores de recompensas viajam pelo espaço ao som de blues, jazz e solidão cósmica.'
  },
  {
    id: 'anime-2',
    typeId: 'animes',
    title: 'A Viagem de Chihiro',
    creator: 'Hayao Miyazaki (Ghibli)',
    year: '2001',
    metric: '2h 05m',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Fantasia', 'Ghibli', 'Oscar'],
    badge: 'Lenda da Animação',
    synopsis: 'Chihiro entra em um mundo de espíritos e deuses onde deve trabalhar para salvar seus pais transformados.'
  },
  {
    id: 'anime-3',
    typeId: 'animes',
    title: 'Avatar: A Lenda de Aang',
    creator: 'Michael Dante DiMartino & Bryan Konietzko',
    year: '2005–2008',
    metric: '3 Temporadas (61 eps)',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Animação', 'Aventura', 'Dobra de Elementos'],
    badge: 'Clássico Eterno',
    synopsis: 'Em um mundo dividido em quatro nações elementares, o jovem Avatar Aang deve dominar todos os elementos para restaurar a paz.'
  },
  {
    id: 'anime-4',
    typeId: 'animes',
    title: 'Neon Genesis Evangelion',
    creator: 'Hideaki Anno (Gainax)',
    year: '1995',
    metric: '26 Episódios',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Mecha', 'Psicológico', 'Filosófico'],
    badge: 'Revolucionário',
    synopsis: 'Jovens pilotos são convocados para controlar robôs biomecânicos gigantes chamados EVAs e proteger a Terra contra os Anjos.'
  },

  // MÚSICAS
  {
    id: 'music-1',
    typeId: 'musicas',
    title: 'Construção',
    creator: 'Chico Buarque',
    year: '1971',
    metric: '4:18 min',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    tags: ['MPB', 'Poesia Concreta', 'Clássico'],
    badge: 'Hino Cultural',
    synopsis: 'Uma obra-prima poética e melódica com versos proparoxítonos rigorosos e arranjos orquestrais arrebatadores.'
  },
  {
    id: 'music-2',
    typeId: 'musicas',
    title: 'Águas de Março',
    creator: 'Tom Jobim & Elis Regina',
    year: '1974',
    metric: '3:32 min',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    tags: ['Bossa Nova', 'Poesia', 'MPB'],
    badge: 'Eterno',
    synopsis: 'Considerada uma das canções brasileiras mais perfeitas, unindo o piano harmônico de Tom ao canto luminoso de Elis.'
  },
  {
    id: 'music-3',
    typeId: 'musicas',
    title: 'Let It Be',
    creator: 'The Beatles',
    year: '1970',
    metric: '4:03 min',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    tags: ['Rock Clássico', 'Balada', 'Beatles'],
    badge: 'Hino Mundial',
    synopsis: 'Composição tocante de Paul McCartney que se tornou um dos maiores legados de paz e esperança da história da música.'
  },
  {
    id: 'music-4',
    typeId: 'musicas',
    title: 'Bohemian Rhapsody',
    creator: 'Queen',
    year: '1975',
    metric: '5:55 min',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    tags: ['Rock Ópera', 'Progressivo', 'Freddie Mercury'],
    badge: 'Lenda Musical',
    synopsis: 'A extraordinária fusão de balada, ópera e hard rock concebida com genialidade por Freddie Mercury.'
  },

  // ÁLBUNS
  {
    id: 'album-1',
    typeId: 'albuns',
    title: 'Clube da Esquina',
    creator: 'Milton Nascimento & Lô Borges',
    year: '1972',
    metric: '21 Faixas • 64 min',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    tags: ['MPB', 'Psicodelia', 'Jazz'],
    badge: 'Essencial',
    synopsis: 'Um monumento da música mundial, fundindo harmonias mineiras, jazz modal, Beatles e pura poesia lírica.'
  },
  {
    id: 'album-2',
    typeId: 'albuns',
    title: 'The Dark Side of the Moon',
    creator: 'Pink Floyd',
    year: '1973',
    metric: '10 Faixas • 43 min',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    tags: ['Rock Progressivo', 'Psicodélico', 'Conceitual'],
    badge: 'Marco Mundial',
    synopsis: 'Um dos discos mais aclamados e vendidos da história, explorando temas sobre o tempo, a loucura e a ganância.'
  },
  {
    id: 'album-3',
    typeId: 'albuns',
    title: 'Abbey Road',
    creator: 'The Beatles',
    year: '1969',
    metric: '17 Faixas • 47 min',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    tags: ['Rock', 'Pop Clássico', 'The Beatles'],
    badge: 'Ícone Supremo',
    synopsis: 'O último álbum gravado pelos Beatles, famoso por sua clássica faixa contínua no lado B e canções lendárias como Come Together.'
  },
  {
    id: 'album-4',
    typeId: 'albuns',
    title: 'Kind of Blue',
    creator: 'Miles Davis',
    year: '1959',
    metric: '5 Faixas • 45 min',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    tags: ['Jazz Modal', 'Improviso', 'Clássico'],
    badge: 'Maior do Jazz',
    synopsis: 'O ápice do jazz modal reunindo lendas como John Coltrane, Bill Evans e Cannonball Adderley.'
  },

  // LIVROS
  {
    id: 'book-1',
    typeId: 'livros',
    title: 'Cem Anos de Solidão',
    creator: 'Gabriel García Márquez',
    year: '1967',
    metric: '448 páginas',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    tags: ['Realismo Mágico', 'Clássico Latino', 'Nobel'],
    badge: 'Clássico Eterno',
    synopsis: 'A saga épica da família Buendía na mítica Macondo, tecendo gerações de solidão, paixão, revoluções e destino.'
  },
  {
    id: 'book-2',
    typeId: 'livros',
    title: '1984',
    creator: 'George Orwell',
    year: '1949',
    metric: '336 páginas',
    coverUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80',
    tags: ['Distopia', 'Ficção Filosófica', 'Política'],
    badge: 'Obra Vital',
    synopsis: 'Um retrato perturbador sobre totalitarismo, vigilância do Grande Irmão e a luta pela verdade e liberdade mental.'
  },
  {
    id: 'book-3',
    typeId: 'livros',
    title: 'Harry Potter e a Pedra Filosofal',
    creator: 'J.K. Rowling',
    year: '1997',
    metric: '223 páginas',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    tags: ['Fantasia', 'Magia', 'Jovem Adulto'],
    badge: 'Fenômeno Literário',
    synopsis: 'O garoto órfão Harry Potter descobre em seu aniversário de 11 anos que é um bruxo e é convidado para a Escola de Magia de Hogwarts.'
  },
  {
    id: 'book-4',
    typeId: 'livros',
    title: 'O Ladrão de Raios (Percy Jackson & os Olimpianos)',
    creator: 'Rick Riordan',
    year: '2005',
    metric: '400 páginas',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['Mitologia', 'Aventura', 'Fantasia'],
    badge: 'Bestseller',
    synopsis: 'Percy descobre que seu verdadeiro pai é Poseidon, deus dos mares, e parte em uma missão mitológica pelo Acampamento Meio-Sangue.'
  },

  // JOGOS
  {
    id: 'game-1',
    typeId: 'jogos',
    title: 'Shadow of the Colossus',
    creator: 'Team Ico / Fumito Ueda',
    year: '2005 / 2018',
    metric: 'PlayStation',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    tags: ['Arte Interativa', 'Atmosférico', 'Aventura'],
    badge: 'Obra de Arte',
    synopsis: 'Um jovem viaja por terras desoladas para confrontar dezesseis gigantes colossos e restaurar a vida de uma garota.'
  },
  {
    id: 'game-2',
    typeId: 'jogos',
    title: 'Chrono Trigger',
    creator: 'Dream Team (Square)',
    year: '1995',
    metric: 'Super Nintendo / PC / Mobile',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    tags: ['RPG', 'Viagem no Tempo', 'Yasunori Mitsuda'],
    badge: 'Lenda dos Games',
    synopsis: 'Uma jornada inesquecível através de eras do tempo para desvendar mistérios e salvar o planeta do apocalipse.'
  },
  {
    id: 'game-3',
    typeId: 'jogos',
    title: 'The Legend of Zelda: Breath of the Wild',
    creator: 'Nintendo EPD',
    year: '2017',
    metric: 'Nintendo Switch',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    tags: ['Mundo Aberto', 'Aventura', 'Obra-Prima'],
    badge: 'Jogo do Ano (GOTY)',
    synopsis: 'Link acorda de um sono de cem anos em um reino de Hyrule devastado e deve explorar livremente para derrotar Calamity Ganon.'
  },
  {
    id: 'game-4',
    typeId: 'jogos',
    title: 'Red Dead Redemption 2',
    creator: 'Rockstar Games',
    year: '2018',
    metric: 'PC / PS4 / Xbox',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    tags: ['Velho Oeste', 'Narrativa Cinematográfica', 'Mundo Vivo'],
    badge: 'Épico Narrativo',
    synopsis: 'Arthur Morgan e a gangue Van der Linde tentam sobreviver no fim da era dos pistoleiros na América de 1899.'
  }
];

export const INITIAL_CULTURAL_ITEMS = GLOBAL_SEARCHABLE_CATALOG.slice(0, 14);
