# -*- coding: utf-8 -*-
"""
Servidor local del geoportal CON PROXY a la API (evita el problema de CORS).

- Sirve el geoportal en  http://localhost:8080
- Cualquier peticion a  /api/...  la reenvia a  https://iot-trabajo.onrender.com/...
  (igual que el proxy.conf de la app de Angular), por lo que el navegador NO hace
  peticion "cross-origin" y no aparece el error de CORS.

USO (terminal de VS Code, desde la carpeta GeoportalGRDGirardota):
    python scripts/servidor_proxy.py
Luego abre en el navegador:  http://localhost:8080/index.html
Para detenerlo: Ctrl + C
"""
import http.server, socketserver, urllib.request, os

PORT = 8080
API  = "https://iot-trabajo.onrender.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # carpeta del geoportal

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def do_GET(self):
        # Reenvia /api/... a la API en Render
        if self.path.startswith("/api/"):
            url = API + self.path[4:]            # quita el prefijo "/api"
            try:
                req = urllib.request.Request(url, headers={"Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=70) as r:
                    data = r.read()
                    self.send_response(r.status)
                    self.send_header("Content-Type", r.headers.get("Content-Type", "application/json"))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(('{"error":"proxy","detalle":"%s"}' % str(e).replace('"', "'")).encode("utf-8"))
            return
        # Cualquier otra ruta: sirve los archivos del geoportal
        return super().do_GET()

    def log_message(self, *a):
        pass  # silencioso

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("=" * 60)
    print("  Geoportal + proxy API en marcha")
    print("  Abre:  http://localhost:%d/index.html" % PORT)
    print("  (Ctrl + C para detener)")
    print("=" * 60)
    httpd.serve_forever()
