"""
Motor de Inteligência Artificial & Curadoria Cultural
SCENA - Sua Rede Social Cultural (Filmes, Séries, Animes, Músicas, Álbuns e Livros)
"""

import json
import os
import re
import string
import sys
import urllib.request
import urllib.error
from datetime import datetime
import uuid

# Configuração de encoding seguro para saída no terminal Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


class ChatbotEngine:
    """
    Classe principal responsável por orquestrar o assistente e curador cultural do SCENA:
    - Carregamento e consulta da base de conhecimento cultural.
    - Integração com LLM (Groq / Llama-3) para recomendações e análises de obras.
    - Mecanismo léxico local de fallback offline e tratamento de saudações.
    - Coleta e gestão de métricas de uso e feedbacks dos usuários.
    """

    # Stopwords comuns da língua portuguesa para o pré-processamento léxico
    STOPWORDS_PT = {
        "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
        "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "com",
        "para", "pra", "pro", "que", "e", "ou", "se", "como", "mas", "mais", "ao", "aos",
        "me", "te", "se", "nos", "lhe", "lhes", "meu", "minha", "seu", "sua", "nosso", "nossa",
        "esse", "essa", "este", "esta", "isso", "isto", "aquele", "aquela", "aquilo",
        "qual", "quais", "quem", "quando", "onde", "quanto", "quantos", "quanta", "quantas"
    }

    # Termos comuns para identificação de saudações
    SAUDACOES = {
        "oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "e ai", "e aí",
        "opa", "tudo bem", "como vai", "fala", "saudacoes", "saudações", "salve", "hey"
    }

    def __init__(self, kb_path=None, env_path=None):
        """
        Inicializa o motor cultural do SCENA, carregando variáveis de ambiente, base de conhecimento e métricas.
        """
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.kb_path = kb_path or os.path.join(self.base_dir, "01_base_conhecimento.json")
        if not os.path.exists(self.kb_path):
            self.kb_path = os.path.join(self.base_dir, "base_conhecimento.json")
            
        self.env_path = env_path or os.path.join(self.base_dir, ".env")

        # Carregar variáveis do .env (se existir)
        self._load_env(self.env_path)

        # Configurações da API Groq
        self.groq_api_key = os.environ.get("GROQ_API_KEY", "").strip()
        self.groq_model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.groq_api_url = "https://api.groq.com/openai/v1/chat/completions"

        # Carregar base de conhecimento JSON
        self.kb_data = self._load_knowledge_base(self.kb_path)

        # Histórico de conversação multi-turn para a LLM
        self.conversation_history = []

        # Gestão de Métricas do Sistema
        self.metrics = {
            "total_mensagens": 0,
            "resolvidas_llm": 0,
            "resolvidas_base": 0,
            "saudacoes": 0,
            "fallbacks": 0,
            "feedbacks_positivos": 0,
            "feedbacks_negativos": 0
        }

        # Armazenamento de mensagens processadas para associação de feedback
        self.messages_log = {}

    def _load_env(self, env_path):
        """Lê um arquivo .env simples e injeta as variáveis no os.environ sem dependências externas."""
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, value = line.split("=", 1)
                            os.environ[key.strip()] = value.strip().strip("'\"")
            except Exception as e:
                print(f"[AVISO] Não foi possível ler o arquivo .env: {e}")

    def _load_knowledge_base(self, path):
        """Carrega e retorna o arquivo JSON da base de conhecimento."""
        if not os.path.exists(path):
            print(f"[ERRO] Base de conhecimento não encontrada no caminho: {path}")
            return {"empresa": "SCENA", "descricao": "", "topicos": [], "faq_rapido": []}
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[ERRO] Falha ao carregar JSON da base de conhecimento: {e}")
            return {"empresa": "SCENA", "descricao": "", "topicos": [], "faq_rapido": []}

    def _get_current_date_pt(self):
        """Retorna a data atual real formatada por extenso em português."""
        meses = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ]
        dias_semana = [
            "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
            "Sexta-feira", "Sábado", "Domingo"
        ]
        now = datetime.now()
        dia_semana = dias_semana[now.weekday()]
        mes = meses[now.month - 1]
        return f"{dia_semana}, {now.day} de {mes} de {now.year} (Horário: {now.strftime('%H:%M')})"

    def _build_system_prompt(self):
        """
        Constrói o prompt de sistema para a LLM, integrando a persona cultural do SCENA.
        """
        data_atual = self._get_current_date_pt()
        app_name = self.kb_data.get("empresa", "SCENA - Rede Social Cultural")
        descricao = self.kb_data.get("descricao", "")
        topicos = self.kb_data.get("topicos", [])

        # Formatar tópicos da base para o prompt
        topicos_texto = []
        for topico in topicos:
            topicos_texto.append(
                f"### Tópico: {topico.get('id')}\n"
                f"- Perguntas frequentes relacionadas: {', '.join(topico.get('perguntas_chave', []))}\n"
                f"- Informação oficial: {topico.get('resposta')}\n"
            )
        base_formatada = "\n".join(topicos_texto)

        prompt = f"""Você é o Assistente e Curador Cultural Inteligente do {app_name}.
{descricao}

Você é especialista em 6 categorias culturais:
1. 🎬 Filmes (clássicos, autorais, blockbusters, diretores, sinopses)
2. 📺 Séries (temporadas, enredos, recomendações)
3. ⛩️ Desenhos e Animes (shonen, seinen, clássicos, novidades, diretores de animação)
4. 🎵 Músicas (faixas, letras, gêneros, épocas)
5. 💿 Álbuns (discografias, história da música, produção)
6. 📚 Livros (literatura clássica e contemporânea, sci-fi, fantasia, ensaios)

📅 [INFORMAÇÃO TEMPORAL ATUAL]
Data e hora atuais: {data_atual}

📚 [BASE DE CONHECIMENTO DO SCENA]
{base_formatada}

🎯 [DIRETRIZES DE ATENDIMENTO E CURADORIA]
1. Responda com entusiasmo, repertório cultural profundo, elegância e tom acolhedor em português do Brasil.
2. Utilize formatação rica em Markdown (tópicos com marcadores, destaques em negrito, notas/avaliações e citações inspiradoras).
3. Se o usuário pedir recomendações, sugira obras interessantes com justificativa, ano de lançamento, gênero e por que vale a pena assistir, ler ou ouvir.
4. Se o usuário tiver dúvidas sobre como usar o SCENA, explique os recursos de listas, notas de 0.5 a 5 estrelas, reviews, diário cultural e feed social.
5. Em saudações, dê as boas-vindas ao universo do SCENA e convide o usuário a explorar alguma categoria cultural.
6. Mantenha respostas organizadas, dinâmicas e visualmente convidativas.
"""
        return prompt.strip()

    def _call_groq_llm(self, user_message, api_key=None):
        """
        Executa a requisição HTTP para a API da Groq utilizando urllib.
        Mantém o histórico de mensagens multi-turn para contexto conversacional.
        """
        key_to_use = (api_key or os.environ.get("GROQ_API_KEY", self.groq_api_key) or "").strip()
        model_to_use = (os.environ.get("GROQ_MODEL", self.groq_model) or "").strip() or "llama-3.3-70b-versatile"

        if not key_to_use:
            return None

        messages = [{"role": "system", "content": self._build_system_prompt()}]
        
        for turn in self.conversation_history[-6:]:
            messages.append(turn)
        
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1024
        }

        try:
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.groq_api_url,
                data=data_bytes,
                headers={
                    "Authorization": f"Bearer {key_to_use}",
                    "Content-Type": "application/json",
                    "User-Agent": "SCENA-CulturalCuratorEngine/1.0"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=20) as response:
                if response.status == 200:
                    resp_body = json.loads(response.read().decode("utf-8"))
                    resposta_texto = resp_body["choices"][0]["message"]["content"]
                    
                    self.conversation_history.append({"role": "user", "content": user_message})
                    self.conversation_history.append({"role": "assistant", "content": resposta_texto})
                    
                    return resposta_texto
                else:
                    print(f"[AVISO] Groq API retornou status {response.status}")
                    return None
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            print(f"[ERRO Groq HTTP {he.code}]: {err_body}")
            return None
        except Exception as e:
            print(f"[AVISO] Erro na chamada da LLM Groq: {e}")
            return None

    def _preprocess_text(self, text):
        """Pré-processa o texto para comparação léxica."""
        if not text:
            return set()

        text = text.lower().strip()
        text = text.translate(str.maketrans("", "", string.punctuation))
        tokens = text.split()
        
        filtered_tokens = {t for t in tokens if t not in self.STOPWORDS_PT and len(t) > 1}
        return filtered_tokens

    def _calculate_similarity(self, query_tokens, target_phrase):
        """Calcula similaridade ponderada entre tokens."""
        if not query_tokens:
            return 0.0
        
        target_tokens = self._preprocess_text(target_phrase)
        if not target_tokens:
            return 0.0

        intersection = query_tokens.intersection(target_tokens)
        if not intersection:
            return 0.0

        overlap_score = len(intersection) / len(query_tokens)
        jaccard_score = len(intersection) / len(query_tokens.union(target_tokens))
        
        return (overlap_score * 0.7) + (jaccard_score * 0.3)

    def _is_greeting(self, message):
        """Verifica se a mensagem do usuário é essencialmente uma saudação."""
        msg_clean = message.lower().strip().translate(str.maketrans("", "", string.punctuation))
        if msg_clean in self.SAUDACOES:
            return True
        for saudacao in self.SAUDACOES:
            if msg_clean.startswith(saudacao) and len(msg_clean.split()) <= 3:
                return True
        return False

    def _get_greeting_response(self):
        """Gera uma saudação acolhedora para o SCENA."""
        app_name = self.kb_data.get("empresa", "SCENA")
        faq_itens = self.kb_data.get("faq_rapido", [])
        faq_sugestoes = "\n".join([f"* 🎭 *\"{item}\"*" for item in faq_itens])

        return (
            f"🎬 **Olá! Seja muito bem-vindo(a) ao {app_name}!**\n\n"
            f"Sou a sua **Curadora Cultural Inteligente**. Aqui você pode descobrir, avaliar e organizar seus filmes, séries, animes, músicas, álbuns e livros favoritos.\n\n"
            f"✨ **O que deseja explorar hoje?** Você pode me pedir indicações ou tirar dúvidas, por exemplo:\n"
            f"{faq_sugestoes}\n\n"
            f"Você também pode usar o botão de microfone para conversar por voz! Em que posso te inspirar?"
        )

    def _find_best_topic_offline(self, user_message, similarity_threshold=0.35):
        """Busca o tópico mais adequado na base de conhecimento local."""
        query_tokens = self._preprocess_text(user_message)
        if not query_tokens:
            return None, 0.0

        best_topic = None
        highest_score = 0.0

        for topico in self.kb_data.get("topicos", []):
            for pergunta in topico.get("perguntas_chave", []):
                score = self._calculate_similarity(query_tokens, pergunta)
                if score > highest_score:
                    highest_score = score
                    best_topic = topico

        if highest_score >= similarity_threshold:
            return best_topic, highest_score
        return None, highest_score

    def _get_fallback_response(self):
        """Mensagem de fallback para o SCENA."""
        faq_itens = self.kb_data.get("faq_rapido", [])
        faq_sugestoes = "\n".join([f"- {item}" for item in faq_itens[:3]])
        
        return (
            "🎨 **Interessante! O universo da cultura é infinito.**\n\n"
            "Posso te ajudar a descobrir obras incríveis ou tirar dúvidas sobre o SCENA:\n"
            f"{faq_sugestoes}\n\n"
            "Você pode me pedir recomendações por gênero, clima, diretor, autor ou época!"
        )

    def process_message(self, user_message):
        """Processamento principal de mensagens."""
        self.metrics["total_mensagens"] += 1
        msg_id = str(uuid.uuid4())
        user_message_clean = user_message.strip() if user_message else ""

        if not user_message_clean:
            return {
                "message_id": msg_id,
                "resposta": "Diga-me qual gênero, filme, livro, anime ou música você gostaria de explorar!",
                "origem": "validacao",
                "score": 0.0
            }

        # 1. Tratamento de Saudações
        if self._is_greeting(user_message_clean):
            self.metrics["saudacoes"] += 1
            resposta = self._get_greeting_response()
            result = {
                "message_id": msg_id,
                "resposta": resposta,
                "origem": "saudacao",
                "score": 1.0
            }
            self.messages_log[msg_id] = result
            return result

        # 2. Obter chave da API dinamicamente
        current_api_key = (os.environ.get("GROQ_API_KEY", self.groq_api_key) or "").strip()
        current_model = (os.environ.get("GROQ_MODEL", self.groq_model) or "").strip() or "llama-3.3-70b-versatile"

        # 3. Tentativa com LLM Generativa (Groq API)
        if current_api_key:
            resposta_llm = self._call_groq_llm(user_message_clean, api_key=current_api_key)
            if resposta_llm:
                self.metrics["resolvidas_llm"] += 1
                result = {
                    "message_id": msg_id,
                    "resposta": resposta_llm,
                    "origem": "llm_groq",
                    "modelo": current_model,
                    "score": 1.0
                }
                self.messages_log[msg_id] = result
                return result

        # 4. Motor Léxico Local / Base de Conhecimento
        topico_encontrado, score = self._find_best_topic_offline(user_message_clean)
        if topico_encontrado:
            self.metrics["resolvidas_base"] += 1
            result = {
                "message_id": msg_id,
                "resposta": topico_encontrado.get("resposta", ""),
                "topico_id": topico_encontrado.get("id"),
                "origem": "base_conhecimento_lexica",
                "score": round(score, 2)
            }
            self.messages_log[msg_id] = result
            return result

        # 5. Se a chave não estiver configurada, orienta o usuário
        if not current_api_key:
            resposta_aviso = (
                "⚠️ **Aviso de Configuração:** A chave de inteligência artificial (`GROQ_API_KEY`) ainda não foi detectada no ambiente da Vercel.\n\n"
                "Para que eu possa gerar recomendações ilimitadas e personalizadas em tempo real com o modelo Llama-3, configure a variável **GROQ_API_KEY** nas configurações do projeto da Vercel (**Settings > Environment Variables**)."
            )
            result = {
                "message_id": msg_id,
                "resposta": resposta_aviso,
                "origem": "sem_chave_ia",
                "score": 0.0
            }
            self.messages_log[msg_id] = result
            return result

        # 6. Fallback Elegante
        self.metrics["fallbacks"] += 1
        resposta_fallback = self._get_fallback_response()
        result = {
            "message_id": msg_id,
            "resposta": resposta_fallback,
            "origem": "fallback_geral",
            "score": round(score, 2)
        }
        self.messages_log[msg_id] = result
        return result

    def register_feedback(self, message_id, is_positive):
        """Registra feedback positivo ou negativo."""
        if is_positive:
            self.metrics["feedbacks_positivos"] += 1
        else:
            self.metrics["feedbacks_negativos"] += 1

        if message_id in self.messages_log:
            self.messages_log[message_id]["feedback"] = "positivo" if is_positive else "negativo"
            return True
        return False

    def get_metrics(self):
        """Retorna uma cópia das métricas atuais."""
        return dict(self.metrics)

    def reset_conversation(self):
        """Limpa o histórico multi-turn da conversa."""
        self.conversation_history.clear()


if __name__ == "__main__":
    engine = ChatbotEngine()
    print("🎬 SCENA - Motor de Curadoria Cultural inicializado!")
    print(f"Plataforma: {engine.kb_data.get('empresa')}")
    print(f"Chave Groq detectada: {'Sim' if engine.groq_api_key else 'Não (Modo Léxico Offline)'}\n")

    test_queries = [
        "Olá, boa tarde!",
        "Quais categorias posso avaliar no SCENA?",
        "Me recomende um livro de ficção científica",
        "Como funciona o sistema de listas?"
    ]

    for q in test_queries:
        print(f"👤 Usuário: {q}")
        res = engine.process_message(q)
        print(f"🤖 SCENA ({res['origem']}):\n{res['resposta']}\n")
        print("-" * 50)
