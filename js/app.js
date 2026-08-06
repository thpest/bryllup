/* =========================================================
   Bryllupsportal – app.js
   Statisk. Laster tre JSON-filer og viser forside, bordkart
   (med søk), meny og program. Ruting via #hash.
   ========================================================= */

const app = document.getElementById("app");

const DATA = { gjester: null, meny: null, program: null, smalltalk: null, vitser: null, santusant: null, utmerkelser: null, hilsener: null, kveld: null, bjornolav: null };

/* ---------- Språk (i18n) ---------- */
let SPRAK = "no";
try { SPRAK = localStorage.getItem("sprak") || "no"; } catch (_) {}

const SPRAAK_LISTE = [["no", "🇳🇴"], ["en", "🇬🇧"], ["de", "🇩🇪"], ["es", "🇪🇸"]];

const I18N = {
  no: {
    tilbake: "Tilbake",
    forsideBunn: "Vi gleder oss til å feire sammen med dere ♥",
    btnPlassT: "Finn min plass", btnPlassU: "Søk opp navnet ditt og se bordet",
    btnMenyT: "Meny", btnMenyU: "Hva serveres i dag",
    btnProgramT: "Program", btnProgramU: "Slik blir dagen",
    btnBilderT: "Bilder", btnBilderU: "Se og del bilder fra dagen",
    btnSmalltalkT: "Smalltalk", btnSmalltalkU: "Bryt isen med sidemannen",
    btnSantusantT: "Sant eller usant", btnSantusantU: "Hvor godt kjenner du brudeparet?",
    btnVitserT: "Vitser", btnVitserU: "En liten skrøne mellom rettene",
    sokPlaceholder: "Skriv navnet ditt …", sokAria: "Søk etter navnet ditt",
    tappHint: "Tips: trykk på et navn for en liten overraskelse 🎉",
    bord: "Bord", deg: "Deg",
    vedSidenAv2: "Ved siden av deg: {a} og {b}.",
    vedSidenAv1: "Ved siden av deg: {a}.",
    rettOverfor: "Rett overfor: {x}.",
    plassMarkert: "Plassen din er markert nedenfor.",
    flereBord: "{navn} finnes ved flere bord. Hvilket er ditt?",
    menteDu: "Mente du noen av disse?",
    ingenTreff: "Fant ingen med «{q}». Prøv fornavnet, eller spør en av vertene.",
    allergener: "Allergener:",
    bilderUndertittel: "Del minnene fra dagen",
    bilderTekst: "Ta del i minnene! Åpne vårt felles fotoalbum for å se bildene som deles – og gjerne legge til dine egne.",
    bilderKnapp: "Åpne fotoalbumet",
    bilderNote: "Albumet åpnes i Google Foto. For å laste opp bilder må du være innlogget med en Google-konto – alle med lenken kan se bildene.",
    smalltalkUnder: "Bryt isen – trekk et spørsmål og spør sidemannen!", smalltalkNy: "Ny setning →",
    vitserUnder: "Trekk en vits – perfekt til en pause mellom rettene!", vitserNy: "Ny vits →",
    suUnder: "Hvor godt kjenner du brudeparet? Gjett først – trykk så «Vis svar».",
    suVisSvar: "Vis svar", suNy: "Ny påstand →", suSant: "SANT", suUsant: "USANT",
    kveldTittel: "Kveldsmodus", kveldAapenUnder: "Baren er åpen!",
    kveldLaastUnder: "Åpner kl. 20:00 når baren åpner", nytt: "Nytt!",
    kveldBanner: "🍸 Baren er åpen – Kveldsmodus er låst opp! Trykk for å se hva som venter.",
    kveldUnder: "Baren er åpen – nå løsner det litt!",
    kveldLaastTittel: "Kveldsmodus åpner kl. 20:00",
    kveldLaastUnder2: "Når baren åpner, låses noe nytt og morsomt opp her. Kom tilbake da!",
    aapnerOm: "Åpner om {t}t {m}m {s}s",
    fanOppdrag: "Oppdrag", fanSmalltalk: "Smalltalk", fanBingo: "Bingo",
    kveldNyOppdrag: "Nytt oppdrag →", kveldNySporsmal: "Nytt spørsmål →",
    bingoInstr: "Trykk på rutene du ser skje. Full rad, kolonne eller diagonal = BINGO!",
    bingoStatus: "{n} av 9 krysset av", bingoRop: "BINGO! 🎉", bingoNullstill: "Nullstill brettet",
    komSnart: "Kommer snart …",
    laasHilsen: "Finn navnet ditt og skriv inn passordet.",
    laasNavnPlaceholder: "Velg navnet ditt …",
    laasIkkeListe: "Jeg står ikke på lista",
    laasVelgNavn: "Velg navnet ditt i lista.",
    velkommenNavn: "Velkommen, {navn}!",
    ventTittel: "Du er påmeldt! 🎉",
    ventUnder: "Portalen åpner på bryllupsdagen, 15. august kl. 12.00. Da finner du bordet ditt, menyen, programmet og mye mer her.",
    ventNedtelling: "Åpner om {d}d {t}t {m}m {s}s",
    ventKlar: "Portalen er åpen – trykk for å gå inn!",
    byttNavn: "Ikke deg? Bytt navn",
    byttNavnHilsen: "Velg riktig navn:",
    byttNavnLagre: "Lagre",
    avbryt: "Avbryt",
    laasPlaceholder: "Passord",
    laasKnapp: "Åpne",
    laasFeil: "Feil passord – prøv igjen.",
    btnMinnebokT: "Minnebok", btnMinnebokU: "Skriv en hilsen til brudeparet",
    minnebokIntro: "Skriv en liten hilsen eller et minne fra festen. Alt samles til en minnebok til brudeparet.",
    minnebokNavn: "Navnet ditt (valgfritt)",
    minnebokTekst: "Din hilsen eller minne …",
    minnebokSend: "Send", minnebokSender: "Sender …",
    minnebokTakk: "Takk for hilsenen! 💛",
    minnebokTakkUnder: "Vil du skrive en til?",
    minnebokIgjen: "Skriv en ny",
    minnebokFeil: "Klarte ikke å sende – sjekk nettet og prøv igjen.",
    minnebokTomFeil: "Skriv en liten hilsen først.",
  },
  en: {
    tilbake: "Back",
    forsideBunn: "We can't wait to celebrate with you ♥",
    btnPlassT: "Find my seat", btnPlassU: "Search your name and see your table",
    btnMenyT: "Menu", btnMenyU: "What's being served today",
    btnProgramT: "Programme", btnProgramU: "How the day unfolds",
    btnBilderT: "Photos", btnBilderU: "View and share photos from the day",
    btnSmalltalkT: "Small talk", btnSmalltalkU: "Break the ice with your neighbour",
    btnSantusantT: "True or false", btnSantusantU: "How well do you know the couple?",
    btnVitserT: "Jokes", btnVitserU: "A little joke between courses",
    sokPlaceholder: "Type your name …", sokAria: "Search for your name",
    tappHint: "Tip: tap a name for a little surprise 🎉",
    bord: "Table", deg: "You",
    vedSidenAv2: "Next to you: {a} and {b}.",
    vedSidenAv1: "Next to you: {a}.",
    rettOverfor: "Right across from you: {x}.",
    plassMarkert: "Your seat is highlighted below.",
    flereBord: "There's more than one {navn}. Which table is yours?",
    menteDu: "Did you mean one of these?",
    ingenTreff: "No one found for «{q}». Try your first name, or ask one of the hosts.",
    allergener: "Allergens:",
    bilderUndertittel: "Share the day's memories",
    bilderTekst: "Be part of the memories! Open our shared photo album to see the photos being shared – and add your own.",
    bilderKnapp: "Open the photo album",
    bilderNote: "The album opens in Google Photos. To upload photos you need to be signed in with a Google account – anyone with the link can view them.",
    smalltalkUnder: "Break the ice – draw a question and ask your neighbour!", smalltalkNy: "New question →",
    vitserUnder: "Draw a joke – perfect for a break between courses!", vitserNy: "New joke →",
    suUnder: "How well do you know the couple? Guess first – then tap «Show answer».",
    suVisSvar: "Show answer", suNy: "New statement →", suSant: "TRUE", suUsant: "FALSE",
    kveldTittel: "Evening mode", kveldAapenUnder: "The bar is open!",
    kveldLaastUnder: "Opens at 20:00 when the bar opens", nytt: "New!",
    kveldBanner: "🍸 The bar is open – Evening mode is unlocked! Tap to see what's waiting.",
    kveldUnder: "The bar is open – time to loosen up!",
    kveldLaastTittel: "Evening mode opens at 20:00",
    kveldLaastUnder2: "When the bar opens, something new and fun unlocks here. Come back then!",
    aapnerOm: "Opens in {t}h {m}m {s}s",
    fanOppdrag: "Missions", fanSmalltalk: "Small talk", fanBingo: "Bingo",
    kveldNyOppdrag: "New mission →", kveldNySporsmal: "New question →",
    bingoInstr: "Tap the squares you see happen. A full row, column or diagonal = BINGO!",
    bingoStatus: "{n} of 9 marked", bingoRop: "BINGO! 🎉", bingoNullstill: "Reset the board",
    komSnart: "Coming soon …",
    laasHilsen: "Find your name and enter the password.",
    laasNavnPlaceholder: "Select your name …",
    laasIkkeListe: "I'm not on the list",
    laasVelgNavn: "Please select your name.",
    velkommenNavn: "Welcome, {navn}!",
    ventTittel: "You're all set! 🎉",
    ventUnder: "The portal opens on the wedding day, 15 August at 12:00. That's when you'll find your table, the menu, the programme and much more here.",
    ventNedtelling: "Opens in {d}d {t}h {m}m {s}s",
    ventKlar: "The portal is open – tap to enter!",
    byttNavn: "Not you? Change name",
    byttNavnHilsen: "Choose the right name:",
    byttNavnLagre: "Save",
    avbryt: "Cancel",
    laasPlaceholder: "Password",
    laasKnapp: "Open",
    laasFeil: "Wrong password – please try again.",
    btnMinnebokT: "Guest book", btnMinnebokU: "Leave a message for the couple",
    minnebokIntro: "Write a short greeting or a memory from the party. It all becomes a keepsake book for the couple.",
    minnebokNavn: "Your name (optional)",
    minnebokTekst: "Your message or memory …",
    minnebokSend: "Send", minnebokSender: "Sending …",
    minnebokTakk: "Thank you for your message! 💛",
    minnebokTakkUnder: "Want to write another?",
    minnebokIgjen: "Write another",
    minnebokFeil: "Couldn't send – check your connection and try again.",
    minnebokTomFeil: "Please write a message first.",
  },
  de: {
    tilbake: "Zurück",
    forsideBunn: "Wir freuen uns darauf, mit euch zu feiern ♥",
    btnPlassT: "Meinen Platz finden", btnPlassU: "Suche deinen Namen und finde deinen Tisch",
    btnMenyT: "Menü", btnMenyU: "Was heute serviert wird",
    btnProgramT: "Programm", btnProgramU: "So verläuft der Tag",
    btnBilderT: "Fotos", btnBilderU: "Fotos vom Tag ansehen und teilen",
    btnSmalltalkT: "Small Talk", btnSmalltalkU: "Brich das Eis mit deinem Nachbarn",
    btnSantusantT: "Wahr oder falsch", btnSantusantU: "Wie gut kennst du das Brautpaar?",
    btnVitserT: "Witze", btnVitserU: "Ein kleiner Witz zwischen den Gängen",
    sokPlaceholder: "Gib deinen Namen ein …", sokAria: "Nach deinem Namen suchen",
    tappHint: "Tipp: Tippe auf einen Namen für eine kleine Überraschung 🎉",
    bord: "Tisch", deg: "Du",
    vedSidenAv2: "Neben dir: {a} und {b}.",
    vedSidenAv1: "Neben dir: {a}.",
    rettOverfor: "Direkt gegenüber: {x}.",
    plassMarkert: "Dein Platz ist unten markiert.",
    flereBord: "Es gibt mehrere {navn}. Welcher Tisch ist deiner?",
    menteDu: "Meintest du eine dieser Personen?",
    ingenTreff: "Niemand für «{q}» gefunden. Versuch deinen Vornamen oder frag einen der Gastgeber.",
    allergener: "Allergene:",
    bilderUndertittel: "Teilt die Erinnerungen des Tages",
    bilderTekst: "Sei Teil der Erinnerungen! Öffne unser gemeinsames Fotoalbum, um die geteilten Fotos zu sehen – und füge gern eigene hinzu.",
    bilderKnapp: "Fotoalbum öffnen",
    bilderNote: "Das Album öffnet sich in Google Fotos. Zum Hochladen musst du mit einem Google-Konto angemeldet sein – ansehen kann jeder mit dem Link.",
    smalltalkUnder: "Brich das Eis – zieh eine Frage und frag deinen Nachbarn!", smalltalkNy: "Neue Frage →",
    vitserUnder: "Zieh einen Witz – perfekt für eine Pause zwischen den Gängen!", vitserNy: "Neuer Witz →",
    suUnder: "Wie gut kennst du das Brautpaar? Erst raten – dann auf «Antwort zeigen» tippen.",
    suVisSvar: "Antwort zeigen", suNy: "Neue Aussage →", suSant: "WAHR", suUsant: "FALSCH",
    kveldTittel: "Abendmodus", kveldAapenUnder: "Die Bar ist offen!",
    kveldLaastUnder: "Öffnet um 20:00 Uhr, wenn die Bar öffnet", nytt: "Neu!",
    kveldBanner: "🍸 Die Bar ist offen – der Abendmodus ist freigeschaltet! Tippe, um zu sehen, was dich erwartet.",
    kveldUnder: "Die Bar ist offen – jetzt wird's lockerer!",
    kveldLaastTittel: "Der Abendmodus öffnet um 20:00 Uhr",
    kveldLaastUnder2: "Wenn die Bar öffnet, wird hier etwas Neues und Lustiges freigeschaltet. Komm dann wieder!",
    aapnerOm: "Öffnet in {t}h {m}m {s}s",
    fanOppdrag: "Aufgaben", fanSmalltalk: "Small Talk", fanBingo: "Bingo",
    kveldNyOppdrag: "Neue Aufgabe →", kveldNySporsmal: "Neue Frage →",
    bingoInstr: "Tippe auf die Felder, die du siehst. Eine volle Reihe, Spalte oder Diagonale = BINGO!",
    bingoStatus: "{n} von 9 markiert", bingoRop: "BINGO! 🎉", bingoNullstill: "Feld zurücksetzen",
    komSnart: "Kommt bald …",
    laasHilsen: "Finde deinen Namen und gib das Passwort ein.",
    laasNavnPlaceholder: "Wähle deinen Namen …",
    laasIkkeListe: "Ich stehe nicht auf der Liste",
    laasVelgNavn: "Bitte wähle deinen Namen.",
    velkommenNavn: "Willkommen, {navn}!",
    ventTittel: "Du bist angemeldet! 🎉",
    ventUnder: "Das Portal öffnet am Hochzeitstag, dem 15. August um 12:00 Uhr. Dann findest du hier deinen Tisch, das Menü, das Programm und vieles mehr.",
    ventNedtelling: "Öffnet in {d}T {t}h {m}m {s}s",
    ventKlar: "Das Portal ist offen – tippe, um einzutreten!",
    byttNavn: "Nicht du? Namen ändern",
    byttNavnHilsen: "Wähle den richtigen Namen:",
    byttNavnLagre: "Speichern",
    avbryt: "Abbrechen",
    laasPlaceholder: "Passwort",
    laasKnapp: "Öffnen",
    laasFeil: "Falsches Passwort – bitte erneut versuchen.",
    btnMinnebokT: "Gästebuch", btnMinnebokU: "Hinterlasse dem Brautpaar eine Nachricht",
    minnebokIntro: "Schreib einen kleinen Gruß oder eine Erinnerung von der Feier. Alles wird zu einem Erinnerungsbuch für das Brautpaar.",
    minnebokNavn: "Dein Name (optional)",
    minnebokTekst: "Deine Nachricht oder Erinnerung …",
    minnebokSend: "Senden", minnebokSender: "Senden …",
    minnebokTakk: "Danke für deine Nachricht! 💛",
    minnebokTakkUnder: "Möchtest du noch eine schreiben?",
    minnebokIgjen: "Noch eine schreiben",
    minnebokFeil: "Konnte nicht gesendet werden – prüfe deine Verbindung und versuche es erneut.",
    minnebokTomFeil: "Bitte schreibe zuerst eine Nachricht.",
  },
  es: {
    tilbake: "Atrás",
    forsideBunn: "¡Nos hace mucha ilusión celebrar con vosotros ♥",
    btnPlassT: "Encontrar mi sitio", btnPlassU: "Busca tu nombre y ve tu mesa",
    btnMenyT: "Menú", btnMenyU: "Qué se sirve hoy",
    btnProgramT: "Programa", btnProgramU: "Cómo será el día",
    btnBilderT: "Fotos", btnBilderU: "Ver y compartir fotos del día",
    btnSmalltalkT: "Charla", btnSmalltalkU: "Rompe el hielo con tu vecino",
    btnSantusantT: "Verdadero o falso", btnSantusantU: "¿Cuánto conoces a los novios?",
    btnVitserT: "Chistes", btnVitserU: "Un chiste entre platos",
    sokPlaceholder: "Escribe tu nombre …", sokAria: "Busca tu nombre",
    tappHint: "Consejo: toca un nombre para una pequeña sorpresa 🎉",
    bord: "Mesa", deg: "Tú",
    vedSidenAv2: "A tu lado: {a} y {b}.",
    vedSidenAv1: "A tu lado: {a}.",
    rettOverfor: "Justo enfrente: {x}.",
    plassMarkert: "Tu sitio está marcado abajo.",
    flereBord: "Hay más de un/a {navn}. ¿Cuál es tu mesa?",
    menteDu: "¿Querías decir alguno de estos?",
    ingenTreff: "No se encontró a nadie con «{q}». Prueba con tu nombre, o pregunta a los anfitriones.",
    allergener: "Alérgenos:",
    bilderUndertittel: "Comparte los recuerdos del día",
    bilderTekst: "¡Forma parte de los recuerdos! Abre nuestro álbum de fotos compartido para ver las fotos – y añade las tuyas.",
    bilderKnapp: "Abrir el álbum de fotos",
    bilderNote: "El álbum se abre en Google Fotos. Para subir fotos debes iniciar sesión con una cuenta de Google – cualquiera con el enlace puede verlas.",
    smalltalkUnder: "Rompe el hielo – ¡saca una pregunta y pregúntale a tu vecino!", smalltalkNy: "Nueva frase →",
    vitserUnder: "Saca un chiste – ¡perfecto para una pausa entre platos!", vitserNy: "Nuevo chiste →",
    suUnder: "¿Cuánto conoces a los novios? Adivina primero – luego toca «Ver respuesta».",
    suVisSvar: "Ver respuesta", suNy: "Nueva afirmación →", suSant: "VERDADERO", suUsant: "FALSO",
    kveldTittel: "Modo noche", kveldAapenUnder: "¡La barra está abierta!",
    kveldLaastUnder: "Se abre a las 20:00 cuando abre la barra", nytt: "¡Nuevo!",
    kveldBanner: "🍸 La barra está abierta – ¡el modo noche está desbloqueado! Toca para ver lo que te espera.",
    kveldUnder: "La barra está abierta – ¡a soltarse un poco!",
    kveldLaastTittel: "El modo noche se abre a las 20:00",
    kveldLaastUnder2: "Cuando abra la barra, aquí se desbloqueará algo nuevo y divertido. ¡Vuelve entonces!",
    aapnerOm: "Abre en {t}h {m}m {s}s",
    fanOppdrag: "Misiones", fanSmalltalk: "Charla", fanBingo: "Bingo",
    kveldNyOppdrag: "Nueva misión →", kveldNySporsmal: "Nueva pregunta →",
    bingoInstr: "Toca las casillas que veas ocurrir. Una fila, columna o diagonal completa = ¡BINGO!",
    bingoStatus: "{n} de 9 marcadas", bingoRop: "¡BINGO! 🎉", bingoNullstill: "Reiniciar el cartón",
    komSnart: "Próximamente …",
    laasHilsen: "Encuentra tu nombre e introduce la contraseña.",
    laasNavnPlaceholder: "Elige tu nombre …",
    laasIkkeListe: "No estoy en la lista",
    laasVelgNavn: "Por favor, elige tu nombre.",
    velkommenNavn: "¡Hola, {navn}!",
    ventTittel: "¡Ya estás dentro! 🎉",
    ventUnder: "El portal se abre el día de la boda, el 15 de agosto a las 12:00. Entonces encontrarás aquí tu mesa, el menú, el programa y mucho más.",
    ventNedtelling: "Abre en {d}d {t}h {m}m {s}s",
    ventKlar: "¡El portal está abierto – toca para entrar!",
    byttNavn: "¿No eres tú? Cambiar nombre",
    byttNavnHilsen: "Elige el nombre correcto:",
    byttNavnLagre: "Guardar",
    avbryt: "Cancelar",
    laasPlaceholder: "Contraseña",
    laasKnapp: "Abrir",
    laasFeil: "Contraseña incorrecta – inténtalo de nuevo.",
    btnMinnebokT: "Libro de recuerdos", btnMinnebokU: "Deja un mensaje a los novios",
    minnebokIntro: "Escribe un pequeño saludo o un recuerdo de la fiesta. Todo se reunirá en un libro de recuerdos para los novios.",
    minnebokNavn: "Tu nombre (opcional)",
    minnebokTekst: "Tu mensaje o recuerdo …",
    minnebokSend: "Enviar", minnebokSender: "Enviando …",
    minnebokTakk: "¡Gracias por tu mensaje! 💛",
    minnebokTakkUnder: "¿Quieres escribir otro?",
    minnebokIgjen: "Escribir otro",
    minnebokFeil: "No se pudo enviar – comprueba tu conexión e inténtalo de nuevo.",
    minnebokTomFeil: "Escribe un mensaje primero.",
  },
};

function t(key, vars) {
  let s = (I18N[SPRAK] && I18N[SPRAK][key]);
  if (s == null) s = (I18N.no && I18N.no[key]);
  if (s == null) s = key;
  if (vars) for (const k in vars) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
  return s;
}

// Oversett et innholdsfelt som enten er en streng (norsk) eller {no,en,de,es}
function tr(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v[SPRAK] ?? v.no ?? Object.values(v)[0] ?? "";
  }
  return v ?? "";
}

function setSprak(lang) {
  if (!I18N[lang]) lang = "no";
  SPRAK = lang;
  try { localStorage.setItem("sprak", lang); } catch (_) {}
  document.documentElement.lang = lang;
  const bar = document.getElementById("sprakbar");
  if (bar) [...bar.children].forEach((b) => b.classList.toggle("aktiv", b.dataset.lang === lang));
  document.title = "Bryllup · " + (DATA.gjester?.bryllup?.par || "");
  if (document.getElementById("adgang-laas")) { visAdgangsLaas(); return; }
  ruter();
}

function byggSprakbar() {
  if (document.getElementById("sprakbar")) return;
  const bar = document.createElement("div");
  bar.id = "sprakbar";
  bar.className = "sprakbar";
  for (const [lang, flagg] of SPRAAK_LISTE) {
    const b = document.createElement("button");
    b.dataset.lang = lang;
    b.textContent = flagg;
    b.setAttribute("aria-label", lang.toUpperCase());
    if (lang === SPRAK) b.classList.add("aktiv");
    b.addEventListener("click", () => setSprak(lang));
    bar.append(b);
  }
  document.body.append(bar);
}

/* ---------- Passord (myk adgangssperre) ---------- */
// SHA-256-hash av passordene – klartekst ligger IKKE i koden.
const PASS_SIDE = "14bf86df359a157a5fc97a9e5ff285735e597498adb990a6898dc2e736dfe58c";
const PASS_BO = "2067a7195567d457485b9cc0f75e0e944bdee4bdf3d3e9fef15dfe0bcd27bea1";

async function hashSHA256(tekst) {
  const data = new TextEncoder().encode(String(tekst).toLowerCase().trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function passordStemmer(input, hash) {
  try { return (await hashSHA256(input)) === hash; } catch (_) { return false; }
}
function sideLaastOpp() { try { return localStorage.getItem("adgang") === "1"; } catch (_) { return false; } }
function boLaastOpp() { try { return localStorage.getItem("boAdgang") === "1"; } catch (_) { return false; } }

// Gjestens eget navn (valgt på låseskjermen), lagret i localStorage
function gjestNavn() { try { return localStorage.getItem("gjestNavn") || ""; } catch (_) { return ""; } }
function settGjestNavn(navn) {
  try { if (navn) localStorage.setItem("gjestNavn", navn); else localStorage.removeItem("gjestNavn"); } catch (_) {}
}

// Alle gjestenavn, alfabetisk. Bordnavn legges på når to har samme fornavn.
function alleGjestNavnOpts() {
  const flat = [];
  for (const b of (DATA.gjester?.bord || [])) {
    for (const rad of ["A", "B"]) {
      for (const navn of (b.rader?.[rad] || [])) flat.push({ navn, bordnavn: b.navn });
    }
  }
  return flat
    .map((x) => ({ value: x.navn, label: `${x.navn} · ${x.bordnavn}` }))
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase(), "nb"));
}

function visAdgangsLaas() {
  const par = DATA.gjester?.bryllup?.par || "";
  const gammel = document.getElementById("adgang-laas");
  if (gammel) gammel.remove();

  const opts = alleGjestNavnOpts();
  const optionsHtml =
    `<option value="">${esc(t("laasNavnPlaceholder"))}</option>` +
    opts.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("") +
    `<option value="__skip__">${esc(t("laasIkkeListe"))}</option>`;

  const laas = el(`<div class="adgang-laas" id="adgang-laas">
    <div class="laas-kort">
      <div class="laas-hjerte">💍</div>
      ${par ? `<h1 class="laas-par">${esc(par)}</h1>` : ""}
      <p class="laas-hilsen">${esc(t("laasHilsen"))}</p>
      <form class="laas-form" autocomplete="off">
        <select class="laas-navn" aria-label="${esc(t("laasNavnPlaceholder"))}">${optionsHtml}</select>
        <input type="password" class="laas-felt" placeholder="${esc(t("laasPlaceholder"))}"
               autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="${esc(t("laasPlaceholder"))}">
        <button type="submit" class="laas-knapp">${esc(t("laasKnapp"))}</button>
      </form>
      <p class="laas-feil" hidden></p>
    </div>
  </div>`);
  document.body.append(laas);

  const navnSel = laas.querySelector(".laas-navn");
  const felt = laas.querySelector(".laas-felt");
  const feil = laas.querySelector(".laas-feil");
  const kort = laas.querySelector(".laas-kort");

  // forhåndsvelg hvis navn allerede er lagret
  const lagret = gjestNavn();
  if (lagret && [...navnSel.options].some((o) => o.value === lagret)) navnSel.value = lagret;

  laas.querySelector(".laas-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!navnSel.value) {
      feil.textContent = t("laasVelgNavn");
      feil.hidden = false;
      navnSel.focus();
      return;
    }
    if (await passordStemmer(felt.value, PASS_SIDE)) {
      try { localStorage.setItem("adgang", "1"); } catch (_) {}
      settGjestNavn(navnSel.value === "__skip__" ? "" : navnSel.value);
      laas.classList.add("aapner");
      setTimeout(() => laas.remove(), 350);
      ruter();
    } else {
      feil.textContent = t("laasFeil");
      feil.hidden = false;
      kort.classList.remove("rist"); void kort.offsetWidth; kort.classList.add("rist");
      felt.select();
    }
  });
  setTimeout(() => navnSel.focus(), 200);
}

// Bytt navn i etterkant (uten passord) – hvis noen valgte feil ved innlogging
function visNavnVelger() {
  const gammel = document.getElementById("navn-velger");
  if (gammel) gammel.remove();
  const opts = alleGjestNavnOpts();
  const optionsHtml =
    `<option value="">${esc(t("laasNavnPlaceholder"))}</option>` +
    opts.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("") +
    `<option value="__skip__">${esc(t("laasIkkeListe"))}</option>`;
  const overlay = el(`<div class="adgang-laas" id="navn-velger">
    <div class="laas-kort">
      <div class="laas-hjerte">🙋</div>
      <p class="laas-hilsen">${esc(t("byttNavnHilsen"))}</p>
      <form class="laas-form" autocomplete="off">
        <select class="laas-navn" aria-label="${esc(t("laasNavnPlaceholder"))}">${optionsHtml}</select>
        <button type="submit" class="laas-knapp">${esc(t("byttNavnLagre"))}</button>
      </form>
      <button type="button" class="laas-avbryt">${esc(t("avbryt"))}</button>
    </div>
  </div>`);
  document.body.append(overlay);
  const sel = overlay.querySelector(".laas-navn");
  const lagret = gjestNavn();
  if (lagret && [...sel.options].some((o) => o.value === lagret)) sel.value = lagret;
  overlay.querySelector(".laas-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sel.value) { sel.focus(); return; }
    settGjestNavn(sel.value === "__skip__" ? "" : sel.value);
    overlay.remove();
    ruter();
  });
  overlay.querySelector(".laas-avbryt").addEventListener("click", () => overlay.remove());
  setTimeout(() => sel.focus(), 150);
}

/* ---------- Ventehall: portalen åpner på bryllupsdagen ---------- */
// Forhåndsvisning: legg til ?apen=1 i adressen for å åpne uansett klokke
function erPortalForhaandsvis() {
  try { return new URLSearchParams(location.search).get("apen") === "1"; } catch (_) { return false; }
}
function portalMaaltid() {
  const tid = DATA.gjester?.bryllup?.portalAapner;
  const ms = tid ? new Date(tid).getTime() : NaN;
  return isNaN(ms) ? null : ms;
}
function erPortalAapen() {
  if (erPortalForhaandsvis()) return true;
  const maal = portalMaaltid();
  if (maal === null) return true; // ingen/ugyldig tid → alltid åpen
  return Date.now() >= maal;
}

function visVentehall() {
  app.innerHTML = "";
  const b = DATA.gjester?.bryllup || {};
  const meg = gjestNavn();
  app.append(el(`
    <header class="hero">
      <div class="kimg">💍</div>
      <h1 class="par">${esc(b.par || "")}</h1>
      <p class="dato">${esc(tr(b.dato) || "")}</p>
      <hr class="skille">
    </header>
  `));
  const kort = el(`<div class="ventehall">
    <p class="vent-tittel">${esc(t("ventTittel"))}</p>
    ${meg ? `<p class="vent-navn">${t("velkommenNavn", { navn: esc(meg) })}</p>` : ""}
    <p class="vent-under">${esc(t("ventUnder"))}</p>
    <p class="nedtelling" id="vent-nedtelling"></p>
    ${meg ? `<a class="bytt-navn-lenke" href="#" id="vent-bytt">${esc(t("byttNavn"))}</a>` : ""}
  </div>`);
  app.append(kort);

  const byttLenke = kort.querySelector("#vent-bytt");
  if (byttLenke) byttLenke.addEventListener("click", (e) => { e.preventDefault(); visNavnVelger(); });

  const ned = kort.querySelector("#vent-nedtelling");
  const maal = portalMaaltid();
  const oppdater = () => {
    if (maal === null) return;
    const diff = maal - Date.now();
    if (diff <= 0) {
      ned.innerHTML = `<button class="neste-knapp" id="vent-inn">${esc(t("ventKlar"))}</button>`;
      const knapp = ned.querySelector("#vent-inn");
      if (knapp) knapp.addEventListener("click", () => ruter());
      return;
    }
    const d = Math.floor(diff / 86400000);
    const tim = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    ned.textContent = t("ventNedtelling", {
      d: d, t: tim, m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0"),
    });
  };
  oppdater();
  const iv = setInterval(() => {
    if (!document.body.contains(kort)) { clearInterval(iv); return; }
    oppdater();
  }, 1000);
}

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
    const [gjester, meny, program, smalltalk, vitser, santusant, utmerkelser, hilsener, kveld, bjornolav] = await Promise.all([
      hentJSON("data/gjester.json"),
      hentJSON("data/meny.json").catch(() => null),
      hentJSON("data/program.json").catch(() => null),
      hentJSON("data/smalltalk.json").catch(() => null),
      hentJSON("data/vitser.json").catch(() => null),
      hentJSON("data/sant_usant.json").catch(() => null),
      hentJSON("data/utmerkelser.json").catch(() => null),
      hentJSON("data/hilsener.json").catch(() => null),
      hentJSON("data/kveld.json").catch(() => null),
      hentJSON("data/bjornolav.json").catch(() => null),
    ]);
    DATA.gjester = gjester;
    DATA.meny = meny;
    DATA.program = program;
    DATA.smalltalk = smalltalk;
    DATA.vitser = vitser;
    DATA.santusant = santusant;
    DATA.utmerkelser = utmerkelser;
    DATA.hilsener = hilsener;
    DATA.kveld = kveld;
    DATA.bjornolav = bjornolav;
    startKveldvakt();
    document.documentElement.lang = SPRAK;
    byggSprakbar();
    document.title = "Bryllup · " + (gjester.bryllup?.par || "");
    window.addEventListener("hashchange", ruter);
    if (sideLaastOpp()) ruter();
    else visAdgangsLaas();
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
  // Portalen er "påmeldt, men lukket" fram til åpningstidspunktet
  if (!erPortalAapen()) {
    visVentehall();
    app.classList.add("fade-inn");
    window.scrollTo(0, 0);
    return;
  }
  if (h === "plass") visBordkart();
  else if (h === "meny") visMeny();
  else if (h === "program") visProgram();
  else if (h === "bilder") visBilder();
  else if (h === "smalltalk") visSmalltalk();
  else if (h === "vitser") visVitser();
  else if (h === "santusant") visSantUsant();
  else if (h === "kveld") visKveld();
  else if (h === "bjornolav") visBjornOlav();
  else if (h === "minnebok") visMinnebok();
  else visForside();
  app.classList.add("fade-inn");
  window.scrollTo(0, 0);
}

function topplinje(tittel) {
  const topp = el(`<div class="topp">
    <button class="tilbake" aria-label="${esc(t("tilbake"))}">←</button>
    <h2>${esc(tittel)}</h2>
  </div>`);
  topp.querySelector(".tilbake").addEventListener("click", () => { location.hash = ""; });
  return topp;
}

/* ---------- Forside ---------- */
function visForside() {
  const b = DATA.gjester.bryllup || {};
  app.innerHTML = "";
  app.append(el(`
    <header class="hero">
      <div class="kimg">💍</div>
      <h1 class="par">${esc(b.par || "Velkommen")}</h1>
      <p class="dato">${esc(tr(b.dato) || "")}</p>
      <hr class="skille">
      <p class="hilsen">${esc(tr(b.hilsen) || "")}</p>
    </header>
  `));

  const meg = gjestNavn();
  if (meg) {
    const hilsenP = el(`<p class="gjest-hilsen">${t("velkommenNavn", { navn: esc(meg) })} 👋 <a class="bytt-navn-lenke" href="#">${esc(t("byttNavn"))}</a></p>`);
    hilsenP.querySelector(".bytt-navn-lenke").addEventListener("click", (e) => { e.preventDefault(); visNavnVelger(); });
    app.append(hilsenP);
  }

  const knapper = el(`<nav class="meny-knapper"></nav>`);
  const punkter = [
    { hash: "plass", ikon: "🪑", tittel: t("btnPlassT"), under: t("btnPlassU") },
    { hash: "meny", ikon: "🍽️", tittel: t("btnMenyT"), under: t("btnMenyU") },
    { hash: "program", ikon: "🎶", tittel: t("btnProgramT"), under: t("btnProgramU") },
  ];
  if (b.bilderUrl) {
    punkter.push({ hash: "bilder", ikon: "📷", tittel: t("btnBilderT"), under: t("btnBilderU") });
  }
  if (DATA.smalltalk?.sporsmal?.length) {
    punkter.push({ hash: "smalltalk", ikon: "💬", tittel: t("btnSmalltalkT"), under: t("btnSmalltalkU") });
  }
  if (DATA.santusant?.pastander?.length) {
    punkter.push({ hash: "santusant", ikon: "🤔", tittel: t("btnSantusantT"), under: t("btnSantusantU") });
  }
  if (DATA.vitser?.vitser?.length) {
    punkter.push({ hash: "vitser", ikon: "😂", tittel: t("btnVitserT"), under: t("btnVitserU") });
  }
  if (b.minnebokUrl) {
    punkter.push({ hash: "minnebok", ikon: "📖", tittel: t("btnMinnebokT"), under: t("btnMinnebokU") });
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

  // Kveldsmodus – låst til kl. 20:00
  if (DATA.kveld) {
    const aapen = erKveldAapen();
    const sett = kveldErSett();
    const kn = el(`<a class="stor-knapp kveld-knapp ${aapen ? "aapen" : "laast"}" href="#/kveld">
      <span class="ikon">${aapen ? "🍸" : "🔒"}</span>
      <span class="tekst">
        <span class="tittel">${esc(t("kveldTittel"))}${aapen && !sett ? ` <span class="nytt-merke">${esc(t("nytt"))}</span>` : ""}</span>
        <span class="under">${aapen ? esc(t("kveldAapenUnder")) : esc(t("kveldLaastUnder"))}</span>
      </span>
      <span class="pil">›</span>
    </a>`);
    knapper.append(kn);
  }

  app.append(knapper);

  // Banner hvis kvelden nettopp har åpnet og gjesten ikke har sett den ennå
  if (DATA.kveld && erKveldAapen() && !kveldErSett()) {
    const banner = el(`<div class="kveld-banner">${esc(t("kveldBanner"))}</div>`);
    banner.addEventListener("click", () => { location.hash = "#/kveld"; });
    app.append(banner);
  }

  app.append(el(`<p class="forside-bunn">${esc(t("forsideBunn"))}</p>`));

  // Diskré «easter egg»-lenke dedikert til familievennen Bjørn Olav
  if (DATA.bjornolav?.sporsmal?.length) {
    const lenke = el(`<a class="diskret-lenke" href="#/bjornolav">${esc(DATA.bjornolav.tittel || "Spør Bjørn Olav")}</a>`);
    app.append(lenke);
  }
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
  if (sider.length === 2) deler.push(t("vedSidenAv2", { a: `<b>${esc(over)}</b>`, b: `<b>${esc(under)}</b>` }));
  else if (sider.length === 1) deler.push(t("vedSidenAv1", { a: `<b>${esc(sider[0])}</b>` }));
  if (overfor) deler.push(t("rettOverfor", { x: `<b>${esc(overfor)}</b>` }));
  return deler.join(" ");
}

function visBordkart() {
  app.innerHTML = "";
  app.append(topplinje(t("btnPlassT")));

  const sok = el(`<div class="sok-boks">
    <input type="search" id="sokfelt" placeholder="${esc(t("sokPlaceholder"))}"
           autocomplete="off" autocapitalize="words" spellcheck="false"
           enterkeyhint="search" aria-label="${esc(t("sokAria"))}">
    <span class="sok-ikon">🔍</span>
  </div>`);
  app.append(sok);

  app.append(el(`<p class="tapp-hint">${esc(t("tappHint"))}</p>`));

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
      treffboks.append(el(`<p class="ingen-treff">${t("ingenTreff", { q: esc(felt.value) })}</p>`));
      return;
    }

    // Grupper treff på navn – hvis flere ULIKE navn matcher og de er mange,
    // be gjesten presisere. Hvis samme navn på flere bord, la dem velge bord.
    const unikeNavn = [...new Set(treff.map(p => p.navn))];

    if (unikeNavn.length > 1 && !valgtNavn) {
      // flere forskjellige navn matcher – vis kort valgliste
      const boks = el(`<div class="treff"><p>${esc(t("menteDu"))}</p><div class="velg-liste"></div></div>`);
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
        <p>${t("flereBord", { navn: `<b>${esc(treff[0].navn)}</b>` })}</p>
        <div class="velg-liste"></div>
      </div>`);
      const liste = boks.querySelector(".velg-liste");
      treff.forEach(p => {
        const btn = el(`<button>${esc(t("bord"))} ${p.bord.nummer} · ${esc(p.bord.navn)}</button>`);
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
      <p class="treff-bord">${esc(t("bord"))} ${p.bord.nummer} · ${esc(p.bord.navn)}</p>
      <p>${naboTekst(p)}</p>
      <p class="liten">${esc(t("plassMarkert"))}</p>
    </div>`);
    treffboks.append(kort);
    fremhev(p);
  }

  felt.addEventListener("input", () => { valgtNavn = null; oppdater(); });
  felt.addEventListener("search", oppdater);

  // Fyll ut automatisk hvis gjesten valgte navnet sitt ved innlogging
  const meg = gjestNavn();
  if (meg && reg.some((p) => norm(p.navn) === norm(meg))) {
    felt.value = meg;
    oppdater();
  } else {
    setTimeout(() => felt.focus(), 250);
  }
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
        <span class="bord-nr">${esc(t("bord"))} ${b.nummer}</span>
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
  p.dataset.navn = navn;
  if (DATA.bjornolav?.bordkort && navn === DATA.bjornolav.bordkort) p.classList.add("blink");
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
  meg.dataset.deg = t("deg");

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

function lagGnister(plate, flagg) {
  const emojis = ["✨", "🎉", "💫", "⭐", "🌟"];
  for (let i = 0; i < 7; i++) {
    const s = document.createElement("span");
    s.className = "gnist";
    // strø inn flagget innimellom for spesialgjester
    s.textContent = (flagg && i % 3 === 1) ? flagg : emojis[Math.floor(Math.random() * emojis.length)];
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
  setTimeout(() => boble.remove(), 3100);
}

function visHilsen(plate, spesial) {
  const liste = spesial.hilsener || [];
  if (!liste.length) return;
  const gammel = plate.querySelector(".utmerkelse");
  if (gammel) gammel.remove();
  const boble = document.createElement("div");
  boble.className = "utmerkelse hilsen";
  const tekst = liste[Math.floor(Math.random() * liste.length)];
  boble.textContent = (spesial.flagg ? spesial.flagg + " " : "") + tekst;
  plate.appendChild(boble);
  setTimeout(() => boble.remove(), 3100);
}

function moroPaaNavn(plate) {
  plate.classList.remove("sprett");
  void plate.offsetWidth;
  plate.classList.add("sprett");
  const navn = plate.dataset.navn || plate.textContent;
  const spesial = DATA.hilsener?.personer?.[navn];
  lagGnister(plate, spesial && spesial.flagg);
  if (spesial) visHilsen(plate, spesial);
  else visUtmerkelse(plate);
  spillTruddelutt();
}

/* ---------- Meny ---------- */
function visMeny() {
  app.innerHTML = "";
  app.append(topplinje(tr(DATA.meny?.tittel) || t("btnMenyT")));
  if (!DATA.meny) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  if (DATA.meny.undertittel) {
    app.append(el(`<div class="seksjon-topp"><p class="under">${esc(tr(DATA.meny.undertittel))}</p></div>`));
  }
  for (const r of DATA.meny.retter || []) {
    const kort = el(`<div class="rett">
      <span class="r-ikon">${r.ikon || "•"}</span>
      <div>
        <div class="r-type">${esc(tr(r.type))}</div>
        <div class="r-navn">${esc(tr(r.navn))}</div>
        <div class="r-besk">${esc(tr(r.beskrivelse))}</div>
        ${r.allergener ? `<div class="r-allergen">${esc(t("allergener"))} ${esc(tr(r.allergener))}</div>` : ""}
      </div>
    </div>`);
    app.append(kort);
  }
}

/* ---------- Program ---------- */
function visProgram() {
  app.innerHTML = "";
  app.append(topplinje(tr(DATA.program?.tittel) || t("btnProgramT")));
  if (!DATA.program) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  if (DATA.program.undertittel) {
    app.append(el(`<div class="seksjon-topp"><p class="under">${esc(tr(DATA.program.undertittel))}</p></div>`));
  }
  const linje = el(`<div class="tidslinje"></div>`);
  for (const p of DATA.program.poster || []) {
    const besk = tr(p.beskrivelse);
    const post = el(`<div class="post">
      <div class="p-tid">${esc(p.tid || "")}</div>
      <div class="p-innhold">
        <div class="p-tittel">${p.ikon ? `<span>${p.ikon}</span>` : ""}<span>${esc(tr(p.tittel))}</span></div>
        ${besk ? `<div class="p-besk">${esc(besk)}</div>` : ""}
      </div>
    </div>`);
    linje.append(post);
  }
  app.append(linje);
}

/* ---------- Bilder ---------- */
function visBilder() {
  app.innerHTML = "";
  app.append(topplinje(t("btnBilderT")));
  const url = DATA.gjester.bryllup?.bilderUrl;
  if (!url) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("bilderUndertittel"))}</p></div>`));
  const kort = el(`<div class="bilder-kort">
    <div class="bilder-ikon">📷</div>
    <p>${esc(t("bilderTekst"))}</p>
    <a class="album-knapp" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(t("bilderKnapp"))}</a>
    <p class="liten">${esc(t("bilderNote"))}</p>
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
  app.append(topplinje(t("btnSmalltalkT")));
  const alle = DATA.smalltalk?.sporsmal || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("smalltalkUnder"))}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">💬</div>
    <p class="moro-tekst" id="moro-tekst"></p>
    <button class="neste-knapp" id="moro-neste">${esc(t("smalltalkNy"))}</button>
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
  app.append(topplinje(t("btnVitserT")));
  const alle = DATA.vitser?.vitser || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("vitserUnder"))}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">😂</div>
    <p class="moro-tekst" id="moro-tekst"></p>
    <button class="neste-knapp" id="moro-neste">${esc(t("vitserNy"))}</button>
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
  app.append(topplinje(t("btnSantusantT")));
  const alle = DATA.santusant?.pastander || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("suUnder"))}</p></div>`));
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">🤔</div>
    <p class="moro-tekst" id="su-pastand"></p>
    <div class="su-svar" id="su-svar" hidden></div>
    <div class="su-knapper">
      <button class="neste-knapp lys" id="su-vis">${esc(t("suVisSvar"))}</button>
      <button class="neste-knapp" id="su-neste">${esc(t("suNy"))}</button>
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
      `<span class="su-merke ${sant ? "sant" : "usant"}">${esc(sant ? t("suSant") : t("suUsant"))}</span>` +
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

/* ---------- Kveldsmodus (låses opp kl. 20:00) ---------- */
const trekkKveldOppdrag = lagTrekker(() => DATA.kveld?.oppdrag);
const trekkKveldSmalltalk = lagTrekker(() => DATA.kveld?.smalltalk);
const trekkBjornOlav = lagTrekker(() => DATA.bjornolav?.sporsmal);

/* ---------- Spør Bjørn Olav (diskré dedikasjon) ---------- */
function visBoLaas() {
  const boks = el(`<div class="bo-laas">
    <div class="moro-emoji">🤫</div>
    <p class="bo-hint">Passord? Spør Bjørn Olav</p>
    <form class="laas-form" autocomplete="off">
      <input type="password" class="laas-felt" placeholder="Passord"
             autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Passord">
      <button type="submit" class="laas-knapp">Åpne</button>
    </form>
    <p class="laas-feil" hidden>Feil passord. Hint: spør Bjørn Olav! 😉</p>
  </div>`);
  app.append(boks);
  const felt = boks.querySelector(".laas-felt");
  const feil = boks.querySelector(".laas-feil");
  boks.querySelector(".laas-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (await passordStemmer(felt.value, PASS_BO)) {
      try { localStorage.setItem("boAdgang", "1"); } catch (_) {}
      visBjornOlav();
    } else {
      feil.hidden = false;
      boks.classList.remove("rist"); void boks.offsetWidth; boks.classList.add("rist");
      felt.select();
    }
  });
  setTimeout(() => felt.focus(), 150);
}

function visBjornOlav() {
  app.innerHTML = "";
  app.append(topplinje(DATA.bjornolav?.tittel || "Spør Bjørn Olav"));
  const alle = DATA.bjornolav?.sporsmal || [];
  if (!alle.length) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  if (!boLaastOpp()) { visBoLaas(); return; }
  if (DATA.bjornolav.undertittel) {
    app.append(el(`<div class="seksjon-topp"><p class="under">${esc(DATA.bjornolav.undertittel)}</p></div>`));
  }
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">😄</div>
    <p class="moro-tekst" id="moro-tekst"></p>
    <button class="neste-knapp" id="moro-neste">Nytt spørsmål →</button>
  </div>`);
  app.append(kort);
  const tekstEl = kort.querySelector("#moro-tekst");
  const vis = () => {
    tekstEl.textContent = trekkBjornOlav();
    tekstEl.classList.remove("fade-inn");
    void tekstEl.offsetWidth;
    tekstEl.classList.add("fade-inn");
  };
  kort.querySelector("#moro-neste").addEventListener("click", vis);
  vis();
}

// Forhåndsvisning: legg til ?kveld=1 i adressen for å låse opp uansett klokke
function erKveldForhaandsvis() {
  try { return new URLSearchParams(location.search).get("kveld") === "1"; } catch (_) { return false; }
}
function kveldMaaltid() {
  const t = DATA.gjester?.bryllup?.kveldLaasOpp;
  const ms = t ? new Date(t).getTime() : NaN;
  return isNaN(ms) ? null : ms;
}
function erKveldAapen() {
  if (erKveldForhaandsvis()) return true;
  const maal = kveldMaaltid();
  if (maal === null) return true; // mangler/ugyldig tid → vis heller enn å skjule
  return Date.now() >= maal;
}
function kveldErSett() { try { return localStorage.getItem("kveldSett") === "1"; } catch (_) { return false; } }
function markerKveldSett() { try { localStorage.setItem("kveldSett", "1"); } catch (_) {} }

let kveldVarslet = false;
let kveldTimer = null;
function startKveldvakt() {
  if (!DATA.kveld) return;
  if (erKveldAapen()) { kveldVarslet = true; return; } // allerede åpen ved lasting – ingen live-effekt
  if (kveldTimer) return;
  kveldTimer = setInterval(() => {
    if (erKveldAapen() && !kveldVarslet) {
      kveldVarslet = true;
      spillTruddelutt();
      if (location.hash.replace(/^#\/?/, "") === "") visForside();
      clearInterval(kveldTimer); kveldTimer = null;
    }
  }, 15000);
}

function visKveld() {
  app.innerHTML = "";
  app.append(topplinje(t("kveldTittel")));
  if (!DATA.kveld) { app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`)); return; }
  if (!erKveldAapen()) { visKveldLaast(); return; }

  markerKveldSett();
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("kveldUnder"))}</p></div>`));

  const faner = [];
  if (DATA.kveld.oppdrag?.length) faner.push({ id: "oppdrag", navn: t("fanOppdrag"), ikon: "🎯" });
  if (DATA.kveld.smalltalk?.length) faner.push({ id: "smalltalk", navn: t("fanSmalltalk"), ikon: "💬" });
  if (DATA.kveld.bingo?.ruter?.length) faner.push({ id: "bingo", navn: t("fanBingo"), ikon: "🕺" });

  const fanerad = el(`<div class="faner"></div>`);
  const innhold = el(`<div id="kveld-innhold"></div>`);
  faner.forEach((f) => {
    const knapp = el(`<button class="fane" data-id="${f.id}">${f.ikon} ${esc(f.navn)}</button>`);
    knapp.addEventListener("click", () => velgFane(f.id));
    fanerad.append(knapp);
  });
  app.append(fanerad);
  app.append(innhold);

  function velgFane(id) {
    [...fanerad.children].forEach((k) => k.classList.toggle("aktiv", k.dataset.id === id));
    if (id === "oppdrag") tegnKveldTrekk(innhold, "🎯", t("kveldNyOppdrag"), trekkKveldOppdrag);
    else if (id === "smalltalk") tegnKveldTrekk(innhold, "💬", t("kveldNySporsmal"), trekkKveldSmalltalk);
    else if (id === "bingo") tegnBingo(innhold);
  }
  if (faner.length) velgFane(faner[0].id);
}

function tegnKveldTrekk(container, emoji, knappTekst, trekker) {
  container.innerHTML = "";
  const kort = el(`<div class="moro-kort">
    <div class="moro-emoji">${emoji}</div>
    <p class="moro-tekst" id="kv-tekst"></p>
    <button class="neste-knapp" id="kv-neste">${esc(knappTekst)}</button>
  </div>`);
  container.append(kort);
  const t = kort.querySelector("#kv-tekst");
  const vis = () => {
    t.textContent = trekker();
    t.classList.remove("fade-inn");
    void t.offsetWidth;
    t.classList.add("fade-inn");
  };
  kort.querySelector("#kv-neste").addEventListener("click", vis);
  vis();
}

function visKveldLaast() {
  const boks = el(`<div class="kveld-laast">
    <div class="laas-ikon">🔒</div>
    <p class="laast-tittel">${esc(t("kveldLaastTittel"))}</p>
    <p class="laast-under">${esc(t("kveldLaastUnder2"))}</p>
    <p class="nedtelling" id="nedtelling"></p>
  </div>`);
  app.append(boks);
  const ned = boks.querySelector("#nedtelling");
  const maal = kveldMaaltid();
  const oppdater = () => {
    if (maal === null) { ned.textContent = ""; return; }
    const diff = maal - Date.now();
    if (diff <= 0) { visKveld(); return; }
    const tim = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    ned.textContent = t("aapnerOm", { t: tim, m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
  };
  oppdater();
  const iv = setInterval(() => {
    if (!document.body.contains(boks)) { clearInterval(iv); return; }
    oppdater();
  }, 1000);
}

/* ---- Dansegulv-bingo ---- */
function bingoKort() {
  const pool = DATA.kveld.bingo.ruter || [];
  const gratis = DATA.kveld.bingo.gratis || "Gratis";
  let lagret = null;
  try { lagret = JSON.parse(localStorage.getItem("bingoKort") || "null"); } catch (_) {}
  if (Array.isArray(lagret) && lagret.length === 9) return lagret;
  const valgt = stokk(pool).slice(0, 8);
  const kort = [];
  let v = 0;
  for (let i = 0; i < 9; i++) kort.push(i === 4 ? gratis : (valgt[v++] ?? "—"));
  try { localStorage.setItem("bingoKort", JSON.stringify(kort)); } catch (_) {}
  return kort;
}
function tomtBingoMerke() { return [false, false, false, false, true, false, false, false, false]; }
function bingoMerker() {
  let m = null;
  try { m = JSON.parse(localStorage.getItem("bingoMerket") || "null"); } catch (_) {}
  if (!Array.isArray(m) || m.length !== 9) m = tomtBingoMerke();
  m[4] = true;
  return m;
}
function lagreBingoMerker(m) { try { localStorage.setItem("bingoMerket", JSON.stringify(m)); } catch (_) {} }
function erBingo(m) {
  const linjer = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return linjer.some((l) => l.every((i) => m[i]));
}
function tegnBingo(container) {
  container.innerHTML = "";
  const kort = bingoKort();
  let merker = bingoMerker();
  let bingoVist = erBingo(merker);

  const info = el(`<p class="bingo-info">${esc(t("bingoInstr"))}</p>`);
  const grid = el(`<div class="bingo-grid"></div>`);
  const status = el(`<div class="bingo-status" id="bingo-status"></div>`);
  const nullstill = el(`<button class="neste-knapp lys" id="bingo-null">${esc(t("bingoNullstill"))}</button>`);
  container.append(info, grid, status, nullstill);

  const oppdaterStatus = () => {
    if (erBingo(merker)) status.innerHTML = `<span class="bingo-rop">${esc(t("bingoRop"))}</span>`;
    else status.textContent = t("bingoStatus", { n: merker.filter(Boolean).length });
  };
  const tegnCeller = () => {
    grid.innerHTML = "";
    kort.forEach((tekst, i) => {
      const c = el(`<button class="bingo-celle ${merker[i] ? "merket" : ""} ${i === 4 ? "gratis" : ""}">${esc(tekst)}</button>`);
      c.addEventListener("click", () => {
        if (i === 4) return;
        merker[i] = !merker[i];
        lagreBingoMerker(merker);
        c.classList.toggle("merket", merker[i]);
        oppdaterStatus();
        if (!bingoVist && erBingo(merker)) { bingoVist = true; spillTruddelutt(); }
      });
      grid.append(c);
    });
  };
  nullstill.addEventListener("click", () => {
    merker = tomtBingoMerke();
    lagreBingoMerker(merker);
    bingoVist = false;
    tegnCeller();
    oppdaterStatus();
  });
  tegnCeller();
  oppdaterStatus();
}

/* ---------- Minnebok (skriver til Google Sheet) ---------- */
async function sendMinnebok(url, navn, tekst) {
  const body = new URLSearchParams({
    action: "minnebok",
    navn: navn || "",
    tekst: tekst,
    submittedAt: new Date().toISOString(),
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    // Google Apps Script svarer uten CORS-hoder → no-cors (svaret blir ugjennomsiktig)
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function visMinnebok() {
  app.innerHTML = "";
  app.append(topplinje(t("btnMinnebokT")));
  const url = DATA.gjester?.bryllup?.minnebokUrl;
  if (!url) {
    app.append(el(`<div class="beskjed">${esc(t("komSnart"))}</div>`));
    return;
  }
  app.append(el(`<div class="seksjon-topp"><p class="under">${esc(t("minnebokIntro"))}</p></div>`));

  const kort = el(`<div class="minnebok-kort">
    <form class="minnebok-form" autocomplete="off">
      <input type="text" class="mb-navn" maxlength="60"
             placeholder="${esc(t("minnebokNavn"))}" aria-label="${esc(t("minnebokNavn"))}">
      <textarea class="mb-tekst" rows="5" maxlength="600"
                placeholder="${esc(t("minnebokTekst"))}" aria-label="${esc(t("minnebokTekst"))}"></textarea>
      <p class="mb-feil" hidden></p>
      <button type="submit" class="mb-send">${esc(t("minnebokSend"))}</button>
    </form>
  </div>`);
  app.append(kort);

  const form = kort.querySelector(".minnebok-form");
  const navnEl = kort.querySelector(".mb-navn");
  const tekstEl = kort.querySelector(".mb-tekst");
  const feilEl = kort.querySelector(".mb-feil");
  const sendKnapp = kort.querySelector(".mb-send");

  navnEl.value = gjestNavn(); // ferdig utfylt hvis gjesten valgte navn ved innlogging

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tekst = tekstEl.value.trim();
    feilEl.hidden = true;
    if (!tekst) {
      feilEl.textContent = t("minnebokTomFeil");
      feilEl.hidden = false;
      tekstEl.focus();
      return;
    }
    sendKnapp.disabled = true;
    sendKnapp.textContent = t("minnebokSender");
    try {
      await sendMinnebok(url, navnEl.value.trim(), tekst);
      visMinnebokTakk(kort);
    } catch (_) {
      feilEl.textContent = t("minnebokFeil");
      feilEl.hidden = false;
      sendKnapp.disabled = false;
      sendKnapp.textContent = t("minnebokSend");
    }
  });
  setTimeout(() => tekstEl.focus(), 200);
}

function visMinnebokTakk(kort) {
  kort.innerHTML = `<div class="mb-takk">
    <div class="mb-takk-ikon">💛</div>
    <p class="mb-takk-tittel">${esc(t("minnebokTakk"))}</p>
    <p class="mb-takk-under">${esc(t("minnebokTakkUnder"))}</p>
    <button class="neste-knapp lys" id="mb-igjen">${esc(t("minnebokIgjen"))}</button>
  </div>`;
  kort.querySelector("#mb-igjen").addEventListener("click", () => visMinnebok());
  kort.classList.add("fade-inn");
}

start();
