# Bryllupsportal

Gjesteportal for bryllupet – **bordkart, meny og program** på mobil.
Gjestene skanner en QR-kode ved ankomst og får opp sin egen plass.

Statisk nettside (ingen server), bygget for **GitHub Pages**:
`https://thpest.github.io/bryllup`

---

## Innhold

```
index.html            Gjesteportalen (det gjestene ser)
plassering.html       Ditt plasseringsverktøy (kun for deg, ikke for gjestene)
css/style.css         Stil: lyseblått tema, hvite duker
js/app.js             Portalens logikk (bordkart, søk, meny, program)
js/plassering.js      Plasseringsverktøyets logikk
data/gjester.json     Bord + sitteplasser  ← FASIT for plasseringen
data/meny.json        Menyen
data/program.json     Programmet
Bordplassering.csv    Gjesteliste (utgangspunkt for gjester.json)
generate_data.py      Lager gjester.json fra CSV-en
lag_qr.py             Lager QR-koden (qr_bryllup.png)
qr_bryllup.png        QR-kode til portalen
```

---

## Kjøre lokalt (for å teste)

Nettleseren tillater ikke at siden leser JSON-filene når den åpnes som `file://`.
Start derfor en enkel webserver i mappa:

```bash
python -m http.server 8000
```

Åpne så:
- Portal: `http://localhost:8000`
- Plasseringsverktøy: `http://localhost:8000/plassering.html`

---

## Slik gjør du de vanlige tingene

### 1. Ordne hvem som sitter hvor (rekkefølgen ved bordene)
Åpne **plassering.html**. Hvert bord vises som to kolonner (venstre = rad A,
høyre = rad B). Plass nr. *i* til venstre sitter **rett overfor** plass nr. *i*
til høyre.

- Flytt navn med **↑ ↓** (opp/ned) og **⇄** (bytt side), eller **dra** dem
  (også til et annet bord).
- **＋** legger til, **✕** fjerner.
- Trykk **«Last ned gjester.json»** og legg den nedlastede fila i `data/`-mappa
  (erstatt den gamle).

> `data/gjester.json` er **fasit** for plasseringen i portalen.

### 2. Endre menyen
Rediger `data/meny.json`. Hver rett har `type`, `navn`, `beskrivelse`,
`allergener` (valgfri) og `ikon` (emoji).

### 3. Endre programmet
Rediger `data/program.json`. Hver post har `tid`, `tittel`, `beskrivelse`, `ikon`.

### 4. Legge til / fjerne gjester (hvem som er invitert)
To muligheter:
- **Enkelt:** bruk **＋ / ✕** i plasseringsverktøyet og last ned gjester.json.
- **Fra lista:** rediger `Bordplassering.csv` og kjør `python generate_data.py`.

> ⚠️ **Merk:** `generate_data.py` bygger `gjester.json` på nytt fra CSV-en og
> **overskriver** rekkefølgen du har pusslet i verktøyet. Kjør den derfor helst
> *før* du finpusser plasseringen – eller pusle på nytt etterpå.
> CSV-en er ordnet slik: først hele venstre kolonne (ovenfra og ned),
> så hele høyre kolonne, for hvert bord.

### 5. Endre brudepar / dato / hilsen på forsiden
Enten i toppen av plasseringsverktøyet, eller i `data/gjester.json`
(feltet `bryllup`).

---

## Publisere til GitHub Pages

1. Legg alle filene i repoet som gir `thpest.github.io/bryllup`
   (enten et repo som heter `bryllup`, eller mappa `bryllup/` i et repo).
2. Slå på **Pages** for repoet (Settings → Pages → branch `main`).
3. Portalen ligger på `https://thpest.github.io/bryllup`.

QR-koden (`qr_bryllup.png`) peker allerede dit. Skriv den ut og sett ved inngangen.
Endrer du adressen, rett `URL` i `lag_qr.py` og kjør `python lag_qr.py`.

---

## Å bekrefte / fylle inn

- [ ] **Brudeparets navn** på forsiden (står nå som «Julie & Endre» – bekreft/endre).
- [ ] **To «Christopher» på Bord 1** – er det to personer, eller en dobbeltføring?
- [ ] **Ekte meny** i `data/meny.json` (nå plassholdere).
- [ ] **Ekte program/klokkeslett** i `data/program.json` (nå et forslag).
