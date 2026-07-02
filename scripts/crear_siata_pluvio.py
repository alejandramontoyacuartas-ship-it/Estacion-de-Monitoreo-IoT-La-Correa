# -*- coding: utf-8 -*-
import json, os, zipfile
BASE = r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota"
URL = "https://geoportal.siata.gov.co/"

# Estaciones PLUVIOMÉTRICAS de SIATA en Girardota (fichas del geoportal SIATA)
EST = [
    {"codigo":"127","nombre":"I.E. Manuel Jose Sierra - Sede La Holanda","subcuenca":"Q. La Molinal",
     "vereda":"La Holanda - Parte Alta","municipio":"Girardota","lat":6.419199,"lon":-75.483316},
    {"codigo":"66","nombre":"I.E San Andres (Sede El Socorro)","subcuenca":"Q. La Correa",
     "vereda":"El Socorro","municipio":"Girardota","lat":6.410358,"lon":-75.452086},
    {"codigo":"31","nombre":"Colegio Jose Manuel Sierra","subcuenca":"Q. El Tabano",
     "vereda":"","municipio":"Girardota","lat":6.375833,"lon":-75.445833},
    {"codigo":"324","nombre":"E.R Jamundi - Pluviometro","subcuenca":"Q. El Salado",
     "vereda":"Jamundi","municipio":"Girardota","lat":6.364524,"lon":-75.436203},
    {"codigo":"88","nombre":"CUIDA Juan Cojo","subcuenca":"Q. La Ferreria",
     "vereda":"Juan Cojo","municipio":"Girardota","lat":6.356780,"lon":-75.450971},
    {"codigo":"389","nombre":"Manga Arriba - Pluviometro","subcuenca":"Q. Juan Cojo",
     "vereda":"Manga Arriba","municipio":"Girardota","lat":6.351598,"lon":-75.458963},
]

feats = []
for e in EST:
    p = dict(e); p["url"] = URL; p["red"] = "SIATA - Red pluviometrica"
    feats.append({"type":"Feature","geometry":{"type":"Point","coordinates":[e["lon"],e["lat"]]},"properties":p})
gj = {"type":"FeatureCollection","name":"siata_pluvio",
      "descripcion":"Estaciones pluviometricas SIATA en Girardota (enlazan al geoportal SIATA)","features":feats}

open(os.path.join(BASE,r"data\siata_pluvio.geojson"),"w",encoding="utf-8").write(json.dumps(gj,ensure_ascii=False))
js = "// Estaciones pluviometricas SIATA (Girardota). Embebido para modo offline. Clic -> geoportal SIATA.\n"
js += "window.GEO=window.GEO||{}; window.GEO.siata_pluvio="+json.dumps(gj,ensure_ascii=False)+";\n"
open(os.path.join(BASE,r"js\siata_pluvio.js"),"w",encoding="utf-8").write(js)

def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
pk = "".join(
    f"""
  <Placemark>
    <name>{esc(e['codigo']+' - '+e['nombre'])}</name>
    <styleUrl>#pluvio</styleUrl>
    <description><![CDATA[
      <b>Estacion SIATA:</b> {esc(e['codigo'])}<br/>
      <b>Nombre:</b> {esc(e['nombre'])}<br/>
      <b>Subcuenca:</b> {esc(e['subcuenca'])}<br/>
      <b>Vereda:</b> {esc(e['vereda']) or '-'} - {esc(e['municipio'])}<br/>
      <b>Coordenadas:</b> {e['lat']}, {e['lon']}<br/>
      <a href="{URL}">Ver en el geoportal SIATA</a>
    ]]></description>
    <Point><coordinates>{e['lon']},{e['lat']},0</coordinates></Point>
  </Placemark>""" for e in EST)
kml = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
  <name>Red pluviometrica SIATA - Girardota</name>
  <Style id="pluvio"><IconStyle><scale>1.2</scale>
    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/purple-circle.png</href></Icon></IconStyle></Style>{pk}
</Document></kml>"""
with zipfile.ZipFile(os.path.join(BASE,r"data\siata_pluvio.kmz"),"w",zipfile.ZIP_DEFLATED) as z:
    z.writestr("doc.kml", kml)

print("estaciones pluvio:", len(feats))
for e in EST: print(" ", e["codigo"], e["nombre"], "|", e["subcuenca"])
