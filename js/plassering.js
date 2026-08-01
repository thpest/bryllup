/* =========================================================
   Plasseringsverktøy – js/plassering.js
   Leser data/gjester.json, lar deg pusle rekkefølgen og
   laste ned en oppdatert gjester.json.
   ========================================================= */

let data = null;
const metaEl = document.getElementById("meta");
const listeEl = document.getElementById("bord-liste");
const toastEl = document.getElementById("toast");

function toast(t) {
  toastEl.textContent = t;
  toastEl.classList.add("vis");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("vis"), 1800);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function last() {
  try {
    const r = await fetch("data/gjester.json", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status + " " + r.statusText);
    data = await r.json();
    render();
  } catch (e) {
    listeEl.innerHTML = `<div class="feil">
      <b>Klarte ikke å laste data/gjester.json.</b><br>${esc(e.message)}<br><br>
      Åpne denne siden via en webserver (ikke som fil). I mappa: <code>python -m http.server 8000</code>,
      og gå til <code>http://localhost:8000/plassering.html</code>.</div>`;
  }
}

/* ---------- Render ---------- */
function render() {
  renderMeta();
  listeEl.innerHTML = "";
  const bord = [...data.bord].sort((a, b) => {
    if (a.hovedbord && !b.hovedbord) return -1;
    if (!a.hovedbord && b.hovedbord) return 1;
    return a.nummer - b.nummer;
  });
  for (const b of bord) listeEl.append(bordEl(b));
}

function renderMeta() {
  const b = data.bryllup || (data.bryllup = {});
  metaEl.innerHTML = "";
  const felt = [
    ["par", "Brudepar"], ["dato", "Dato"], ["hilsen", "Hilsen på forsiden"],
  ];
  for (const [nokkel, etikett] of felt) {
    const l = document.createElement("label");
    l.innerHTML = `${esc(etikett)}<input type="text" value="${esc(b[nokkel] || "")}">`;
    l.querySelector("input").addEventListener("input", e => { b[nokkel] = e.target.value; });
    metaEl.append(l);
  }
}

function bordEl(b) {
  const idx = data.bord.indexOf(b);
  const A = b.rader.A || (b.rader.A = []);
  const B = b.rader.B || (b.rader.B = []);
  const total = A.length + B.length;

  const sek = document.createElement("section");
  sek.className = "bord" + (b.hovedbord ? " hoved" : "");
  sek.innerHTML = `
    <div class="bord-hode">
      <span class="nr">Bord ${b.nummer}</span>
      <h2>${esc(b.navn)}</h2>
      <span class="antall">${total} gjester</span>
    </div>
    <div class="midtlinje">↑ venstre og høyre kolonne vender mot hverandre ↑</div>
    <div class="kolonner"></div>`;
  const kolonner = sek.querySelector(".kolonner");
  kolonner.append(kolonneEl(idx, "A", "Venstre (rad A)"));
  kolonner.append(kolonneEl(idx, "B", "Høyre (rad B)"));
  return sek;
}

function kolonneEl(bordIdx, rad, tittel) {
  const liste = data.bord[bordIdx].rader[rad];
  const kol = document.createElement("div");
  kol.className = "kol";
  kol.innerHTML = `<h3>${esc(tittel)}</h3><div class="slots"></div>`;
  const slots = kol.querySelector(".slots");

  liste.forEach((navn, i) => slots.append(chipEl(bordIdx, rad, i, navn)));

  // Slipp-sone: slippe nederst i kolonnen
  slots.addEventListener("dragover", e => e.preventDefault());
  slots.addEventListener("drop", e => {
    if (e.target === slots) { e.preventDefault(); slipp(bordIdx, rad, liste.length); }
  });

  // Legg til
  const leggTil = document.createElement("div");
  leggTil.className = "legg-til";
  leggTil.innerHTML = `<input type="text" placeholder="Legg til navn …"><button title="Legg til">＋</button>`;
  const inp = leggTil.querySelector("input");
  const btn = leggTil.querySelector("button");
  const gjor = () => {
    const n = inp.value.trim();
    if (!n) return;
    liste.push(n);
    render();
    toast(`La til ${n}`);
  };
  btn.addEventListener("click", gjor);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") gjor(); });
  kol.append(leggTil);
  return kol;
}

function chipEl(bordIdx, rad, i, navn) {
  const c = document.createElement("div");
  c.className = "chip";
  c.draggable = true;
  c.innerHTML = `
    <span class="num">${i + 1}</span>
    <span class="nv" title="${esc(navn)}">${esc(navn)}</span>
    <button class="k opp" title="Opp">↑</button>
    <button class="k ned" title="Ned">↓</button>
    <button class="k side" title="Bytt side">⇄</button>
    <button class="k fjern" title="Fjern">✕</button>`;

  c.querySelector(".opp").addEventListener("click", () => flyttInternt(bordIdx, rad, i, -1));
  c.querySelector(".ned").addEventListener("click", () => flyttInternt(bordIdx, rad, i, +1));
  c.querySelector(".side").addEventListener("click", () => byttSide(bordIdx, rad, i));
  c.querySelector(".fjern").addEventListener("click", () => fjern(bordIdx, rad, i, navn));

  // Dra og slipp
  c.addEventListener("dragstart", e => {
    dragKilde = { bordIdx, rad, i };
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", navn); } catch (_) {}
  });
  c.addEventListener("dragover", e => { e.preventDefault(); c.classList.add("dragover"); });
  c.addEventListener("dragleave", () => c.classList.remove("dragover"));
  c.addEventListener("drop", e => {
    e.preventDefault();
    c.classList.remove("dragover");
    slipp(bordIdx, rad, i);
  });
  return c;
}

/* ---------- Operasjoner ---------- */
let dragKilde = null;

function arr(bordIdx, rad) { return data.bord[bordIdx].rader[rad]; }

function flyttInternt(bordIdx, rad, i, retning) {
  const a = arr(bordIdx, rad);
  const j = i + retning;
  if (j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]];
  render();
}

function byttSide(bordIdx, rad, i) {
  const fra = arr(bordIdx, rad);
  const til = arr(bordIdx, rad === "A" ? "B" : "A");
  const [navn] = fra.splice(i, 1);
  til.push(navn);
  render();
  toast(`${navn} byttet side`);
}

function fjern(bordIdx, rad, i, navn) {
  if (!confirm(`Fjerne ${navn} fra plasseringen?`)) return;
  arr(bordIdx, rad).splice(i, 1);
  render();
  toast(`Fjernet ${navn}`);
}

// slipp dragKilde til (bordIdx, rad) på posisjon tIndex
function slipp(bordIdx, rad, tIndex) {
  if (!dragKilde) return;
  const k = dragKilde;
  const kilde = arr(k.bordIdx, k.rad);
  const [navn] = kilde.splice(k.i, 1);
  const mal = arr(bordIdx, rad);
  let idx = tIndex;
  if (k.bordIdx === bordIdx && k.rad === rad && k.i < tIndex) idx -= 1;
  idx = Math.max(0, Math.min(idx, mal.length));
  mal.splice(idx, 0, navn);
  dragKilde = null;
  render();
}

/* ---------- Eksport ---------- */
function lastNed() {
  const tekst = JSON.stringify(data, null, 2);
  const blob = new Blob([tekst], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gjester.json";
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Lastet ned gjester.json – legg den i data/-mappa");
}

async function kopier() {
  const tekst = JSON.stringify(data, null, 2);
  try {
    await navigator.clipboard.writeText(tekst);
    toast("JSON kopiert til utklippstavlen");
  } catch (_) {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = tekst; document.body.append(ta); ta.select();
    document.execCommand("copy"); ta.remove();
    toast("JSON kopiert");
  }
}

document.getElementById("last-ned").addEventListener("click", lastNed);
document.getElementById("kopier").addEventListener("click", kopier);
document.getElementById("last-paa-nytt").addEventListener("click", () => {
  if (confirm("Hente gjester.json på nytt? Ulagrede endringer forsvinner.")) last();
});

last();
