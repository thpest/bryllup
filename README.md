# Bryllupsportal

Gjesteportal for bryllupet til **Julie & Endre – 15. august 2026**.
Gjestene skanner en QR-kode ved ankomst og får opp bordkart, meny, program,
bilder, leker og mer – på mobil.

Statisk nettside (ingen egen server), bygget for **GitHub Pages**:
`https://thpest.github.io/bryllup` (satt til `noindex` – dukker ikke opp i søk).

---

## Funksjoner

- **Finn min plass** – søk på navnet ditt, se bordet og naboene dine
- **Meny** og **Program** – flerspråklig
- **Bilder** – lenke til delt Google Foto-album
- **Smalltalk / Sant eller usant / Vitser** – små leker (norsk)
- **Kveldsmodus** – låses opp automatisk kl. 20:00 (oppdrag, frekk smalltalk, dansegulv-bingo)
- **Ventehall** – innloggingen er åpen på forhånd, portalen åpner 15. august kl. 12:00
- **Minnebok** – gjestene skriver «snaps» som lagres i Google Sheet (se eget avsnitt)
- **Språkvalg** 🇳🇴 🇬🇧 🇩🇪 🇪🇸 (flagg øverst; huskes på telefonen)
- **Passord** – myk adgangssperre på hele siden + egen port på «Spør Bjørn Olav»
- Trykk på et navn i bordkartet → liten animasjon + tilfeldig «utmerkelse»
  (utenlandske gjester får en hilsen på eget språk)

---

## Filstruktur

```
index.html            Gjesteportalen (det gjestene ser)
plassering.html       Plasseringsverktøy (kun for deg – ikke for gjestene)
css/style.css         All stil (lyseblått tema, hvite duker)
js/app.js             All logikk: ruting, språk (i18n), passord, alle sidene
js/plassering.js      Plasseringsverktøyets logikk

data/gjester.json     Bord + sitteplasser + config (URL-er, kveld-tid)  ← FASIT
data/meny.json        Menyen (flerspråklig)
data/program.json     Programmet (flerspråklig)
data/smalltalk.json   Smalltalk-spørsmål
data/vitser.json      Vitser
data/sant_usant.json  Sant/usant-påstander (EKSEMPLER – bytt ut med ekte fakta)
data/utmerkelser.json Tilfeldige utmerkelser ved trykk på navn
data/hilsener.json    Personlige hilsener til utenlandske gjester
data/kveld.json       Kveldsmodus-innhold (oppdrag, smalltalk, bingo)
data/bjornolav.json   «Spør Bjørn Olav»-spørsmål + hvilket bordkort som blinker

Bordplassering.csv    Gjesteliste (utgangspunkt for gjester.json)
generate_data.py      Lager gjester.json fra CSV-en
lag_qr.py             Lager QR-koden (qr_bryllup.png)
lag_bordkart_pdf.py   Lager PDF-backup (Bordplassering.pdf)
qr_bryllup.png        QR-kode til portalen
Bordplassering.pdf    Utskriftsvennlig backup (bordkart + alfabetisk liste)
```

`_thomas/` og `Skisse_bordplassering.png` ligger i `.gitignore` og publiseres ikke.

---

## Kjøre lokalt

Nettleseren leser ikke JSON-filene når siden åpnes som `file://`. Start en enkel
webserver i mappa:

```bash
python -m http.server 8000
```

- Portal: `http://localhost:8000`
- Plasseringsverktøy: `http://localhost:8000/plassering.html`
- Forhåndsvis Kveldsmodus (før kl. 20:00): `http://localhost:8000/?kveld=1`

Siden husker passord og språk i localStorage. Vil du se låseskjermen på nytt,
bruk et privat/inkognito-vindu.

---

## Flerspråklige felt

Tekst som skal oversettes lagres enten som en vanlig streng (kun norsk) **eller**
som et objekt `{ "no": "…", "en": "…", "de": "…", "es": "…" }`. Mangler et språk,
faller portalen tilbake til norsk. Grensesnittstekstene ligger i `I18N`-blokken
øverst i `js/app.js`. Selve lekene er norske.

---

## Slik gjør du de vanlige tingene

### Bordplassering (rekkefølgen ved bordene)
Åpne **plassering.html**. Hvert bord vises som to kolonner (venstre = rad A,
høyre = rad B). Plass *i* til venstre sitter rett overfor plass *i* til høyre.
Flytt navn med ↑ ↓ / ⇄ / dra, legg til med ＋, fjern med ✕. Trykk
**«Last ned gjester.json»** og legg fila i `data/`. `data/gjester.json` er fasit.

### Meny / program
Rediger `data/meny.json` og `data/program.json` (flerspråklige felt, se over).

### Legge til / fjerne gjester
Enten ＋/✕ i plasseringsverktøyet, eller rediger `Bordplassering.csv` og kjør
`python generate_data.py`.

> ⚠️ `generate_data.py` bygger `gjester.json` på nytt fra CSV-en og **overskriver**
> rekkefølgen du har pusslet. Kjør den før finpuss – eller pusle på nytt etterpå.
> CSV-rekkefølge: hele venstre kolonne, så hele høyre kolonne, per bord.

### Forside: brudepar / dato / hilsen
I `data/gjester.json` → `bryllup` (dato og hilsen er flerspråklige objekter).

### Passord
Passordene ligger **ikke i klartekst** – kun som SHA-256-hash i `js/app.js`
(`PASS_SIDE` = hele siden, `PASS_BO` = «Spør Bjørn Olav»). Vil du endre et passord:

```bash
python -c "import hashlib; print(hashlib.sha256('NYTT_PASSORD'.lower().strip().encode()).hexdigest())"
```

…og lim den nye hashen inn i riktig konstant. (Merk: dette er en «fløyelssnor»,
ikke ekte sikkerhet – alt på en statisk side kan i prinsippet omgås.)

### Portalen åpner på bryllupsdagen
Gjestene kan logge inn i god tid (lenken sendes ut 14. august), men selve
innholdet er sperret til **15. august kl. 12.00**. Fram til da møtes de av en
ventehall med nedtelling («Du er påmeldt!»), og når klokka passerer, dukker det
opp en knapp rett inn i portalen. Tidspunktet styres av `bryllup.portalAapner` i
`data/gjester.json`. Forhåndsvis den åpne portalen med `?apen=1` i adressen
(f.eks. `https://thpest.github.io/bryllup/?apen=1`).

### Navnevalg ved innlogging
På låseskjermen velger gjesten navnet sitt fra en nedtrekksliste (alle gjestene,
alfabetisk, med bordnavn så like fornavn skilles). Navnet lagres i localStorage og
gjenbrukes: forhåndsutfylt i minneboken, automatisk søk i «Finn min plass», og en
liten hilsen på forsiden. Valgte man feil, kan man rette det når som helst via
«Ikke deg? Bytt navn» ved hilsenen (uten passord). «Jeg står ikke på lista» finnes
for gjester som ikke er i lista.

---

## Minnebok (Google Sheet via Apps Script)

Minnebok-siden sender «snaps» til et **Google Apps Script-webapp** som legger dem
i en egen **«Minnebok»-fane** i regnearket. Backenden deles med det eldre
prosjektet `C:\Prosjekter\bryllupsportalen` (Bryllupsportalen 3.0 – samme bryllup).

- **URL:** `data/gjester.json` → `bryllup.minnebokUrl` (Apps Script `/exec`-adressen).
- **Sending:** POST med `mode:"no-cors"`, felt `action=minnebok`, `navn`, `tekst`,
  `submittedAt`. Svaret er «ugjennomsiktig», så portalen viser «Takk!» så lenge
  forespørselen når fram (skriving er «send og glem»).
- **Backend:** funksjonene `handleMinnebok_` og `getMinnebokSheet_` i Apps Script-
  koden (`Code.gs`) tar imot og skriver `[tidspunkt, navn, hilsen, ID]`. Fanen
  opprettes automatisk første gang. Skriv-kun – brudeparet leser minneboken i arket.

### ⚠️ Viktig når du endrer Apps Script-koden
For at `/exec`-URL-en skal forbli **den samme** (så `minnebokUrl` fortsatt stemmer):

1. Apps Script → **Distribuer → Administrer distribusjoner**
2. Klikk **blyanten** (rediger) på den eksisterende distribusjonen
3. **Versjon: Ny versjon** → **Distribuer**

**Ikke** lag en *ny* distribusjon – da får du en ny URL, og du må i så fall
oppdatere `minnebokUrl` i `data/gjester.json`. «Hvem har tilgang» skal være **Alle**.

---

## Backup (PDF)

`Bordplassering.pdf` er en utskriftsvennlig reserve (bordkart i to kolonner +
alfabetisk gjesteliste). Regenerer ved endringer:

```bash
python lag_bordkart_pdf.py
```

Skriv ut et par eksemplarer til toastmaster/verter som helgardering.

---

## Publisere til GitHub Pages

Repoet heter `bryllup` (public). Endringer publiseres med:

```bash
git add -A && git commit -m "..." && git push
```

Pages: Settings → Pages → branch `main` / `(root)`. QR-koden (`qr_bryllup.png`)
peker til adressen; endres adressen, rett `URL` i `lag_qr.py` og kjør den på nytt.

---

## Å bekrefte / fylle inn

- [ ] **Brudeparets navn** på forsiden (står som «Julie & Endre» – bekreft).
- [ ] **Sant/usant** i `data/sant_usant.json` – bytt EKSEMPLENE med ekte fakta om paret.
- [ ] Slett testrader i «Minnebok»-fanen før festen (om noen).
- [x] Meny og program fylt inn.
- [x] To «Christopher» på Bord 1 = to personer («Christopher S.» / «Christopher L.»).
```
