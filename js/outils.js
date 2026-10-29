/* =====================================================================
   outils.js : petits outils de base, utilisés par tous les autres fichiers
   ---------------------------------------------------------------------
   Aucune de ces fonctions ne construit de page : elles nettoient, simplifient
   ou transforment du texte. Elles ne dépendent de rien, sauf de l'élément
   <main id="view"> qui doit déjà exister dans la page.
 
   Ordre de chargement : ce fichier passe EN PREMIER parmi les fichiers de
   code, et en bas du <body> (après <main id="view">).
   ===================================================================== */
 
 
/* ---------------------------------------------------------------------
   view : la zone de la page que le code remplit
   Les pages (accueil, fiche, détail) sont écrites dans cet élément, et les
   écouteurs des filtres y sont posés.
   Attention : vaut null si <main id="view"> n'existe pas encore au chargement.
   --------------------------------------------------------------------- */
const view = document.getElementById("view");
 
 
/* ---------------------------------------------------------------------
   esc(texte) : rend un texte sûr pour un ATTRIBUT HTML
   Remplace & < > " par leurs codes (&amp; &lt; &gt; &quot;), pour qu'un
   guillemet dans un texte ne casse pas src="…", alt="…" ou data-…="…".
   Exemple : esc('Le "Nain" <3')  →  Le &quot;Nain&quot; &lt;3
   Utilisé par : portrait (src et alt), ligneDon (attributs data-), feats
   (valeurs des menus déroulants).
   --------------------------------------------------------------------- */
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
 
 
/* ---------------------------------------------------------------------
   html(texte) : insère un texte AVEC ses balises
   Ne modifie rien : si tes données contiennent <i>, <b> ou <a>, elles seront
   interprétées par le navigateur. Elle sert à marquer, dans le code, les
   endroits où l'on accepte volontairement du HTML.
   Exemple : html("<i>Low-light Vision</i>")  →  <i>Low-light Vision</i>
   Attention : à réserver à du contenu que tu as écrit toi-même, car un texte
   venant d'ailleurs pourrait contenir du code malveillant.
   Utilisé par : presque toutes les fonctions qui écrivent du contenu.
   --------------------------------------------------------------------- */
const html = (s) => String(s);
 
 
/* ---------------------------------------------------------------------
   txt(texte) : retire toutes les balises, pour garder du texte simple
   Exemple : txt("<i>Low-light</i> Vision")  →  Low-light Vision
   Utilisé par : le titre de l'onglet du navigateur (document.title), slug
   et norm (ci-dessous), et l'attribut alt des images.
   --------------------------------------------------------------------- */
const txt = (s) => String(s).replace(/<[^>]*>/g, "");
 
 
/* ---------------------------------------------------------------------
   slug(nom) : fabrique un morceau d'adresse propre à partir d'un nom
   Étapes : retire les balises, met en minuscules, enlève les accents, puis
   remplace tout ce qui n'est ni lettre ni chiffre par un tiret.
   Exemples : slug("Clan’s Edge")  →  clan-s-edge
              slug("Écho de pierre")  →  echo-de-pierre
   Utilisé par : les liens et la navigation (#/nain/don/clan-lore).
   Dépend de : txt (doit être défini plus haut).
   --------------------------------------------------------------------- */
const slug = (n) =>
  txt(n)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
 
 
/* ---------------------------------------------------------------------
   hue(position) : donne une teinte (de 0 à 360) à chaque espèce
   Sert de fond coloré quand une espèce n'a pas d'image (variable CSS --h).
   La position 0 donne 200 (bleu), la 1 donne 240, et ainsi de suite, avec un
   retour à 0 après 360.
   Exemple : hue(0) → 200   |   hue(1) → 240   |   hue(4) → 0
   Utilisé par : portrait.
   --------------------------------------------------------------------- */
const hue = (i) => (i * 40 + 200) % 360;
 
 
/* ---------------------------------------------------------------------
   norm(texte) : texte simplifié pour CHERCHER et COMPARER
   Retire les balises, passe en minuscules et enlève les accents, pour que
   « Écho », « écho » et « echo » soient considérés comme identiques.
   Exemple : norm("<i>Écho</i> de Pierre")  →  echo de pierre
   Utilisé par : la recherche et les filtres des dons (ligneDon, feats,
   filtrer).
   Dépend de : txt.
   --------------------------------------------------------------------- */
const norm = (t) =>
  txt(t)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
 
 
/* ---------------------------------------------------------------------
   livre(source) : isole le nom du livre dans une source
   Retire « pg. » et le numéro de page qui suit. Accepte une valeur vide
   (renvoie alors un texte vide, sans erreur).
   Exemples : livre("Player Core pg. 43")  →  Player Core
              livre("")  →  (texte vide)
   Utilisé par : le menu « Tous les livres » et le tableau des dons.
   --------------------------------------------------------------------- */
const livre = (t) =>
  String(t || "")
    .replace(/\s+pg\..*$/, "")
    .trim();