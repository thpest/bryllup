# -*- coding: utf-8 -*-
"""
Lager en utskriftsvennlig PDF-backup av bordplasseringen fra data/gjester.json.
Kjør:  python lag_bordkart_pdf.py   ->   Bordplassering.pdf

To deler:
  1) Selve bordplasseringen – to kolonner per bord (venstre = rad A, høyre = rad B),
     der plass i til venstre sitter rett overfor plass i til høyre (som skissen).
  2) Alfabetisk gjesteliste (Navn -> Bord) for raskt manuelt oppslag.
"""
import json
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak,
)

HER = os.path.dirname(os.path.abspath(__file__))
INN = os.path.join(HER, "data", "gjester.json")
UT = os.path.join(HER, "Bordplassering.pdf")

# Farger (bryllupets tema)
BLAA = colors.HexColor("#3f6f96")
BLAA_LYS = colors.HexColor("#eaf3fb")
NAVY = colors.HexColor("#26425c")
GULL = colors.HexColor("#c6a86b")
DUK = colors.HexColor("#fbfdff")


def tekst(v):
    """gjester.json kan ha flerspråklige felt {no,en,...}; vi bruker norsk."""
    if isinstance(v, dict):
        return v.get("no") or next(iter(v.values()), "")
    return v or ""


def last_data():
    with open(INN, encoding="utf-8") as f:
        return json.load(f)


def bygg():
    data = last_data()
    bryllup = data.get("bryllup", {})
    par = bryllup.get("par", "")
    dato = tekst(bryllup.get("dato", ""))

    styles = getSampleStyleSheet()
    tittel_st = ParagraphStyle("tittel", parent=styles["Title"], fontName="Times-Bold",
                               fontSize=24, textColor=NAVY, spaceAfter=2)
    par_st = ParagraphStyle("par", parent=styles["Normal"], fontName="Times-Italic",
                            fontSize=14, textColor=BLAA, alignment=1, spaceAfter=2)
    dato_st = ParagraphStyle("dato", parent=styles["Normal"], fontName="Helvetica",
                             fontSize=11, textColor=NAVY, alignment=1, spaceAfter=2)
    note_st = ParagraphStyle("note", parent=styles["Normal"], fontName="Helvetica-Oblique",
                             fontSize=9, textColor=colors.HexColor("#4a6076"), alignment=1)
    bord_hode_st = ParagraphStyle("bordhode", parent=styles["Normal"], fontName="Times-Bold",
                                  fontSize=14, textColor=colors.white)
    seksjon_st = ParagraphStyle("seksjon", parent=styles["Title"], fontName="Times-Bold",
                                fontSize=18, textColor=NAVY, spaceBefore=4, spaceAfter=10)
    celle_st = ParagraphStyle("celle", parent=styles["Normal"], fontName="Helvetica",
                              fontSize=11, textColor=NAVY, leading=14)
    kol_hode_st = ParagraphStyle("kolhode", parent=styles["Normal"], fontName="Helvetica-Bold",
                                 fontSize=9, textColor=colors.white, alignment=1)

    doc = SimpleDocTemplate(UT, pagesize=A4,
                            topMargin=16 * mm, bottomMargin=16 * mm,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            title="Bordplassering", author=par)
    bredde = doc.width
    innhold = []

    # ---- Topp ----
    innhold.append(Paragraph("Bordplassering", tittel_st))
    if par:
        innhold.append(Paragraph(par, par_st))
    if dato:
        innhold.append(Paragraph(dato, dato_st))
    innhold.append(Spacer(1, 4 * mm))
    innhold.append(Paragraph(
        "Venstre kolonne (rad A) sitter rett overfor høyre kolonne (rad B).", note_st))
    innhold.append(Spacer(1, 6 * mm))

    # Hovedbord først, deretter etter nummer
    bord = sorted(data.get("bord", []),
                  key=lambda b: (0 if b.get("hovedbord") else 1, b.get("nummer", 0)))

    for b in bord:
        A = b["rader"].get("A", [])
        B = b["rader"].get("B", [])
        antall = len(A) + len(B)
        navn = tekst(b.get("navn", ""))

        # Overskriftsbjelke
        hode = Table([[Paragraph(f"Bord {b['nummer']} &nbsp;·&nbsp; {navn}", bord_hode_st),
                       Paragraph(f"{antall} gjester", ParagraphStyle(
                           "ant", parent=kol_hode_st, alignment=2, fontSize=10))]],
                     colWidths=[bredde * 0.7, bredde * 0.3])
        hode.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GULL if b.get("hovedbord") else BLAA),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))

        # To-kolonners plassering
        rader = [[Paragraph("Venstre (rad A)", kol_hode_st),
                  Paragraph("Høyre (rad B)", kol_hode_st)]]
        maks = max(len(A), len(B))
        for i in range(maks):
            v = f"{i + 1}.&nbsp; {A[i]}" if i < len(A) else ""
            h = f"{i + 1}.&nbsp; {B[i]}" if i < len(B) else ""
            rader.append([Paragraph(v, celle_st), Paragraph(h, celle_st)])

        tab = Table(rader, colWidths=[bredde / 2.0, bredde / 2.0])
        tab.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLAA),
            ("BACKGROUND", (0, 1), (-1, -1), DUK),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DUK, BLAA_LYS]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cfe0f0")),
            ("LINEAFTER", (0, 0), (0, -1), 1.2, GULL),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))

        innhold.append(KeepTogether([hode, tab, Spacer(1, 8 * mm)]))

    # ---- Alfabetisk gjesteliste ----
    innhold.append(PageBreak())
    innhold.append(Paragraph("Gjesteliste (alfabetisk)", seksjon_st))
    innhold.append(Paragraph("For raskt oppslag: finn navnet, se hvilket bord.", note_st))
    innhold.append(Spacer(1, 6 * mm))

    alle = []
    for b in bord:
        navn = tekst(b.get("navn", ""))
        for rad in ("A", "B"):
            for g in b["rader"].get(rad, []):
                alle.append((g, b["nummer"], navn))
    alle.sort(key=lambda x: x[0].lower())

    # to spalter med Navn | Bord
    rader = [[Paragraph("Navn", kol_hode_st), Paragraph("Bord", kol_hode_st)]]
    for g, nr, navn in alle:
        rader.append([Paragraph(g, celle_st),
                      Paragraph(f"Bord {nr} · {navn}", celle_st)])
    liste = Table(rader, colWidths=[bredde * 0.45, bredde * 0.55], repeatRows=1)
    liste.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLAA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DUK, BLAA_LYS]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cfe0f0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    innhold.append(liste)

    doc.build(innhold)
    print(f"Skrev {UT}")
    print(f"  {len(bord)} bord, {len(alle)} gjester")


if __name__ == "__main__":
    bygg()
