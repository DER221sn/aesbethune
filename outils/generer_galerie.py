#!/usr/bin/env python3
"""
Génère data/gallery.json à partir des dossiers de photos.

Organisation attendue (un sous-dossier par événement) :
    images/galerie/soiree-de-jeux/   <- vos photos de la soirée
    images/galerie/match-lens/       <- vos photos du match

Le script :
  1. renomme les photos proprement (soiree-de-jeux-01.jpg, -02.jpg…) : plus d'espaces ni de "(1)" ;
  2. met de côté les doublons exacts dans images/galerie/_doublons_a_supprimer/ ;
  3. écrit data/gallery.json.

Utilisation (à la racine du projet) :   python outils/generer_galerie.py
"""
import hashlib
import json
from pathlib import Path

# ====== À MODIFIER : un bloc par événement ======
# Clé = nom du sous-dossier dans images/galerie/
EVENEMENTS = {
    "soiree-de-jeux": {
        "titre": "Soirée de jeux",
        "date": "2026-11-10",          # AAAA-MM-JJ : vérifiez-la
        "alt": "Membres de l'AESB réunis lors de la soirée de jeux",
    },
    "match-lens": {
        "titre": "Match amical de foot contre Lens",
        "date": "2026-11-11",          # AAAA-MM-JJ : vérifiez-la
        "alt": "Match amical de football entre les étudiants de Béthune et de Lens",
    },
}
# =================================================

RACINE = Path(__file__).resolve().parent.parent
GALERIE = RACINE / "images" / "galerie"
DOUBLONS = GALERIE / "_doublons_a_supprimer"
SORTIE = RACINE / "data" / "gallery.json"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def empreinte(chemin):
    return hashlib.md5(chemin.read_bytes()).hexdigest()


def main():
    entrees = []
    for dossier, infos in EVENEMENTS.items():
        d = GALERIE / dossier
        if not d.is_dir():
            print(f"[!] Dossier introuvable, ignoré : {d}")
            continue

        # 1. Photos du dossier, doublons exacts mis de côté
        vues, uniques = set(), []
        for f in sorted(p for p in d.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS):
            h = empreinte(f)
            if h in vues:
                DOUBLONS.mkdir(exist_ok=True)
                f.rename(DOUBLONS / f"{dossier}-{f.name}")
                print(f"Doublon mis de côté : {f.name}")
                continue
            vues.add(h)
            uniques.append(f)

        # 2. Renommage en deux temps (évite les collisions de noms)
        temporaires = []
        for i, f in enumerate(uniques, 1):
            t = f.with_name(f"__tmp{i}{f.suffix.lower()}")
            f.rename(t)
            temporaires.append(t)
        for i, t in enumerate(temporaires, 1):
            ext = ".jpg" if t.suffix.lower() == ".jpeg" else t.suffix.lower()
            final = d / f"{dossier}-{i:02d}{ext}"
            t.rename(final)
            entrees.append({
                "fichier": f"images/galerie/{dossier}/{final.name}",
                "alt": f"{infos['alt']} ({i})",
                "evenement": infos["titre"],
                "date": infos["date"],
            })
        print(f"{dossier} : {len(uniques)} photo(s)")

    SORTIE.write_text(json.dumps(entrees, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n{len(entrees)} photo(s) écrite(s) dans {SORTIE}")


if __name__ == "__main__":
    main()
