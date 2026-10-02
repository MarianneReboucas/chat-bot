from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import time
import random

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from chatbot_engine import ChatbotEngine

kb_file = os.path.join(current_dir, "01_base_conhecimento.json")
engine = ChatbotEngine(kb_path=kb_file)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            message = body.get('message', '').strip()
            if not message:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Campo message vazio'}).encode('utf-8'))
                return

            result = engine.process_message(message)
            faq_rapido = engine.kb_data.get("faq_rapido", [])
            sugestoes = random.sample(faq_rapido, min(len(faq_rapido), 3)) if faq_rapido else []

            response_data = {
                "message_id": result.get("message_id", f"bot-{int(time.time()*1000)}"),
                "reply": result.get("resposta", ""),
                "source": result.get("origem", "desconhecido"),
                "confidence": float(result.get("score", 1.0)),
                "timestamp": time.time(),
                "suggested_actions": sugestoes
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
