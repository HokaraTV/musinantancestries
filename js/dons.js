/* =====================================================================
   dons.js : l'onglet « Dons » d'une fiche d'espèce, avec ses filtres
   ---------------------------------------------------------------------
   Ce fichier contient le CODE d'affichage. Le CONTENU (la liste des dons)
   est dans data/dons.js : ne pas confondre les deux.
 
   Il fait quatre choses :
     1. construire les tableaux de dons, un bloc repliable par niveau ;
     2. construire la barre de filtres (recherche, rareté, livre, prérequis) ;
     3. appliquer les filtres en masquant les lignes qui ne correspondent pas ;
     4. écouter les actions de l'utilisateur (frappe, menus, boutons).
 
   Dépend de : outils.js (view, esc, html, norm, livre)
               composants.js (liste, lien).
   Ordre de chargement : après composants.js. Comme ce fichier pose des
   écouteurs sur « view » dès son chargement, <main id="view"> doit déjà
   exister dans la page.
   ===================================================================== */
 
 
/* ---------------------------------------------------------------------
   F : l'état des filtres
   Garde en mémoire ce que l'utilisateur a choisi, pour pouvoir le remettre
   dans les champs quand l'onglet est réaffiché.
     q : texte recherché          r : rareté ("", "common" ou "uncommon")
     s : livre (déjà simplifié)   p : « Sans prérequis » coché (vrai/faux)
   Une valeur vide ("" ou false) signifie « ce filtre n'est pas actif ».
   --------------------------------------------------------------------- */
const F = { q: "", r: "", s: "", p: false };
 
 
/* ---------------------------------------------------------------------
   ligneDon(espèce, don) : une ligne du tableau des dons
   Affiche le nom (cliquable), le prérequis (« — » s'il n'y en a pas) et le
   livre de la source (sans le numéro de page).
   Les attributs data-… sont des « étiquettes » cachées, déjà simplifiées,
   que filtrer() compare aux filtres sans avoir à relire les données :
     data-n : le nom, pour la recherche
     data-r : "uncommon" si le don a ce trait, sinon "common"
     data-s : le livre, pour le menu « Tous les livres »
     data-p : 1 s'il y a un prérequis, 0 sinon
   Utilisé par : feats().
   --------------------------------------------------------------------- */
const ligneDon = (e, x) =>
  `<tr class="d-row" data-n="${esc(norm(x.titre))}" data-r="${(x.traits || []).includes("Uncommon") ? "uncommon" : "common"}" data-s="${esc(norm(livre(x.source)))}" data-p="${x.prereq ? 1 : 0}"><th scope="row" class="d-name">${lien(e, "don", x)}</th><td class="d-pre">${html(x.prereq || "—")}</td><td class="d-src">${html(livre(x.source))}</td></tr>`;
 
 
/* ---------------------------------------------------------------------
   feats(espèce) : tout le contenu de l'onglet Dons
   Dans l'ordre, la fonction produit :
     1. la barre de filtres : recherche, rareté, livre (menu rempli avec les
        livres réellement présents), case « Sans prérequis » ;
     2. la barre de boutons : Réinitialiser, Tout déplier, Tout replier,
        avec le compteur de dons à gauche ;
     3. un bloc repliable <details> par niveau présent, ouvert au départ,
        contenant son tableau (nombre de dons dans la pastille) ;
     4. un message « Aucun don ne correspond… », caché tant qu'il reste des
        résultats.
   Si l'espèce n'a aucun don, renvoie un texte vide : c'est fiche() qui
   affiche alors « Aucun don renseigné. ».
   Les niveaux et les livres sont déduits des données : ajouter un don d'un
   nouveau niveau ou d'un nouveau livre crée automatiquement le bloc ou
   l'entrée du menu correspondant.
   --------------------------------------------------------------------- */
const feats = (e) => {
  if (!(e.dons && e.dons.length)) return "";
  const L = liste(e, "don"),
    // livres : noms de livres sans doublon, triés (pour le menu déroulant)
    livres = [
      ...new Set(L.map((x) => livre(x.source)).filter(Boolean)),
    ].sort(),
    // niveaux : niveaux présents, sans doublon (dans l'ordre des dons triés)
    niveaux = [...new Set(L.map((x) => x.niveau))];
  return (
    `<div class="filtres" role="search"><input type="search" id="f-q" placeholder="Rechercher un don…" aria-label="Rechercher un don" autocomplete="off"><select id="f-rare" aria-label="Rareté"><option value="">Toutes raretés</option><option value="common">Common</option><option value="uncommon">Uncommon</option></select><select id="f-src" aria-label="Livre source"><option value="">Tous les livres</option>${livres.map((l) => `<option value="${esc(norm(l))}">${html(l)}</option>`).join("")}</select><label class="f-chk"><input type="checkbox" id="f-pre"> Sans prérequis</label></div>
  <div class="f-bar"><p class="f-count" id="f-count" aria-live="polite"></p><div><button type="button" class="f-btn" id="f-reset">Réinitialiser</button><button type="button" class="f-btn" data-fold="open">Tout déplier</button><button type="button" class="f-btn" data-fold="close">Tout replier</button></div></div>` +
    niveaux
      .map((n) => {
        const g = L.filter((x) => x.niveau === n);
        return `<details class="grp" open><summary><span class="lvl">${html(n)}</span>Niveau ${html(n)}<span class="g-count">${g.length}</span></summary><div class="tablewrap"><table class="dons"><thead><tr><th>Don</th><th>Prérequis</th><th>Source</th></tr></thead><tbody>${g.map((x) => ligneDon(e, x)).join("")}</tbody></table></div></details>`;
      })
      .join("") +
    `<p class="f-none" id="f-none" hidden>Aucun don ne correspond à ces filtres.</p>`
  );
};
 
 
/* ---------------------------------------------------------------------
   filtrer() : applique les filtres à toutes les lignes de dons
   Une ligne reste visible seulement si elle respecte TOUS les filtres
   actifs (les filtres vides sont ignorés) :
     - recherche : le nom contient le texte (sans accents ni majuscules) ;
     - rareté : correspond au choix du menu ;
     - livre : correspond au choix du menu ;
     - « Sans prérequis » : seulement les dons qui n'en ont pas.
   Au passage, la fonction met à jour :
     - la pastille de chaque niveau (nombre de dons visibles) ;
     - le niveau lui-même, masqué s'il ne lui reste aucun don ;
     - le compteur général (« 35 dons », ou « 12 / 35 dons » si filtré) ;
     - le message « Aucun don ne correspond… », affiché si tout est masqué.
   Elle masque les lignes (attribut hidden) au lieu de les supprimer : les
   données ne sont jamais recalculées, donc c'est rapide.
   --------------------------------------------------------------------- */
function filtrer() {
  const q = norm(F.q).trim();
  let tot = 0, // total de dons
    vis = 0; // dons visibles
  view.querySelectorAll(".grp").forEach((g) => {
    let n = 0; // dons visibles dans ce niveau
    g.querySelectorAll(".d-row").forEach((r) => {
      tot++;
      const d = r.dataset,
        ok =
          (!q || d.n.includes(q)) &&
          (!F.r || d.r === F.r) &&
          (!F.s || d.s === F.s) &&
          (!F.p || d.p === "0");
      r.hidden = !ok;
      if (ok) n++;
    });
    g.hidden = n === 0;
    vis += n;
    const c = g.querySelector(".g-count");
    if (c) c.textContent = n;
  });
  const c = document.getElementById("f-count");
  if (c)
    c.textContent =
      vis === tot ? tot + " dons" : vis + " / " + tot + " dons";
  const z = document.getElementById("f-none");
  if (z) z.hidden = vis > 0;
}
 
 
/* ---------------------------------------------------------------------
   initFiltres() : remet les filtres mémorisés dans les champs
   Appelée par fiche() quand l'onglet Dons s'affiche, car les champs sont
   recréés vides à chaque affichage. Elle recopie F dans la recherche, les
   deux menus et la case, puis lance un premier filtrage (ce qui remplit
   aussi le compteur). Appelée aussi par « Réinitialiser ».
   --------------------------------------------------------------------- */
function initFiltres() {
  // set : met la valeur k (value, checked…) de l'élément d'identifiant id,
  // si cet élément existe dans la page
  const set = (id, k, v) => {
    const el = document.getElementById(id);
    if (el) el[k] = v;
  };
  set("f-q", "value", F.q);
  set("f-rare", "value", F.r);
  set("f-src", "value", F.s);
  set("f-pre", "checked", F.p);
  filtrer();
}
 
 
/* ---------------------------------------------------------------------
   Les trois écouteurs : réagir aux actions de l'utilisateur
   Ils sont posés une seule fois, sur « view », et non sur chaque champ : les
   champs sont détruits et recréés à chaque changement de page, ce qui ferait
   perdre des écouteurs posés directement dessus. Chaque écouteur regarde
   d'abord quel élément a été touché (e.target) et ignore tout le reste.
   --------------------------------------------------------------------- */
 
// 1. Frappe dans la zone de recherche : filtre à chaque lettre.
view.addEventListener("input", (e) => {
  if (e.target.id === "f-q") {
    F.q = e.target.value;
    filtrer();
  }
});
 
// 2. Changement d'un menu ou de la case : mémorise le choix puis filtre.
//    Si l'élément n'est aucun des trois, « return » évite de filtrer pour rien.
view.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "f-rare") F.r = t.value;
  else if (t.id === "f-src") F.s = t.value;
  else if (t.id === "f-pre") F.p = t.checked;
  else return;
  filtrer();
});
 
// 3. Boutons : « Réinitialiser » remet tous les filtres à zéro ;
//    « Tout déplier » / « Tout replier » ouvre ou ferme tous les niveaux
//    (data-fold vaut "open" ou "close" selon le bouton).
view.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "f-reset") {
    Object.assign(F, { q: "", r: "", s: "", p: false });
    initFiltres();
  } else if (b.dataset.fold)
    view
      .querySelectorAll(".grp")
      .forEach((g) => (g.open = b.dataset.fold === "open"));
});