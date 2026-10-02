"""
Script de Testes Automatizados no Terminal
Projeto: SCENA - Rede Social Cultural & Curadoria Inteligente
Camada: Validação & Qualidade de Software
Arquivo: test_backend.py
"""

import os
import sys
import time

# Configuração de encoding seguro para saída no terminal Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Garantir importação do ChatbotEngine
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from chatbot_engine import ChatbotEngine
except ImportError:
    import importlib.util
    engine_path = os.path.join(current_dir, "02_chatbot_engine.py")
    spec = importlib.util.spec_from_file_location("chatbot_engine", engine_path)
    chatbot_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(chatbot_module)
    ChatbotEngine = chatbot_module.ChatbotEngine


def run_tests():
    print("=" * 70)
    print("🎬 INICIANDO BATERIA DE TESTES AUTOMATIZADOS - SCENA CULTURAL")
    print("=" * 70)

    # 1. Inicialização do motor
    kb_path = os.path.join(current_dir, "01_base_conhecimento.json")
    if not os.path.exists(kb_path):
        kb_path = os.path.join(current_dir, "base_conhecimento.json")

    env_path = os.path.join(current_dir, ".env")
    engine = ChatbotEngine(kb_path=kb_path, env_path=env_path)

    llm_status = "Online (Groq API conectada)" if engine.groq_api_key else "Offline / Não configurada (Modo Léxico Local)"
    print(f"📊 Status da LLM: {llm_status}")
    print(f"🤖 Modelo configurado: {engine.groq_model}")
    print(f"📚 Base Cultural: {engine.kb_data.get('empresa', 'N/A')} ({len(engine.kb_data.get('topicos', []))} categorias/tópicos)")
    print("-" * 70)

    # Cenários de teste para o SCENA
    test_cases = [
        {
            "id": 1,
            "cenario": "Saudação do usuário",
            "pergunta": "Olá, tudo bem?",
            "validador": lambda r: r["origem"] == "saudacao" and "SCENA" in r["resposta"]
        },
        {
            "id": 2,
            "cenario": "Categorias de avaliação suportadas",
            "pergunta": "Quais categorias posso avaliar no SCENA?",
            "validador": lambda r: "Filmes" in r["resposta"] or "animes" in r["resposta"].lower() or r["origem"] == "llm_groq"
        },
        {
            "id": 3,
            "cenario": "Sistema de notas e listas",
            "pergunta": "Como funciona o sistema de notas e listas personalizadas?",
            "validador": lambda r: "estrelas" in r["resposta"].lower() or "listas" in r["resposta"].lower() or r["origem"] == "llm_groq"
        },
        {
            "id": 4,
            "cenario": "Pergunta genérica / recomendação cultural",
            "pergunta": "Me indique um filme clássico cult",
            "validador": lambda r: len(r["resposta"]) > 20
        }
    ]

    total_pass = 0

    for tc in test_cases:
        print(f"\n[TESTE {tc['id']}] {tc['cenario']}")
        print(f"👤 Pergunta: \"{tc['pergunta']}\"")
        
        start_t = time.time()
        result = engine.process_message(tc["pergunta"])
        duracao = time.time() - start_t

        print(f"🤖 Origem da Resposta: [{result.get('origem')}] (Score: {result.get('score', 'N/A')}) em {duracao:.2f}s")
        print(f"💬 Resposta:\n{result.get('resposta')[:200]}...")

        # Validação
        if tc["validador"](result):
            print("✅ Status: APROVADO")
            total_pass += 1
        else:
            print("⚠️ Status: ATENÇÃO / RESULTADO INESPERADO")

    # 2. Teste de Métricas e Feedback
    print("\n" + "-" * 70)
    print("📈 TESTE DE REGISTRO DE FEEDBACK E MÉTRICAS")
    last_msg_id = list(engine.messages_log.keys())[-1] if engine.messages_log else "test-id"
    engine.register_feedback(last_msg_id, is_positive=True)
    
    metrics = engine.get_metrics()
    print(f"📊 Métricas Finais: {metrics}")
    
    print("=" * 70)
    print(f"🎯 RESULTADO FINAL: {total_pass}/{len(test_cases)} testes aprovados com sucesso!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
