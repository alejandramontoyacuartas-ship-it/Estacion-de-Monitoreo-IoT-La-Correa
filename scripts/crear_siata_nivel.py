# -*- coding: utf-8 -*-
import json, os, zipfile
BASE = r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota"
URL = "https://geoportal.siata.gov.co/"

# Estaciones de NIVEL de SIATA en/cerca de Girardota (fichas del geoportal SIATA)
EST = [
    {"codigo":"671","nombre":"Q. Telesfora - Vereda La Holanda","subcuenca":"Q. Telesfora",
     "vereda":"La Holanda","municipio":"Girardota","lat":6.3984,"lon":-75.4818},
    {"codigo":"821","nombre":"Q. El Limonar - El Zarzal","subcuenca":"Q. La Molinal",
     "vereda":"Zarzal Curazao","municipio":"Girardota","lat":6.3933,"lon":-75.4882},
    {"codigo":"472","nombre":"R. Medellin - Puente Girardota","subcuenca":"R. Aburra-Medellin",
     "vereda":"Loma de los Ochoa","municipio":"Girardota","lat":6.3802,"lon":-75.4521},
    {"codigo":"272","nombre":"Q. El Salado - Jamundi","subcuenca":"Q. El Salado",
     "vereda":"Jamundi","municipio":"Girardota","lat":6.3579,"lon":-75.434},
]

feats = []
for e in EST:
    p = dict(e); p["url"] = URL; p["red"] = "SIATA - Sensores de nivel"
    feats.append({"type":"Feature","geometry":{"type":"Point","coordinates":[e["lon"],e["lat"]]},"properties":p})
gj = {"type":"FeatureCollection","name":"siata_nivel",
      "descripcion":"Estaciones de nivel SIATA en Girardota (enlazan al geoportal SIATA)","features":feats}

open(os.path.join(BASE,r"data\siata_nivel.geojson"),"w",encoding="utf-8").write(json.dumps(gj,ensure_ascii=False))
js = "// Estaciones de nivel SIATA (Girardota). Embebido para modo offline. Clic -> geoportal SIATA.\n"
js += "window.GEO=window.GEO||{}; window.GEO.siata_nivel="+json.dumps(gj,ensure_ascii=False)+";\n"
open(os.path.join(BASE,r"js\siata_nivel.js"),"w",encoding="utf-8").write(js)

# KMZ (doc.kml comprimido) con icono de nivel (paddle azul de Google)
def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
pk = "".join(
    f"""
  <Placemark>
    <name>{esc(e['codigo']+' - '+e['nombre'])}</name>
    <styleUrl>#nivel</styleUrl>
    <description><![CDATA[
      <b>Estacion SIATA:</b> {esc(e['codigo'])}<br/>
      <b>Nombre:</b> {esc(e['nombre'])}<br/>
      <b>Subcuenca:</b> {esc(e['subcuenca'])}<br/>
      <b>Vereda:</b> {esc(e['vereda'])} - {esc(e['municipio'])}<br/>
      <b>Coordenadas:</b> {e['lat']}, {e['lon']}<br/>
      <a href="{URL}">Ver en el geoportal SIATA</a>
    ]]></description>
    <Point><coordinates>{e['lon']},{e['lat']},0</coordinates></Point>
  </Placemark>""" for e in EST)
kml = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
  <name>Sensores de nivel SIATA - Girardota</name>
  <Style id="nivel"><IconStyle><scale>1.2</scale>
    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href></Icon></IconStyle></Style>{pk}
</Document></kml>"""
kmz_path = os.path.join(BASE,r"data\siata_nivel.kmz")
with zipfile.ZipFile(kmz_path,"w",zipfile.ZIP_DEFLATED) as z:
    z.writestr("doc.kml", kml)

print("estaciones:", len(feats))
print("geojson + js + kmz OK ->", kmz_path)
