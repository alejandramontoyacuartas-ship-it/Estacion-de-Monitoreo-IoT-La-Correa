# -*- coding: utf-8 -*-
"""
Vuelca la plantilla 'plantilla_puntos_riesgo.csv' a data/puntos_riesgo.geojson
(campos Evento, Vereda, Sector, Descripcion, foto) y regenera js/data.js.

Uso:  python scripts/aplicar_puntos.py
(ejecutar desde la carpeta GeoportalGRDGirardota)
"""
import json, csv, glob, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV  = os.path.join(BASE, "plantilla_puntos_riesgo.csv")
GJ   = os.path.join(BASE, "data", "puntos_riesgo.geojson")

gj = json.load(open(GJ, encoding="utf-8"))
feats = gj["features"]

# Leer la plantilla (indexada por la columna '#', 1-based)
filas = {}
with open(CSV, encoding="utf-8-sig", newline="") as f:
    for row in csv.DictReader(f):
        try: i = int(row["#"])
        except: continue
        filas[i] = row

aplicados = 0
for idx, feat in enumerate(feats, 1):
    r = filas.get(idx)
    if not r: continue
    p = feat["properties"]
    for campo in ["Evento", "Vereda", "Sector", "Descripcion", "foto"]:
        val = (r.get(campo) or "").strip()
        if val: p[campo] = val
    aplicados += 1

json.dump(gj, open(GJ, "w", encoding="utf-8"), ensure_ascii=False)
print(f"Actualizados {aplicados} puntos en {os.path.basename(GJ)}")

# Regenerar data.js (datos embebidos para abrir por doble clic)
GEO = {}
for fp in glob.glob(os.path.join(BASE, "data", "*.geojson")):
    k = os.path.splitext(os.path.basename(fp))[0]
    try: GEO[k] = json.load(open(fp, encoding="utf-8"))
    except: GEO[k] = json.load(open(fp, encoding="latin-1"))
with open(os.path.join(BASE, "js", "data.js"), "w", encoding="utf-8") as f:
    f.write("window.GEO=" + json.dumps(GEO, ensure_ascii=False, separators=(",", ":")) + ";")
print("data.js regenerado. Recuerda subir la versión ?v= en index.html.")
