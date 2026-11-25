// Galerie photos : lit data/gallery.json, filtre par événement, ouvre une visionneuse.
const zone = document.querySelector("#gallery");
const filtres = document.querySelector("#filters");
const boite = document.querySelector("#lightbox");

if (zone && boite) {
  const imgGrande = boite.querySelector("#lb-img");
  const legende = boite.querySelector("#lb-cap");
  let toutes = [];   // toutes les photos
  let visibles = []; // photos du filtre actuel
  let courante = 0;

  function formaterDate(iso) {
    return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  function texteLegende(p) {
    return [p.evenement, p.date ? formaterDate(p.date) : ""].filter(Boolean).join(" · ");
  }

  function afficherPhotos(liste) {
    visibles = liste;
    zone.replaceChildren();
    if (!liste.length) {
      zone.textContent = "Les photos arrivent bientôt.";
      return;
    }
    liste.forEach((photo, i) => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "thumb";
      bouton.setAttribute("aria-label", "Agrandir : " + photo.alt);
      const img = document.createElement("img");
      img.src = photo.fichier;
      img.alt = photo.alt;
      img.loading = "lazy";
      bouton.appendChild(img);
      bouton.addEventListener("click", () => ouvrir(i));
      zone.appendChild(bouton);
    });
  }

  function creerFiltres() {
    const evenements = [...new Set(toutes.map((p) => p.evenement).filter(Boolean))];
    if (evenements.length < 2) return; // inutile s'il n'y a qu'un événement
    ["Tous", ...evenements].forEach((nom, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "filter";
      b.textContent = nom;
      b.setAttribute("aria-pressed", i === 0);
      b.addEventListener("click", () => {
        filtres.querySelectorAll(".filter").forEach((x) => x.setAttribute("aria-pressed", x === b));
        afficherPhotos(i === 0 ? toutes : toutes.filter((p) => p.evenement === nom));
      });
      filtres.appendChild(b);
    });
  }

  function montrer(i) {
    courante = (i + visibles.length) % visibles.length;
    const p = visibles[courante];
    imgGrande.src = p.fichier;
    imgGrande.alt = p.alt;
    legende.textContent = texteLegende(p);
  }

  function ouvrir(i) {
    montrer(i);
    boite.showModal(); // le navigateur gère le focus et la touche Échap
  }

  boite.querySelector(".lb-close").addEventListener("click", () => boite.close());
  boite.querySelector(".lb-prev").addEventListener("click", () => montrer(courante - 1));
  boite.querySelector(".lb-next").addEventListener("click", () => montrer(courante + 1));
  boite.addEventListener("click", (e) => { if (e.target === boite) boite.close(); }); // clic à côté
  boite.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") montrer(courante - 1);
    if (e.key === "ArrowRight") montrer(courante + 1);
  });

  fetch("data/gallery.json")
    .then((r) => r.json())
    .then((donnees) => {
      toutes = donnees.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      creerFiltres();
      afficherPhotos(toutes);
    })
    .catch(() => { zone.textContent = "Impossible de charger la galerie."; });
}
