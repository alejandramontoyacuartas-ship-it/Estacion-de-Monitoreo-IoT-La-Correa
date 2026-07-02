# -*- coding: utf-8 -*-
import json
BASE = r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota"
ver = json.load(open(BASE + r"\data\veredas.geojson", encoding='utf-8'))
pts = json.load(open(BASE + r"\data\pt_inter.geojson", encoding='utf-8'))

def in_ring(x, y, ring):
    inside = False
    n = len(ring); j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def polys(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    if geom['type'] == 'MultiPolygon':
        return geom['coordinates']
    return []

def vereda_en(x, y):
    for f in ver['features']:
        for poly in polys(f['geometry']):
            if not poly: continue
            if in_ring(x, y, poly[0]):                       # anillo exterior
                if any(in_ring(x, y, h) for h in poly[1:]):  # dentro de hueco -> fuera
                    continue
                return f['properties'].get('Vereda')
    return None

cambios = []
for ft in pts['features']:
    p = ft['properties']
    if p['vereda'] == 'Sin dato':
        x, y = ft['geometry']['coordinates']
        v = vereda_en(x, y)
        if v:
            p['vereda'] = v
            cambios.append((p['punto'], v))
        else:
            cambios.append((p['punto'], 'FUERA de toda vereda'))

open(BASE + r"\data\pt_inter.geojson", 'w', encoding='utf-8').write(json.dumps(pts, ensure_ascii=False))
js = "// 18 puntos de inspeccion interinstitucional (KML P1-P18). Embebido para modo offline.\n"
js += "window.GEO=window.GEO||{}; window.GEO.pt_inter=" + json.dumps(pts, ensure_ascii=False) + ";\n"
open(BASE + r"\js\pt_inter.js", 'w', encoding='utf-8').write(js)

print("cambios:")
for pu, v in cambios:
    print(" ", pu, "->", v)
import collections
print("por vereda:", dict(collections.Counter(f['properties']['vereda'] for f in pts['features'])))
