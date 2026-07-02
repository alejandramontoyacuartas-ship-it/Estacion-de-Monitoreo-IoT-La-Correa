# -*- coding: utf-8 -*-
"""
Genera la SECCIÓN TRANSVERSAL del cauce en el punto de la estación (P1)
a partir del MDT 2 m de ArcGIS (EPSG:9377).

Salida:
  - data/corte_p1.json   (perfil distancia/cota para el geoportal)
Luego, embeber ese JSON en js/corte_p1.js  ->  window.CORTE_P1 = {...}

Cómo se ejecuta:
  Desde ArcGIS Pro (ventana de Python) con N_CORREA.aprx abierto, o vía MCP
  arcgis-pro. Requiere el MDT (MDT_2m.tif) y el cauce (Sistema_Hidrico_LaCorrea).

Método:
  1. P1 (4326) -> se proyecta al CRS del MDT (9377).
  2. Se busca el segmento de cauce más cercano a P1 y su rumbo.
  3. Se traza una línea PERPENDICULAR al cauce (±HALF m, paso STEP m).
  4. Se muestrea la cota del MDT en cada punto (vecino más cercano).
"""
import arcpy, os, json, math
import numpy as np

DEM   = r"C:\Users\malej\OneDrive\Escritorio\IOT\N_CORREA\N_CORREA\proc_muni\MDT_2m.tif"
CAUCE = "Sistema_Hidrico_LaCorrea"          # capa del mapa activo
P1_LON, P1_LAT = -75.446880, 6.407003       # estación (WGS84)
HALF, STEP = 25.0, 0.5                       # medio ancho (m) y paso (m)
OUT = r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota\data\corte_p1.json"

sr = arcpy.Describe(DEM).spatialReference
p1 = arcpy.PointGeometry(arcpy.Point(P1_LON, P1_LAT), arcpy.SpatialReference(4326)).projectAs(sr)
px, py = p1.centroid.X, p1.centroid.Y

# --- rumbo del cauce en P1 (segmento más cercano) ---
csr = arcpy.Describe(CAUCE).spatialReference
best = None
with arcpy.da.SearchCursor(CAUCE, ["SHAPE@"]) as cur:
    for (shp,) in cur:
        shp = shp.projectAs(sr) if csr.factoryCode != sr.factoryCode else shp
        for part in shp:
            pts = [pt for pt in part if pt]
            for i in range(len(pts) - 1):
                ax, ay, bx, by = pts[i].X, pts[i].Y, pts[i+1].X, pts[i+1].Y
                dx, dy = bx-ax, by-ay; L2 = dx*dx + dy*dy
                t = 0 if L2 == 0 else max(0, min(1, ((px-ax)*dx + (py-ay)*dy)/L2))
                cx, cy = ax + t*dx, ay + t*dy
                d = math.hypot(px-cx, py-cy)
                if best is None or d < best[0]:
                    best = (d, math.atan2(by-ay, bx-ax))
ang = best[1]; perp = ang + math.pi/2
ux, uy = math.cos(perp), math.sin(perp)

# --- muestreo del MDT a lo largo de la perpendicular ---
S = np.arange(-HALF, HALF + 1e-6, STEP)
xs, ys = px + S*ux, py + S*uy
cell = arcpy.Raster(DEM).meanCellWidth
x0, y0 = xs.min() - 4*cell, ys.min() - 4*cell
ncols = int(math.ceil((xs.max() + 4*cell - x0)/cell))
nrows = int(math.ceil((ys.max() + 4*cell - y0)/cell))
arr = arcpy.RasterToNumPyArray(DEM, arcpy.Point(x0, y0), ncols, nrows, nodata_to_value=np.nan)
ymax = y0 + nrows*cell

def sample(x, y):
    ci, ri = int(round((x-x0)/cell)), int(round((ymax-y)/cell))
    if 0 <= ri < arr.shape[0] and 0 <= ci < arr.shape[1]:
        v = arr[ri, ci]
        return None if (v is None or np.isnan(v)) else round(float(v), 2)
    return None

perf = [{"d": round(float(s+HALF), 2), "z": sample(x, y)} for s, x, y in zip(S, xs, ys)]
zz = [(p["z"], p["d"]) for p in perf if p["z"] is not None]
res = {"perfil": perf, "z_min": min(zz)[0], "d_thalweg": min(zz)[1],
       "z_p1": sample(px, py), "ancho_total": 2*HALF, "paso": STEP,
       "ang_cauce": round(math.degrees(ang), 2), "P1_9377": [px, py],
       "P1_4326": [P1_LON, P1_LAT], "n_puntos": len(perf)}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(res, f, ensure_ascii=False)
print("OK ->", OUT, "| thalweg", res["z_min"], "m | n", res["n_puntos"])
