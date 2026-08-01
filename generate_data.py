# -*- coding: utf-8 -*-
"""
Genererer data/gjester.json fra Bordplassering.csv.

Kjør på nytt hver gang du endrer CSV-en:
    python generate_data.py

VIKTIG: Hvis du allerede har pusslet rekkefølgen i plasseringsverktoeyet
(plassering.html) og lastet ned en oppdatert gjester.json, vil denne
generatoren OVERSKRIVE plasseringen. Kjoer da heller ikke generatoren paa
nytt -- rediger CSV-en og pusle rekkefoelgen i verktoeyet i stedet, ELLER
kjoer generatoren og pusle rekkefoelgen paa nytt.
"""
import csv
import json
import os
from collections import Counter

HER = os.path.dirname(os.path.abspath(__file__))
CSV_FIL = os.path.join(HER, "Bordplassering.csv")
UT_FIL = os.path.join(HER, "data", "gjester.json")

# ---- Rediger disse for aa endre forsidetekst ------------------------------
BRYLLUP = {
    "par": "Julie & Endre",          # <-- BEKREFT/ENDRE brudeparets navn
    "dato": "15. august 2026",
    "hilsen": "Velkommen til feiring!",
    "bilderUrl": "https://photos.google.com/share/AF1QipNV5mkBwotKZ8-XSeC5paGjq8tsmBY_xBfPu8C394YWo4hVYZl1eEQVs6TMHbvkGw?key=TU9zR3RZZHAtRGN1ck1uakFldk9WNU92OEJaTGpn",
    "kveldLaasOpp": "2026-08-15T20:00:00+02:00",
}
# ---------------------------------------------------------------------------


def les_gjester():
    """Leser CSV, returnerer ordnet dict: bordnummer -> {navn, gjester[]}."""
    bord = {}
    with open(CSV_FIL, encoding="utf-8-sig", newline="") as f:
        leser = csv.DictReader(f)
        for rad in leser:
            aktiv = (rad.get("Aktiv") or "").strip().upper() == "TRUE"
            navn = (rad.get("Navn") or "").strip()
            if not aktiv or not navn:
                continue
            nr = (rad.get("Bordnummer") or "").strip()
            if nr == "":
                continue
            nr = int(nr)
            bordnavn = (rad.get("Bordnavn") or "").strip()
            if nr not in bord:
                bord[nr] = {"navn_kandidater": Counter(), "gjester": []}
            if bordnavn:
                bord[nr]["navn_kandidater"][bordnavn] += 1
            bord[nr]["gjester"].append(navn)
    # Velg det vanligste bordnavnet per bord (CSV kan ha smaa inkonsekvenser)
    for nr, info in bord.items():
        if info["navn_kandidater"]:
            info["navn"] = info["navn_kandidater"].most_common(1)[0][0]
        else:
            info["navn"] = f"Bord {nr}"
        del info["navn_kandidater"]
    return bord


def del_i_rader(gjester, hovedbord=False):
    """Deler en gjesteliste i to rader (A/B) som vender mot hverandre.

    CSV-en er ordnet i leserekkefoelge fra skissen: foerst hele VENSTRE
    kolonnen (ovenfra og ned), deretter hele HOEYRE kolonnen. Vi deler
    derfor paa midten: foerste halvdel -> rad A (venstre), andre halvdel
    -> rad B (hoeyre). Ved oddetall faar rad B den ekstra plassen (slik
    skissen viser for Bord 2: 11 til venstre, 12 til hoeyre).

    Plass nr. i i rad A sitter rett OVERFOR plass nr. i i rad B.
    Bruk plasseringsverktoeyet (plassering.html) til finjustering.
    """
    n = len(gjester)
    midt = n // 2
    return {"A": list(gjester[:midt]), "B": list(gjester[midt:])}


def main():
    bord_raw = les_gjester()
    bord_ut = []
    for nr in sorted(bord_raw.keys()):
        info = bord_raw[nr]
        er_hovedbord = (nr == 0)
        bord_ut.append({
            "nummer": nr,
            "navn": info["navn"],
            "hovedbord": er_hovedbord,
            "rader": del_i_rader(info["gjester"], hovedbord=er_hovedbord),
        })

    data = {"bryllup": BRYLLUP, "bord": bord_ut}

    os.makedirs(os.path.dirname(UT_FIL), exist_ok=True)
    with open(UT_FIL, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    antall = sum(len(b["rader"]["A"]) + len(b["rader"]["B"]) for b in bord_ut)
    print(f"Skrev {UT_FIL}")
    print(f"  {len(bord_ut)} bord, {antall} gjester")
    for b in bord_ut:
        n = len(b["rader"]["A"]) + len(b["rader"]["B"])
        merke = "  (hovedbord)" if b["hovedbord"] else ""
        print(f"  - Bord {b['nummer']} {b['navn']}: {n} gjester{merke}")


if __name__ == "__main__":
    main()
