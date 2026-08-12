/* =========================================================
   Storskjerm / kiosk – bryllup
   Ruller automatisk gjennom velkomst+QR, snaps fra minneboken,
   bordkart, program og meny. Ingen passord, ingen mus.

   Taster:  mellomrom = pause/spill,  → = neste,  ← = forrige,  F = fullskjerm
   ========================================================= */

const scene = document.getElementById("scene");
const fremdriftEl = document.getElementById("fremdrift");

const DATA = { gjester: null, program: null, meny: null };
let SNAPS = [];
let snapPeker = 0;
let RAAD = [];
let raadPeker = 0;

/* ---------- Hjelpere ---------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function tr(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) return v.no ?? Object.values(v)[0] ?? "";
  return v ?? "";
}
async function hentJSON(sti) {
  const r = await fetch(sti, { cache: "no-store" });
  if (!r.ok) throw new Error(`Kunne ikke laste ${sti}`);
  return r.json();
}

/* JSONP – Google Apps Script svarer uten CORS-hoder */
let jsonpTeller = 0;
function hentJSONP(url, params = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const navn = `skjermCb_${Date.now()}_${++jsonpTeller}`;
    const u = new URL(url);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    u.searchParams.set("callback", navn);
    u.searchParams.set("_", Date.now());

    const script = document.createElement("script");

    const rydd = () => { script.remove(); delete window[navn]; clearTimeout(timer); };

    // Ved tidsavbrudd/feil: la funksjonen stå igjen som en tom "fangst",
    // slik at et sent svar fra Google ikke kaster ReferenceError.
    const ryddMykt = () => {
      script.remove();
      clearTimeout(timer);
      window[navn] = function () { delete window[navn]; };
      setTimeout(() => { delete window[navn]; }, 60000);
    };

    const timer = setTimeout(() => { ryddMykt(); reject(new Error("tidsavbrudd")); }, timeoutMs);

    window[navn] = (data) => { rydd(); resolve(data); };
    script.onerror = () => { ryddMykt(); reject(new Error("lastefeil")); };
    script.src = u.toString();
    document.head.appendChild(script);
  });
}

/* ---------- Snaps fra minneboken ---------- */
async function hentSnaps() {
  const url = DATA.gjester?.bryllup?.minnebokUrl;
  if (!url) return;
  try {
    const svar = await hentJSONP(url, { action: "minnebok_list" });
    if (svar?.ok && Array.isArray(svar.items)) {
      SNAPS = svar.items.filter((x) => x && x.tekst);
    }
  } catch (_) {
    /* stille – skjermen ruller videre på det andre innholdet */
  }
}

async function hentRaad() {
  const url = DATA.gjester?.bryllup?.minnebokUrl; // samme endepunkt
  if (!url) return;
  try {
    const svar = await hentJSONP(url, { action: "raad_list" });
    if (svar?.ok && Array.isArray(svar.items)) {
      RAAD = svar.items.filter((x) => x && x.tekst);
    }
  } catch (_) { /* stille */ }
}

/* ---------- Slides ---------- */
function slideVelkomst() {
  const b = DATA.gjester.bryllup || {};
  return el(`<div class="slide velkomst">
    <div class="v-tekst">
      <div class="s-kicker">Velkommen til feiringen av</div>
      <h1 class="v-par">${esc(b.par || "")}</h1>
      <p class="v-dato">${esc(tr(b.dato))}</p>
      <p class="v-oppfordring">Skann koden og finn plassen din, menyen og programmet.</p>
      <p class="v-liten">Passord: <b>bruden</b></p>
    </div>
    <div class="qr-ramme"><img src="qr_bryllup.png" alt="QR-kode til bryllupsportalen"></div>
  </div>`);
}

function slideSnap() {
  if (!SNAPS.length) {
    return el(`<div class="slide snap-tom">
      <div class="st-tekst">
        <div class="s-kicker">Minneboken</div>
        <h2 class="s-tittel">Skriv en hilsen til brudeparet</h2>
        <p class="s-under">Åpne portalen, velg «Minnebok» – så dukker hilsenen din opp her på skjermen.</p>
      </div>
      <div class="qr-ramme"><img src="qr_bryllup.png" alt="QR-kode"></div>
    </div>`);
  }
  const snap = SNAPS[snapPeker % SNAPS.length];
  snapPeker++;
  const lengde = (snap.tekst || "").length;
  const storrelse = lengde > 220 ? "svaert-lang" : lengde > 90 ? "lang" : "";
  const navn = (snap.navn || "").trim();
  return el(`<div class="slide">
    <div class="snap-kort">
      <div class="snap-hjerte">💛</div>
      <p class="snap-tekst ${storrelse}">«${esc(snap.tekst)}»</p>
      <div class="snap-navn">${navn ? esc(navn) : "En gjest"}${snap.tid ? `<span class="tid">${esc(snap.tid)}</span>` : ""}</div>
    </div>
  </div>`);
}

function slideRaad() {
  if (!RAAD.length) {
    return el(`<div class="slide snap-tom">
      <div class="st-tekst">
        <div class="s-kicker">Ekteskapsråd</div>
        <h2 class="s-tittel">Del ditt beste råd</h2>
        <p class="s-under">Åpne portalen, velg «Ekteskapsråd» – så dukker rådet ditt opp her.</p>
      </div>
      <div class="qr-ramme"><img src="qr_bryllup.png" alt="QR-kode"></div>
    </div>`);
  }
  const r = RAAD[raadPeker % RAAD.length];
  raadPeker++;
  const lengde = (r.tekst || "").length;
  const storrelse = lengde > 220 ? "svaert-lang" : lengde > 90 ? "lang" : "";
  return el(`<div class="slide">
    <div class="snap-kort raad-kort">
      <div class="s-kicker">Ekteskapsråd</div>
      <div class="snap-hjerte">💍</div>
      <p class="snap-tekst ${storrelse}">«${esc(r.tekst)}»</p>
      <div class="snap-navn">${esc((r.navn || "").trim() || "En gjest")}</div>
    </div>
  </div>`);
}

// Veksler mellom snap og råd, slik at begge deler får plass
let hilsenVeksel = 0;
function slideHilsen() {
  const harSnaps = SNAPS.length > 0;
  const harRaad = RAAD.length > 0;
  if (harSnaps && harRaad) return (hilsenVeksel++ % 2 === 0) ? slideSnap() : slideRaad();
  if (harRaad) return slideRaad();
  return slideSnap(); // dekker også "ingen ennå" med invitasjons-slide
}

function slideBord(bord) {
  const A = bord.rader?.A || [];
  const B = bord.rader?.B || [];
  const brudepar = DATA.gjester?.bryllup?.brudepar || [];
  const tett = Math.max(A.length, B.length) > 9;

  const kol = (liste) => liste.map((navn) => {
    const gull = bord.hovedbord && brudepar.includes(navn) ? " brudepar" : "";
    return `<div class="plassnavn${gull}">${esc(navn)}</div>`;
  }).join("");

  return el(`<div class="slide bord-slide">
    <div class="s-kicker">Bord ${bord.nummer}</div>
    <h2 class="bord-navn">${esc(bord.navn)}</h2>
    <div class="bord-grid ${tett ? "tett" : ""}">
      <div class="bord-kol">${kol(A)}</div>
      <div class="bord-midt"></div>
      <div class="bord-kol">${kol(B)}</div>
    </div>
  </div>`);
}

// Finn hvilken programpost som er "nå" (kun på selve bryllupsdagen)
function naaIndeks(poster) {
  const dagISO = (DATA.gjester?.bryllup?.portalAapner || "").slice(0, 10);
  const naa = new Date();
  const iDagISO = `${naa.getFullYear()}-${String(naa.getMonth() + 1).padStart(2, "0")}-${String(naa.getDate()).padStart(2, "0")}`;
  if (!dagISO || dagISO !== iDagISO) return -1;
  const minutter = naa.getHours() * 60 + naa.getMinutes();
  let treff = -1;
  poster.forEach((p, i) => {
    const m = String(p.tid || "").match(/(\d{1,2})[.:](\d{2})/);
    if (!m) return;
    const t = Number(m[1]) * 60 + Number(m[2]);
    // etter midnatt (00.00, 01.30) hører til neste døgn
    const justert = Number(m[1]) < 6 ? t + 24 * 60 : t;
    const naaJustert = naa.getHours() < 6 ? minutter + 24 * 60 : minutter;
    if (justert <= naaJustert) treff = i;
  });
  return treff;
}

function slideProgram() {
  const poster = DATA.program?.poster || [];
  const naa = naaIndeks(poster);
  const rader = poster.map((p, i) => {
    const klasse = i === naa ? " naa" : (naa >= 0 && i < naa ? " forbi" : "");
    return `<div class="prog-rad${klasse}">
      <div class="p-tid">${esc(p.tid || "")}</div>
      ${p.ikon ? `<div class="p-ikon">${p.ikon}</div>` : ""}
      <div class="p-tittel">${esc(tr(p.tittel))}</div>
    </div>`;
  }).join("");
  const toSpalter = poster.length > 8 ? " to-spalter" : "";
  return el(`<div class="slide">
    <div class="s-kicker">Kveldens gang</div>
    <h2 class="s-tittel" style="font-size:5.5vh;margin-bottom:2.5vh">Program</h2>
    <div class="prog-liste${toSpalter}">${rader}</div>
  </div>`);
}

function slideMeny() {
  const retter = (DATA.meny?.retter || []).filter((r) => tr(r.navn));
  const rader = retter.map((r) => `<div class="meny-rad">
    <div class="m-ikon">${r.ikon || "•"}</div>
    <div>
      <div class="m-type">${esc(tr(r.type))}</div>
      <div class="m-navn">${esc(tr(r.navn))}</div>
      <div class="m-besk">${esc(tr(r.beskrivelse))}</div>
    </div>
  </div>`).join("");
  return el(`<div class="slide">
    <div class="s-kicker">Kveldens</div>
    <h2 class="s-tittel" style="font-size:5.5vh;margin-bottom:2.5vh">Meny</h2>
    <div class="meny-liste">${rader}</div>
  </div>`);
}

/* ---------- Rulleringen ---------- */
// Snaps flettes inn mellom de andre, så de vises ofte
function byggProgramliste() {
  const bord = [...(DATA.gjester?.bord || [])].sort((a, b) => {
    if (a.hovedbord && !b.hovedbord) return -1;
    if (!a.hovedbord && b.hovedbord) return 1;
    return a.nummer - b.nummer;
  });

  const liste = [];
  const hilsen = { lag: slideHilsen, tid: 12000 };
  liste.push({ lag: slideVelkomst, tid: 14000 });
  liste.push(hilsen);
  for (const b of bord) {
    liste.push({ lag: () => slideBord(b), tid: 15000 });
    liste.push(hilsen);
  }
  if (DATA.program?.poster?.length) { liste.push({ lag: slideProgram, tid: 17000 }); liste.push(hilsen); }
  if (DATA.meny?.retter?.length) { liste.push({ lag: slideMeny, tid: 15000 }); liste.push(hilsen); }
  return liste;
}

let slides = [];
let peker = 0;
let timer = null;
let pauset = false;

/* Skalerer slide-innholdet ned til det får plass på skjermen.
   Gjør at store bord og lange programlister aldri blir kuttet. */
function tilpassSlide(slideEl) {
  if (!slideEl) return;
  slideEl.style.transform = "none";
  const cs = getComputedStyle(scene);
  const ledigH = scene.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ledigB = scene.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = slideEl.scrollHeight;
  const b = slideEl.scrollWidth;
  if (!h || !b || !ledigH || !ledigB) return;
  const k = Math.min(1, ledigH / h, ledigB / b);
  if (k < 0.999) slideEl.style.transform = `scale(${k.toFixed(3)})`;
}

let gjeldendeSlideEl = null;

function visSlide(indeks) {
  if (!slides.length) return;
  peker = (indeks + slides.length) % slides.length;
  const s = slides[peker];
  const nytt = s.lag();
  scene.replaceChildren(nytt);   // atomisk bytte – ingen rester fra forrige
  gjeldendeSlideEl = nytt;
  tilpassSlide(nytt);
  // Bilder kan endre høyden når de er ferdig lastet – mål på nytt da
  nytt.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", () => tilpassSlide(nytt), { once: true });
  });
  startFremdrift(s.tid);
  clearTimeout(timer);
  if (!pauset) timer = setTimeout(() => visSlide(peker + 1), s.tid);
}

function startFremdrift(varighet) {
  fremdriftEl.style.transition = "none";
  fremdriftEl.style.width = "0%";
  void fremdriftEl.offsetWidth;
  if (pauset) return;
  fremdriftEl.style.transition = `width ${varighet}ms linear`;
  fremdriftEl.style.width = "100%";
}

function settPause(nyVerdi) {
  pauset = nyVerdi;
  const knapp = document.getElementById("k-pause");
  if (knapp) knapp.textContent = pauset ? "▶" : "⏸";
  if (pauset) {
    clearTimeout(timer);
    const bredde = getComputedStyle(fremdriftEl).width;
    fremdriftEl.style.transition = "none";
    fremdriftEl.style.width = bredde;
  } else {
    visSlide(peker + 1);
  }
}

/* ---------- Skjerm av-sperre + kontroller ---------- */
async function holdSkjermenVaaken() {
  try {
    if ("wakeLock" in navigator) {
      let laas = await navigator.wakeLock.request("screen");
      document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible") {
          try { laas = await navigator.wakeLock.request("screen"); } catch (_) {}
        }
      });
    }
  } catch (_) { /* ikke kritisk */ }
}

function settOppKontroller() {
  const boks = document.getElementById("kontroller");
  let skjulTimer = null;
  const vis = () => {
    boks.classList.add("synlig");
    document.body.classList.add("viser-mus");
    clearTimeout(skjulTimer);
    skjulTimer = setTimeout(() => {
      boks.classList.remove("synlig");
      document.body.classList.remove("viser-mus");
    }, 2500);
  };
  document.addEventListener("mousemove", vis);
  document.addEventListener("touchstart", vis);

  // Ny måling ved endret skjermstørrelse / fullskjerm
  let maalTimer = null;
  const maalPaaNytt = () => {
    clearTimeout(maalTimer);
    maalTimer = setTimeout(() => tilpassSlide(gjeldendeSlideEl), 150);
  };
  window.addEventListener("resize", maalPaaNytt);
  document.addEventListener("fullscreenchange", maalPaaNytt);

  document.getElementById("k-neste").addEventListener("click", () => visSlide(peker + 1));
  document.getElementById("k-pause").addEventListener("click", () => settPause(!pauset));
  document.getElementById("k-fullskjerm").addEventListener("click", vekslFullskjerm);

  document.addEventListener("keydown", (e) => {
    if (e.key === " ") { e.preventDefault(); settPause(!pauset); }
    else if (e.key === "ArrowRight") visSlide(peker + 1);
    else if (e.key === "ArrowLeft") visSlide(peker - 1);
    else if (e.key.toLowerCase() === "f") vekslFullskjerm();
  });
}

function vekslFullskjerm() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

/* ---------- Oppstart ---------- */
async function start() {
  try {
    const [gjester, program, meny] = await Promise.all([
      hentJSON("data/gjester.json"),
      hentJSON("data/program.json").catch(() => null),
      hentJSON("data/meny.json").catch(() => null),
    ]);
    DATA.gjester = gjester;
    DATA.program = program;
    DATA.meny = meny;

    await Promise.all([hentSnaps(), hentRaad()]);

    slides = byggProgramliste();
    settOppKontroller();
    holdSkjermenVaaken();
    visSlide(0);

    // Hent nye snaps og råd jevnlig
    setInterval(() => { hentSnaps(); hentRaad(); }, 60000);
    // Bygg rulleringen på nytt av og til (fanger opp nye bord/endringer)
    setInterval(async () => {
      try {
        DATA.gjester = await hentJSON("data/gjester.json");
        DATA.program = await hentJSON("data/program.json").catch(() => DATA.program);
        slides = byggProgramliste();
      } catch (_) {}
    }, 600000);
  } catch (e) {
    scene.innerHTML = `<div class="laster">Klarte ikke å laste innholdet.<br><span style="font-size:2.4vh">${esc(e.message)}</span></div>`;
  }
}

start();
