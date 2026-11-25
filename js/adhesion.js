// Page adhésion : envoi du formulaire de partenariat et boutons sans lien pour l'instant.

// 1. Un bouton dont le lien est encore "#" ne doit pas faire remonter la page.
document.querySelectorAll("[data-lien-vide]").forEach((lien) => {
  lien.addEventListener("click", (e) => {
    if (lien.getAttribute("href") === "#") e.preventDefault();
  });
});

// 2. Formulaire de partenariat (Formspree). Plus tard, il suffira de changer l'adresse "action" du formulaire.
const form = document.querySelector("#partner-form");
if (form) {
  const statut = document.getElementById(form.dataset.statut);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statut.className = "";
    statut.textContent = "Envoi en cours…";
    try {
      const reponse = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!reponse.ok) throw new Error();
      form.reset();
      statut.className = "ok";
      statut.textContent = "Merci ! Votre proposition a bien été envoyée. Nous vous répondrons bientôt.";
    } catch {
      statut.className = "erreur";
      statut.textContent = "L'envoi a échoué. Réessayez plus tard.";
    }
  });
}
