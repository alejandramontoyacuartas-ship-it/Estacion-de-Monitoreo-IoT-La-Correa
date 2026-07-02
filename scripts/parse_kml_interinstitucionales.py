# -*- coding: utf-8 -*-
import re, json, os, shutil
BASE = r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota"
SRC_KML = os.path.join(BASE, r"Inspecciones tecnicas inter\puntos_grd_girardota_P1_P18_actualizado.kml")
SRC_INF = os.path.join(BASE, r"Inspecciones tecnicas inter\INFORMES DE VISITAS INTERINSTITUCIONALES")
DST_INF = os.path.join(BASE, "informes")
os.makedirs(DST_INF, exist_ok=True)

# Mapeo: rango de puntos -> (archivo fuente, nombre limpio, nombre a mostrar)
REPORTES = [
    (1, 10, "1-10. informe_120-IT2307-8323_Informe Tecnico Girardota (1) evento mayo 27 (2).pdf",
            "IT2307-8323_Girardota_p1-10_mayo2023.pdf",
            "Informe Tecnico 120-IT2307-8323 - Girardota - evento 27 may 2023 (puntos 1-10)"),
    (11, 11, "11. DAGRAN2025030551343_SOCORRO RANCHO ALEGRE.pdf",
             "DAGRAN2025030551343_Socorro_Rancho_Alegre_p11.pdf",
             "DAGRAN 2025030551343 - Socorro Rancho Alegre (punto 11)"),
    (12, 12, "12. 160AN-IT2602-1057. TOTUMO_ASERRIO.pdf",
             "160AN-IT2602-1057_Totumo_Aserrio_p12.pdf",
             "160AN-IT2602-1057 - El Totumo / Aserrio (punto 12)"),
    (13, 13, "13. 160AN-COI2410-24668_VSOCORRO.pdf",
             "160AN-COI2410-24668_VSocorro_p13.pdf",
             "160AN-COI2410-24668 - Vereda El Socorro (punto 13)"),
    (14, 15, "14 -15 160AN-COI2610-28891.pdf",
             "160AN-COI2610-28891_p14-15.pdf",
             "160AN-COI2610-28891 (puntos 14-15)"),
    (16, 16, "16. AMVA COLCERÁMICAS.pdf",
             "AMVA_Colceramicas_p16.pdf",
             "AMVA - Colceramica S.A. (punto 16)"),
    (17, 17, "17. AMVA SAN ESTEBAN_.pdf",
             "AMVA_San_Esteban_p17.pdf",
             "AMVA - San Esteban (punto 17)"),
    (18, 18, "18. AMVA MANGARRIBA.pdf",
             "AMVA_Manga_Arriba_p18.pdf",
             "AMVA - Manga Arriba (punto 18)"),
]

# Copiar PDFs a informes/
for lo, hi, src, clean, nombre in REPORTES:
    s = os.path.join(SRC_INF, src)
    if os.path.exists(s):
        shutil.copy2(s, os.path.join(DST_INF, clean))
        print("copiado:", clean)
    else:
        print("!! NO existe:", src)

def informe_de(num):
    for lo, hi, src, clean, nombre in REPORTES:
        if lo <= num <= hi:
            return "informes/" + clean, nombre
    return "", ""

def limpiar_vereda(u):
    m = re.search(r'(?:veredas?|vda\.?)\s+([^,\-]+)', u, flags=re.I)
    if m:
        v = re.sub(r'\s+parte\s+(baja|alta).*$', '', m.group(1), flags=re.I)
        v = re.sub(r'\s+municipio.*$', '', v, flags=re.I)
        return v.strip()
    return 'Sin dato'

kml = open(SRC_KML, encoding='utf-8').read()
feats = []
for pm in re.findall(r'<Placemark>(.*?)</Placemark>', kml, re.S):
    if '<Point>' not in pm:      # ignorar la Ruta (LineString)
        continue
    d = re.search(r'<description><!\[CDATA\[(.*?)\]\]>', pm, re.S)
    d = d.group(1) if d else ''
    pnum = re.search(r'Punto:</b>\s*P?(\d+)', d, re.I)
    num = int(pnum.group(1)) if pnum else None
    m_ub = re.search(r'Ubicaci.{1,2}n:</b>\s*(.*?)<br', d, re.S | re.I)
    ubic = m_ub.group(1).strip() if m_ub else ''
    m_al = re.search(r'Altitud:</b>\s*([^<\n\]]+)', d, re.I)
    alt  = m_al.group(1).strip() if m_al else ''
    c = re.search(r'<coordinates>\s*([-\d.]+),([-\d.]+)', pm)
    lon, lat = float(c.group(1)), float(c.group(2))
    inf_a, inf_n = informe_de(num)
    feats.append({"type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": {"punto": "P%d" % num, "num": num, "ubicacion": ubic,
            "vereda": limpiar_vereda(ubic), "altitud": alt,
            "informe": inf_a, "informe_nombre": inf_n}})

feats.sort(key=lambda f: f["properties"]["num"])
gj = {"type": "FeatureCollection", "name": "pt_inter",
      "descripcion": "Puntos de inspeccion GRD Girardota - visitas interinstitucionales (P1-P18)",
      "features": feats}
open(os.path.join(BASE, r"data\pt_inter.geojson"), 'w', encoding='utf-8').write(json.dumps(gj, ensure_ascii=False))
js = "// 18 puntos de inspeccion interinstitucional (KML actualizado P1-P18). Embebido para modo offline.\n"
js += "window.GEO=window.GEO||{}; window.GEO.pt_inter=" + json.dumps(gj, ensure_ascii=False) + ";\n"
open(os.path.join(BASE, r"js\pt_inter.js"), 'w', encoding='utf-8').write(js)

print("\npuntos:", len(feats))
import collections
print("por vereda:", dict(collections.Counter(f['properties']['vereda'] for f in feats)))
for f in feats:
    p = f['properties']
    print(" ", p['punto'], "|", p['vereda'], "| alt:", p['altitud'], "| informe:", p['informe'].split('/')[-1])
