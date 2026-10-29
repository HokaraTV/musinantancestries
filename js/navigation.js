/* =====================================================================
   navigation.js : choisir la page à afficher d'après l'adresse
   ---------------------------------------------------------------------
   Le site n'a qu'un seul fichier HTML. Les « pages » sont affichées selon la
   partie de l'adresse qui suit le # (par exemple index.html#/nain/dons).
   Ce fichier lit cette partie, décide quelle page afficher, et la réaffiche
   chaque fois que l'adresse change.
 
   Adresses reconnues :
     #/                           accueil
     #/nain                       fiche, onglet Présentation
     #/nain/heritages             fiche, onglet Héritages
     #/nain/dons                  fiche, onglet Dons
     #/nain/don/clan-lore         détail d'un don
     #/nain/heritage/rock-dwarf   détail d'un héritage
   Toute adresse inconnue renvoie vers une page existante (voir route).
 
   Dépend de : outils.js (view, slug), composants.js (liste),
               pages.js (accueil, fiche, detail) et de ESPECES (data/).
   Ordre de chargement : EN DERNIER. Ce fichier affiche la première page dès
   son chargement (l'appel route() en bas), donc tout le reste doit déjà
   exister.
   ===================================================================== */

/* ---------------------------------------------------------------------
   route() : lit l'adresse et affiche la bonne page
   1. On prend ce qui suit le # (location.hash), on retire le « #/ » du début,
      on coupe aux « / » et on décode les caractères spéciaux.
      Exemple : "#/nain/don/clan-lore" donne q = ["nain", "don", "clan-lore"]
        q[0] = l'espèce   q[1] = l'onglet ou le type   q[2] = l'élément
   2. i : position de l'espèce dont slug(nom) correspond à q[0]
      (-1 si aucune ne correspond).
   3. j : position, dans la liste de cette espèce, de l'élément dont
      slug(titre) correspond à q[2] (-1 si aucun, ou si l'espèce est inconnue).
   4. Choix de la page, du plus précis au moins précis :
        élément trouvé (j ≥ 0)   → detail()
        espèce trouvée (i ≥ 0)   → fiche(), onglet demandé s'il est valide
                                   (heritages ou dons), sinon Présentation
        sinon                    → accueil()
      Une faute dans l'adresse ne casse donc jamais le site : par exemple
      #/nain/xyz ouvre la fiche du Nain, et #/inconnu ouvre l'accueil.
   5. scrollTo(0, 0) remonte en haut de la page à chaque changement, comme le
      ferait une vraie navigation.
   --------------------------------------------------------------------- */
function route() {
  const q = location.hash
    .replace(/^#\/?/, "")
    .split("/")
    .map(decodeURIComponent);
  const i = ESPECES.findIndex((e) => slug(e.nom) === q[0]);
  const j =
    i >= 0
      ? liste(ESPECES[i], q[1]).findIndex((x) => slug(x.titre) === q[2])
      : -1;
  j >= 0
    ? detail(i, q[1], j)
    : i >= 0
      ? fiche(i, ["heritages", "dons"].includes(q[1]) ? q[1] : "presentation")
      : accueil();
  scrollTo(0, 0);
}

/* ---------------------------------------------------------------------
   Lignes de tableau cliquables
   Dans le tableau des dons, un clic n'importe où sur la ligne ouvre le don,
   pas seulement sur son titre : on cherche le lien de la ligne et on le
   déclenche.
   Si le clic est déjà tombé sur un lien, on ne fait rien : le navigateur
   l'ouvre lui-même, et le déclencher une seconde fois serait inutile.
   --------------------------------------------------------------------- */
view.addEventListener("click", (e) => {
  const r = e.target.closest(".d-row");
  if (!r || e.target.closest("a")) return;
  const a = r.querySelector("a");
  if (a) a.click();
});

/* ---------------------------------------------------------------------
   Démarrage et suivi de l'adresse
   - hashchange : se déclenche quand la partie après # change (clic sur un
     lien du site, boutons Précédent/Suivant du navigateur, adresse collée).
     On réaffiche alors la bonne page.
   - route() : premier affichage, au chargement. Sans lui, la page resterait
     vide jusqu'au premier clic. Si la personne ouvre directement une adresse
     comme index.html#/nain/dons, c'est lui qui affiche la bonne page.
   --------------------------------------------------------------------- */
addEventListener("hashchange", route);
route();
