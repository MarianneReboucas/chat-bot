from http.server import BaseHTTPRequestHandler
import json
import os
import sys

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

    def do_GET(self):
        metrics = engine.get_metrics()
        total_feedbacks = metrics.get("feedbacks_positivos", 0) + metrics.get("feedbacks_negativos", 0)
        if total_feedbacks > 0:
            satisfaction_rate = round((metrics.get("feedbacks_positivos", 0) / total_feedbacks) * 100, 2)
        else:
            satisfaction_rate = 100.0

        response_data = {
            "metrics": metrics,
            "satisfaction_rate_percent": satisfaction_rate,
            "total_feedbacks": total_feedbacks,
            "status": "operational"
        }

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
