/* =========================================================
   Bryllupsportal – app.js
   Statisk. Laster tre JSON-filer og viser forside, bordkart
   (med søk), meny og program. Ruting via #hash.
   ========================================================= */

const app = document.getElementById("app");

const DATA = { gjester: null, meny: null, program: null, smalltalk: null, vitser: null, santusant: null, utmerkelser: null };

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
    const [gjester, meny, program, smalltalk, vitser, santusant, utmerkelser] = await Promise.all([
      hentJSON("data/gjester.json"),
      hentJSON("data/meny.json").catch(() => null),
      hentJSON("data/program.json").catch(() => null),
      hentJSON("data/smalltalk.json").catch(() => null),
      hentJSON("data/vitser.json").catch(() => null),
      hentJSON("data/sant_usant.json").catch(() => null),
      hentJSON("data/utmerkelser.json").catch(() => null),
    ]);
    DATA.gjester = gjester;
    DATA.meny = meny;
    DATA.program = program;
    DATA.smalltalk = smalltalk;
    DATA.vitser = vitser;
    DATA.santusant = santusant;
    DATA.utmerkelser = utmerkelser;
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
  else if (h === "smalltalk") visSmalltalk();
  else if (h === "vitser") visVitser();
  else if (h === "santusant") visSantUsant();
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
  if (DATA.smalltalk?.sporsmal?.length) {
    punkter.push({ hash: "smalltalk", ikon: "💬", tittel: "Smalltalk", under: "Bryt isen med sidemannen" });
  }
  if (DATA.santusant?.pastander?.length) {
    punkter.push({ hash: "santusant", ikon: "🤔", tittel: "Sant eller usant", under: "Hvor godt kjenner du brudeparet?" });
  }
  if (DATA.vitser?.vitser?.length) {
    punkter.push({ hash: "vitser", ikon: "😂", tittel: "Vitser", under: "En liten skrøne mellom rettene" });
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

  app.append(el(`<p class="tapp-hint">Tips: trykk på et navn for en liten overraskelse 🎉</p>`));

  const treffboks = el(`<div id="treffboks"></div>`);
  app.append(treffboks);

  const bordvis = el(`<div id="bordvis"></div>`);
  app.append(bordvis);
  tegnAlleBord(bordvis);

  // Trykk på et navn → morsom animasjon, gnister, utmerkelse og en truddelutt
  bordvis.addEventListener("click", (e) => {
    const plate = e.target.closest(".plass");
    if (!plate || plate.classList.contains("tom") || !bordvis.contains(plate)) return;
    moroPaaNavn(plate);
  });

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

/* ---------- Moro ved trykk på navn ---------- */
let lydKontekst = null;

function spillTone(ctx, freq, start, dur, type = "triangle", vol = 0.2) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.03);
}

function spillTruddelutt() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    lydKontekst = lydKontekst || new AC();
    if (lydKontekst.state === "suspended") lydKontekst.resume();
    // Pentaton skala (C-dur) – låter alltid fint uansett rekkefølge
    const skala = [523.25, 587.33, 659.25, 783.99, 880.0];
    const antall = 3 + Math.floor(Math.random() * 2);
    let t = lydKontekst.currentTime;
    let forrige = -1;
    for (let i = 0; i < antall; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * skala.length); } while (idx === forrige);
      forrige = idx;
      spillTone(lydKontekst, skala[idx], t, 0.17);
      t += 0.12;
    }
    // liten avsluttende "ding" en oktav opp
    spillTone(lydKontekst, skala[skala.length - 1] * 2, t + 0.02, 0.3, "triangle", 0.16);
  } catch (_) { /* stille om lyd ikke er tilgjengelig */ }
}

function lagGnister(plate) {
  const emojis = ["✨", "🎉", "💫", "⭐", "🌟"];
  for (let i = 0; i < 7; i++) {
    const s = document.createElement("span");
    s.className = "gnist";
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = (25 + Math.random() * 50) + "%";
    s.style.setProperty("--dx", (Math.random() * 70 - 35).toFixed(0) + "px");
    s.style.animationDelay = (Math.random() * 0.14).toFixed(2) + "s";
    plate.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}

function visUtmerkelse(plate) {
  const liste = DATA.utmerkelser?.titler || [];
  if (!liste.length) return;
  const gammel = plate.querySelector(".utmerkelse");
  if (gammel) gammel.remove();
  const boble = document.createElement("div");
  boble.className = "utmerkelse";
  boble.textContent = liste[Math.floor(Math.random() * liste.length)];
  plate.appendChild(boble);
  setTimeout(() => boble.remove(), 2100);
}

function moroPaaNavn(plate) {
  plate.classList.remove("sprett");
  void plate.offsetWidth;
  plate.classList.add("sprett");
  lagGnister(plate);
  visUtmerkelse(plate);
  spillTruddelutt();
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

/* ---------- Tilfeldig trekking (delt av Smalltalk/Vitser/Sant-usant) ---------- */
function stokk(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Lager en trekker som går gjennom hele lista i tilfeldig rekkefølge
// før noe gjentas, og unngår at samme kommer to ganger på rad.
function lagTrekker(hentListe) {
  let pose = [];
  let siste = null;
  return function neste() {
    const alle = hentListe() || [];
    if (alle.length === 0) return null;
    if (alle.length === 1) return alle[0];
    if (pose.length === 0) {
      pose = stokk(alle);
      if (pose[pose.length - 1] === siste) {
        [pose[0], pose[pose.length - 1]] = [pose[pose.length - 1], pose[0]];
      }
    }
    siste = pose.pop();
    return siste;
  };
}

/* ---------- Smalltalk ---------- */
const trekkSmalltalk = lagTrekker(() => DATA.smalltalk?.sporsmal);

function visSmalltalk() {
  app.innerHTML = "";
  app.append(topplinje("Smalltalk"));
  const alle = DATA.smalltalk?.sporsmal || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">Kommer snart …</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.smalltalk.undertittel || "Bryt isen – spør sidemannen!")}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">💬</div>
    <p class="moro-tekst" id="moro-tekst"></p>
    <button class="neste-knapp" id="moro-neste">Ny setning →</button>
  </div>`);
  app.append(kort);
  const tekstEl = kort.querySelector("#moro-tekst");
  const vis = () => {
    tekstEl.textContent = trekkSmalltalk();
    tekstEl.classList.remove("fade-inn");
    void tekstEl.offsetWidth;
    tekstEl.classList.add("fade-inn");
  };
  kort.querySelector("#moro-neste").addEventListener("click", vis);
  vis();
}

/* ---------- Vitser ---------- */
const trekkVits = lagTrekker(() => DATA.vitser?.vitser);

function visVitser() {
  app.innerHTML = "";
  app.append(topplinje("Vitser"));
  const alle = DATA.vitser?.vitser || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">Kommer snart …</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.vitser.undertittel || "Trekk en vits!")}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">😂</div>
    <p class="moro-tekst" id="moro-tekst"></p>
    <button class="neste-knapp" id="moro-neste">Ny vits →</button>
  </div>`);
  app.append(kort);
  const tekstEl = kort.querySelector("#moro-tekst");
  const vis = () => {
    tekstEl.textContent = trekkVits();
    tekstEl.classList.remove("fade-inn");
    void tekstEl.offsetWidth;
    tekstEl.classList.add("fade-inn");
  };
  kort.querySelector("#moro-neste").addEventListener("click", vis);
  vis();
}

/* ---------- Sant eller usant ---------- */
const trekkPastand = lagTrekker(() => DATA.santusant?.pastander);

function visSantUsant() {
  app.innerHTML = "";
  app.append(topplinje("Sant eller usant"));
  const alle = DATA.santusant?.pastander || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">Kommer snart …</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.santusant.undertittel || "Gjett – og vis svaret!")}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">🤔</div>
    <p class="moro-tekst" id="su-pastand"></p>
    <div class="su-svar" id="su-svar" hidden></div>
    <div class="su-knapper">
      <button class="neste-knapp lys" id="su-vis">Vis svar</button>
      <button class="neste-knapp" id="su-neste">Ny påstand →</button>
    </div>
  </div>`);
  app.append(kort);

  const pastandEl = kort.querySelector("#su-pastand");
  const svarEl = kort.querySelector("#su-svar");
  const visKnapp = kort.querySelector("#su-vis");
  let gjeldende = null;

  const nyPastand = () => {
    gjeldende = trekkPastand();
    pastandEl.textContent = gjeldende ? gjeldende.pastand : "";
    svarEl.hidden = true;
    svarEl.innerHTML = "";
    visKnapp.hidden = false;
    pastandEl.classList.remove("fade-inn");
    void pastandEl.offsetWidth;
    pastandEl.classList.add("fade-inn");
  };
  const visSvar = () => {
    if (!gjeldende) return;
    const sant = gjeldende.svar === true;
    svarEl.innerHTML =
      `<span class="su-merke ${sant ? "sant" : "usant"}">${sant ? "SANT" : "USANT"}</span>` +
      (gjeldende.forklaring ? `<p class="su-forklaring">${esc(gjeldende.forklaring)}</p>` : "");
    svarEl.hidden = false;
    visKnapp.hidden = true;
    svarEl.classList.remove("fade-inn");
    void svarEl.offsetWidth;
    svarEl.classList.add("fade-inn");
  };

  visKnapp.addEventListener("click", visSvar);
  kort.querySelector("#su-neste").addEventListener("click", nyPastand);
  nyPastand();
}

start();
