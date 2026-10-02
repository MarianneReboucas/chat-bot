"""
Vercel Serverless Function - FastAPI SCENA API
"""

import os
import sys
import time
import random
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Garantir imports relativos na Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from chatbot_engine import ChatbotEngine

# Instanciação da aplicação FastAPI
app = FastAPI(
    title="SCENA API",
    description="API REST para curadoria cultural e rede social SCENA com IA e RAG.",
    version="1.0.0"
)

# 1. Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialização do ChatbotEngine
kb_file = os.path.join(current_dir, "01_base_conhecimento.json")
engine = ChatbotEngine(kb_path=kb_file)


# 2. Modelos Pydantic
class MessageRequest(BaseModel):
    message: str = Field(..., description="Mensagem ou pergunta cultural enviada pelo usuário")
    session_id: Optional[str] = Field(None, description="Identificador da sessão conversacional")


class FeedbackRequest(BaseModel):
    message_id: str = Field(..., description="ID da mensagem avaliada")
    is_positive: bool = Field(..., description="True para like (positivo), False para dislike (negativo)")


class ChatResponse(BaseModel):
    message_id: str = Field(..., description="ID único da resposta gerada")
    reply: str = Field(..., description="Texto da resposta/curadoria do assistente")
    source: str = Field(..., description="Origem da resposta (llm_groq, base_conhecimento_lexica, saudacao, fallback_geral)")
    confidence: float = Field(..., description="Nível de confiança / similaridade (0.0 a 1.0)")
    timestamp: float = Field(..., description="Timestamp da resposta")
    suggested_actions: List[str] = Field(default_factory=list, description="Sugestões de explorações culturais ou ações rápidas")


# 3. Endpoints da API

@app.get("/")
@app.get("/api")
def get_root():
    """Retorna o status da API e lista de endpoints disponíveis."""
    return {
        "status": "online",
        "service": "SCENA Cultural API (Vercel Serverless)",
        "version": "1.0.0",
        "endpoints": {
            "GET /api": "Status da API",
            "POST /api/chat": "Envio de mensagem/pergunta cultural para a IA",
            "GET /api/knowledge-base": "Base de conhecimento cultural do SCENA",
            "GET /api/metrics": "Métricas de uso e taxa de satisfação",
            "POST /api/feedback": "Registro de avaliação Like/Dislike"
        }
    }


@app.post("/api/chat", response_model=ChatResponse)
def post_chat(request: MessageRequest):
    """Processa a mensagem do usuário via ChatbotEngine."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="O campo 'message' não pode estar vazio.")

    result = engine.process_message(request.message)

    faq_rapido = engine.kb_data.get("faq_rapido", [])
    sugestoes = random.sample(faq_rapido, min(len(faq_rapido), 3)) if faq_rapido else []

    return ChatResponse(
        message_id=result.get("message_id", ""),
        reply=result.get("resposta", ""),
        source=result.get("origem", "desconhecido"),
        confidence=float(result.get("score", 1.0)),
        timestamp=time.time(),
        suggested_actions=sugestoes
    )


@app.get("/api/knowledge-base")
def get_knowledge_base():
    """Retorna o conteúdo da base de conhecimento cultural institucional."""
    return engine.kb_data


@app.get("/api/metrics")
def get_metrics():
    """Retorna as métricas e taxa de satisfação."""
    metrics = engine.get_metrics()
    total_feedbacks = metrics.get("feedbacks_positivos", 0) + metrics.get("feedbacks_negativos", 0)
    
    if total_feedbacks > 0:
        satisfaction_rate = round((metrics.get("feedbacks_positivos", 0) / total_feedbacks) * 100, 2)
    else:
        satisfaction_rate = 100.0

    return {
        "metrics": metrics,
        "satisfaction_rate_percent": satisfaction_rate,
        "total_feedbacks": total_feedbacks,
        "status": "operational"
    }


@app.post("/api/feedback")
def post_feedback(feedback: FeedbackRequest):
    """Registra uma avaliação positiva ou negativa de uma mensagem."""
    engine.register_feedback(feedback.message_id, feedback.is_positive)
    return {
        "status": "success",
        "message_id": feedback.message_id,
        "is_positive": feedback.is_positive,
        "registered": True
    }
