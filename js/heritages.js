/* =====================================================================
   heritages.js : l'onglet « Héritages » d'une fiche d'espèce
   ---------------------------------------------------------------------
   Ce fichier contient le CODE d'affichage. Le CONTENU (la liste des
   héritages) est dans data/heritages.js : ne pas confondre les deux.
 
   Dépend de : outils.js (html) et composants.js (liste).
   Ordre de chargement : après composants.js.
   ===================================================================== */
 
 
/* ---------------------------------------------------------------------
   sousSections(espèce) : le tableau des héritages
   Construit un tableau à deux colonnes (Héritage | Description). Chaque
   héritage donne une ligne :
     - colonne de gauche : le titre, la pastille « Legacy » si l'héritage est
       marqué legacy, puis la source en petit dessous (si elle existe) ;
     - colonne de droite : un paragraphe par élément du texte.
   Le texte accepte une chaîne OU un tableau de paragraphes : [].concat(texte)
   ramène les deux cas à un tableau.
   Si l'espèce n'a aucun héritage, la fonction renvoie un texte vide : c'est
   fiche() qui affiche alors « Aucun héritage renseigné. ».
 
   Exemple : un héritage {titre:"Forge Dwarf", source:"Player Core pg. 43", texte:"…"}
     → une ligne <tr> avec "Forge Dwarf", la source en dessous, et le texte à droite.
 
   Bon à savoir :
     - Les classes "dons herit" réutilisent le style du tableau des dons
       (.dons) et ajoutent ce qui est propre aux héritages (.herit, .h-txt, .h-src).
     - Contrairement aux dons, les titres ne sont pas des liens : l'adresse
       #/espèce/heritage/titre existe (detail() la gère), mais rien ne
       l'ouvre depuis ce tableau. Pour la rendre cliquable, il suffirait
       d'appeler lien(e, "heritage", x) à la place de html(x.titre).
   Utilisé par : l'onglet Héritages de fiche() (dans pages.js).
   --------------------------------------------------------------------- */
const sousSections = (e) =>
  e.heritages && e.heritages.length
    ? `<div class="tablewrap"><table class="dons herit"><thead><tr><th>Héritage</th><th>Description</th></tr></thead><tbody>` +
      liste(e, "heritage")
        .map(
          (x) =>
            `<tr><th scope="row" class="d-name">${html(x.titre)}${x.legacy ? ` <em class="legacy">Legacy</em>` : ""}${x.source ? `<span class="h-src">${html(x.source)}</span>` : ""}</th><td class="h-txt">${[]
              .concat(x.texte)
              .map((t) => `<p>${html(t)}</p>`)
              .join("")}</td></tr>`,
        )
        .join("") +
      `</tbody></table></div>`
    : "";