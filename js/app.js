/* =========================================================
   Bryllupsportal – app.js
   Statisk. Laster tre JSON-filer og viser forside, bordkart
   (med søk), meny og program. Ruting via #hash.
   ========================================================= */

const app = document.getElementById("app");

const DATA = { gjester: null, meny: null, program: null };

/* ---------- Hjelpere ---------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
// Normaliser navn for søk/sammenligning (uten store/små, ekstra mellomrom)
function norm(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

async function hentJSON(sti) {
  const r = await fetch(sti, { cache: "no-store" });
  if (!r.ok) throw new Error(`Kunne ikke laste ${sti} (${r.status})`);
  return r.json();
}

/* ---------- Oppstart ---------- */
async function start() {
  try {
    const [gjester, meny, program] = await Promise.all([
      hentJSON("data/gjester.json"),
      hentJSON("data/meny.json").catch(() => null),
      hentJSON("data/program.json").catch(() => null),
    ]);
    DATA.gjester = gjester;
    DATA.meny = meny;
    DATA.program = program;
    document.title = "Bryllup · " + (gjester.bryllup?.par || "");
    window.addEventListener("hashchange", ruter);
    ruter();
  } catch (e) {
    app.innerHTML = "";
    app.append(el(`<div class="beskjed">
      <p>Klarte ikke å laste innholdet.</p>
      <p class="liten">${esc(e.message)}</p>
      <p class="liten">Åpne siden via en webserver (ikke som fil). Se README.</p>
    </div>`));
  }
}

/* ---------- Ruter ---------- */
function ruter() {
  const h = location.hash.replace(/^#\/?/, "");
  app.classList.remove("fade-inn");
  void app.offsetWidth; // restart animasjon
  if (h === "plass") visBordkart();
  else if (h === "meny") visMeny();
  else if (h === "program") visProgram();
  else if (h === "bilder") visBilder();
  else visForside();
  app.classList.add("fade-inn");
  window.scrollTo(0, 0);
}

function topplinje(tittel) {
  const t = el(`<div class="topp">
    <button class="tilbake" aria-label="Tilbake">←</button>
    <h2>${esc(tittel)}</h2>
  </div>`);
  t.querySelector(".tilbake").addEventListener("click", () => { location.hash = ""; });
  return t;
}

/* ---------- Forside ---------- */
function visForside() {
  const b = DATA.gjester.bryllup || {};
  app.innerHTML = "";
  app.append(el(`
    <header class="hero">
      <div class="kimg">💍</div>
      <h1 class="par">${esc(b.par || "Velkommen")}</h1>
      <p class="dato">${esc(b.dato || "")}</p>
      <hr class="skille">
      <p class="hilsen">${esc(b.hilsen || "Velkommen til feiringen! Her finner du plassen din, menyen og programmet for dagen.")}</p>
    </header>
  `));

  const knapper = el(`<nav class="meny-knapper"></nav>`);
  const punkter = [
    { hash: "plass", ikon: "🪑", tittel: "Finn min plass", under: "Søk opp navnet ditt og se bordet" },
    { hash: "meny", ikon: "🍽️", tittel: "Meny", under: "Hva serveres i dag" },
    { hash: "program", ikon: "🎶", tittel: "Program", under: "Slik blir dagen" },
  ];
  if (b.bilderUrl) {
    punkter.push({ hash: "bilder", ikon: "📷", tittel: "Bilder", under: "Se og del bilder fra dagen" });
  }
  for (const p of punkter) {
    const a = el(`<a class="stor-knapp" href="#/${p.hash}">
      <span class="ikon">${p.ikon}</span>
      <span class="tekst">
        <span class="tittel">${esc(p.tittel)}</span>
        <span class="under">${esc(p.under)}</span>
      </span>
      <span class="pil">›</span>
    </a>`);
    knapper.append(a);
  }
  app.append(knapper);
  app.append(el(`<p class="forside-bunn">Vi gleder oss til å feire sammen med dere ♥</p>`));
}

/* ---------- Bordkart + søk ---------- */
// Bygg et flatt register: hvert menneske med bord, rad, indeks
function byggRegister() {
  const reg = [];
  for (const bord of DATA.gjester.bord) {
    for (const rad of ["A", "B"]) {
      const liste = bord.rader?.[rad] || [];
      liste.forEach((navn, i) => {
        reg.push({ navn, bord, rad, i });
      });
    }
  }
  return reg;
}

function naboTekst(person) {
  const { bord, rad, i } = person;
  const egen = bord.rader[rad];
  const annen = bord.rader[rad === "A" ? "B" : "A"];
  const over = egen[i - 1];
  const under = egen[i + 1];
  const overfor = annen ? annen[i] : null;

  const deler = [];
  const sider = [over, under].filter(Boolean);
  if (sider.length === 2) deler.push(`Ved siden av deg: <b>${esc(over)}</b> og <b>${esc(under)}</b>.`);
  else if (sider.length === 1) deler.push(`Ved siden av deg: <b>${esc(sider[0])}</b>.`);
  if (overfor) deler.push(`Rett overfor: <b>${esc(overfor)}</b>.`);
  return deler.join(" ");
}

function visBordkart() {
  app.innerHTML = "";
  app.append(topplinje("Finn min plass"));

  const sok = el(`<div class="sok-boks">
    <input type="search" id="sokfelt" placeholder="Skriv navnet ditt …"
           autocomplete="off" autocapitalize="words" spellcheck="false"
           enterkeyhint="search" aria-label="Søk etter navnet ditt">
    <span class="sok-ikon">🔍</span>
  </div>`);
  app.append(sok);

  const treffboks = el(`<div id="treffboks"></div>`);
  app.append(treffboks);

  const bordvis = el(`<div id="bordvis"></div>`);
  app.append(bordvis);
  tegnAlleBord(bordvis);

  const felt = sok.querySelector("#sokfelt");
  const reg = byggRegister();

  let valgtNavn = null; // låst valg når flere har samme navn

  function oppdater() {
    const q = norm(felt.value);
    fjernFremhev();
    treffboks.innerHTML = "";
    if (q.length < 2) return;

    // eksakt-treff prioriteres, ellers "starter med", ellers "inneholder"
    const eksakt = reg.filter(p => norm(p.navn) === q);
    const starter = reg.filter(p => norm(p.navn).startsWith(q) && norm(p.navn) !== q);
    const inneholder = reg.filter(p => norm(p.navn).includes(q) && !norm(p.navn).startsWith(q));
    let treff = eksakt.length ? eksakt : (starter.length ? starter : inneholder);

    if (valgtNavn) {
      const laast = reg.filter(p => norm(p.navn) === norm(valgtNavn));
      if (laast.length) treff = laast;
    }

    if (treff.length === 0) {
      treffboks.append(el(`<p class="ingen-treff">Fant ingen med «${esc(felt.value)}». Prøv fornavnet, eller spør en av vertene.</p>`));
      return;
    }

    // Grupper treff på navn – hvis flere ULIKE navn matcher og de er mange,
    // be gjesten presisere. Hvis samme navn på flere bord, la dem velge bord.
    const unikeNavn = [...new Set(treff.map(p => p.navn))];

    if (unikeNavn.length > 1 && !valgtNavn) {
      // flere forskjellige navn matcher – vis kort valgliste
      const boks = el(`<div class="treff"><p>Mente du noen av disse?</p><div class="velg-liste"></div></div>`);
      const liste = boks.querySelector(".velg-liste");
      unikeNavn.slice(0, 8).forEach(n => {
        const btn = el(`<button>${esc(n)}</button>`);
        btn.addEventListener("click", () => { valgtNavn = n; felt.value = n; oppdater(); });
        liste.append(btn);
      });
      treffboks.append(boks);
      return;
    }

    if (treff.length > 1) {
      // samme navn, flere personer/bord – la gjesten velge riktig bord
      const boks = el(`<div class="treff">
        <p><b>${esc(treff[0].navn)}</b> finnes ved flere bord. Hvilket er ditt?</p>
        <div class="velg-liste"></div>
      </div>`);
      const liste = boks.querySelector(".velg-liste");
      treff.forEach(p => {
        const btn = el(`<button>Bord ${p.bord.nummer} · ${esc(p.bord.navn)}</button>`);
        btn.addEventListener("click", () => visTreff(p));
        liste.append(btn);
      });
      treffboks.append(boks);
      return;
    }

    visTreff(treff[0]);
  }

  function visTreff(p) {
    treffboks.innerHTML = "";
    const kort = el(`<div class="treff">
      <p class="treff-bord">Bord ${p.bord.nummer} · ${esc(p.bord.navn)}</p>
      <p>${naboTekst(p)}</p>
      <p class="liten">Plassen din er markert nedenfor.</p>
    </div>`);
    treffboks.append(kort);
    fremhev(p);
  }

  felt.addEventListener("input", () => { valgtNavn = null; oppdater(); });
  felt.addEventListener("search", oppdater);
  setTimeout(() => felt.focus(), 250);
}

function tegnAlleBord(container) {
  container.innerHTML = "";
  // Hovedbord først, deretter etter nummer
  const bord = [...DATA.gjester.bord].sort((a, b) => {
    if (a.hovedbord && !b.hovedbord) return -1;
    if (!a.hovedbord && b.hovedbord) return 1;
    return a.nummer - b.nummer;
  });

  for (const b of bord) {
    const A = b.rader?.A || [];
    const B = b.rader?.B || [];
    const enkel = A.length === 0 || B.length === 0;
    const seksjon = el(`<section class="bord ${b.hovedbord ? "hovedbord" : ""}" id="bord-${b.nummer}">
      <div class="bord-tittel-wrap">
        <span class="bord-nr">Bord ${b.nummer}</span>
        <h3 class="bord-tittel">${esc(b.navn)}</h3>
      </div>
    </section>`);

    const grid = el(`<div class="langbord ${enkel ? "enkel" : ""}"></div>`);
    if (enkel) {
      const liste = A.length ? A : B;
      const radNavn = A.length ? "A" : "B";
      liste.forEach((navn, i) => grid.append(plassEl(navn, b, radNavn, i)));
    } else {
      const maks = Math.max(A.length, B.length);
      for (let i = 0; i < maks; i++) {
        grid.append(A[i] != null ? plassEl(A[i], b, "A", i) : tomEl());
        grid.append(B[i] != null ? plassEl(B[i], b, "B", i) : tomEl());
      }
    }
    seksjon.append(grid);
    container.append(seksjon);
  }
}

function plassEl(navn, bord, rad, i) {
  const p = el(`<div class="plass">${esc(navn)}</div>`);
  p.dataset.bord = bord.nummer;
  p.dataset.rad = rad;
  p.dataset.i = i;
  return p;
}
function tomEl() {
  return el(`<div class="plass tom"></div>`);
}

function finnPlassEl(p) {
  return document.querySelector(
    `.plass[data-bord="${p.bord.nummer}"][data-rad="${p.rad}"][data-i="${p.i}"]`
  );
}

function fjernFremhev() {
  document.querySelectorAll(".plass.deg, .plass.nabo")
    .forEach(e => e.classList.remove("deg", "nabo"));
}

function fremhev(p) {
  fjernFremhev();
  const meg = finnPlassEl(p);
  if (!meg) return;
  meg.classList.add("deg");

  // marker naboer (over/under + overfor)
  const naboer = [
    { rad: p.rad, i: p.i - 1 },
    { rad: p.rad, i: p.i + 1 },
    { rad: p.rad === "A" ? "B" : "A", i: p.i },
  ];
  for (const n of naboer) {
    const e = document.querySelector(
      `.plass[data-bord="${p.bord.nummer}"][data-rad="${n.rad}"][data-i="${n.i}"]`
    );
    if (e && !e.classList.contains("tom")) e.classList.add("nabo");
  }

  const bordSeksjon = document.getElementById("bord-" + p.bord.nummer);
  if (bordSeksjon) bordSeksjon.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Meny ---------- */
function visMeny() {
  app.innerHTML = "";
  app.append(topplinje(DATA.meny?.tittel || "Meny"));
  if (!DATA.meny) {
    app.append(el(`<div class="beskjed">Menyen er ikke klar ennå.</div>`));
    return;
  }
  if (DATA.meny.undertittel) {
    app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.meny.undertittel)}</p></div>`));
  }
  for (const r of DATA.meny.retter || []) {
    const kort = el(`<div class="rett">
      <span class="r-ikon">${r.ikon || "•"}</span>
      <div>
        <div class="r-type">${esc(r.type || "")}</div>
        <div class="r-navn">${esc(r.navn || "")}</div>
        <div class="r-besk">${esc(r.beskrivelse || "")}</div>
        ${r.allergener ? `<div class="r-allergen">Allergener: ${esc(r.allergener)}</div>` : ""}
      </div>
    </div>`);
    app.append(kort);
  }
}

/* ---------- Program ---------- */
function visProgram() {
  app.innerHTML = "";
  app.append(topplinje(DATA.program?.tittel || "Program"));
  if (!DATA.program) {
    app.append(el(`<div class="beskjed">Programmet er ikke klart ennå.</div>`));
    return;
  }
  if (DATA.program.undertittel) {
    app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.program.undertittel)}</p></div>`));
  }
  const linje = el(`<div class="tidslinje"></div>`);
  for (const p of DATA.program.poster || []) {
    const post = el(`<div class="post">
      <div class="p-tid">${esc(p.tid || "")}</div>
      <div class="p-innhold">
        <div class="p-tittel">${p.ikon ? `<span>${p.ikon}</span>` : ""}<span>${esc(p.tittel || "")}</span></div>
        ${p.beskrivelse ? `<div class="p-besk">${esc(p.beskrivelse)}</div>` : ""}
      </div>
    </div>`);
    linje.append(post);
  }
  app.append(linje);
}

/* ---------- Bilder ---------- */
function visBilder() {
  app.innerHTML = "";
  app.append(topplinje("Bilder"));
  const url = DATA.gjester.bryllup?.bilderUrl;
  if (!url) {
    app.append(el(`<div class="beskjed">Fotoalbumet er ikke klart ennå.</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">Del minnene fra dagen</p></div>`));
  const kort = el(`<div class="bilder-kort">
    <div class="bilder-ikon">📷</div>
    <p>Ta del i minnene! Åpne vårt felles fotoalbum for å <b>se bildene</b> som deles –
       og gjerne <b>legg til dine egne</b>.</p>
    <a class="album-knapp" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Åpne fotoalbumet</a>
    <p class="liten">Albumet åpnes i Google Foto. For å laste opp bilder må du være innlogget
       med en Google-konto – alle med lenken kan se bildene.</p>
  </div>`);
  app.append(kort);
}

start();
