# -*- coding: utf-8 -*-
from fpdf import FPDF

VERDE=(31,90,67); VERDE2=(47,122,87); GRIS=(90,90,90); TEXTO=(34,34,34)

def s(t):
    r={'→':'->','≥':'>=','≤':'<=','≈':'~','—':'-','–':'-','…':'...','•':'-','“':'"','”':'"','’':"'","´":"'"}
    for k,v in r.items(): t=t.replace(k,v)
    return t.encode('latin-1','replace').decode('latin-1')

class PDF(FPDF):
    def header(self):
        if self.page_no()==1: return
        self.set_y(8); self.set_font('Helvetica','',8); self.set_text_color(*GRIS)
        self.cell(0,5,s('Actualización del análisis SIG · SAT Quebrada La Correa - Girardota'),0,1,'R')
        self.set_draw_color(*VERDE2); self.set_line_width(0.3); self.line(15,15,195,15)
    def footer(self):
        self.set_y(-13); self.set_font('Helvetica','',7.5); self.set_text_color(*GRIS)
        self.cell(0,5,s('Grupo 3 · Universidad de San Buenaventura - Medellín · Ruta de Innovación y Desarrollo IoT'),0,0,'L')
        self.cell(0,5,s('%d'%self.page_no()),0,0,'R')

pdf=PDF(format='A4'); pdf.set_auto_page_break(True,margin=16); pdf.add_page()

# --- Portada / encabezado ---
pdf.set_fill_color(*VERDE); pdf.rect(0,0,210,34,'F')
pdf.set_xy(15,8); pdf.set_text_color(255,255,255); pdf.set_font('Helvetica','B',16)
pdf.cell(0,8,s('Actualización del análisis SIG'),0,1)
pdf.set_x(15); pdf.set_font('Helvetica','',11)
pdf.cell(0,6,s('Sistema de Alerta Temprana - Quebrada La Correa · Girardota (Antioquia)'),0,1)
pdf.set_x(15); pdf.set_font('Helvetica','',9)
pdf.cell(0,5,s('Nuevo modelo de elevación DTM12 (ALOS PALSAR 12,5 m corregido con stream burning) · Proyecto N_CORREA'),0,1)
pdf.ln(6); pdf.set_text_color(*TEXTO)

def titulo(t):
    pdf.ln(2); pdf.set_font('Helvetica','B',11.5); pdf.set_text_color(*VERDE)
    pdf.cell(0,7,s(t),0,1); pdf.set_draw_color(*VERDE2); pdf.set_line_width(0.3)
    pdf.line(15,pdf.get_y(),195,pdf.get_y()); pdf.ln(1.5); pdf.set_text_color(*TEXTO)

def bullet(t):
    pdf.set_font('Helvetica','',9.5); pdf.set_x(17)
    pdf.set_text_color(*VERDE2); pdf.cell(4,5,s('-'),0,0)
    pdf.set_text_color(*TEXTO); pdf.multi_cell(174,5,s(t));

def parra(t):
    pdf.set_font('Helvetica','',9.5); pdf.set_text_color(*TEXTO); pdf.multi_cell(180,5,s(t)); pdf.ln(1)

import os
def figura(path, cap, w=105):
    if not os.path.exists(path): return
    if pdf.get_y()>210: pdf.add_page()
    pdf.image(path, x=(210-w)/2, w=w)
    pdf.set_font('Helvetica','I',8); pdf.set_text_color(*GRIS)
    pdf.cell(0,5,s(cap),0,1,'C'); pdf.set_text_color(*TEXTO); pdf.ln(2)

parra('Este documento actualiza los resultados del componente geoespacial (SIG) del informe del SAT de la '
      'Quebrada La Correa, con base en el análisis final del proyecto N_CORREA sobre el modelo digital de '
      'elevación DTM12 (ALOS PALSAR de 12,5 m corregido con stream burning del cauce real). Se listan solo los '
      'valores del análisis SIG; el componente electrónico/IoT no varía.')

titulo('1. Modelación hidrológica y morfometría')
bullet('Cuenca La Correa: 856,4 ha, delimitada con stream burning del cauce real (98,4 % del cauce oficial CORANTIOQUIA contenido).')
bullet('Forma alargada: coef. de compacidad Kc 2,27 · relieve 1.378 m · pendiente media de la cuenca 38,4 %.')
bullet('Red de drenaje: orden de Strahler 5 · densidad de drenaje 7,12 km/km² · longitud del cauce 8,32 km · sinuosidad 1,36.')
bullet('Torrencialidad: índice de Melton 0,472 (debris flood) · pendiente del cauce 14,6 % · Tc (Kirpich) ~43 min.')

titulo('2. Lluvia y caudal de diseño')
bullet('Lluvia de diseño Tr100: 98,4 mm en 24 h (CHIRPS calibrado ×1,39, anclado a la curva IDF del río Medellín).')
bullet('Caudal de diseño: SCS-CN (CN III = 77,5) + abultamiento por sedimentos ×1,5 -> Qp(Tr100) ~ 249 m³/s (rango 216-332). Valor provisional.')

titulo('3. Amenaza, exposición y riesgo')
bullet('Amenaza por avenida torrencial (stream power = área acumulada × pendiente longitudinal del cauce): ALTA 86,8 ha · MEDIA 114,9 ha · BAJA 94,5 ha (corredor).')
bullet('Exposición: 1.056 construcciones y ~1.701 habitantes en la cuenca; corredor de exposición de 30/60/100 m sobre el cauce.')
bullet('Riesgo (zonificación amenaza × exposición): ALTO 39,7 ha · MEDIO 61,3 ha · BAJO 97,5 ha.')
bullet('Elementos expuestos: 61 puntos validados en campo (13 crítico · 4 alto · 17 medio-alto · 24 medio · 3 bajo).')

titulo('4. Producto A - Estación de monitoreo  (cambio principal)')
bullet('Estación óptima: P1 - "Estación de Monitoreo La Correa" (reemplaza el punto C2 del informe previo).')
bullet('Coordenadas: 6,407003 / -75,446880 (WGS84).')
bullet('Localización multicriterio (AHP/Saaty) con consistencia CR = 0,008.')
bullet('Capta ~89 % del área aportante (justo bajo la confluencia, capta los dos cauces); ventana de reacción 3,4-7,9 min.')
bullet('Sección de medición estable, aguas arriba de la zona crítica (Hogar Santa Clara).')

titulo('5. Producto B - Red de bocinas de alerta')
bullet('3 bocinas ubicadas aguas abajo de P1 (modelo de máxima cobertura MCLP + verificación por soundshed).')
bullet('Cobertura acústica: 100 % de las vidas críticas audibles (>= 70 dB).')

titulo('6. Cuadro de cambios frente al informe previo')
from fpdf.fonts import FontFace
filas=[('Parámetro','Informe previo','Actualizado (nuevo MDE / N_CORREA)'),
 ('Estación (Producto A)','C2','P1 - Estación de Monitoreo La Correa'),
 ('Coordenadas del sensor','6,406633 / -75,446592','6,407003 / -75,446880'),
 ('% área aportante captada','91 %','~89 %'),
 ('Consistencia AHP (CR)','0,019','0,008'),
 ('Área de la cuenca','851 ha','856,4 ha'),
 ('Zonificación del riesgo','crítico 54,4 ha','ALTO 39,7 · MEDIO 61,3 · BAJO 97,5 ha'),
 ('Elementos expuestos','18 / 33','61 (validados en campo)'),
 ('Método lluvia Tr100','Gumbel','CHIRPS ×1,39 (~98,4 mm)'),
 ('Bocinas (cobertura)','~95 %','100 % vidas críticas (>= 70 dB)')]
pdf.set_font('Helvetica','',8.3); pdf.set_text_color(*TEXTO); pdf.set_draw_color(205,215,208)
head=FontFace(emphasis='BOLD', color=(255,255,255), fill_color=VERDE)
with pdf.table(col_widths=(50,42,88), line_height=5, text_align='LEFT',
               headings_style=head, cell_fill_color=(242,248,242),
               cell_fill_mode='ROWS') as table:
    for r_ in filas:
        row=table.row()
        for c in r_: row.cell(s(c))
pdf.ln(3)

titulo('7. Geoportal de gestión del riesgo (construido)')
parra('El geoportal, que en el informe figuraba como trabajo futuro, ya está construido y operativo (visor web '
      '"SAT - La Correa", Alcaldía de Girardota). Integra la capa estática (SIG) y la dinámica (IoT).')
bullet('Menús: Conocimiento del riesgo · Reducción del riesgo · Manejo de desastres.')
bullet('Capas: subcuencas del municipio, uso del suelo (AMVA), amenaza, exposición, riesgo, red hídrica, curvas de nivel, elementos expuestos, estación P1 y bocinas.')
bullet('Estación de monitoreo en tiempo real: lee la API (endpoint /mapa) y muestra nivel, temperatura, humedad, lluvia y estado sobre el mapa.')
bullet('Herramientas: coordenadas y escala, medición, mi ubicación y mapas base (calle, satélite, terreno).')
bullet('Páginas analíticas: puntos críticos, inspecciones interinstitucionales (con informe descargable) y tablero de lectura.')

titulo('8. Sección transversal del cauce en P1  (nuevo, MDT 2 m)')
bullet('Perfil del cauce perpendicular a la corriente en P1, extraído del MDT de 2 m (EPSG:9377): valle en "V".')
bullet('Fondo del cauce (thalweg) ~ 1.551,7 m s.n.m.; ancho modelado ~ 50 m; el sensor se ubica sobre el punto más bajo de la sección.')
bullet('Base para dimensionar los niveles de alerta N1-N4 según la lámina de agua medida en tiempo real.')
bullet('Niveles de alerta (prototipo, pendientes de calibración oficial): N1 seguro (<10 cm) · N2 precaución (10-20) · N3 inundación menor (20-40) · N4 mayor (>40).')

titulo('9. Inventario de campo y visitas interinstitucionales')
bullet('61 elementos expuestos validados en campo, clasificados por nivel de riesgo.')
bullet('18 puntos críticos con fotografía (avenida torrencial, movimiento en masa, inundación, socavación, estructural).')
bullet('18 puntos de visitas técnicas interinstitucionales (P1-P18) con informe descargable, por institución: Corantioquia (14) · AMVA (3) · DAGRAN (1).')

titulo('10. Estaciones de referencia SIATA integradas')
bullet('4 estaciones de nivel de SIATA en Girardota: 671 Q. Telesfora, 821 Q. El Limonar, 472 R. Medellín-Puente, 272 Q. El Salado.')
bullet('6 estaciones pluviométricas de SIATA: 127, 66, 31, 324, 88 y 389 (subcuencas La Molinal, La Correa, El Tábano, El Salado, La Ferrería, Juan Cojo).')
bullet('Se muestran en el geoportal con enlace directo al geoportal SIATA; complementan (no reemplazan) la estación propia P1.')

titulo('11. Conexión IoT en vivo (API)')
bullet('API REST (FastAPI, desplegada en Render); el geoportal consume el endpoint /mapa (GeoJSON con las mediciones del punto P1).')
bullet('Campos en vivo: nivel_agua, nivel_fluvial, temperatura, humedad, esta_lloviendo, estado_alerta, fecha_hora.')
bullet('Estado derivado del nivel medido: NORMAL · PREVENCIÓN (>=10 cm) · CRÍTICO (>=20 cm).')
bullet('La lectura en vivo ya funciona en el geoportal; el nodo electrónico sigue en Prueba de Concepto (pendiente el despliegue de campo).')

titulo('12. Cartografía del análisis (geoportal)')
DOCS=r"C:\Users\malej\OneDrive\Escritorio\IOT\GeoportalGRDGirardota\docs"
figura(os.path.join(DOCS,'02_amenaza.png'),'Amenaza por avenida torrencial a lo largo del cauce (stream power).')
figura(os.path.join(DOCS,'06_SAT_sensor_sirenas.png'),'Productos del SAT: estación de monitoreo (P1) y bocinas de alerta.')

titulo('Nota de honestidad técnica (limitaciones)')
parra('El caudal Q(Tr100) ~ 249 m³/s es provisional: se estimó con lluvia satelital CHIRPS + factor de corrección, '
      'sin estación local; debe validarse con lluvia de IDEAM/SIATA y modelación hidráulica (HEC-RAS / IBER). '
      'El modelo de elevación es ALOS PALSAR (SRTM remuestreado a 12,5 m), no LiDAR; los puntos óptimos requieren '
      'verificación en terreno.')

out=r"C:\Users\malej\Downloads\Actualizacion_SIG_SAT_LaCorrea_nuevoMDE.pdf"
pdf.output(out)
print("PDF OK ->", out)
