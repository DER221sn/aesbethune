// ===== 1. Menu mobile =====
const burger = document.querySelector(".burger");
const menu = document.querySelector("#menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const ouvert = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", ouvert);
  });
}

// ===== 2. Événements lus depuis data/events.json =====
function formaterDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function creerCarte(ev) {
  // On utilise textContent (jamais innerHTML) : ça évite d'injecter du code par erreur.
  const carte = document.createElement("article");
  carte.className = "event";

  const img = document.createElement("div");
  img.className = "event-img";
  if (ev.image) {
    const photo = document.createElement("img");
    photo.src = ev.image;
    photo.alt = ev.titre;
    photo.loading = "lazy";
    img.appendChild(photo);
  } else {
    img.textContent = "Photo à venir";
  }

  const corps = document.createElement("div");
  corps.className = "event-body";
  const meta = document.createElement("p");
  meta.className = "event-meta";
  meta.textContent = formaterDate(ev.date) + " · " + ev.lieu;
  const titre = document.createElement("h3");
  titre.textContent = ev.titre;
  const desc = document.createElement("p");
  desc.textContent = ev.description;

  corps.append(meta, titre, desc);
  carte.append(img, corps);
  return carte;
}

async function afficherEvenements() {
  const conteneurs = document.querySelectorAll("[data-mode]");
  if (!conteneurs.length) return;
  try {
    const reponse = await fetch("data/events.json");
    const evenements = await reponse.json();
    const aujourdhui = new Date().toISOString().slice(0, 10);

    conteneurs.forEach((zone) => {
      const mode = zone.dataset.mode;
      let liste = evenements.filter((e) => (mode === "upcoming" ? e.date >= aujourdhui : e.date < aujourdhui));
      liste.sort((a, b) => (mode === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
      if (zone.dataset.limit) liste = liste.slice(0, Number(zone.dataset.limit));

      zone.replaceChildren();
      if (!liste.length) {
        zone.textContent = mode === "upcoming" ? "Aucun événement prévu pour le moment." : "Aucun événement passé.";
        return;
      }
      liste.forEach((ev) => zone.appendChild(creerCarte(ev)));
    });
  } catch (erreur) {
    conteneurs.forEach((z) => (z.textContent = "Impossible de charger les événements."));
  }
}
afficherEvenements();

// ===== 3. Formulaire de contact : envoi sans quitter la page =====
const formulaire = document.querySelector("#contact-form");
if (formulaire) {
  const statut = document.querySelector("#form-status");
  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    statut.className = "";
    statut.textContent = "Envoi en cours…";
    try {
      const reponse = await fetch(formulaire.action, {
        method: "POST",
        body: new FormData(formulaire),
        headers: { Accept: "application/json" },
      });
      if (!reponse.ok) throw new Error();
      formulaire.reset();
      statut.className = "ok";
      statut.textContent = "Message envoyé. Merci, nous vous répondrons bientôt.";
    } catch {
      statut.className = "erreur";
      statut.textContent = "L'envoi a échoué. Réessayez plus tard.";
    }
  });
}


// ===== 4. Page bureau : membres lus depuis data/bureau.json =====
function initiales(nom) {
  return nom.split(" ").filter(Boolean).slice(0, 2).map((mot) => mot[0].toUpperCase()).join("");
}

function creerMembre(membre, index) {
  const couleurs = ["", "member-or", "member-rouge"]; // vert, or, rouge en alternance
  const carte = document.createElement("article");
  carte.className = "member " + couleurs[index % 3];

  const photo = document.createElement("div");
  photo.className = "member-photo";
  if (membre.photo) {
    const img = document.createElement("img");
    img.src = membre.photo;
    img.alt = "Portrait de " + membre.nom;
    img.loading = "lazy";
    photo.appendChild(img);
  } else {
    photo.textContent = initiales(membre.nom); // pas de photo : on affiche les initiales
    photo.setAttribute("aria-hidden", "true");
  }

  const nom = document.createElement("h2");
  nom.textContent = membre.nom;
  const role = document.createElement("span");
  role.className = "member-role";
  role.textContent = membre.role;
  const desc = document.createElement("p");
  desc.textContent = membre.description;

  carte.append(photo, nom, role, desc);
  return carte;
}

async function afficherBureau() {
  const zone = document.querySelector("#bureau-list");
  if (!zone) return;
  try {
    const reponse = await fetch("data/bureau.json");
    const membres = await reponse.json();
    zone.replaceChildren(...membres.map(creerMembre));
  } catch (erreur) {
    zone.textContent = "Impossible de charger le bureau.";
  }
}
afficherBureau();
