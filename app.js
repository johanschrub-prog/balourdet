
let modeOnglets = true;
let indexAvantRecherche = null;
let currentTab = "";
let currentIndex = 0;
let Commande = {};
let codeBarreAAssocier = "";
let produitSelectionne = null;

async function charger(){

    const r =
    await fetch("balourdet.json");

    const sauvegarde =
localStorage.getItem(
"CommandeHDLP"
);

if(sauvegarde){

    Commande =
    JSON.parse(sauvegarde);

}
else{

    Commande =
    await r.json();

}

    currentTab =
    Object.keys(Commande)[0];

    creerOnglets();

    afficherArticle();

}

function creerOnglets(){

    let html = "";

    Object.keys(Commande)
    .forEach(cat => {

        const couleurFond =
        cat.includes("RCLP")
        ? "#ffe0b2"
        : "#ddd";

        const couleurActive =
        cat.includes("RCLP")
        ? "#fd7e14"
        : "#0a66ff";

        html += `
        <button
        class="tab"
        style="
        background:${
            cat===currentTab
            ? couleurActive
            : couleurFond
        };
        color:${
            cat===currentTab
            ? 'white'
            : 'black'
        };
        "
        onclick="changerOnglet('${cat}')">

        ${cat}

        </button>
        `;

    });

    document
    .getElementById("tabs")
    .innerHTML = html;

}
function changerOnglet(cat){

    currentTab = cat;
    currentIndex = 0;

    modeOnglets = false;

    afficherArticle();

}
function retourOnglets(){

    modeOnglets = true;

    afficherArticle();

}
function importerFournisseur(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"array"}
        );

        Commande = {};

        workbook.SheetNames.forEach(nomFeuille => {

            const sheet =
            workbook.Sheets[nomFeuille];

            const rows =
            XLSX.utils.sheet_to_json(sheet);

            Commande[nomFeuille] = [];

            rows.forEach(row => {

                Commande[nomFeuille].push({

                    id: crypto.randomUUID(),

                    ordre:
                        Number(
                            row.ORDRE || 9999
                        ),

                    code:
                        String(
                            row.NA || ""
                        ),

                    article:
                        String(
                            row.ARTICLE || ""
                        ),

                    categorie:
                        String(
                            row.CATEGORIE || ""
                        ),

                    conditionnement:
                        String(
                            row.CONDITIONNEMENT || ""
                        ),

                    codesBarres: [],

                    Stock:
                        Number(
                            row.STOCK || 0
                        ),

                    Commande:
                        Number(
                            row.COMMANDE || 0
                        )

                });

            });

            Commande[nomFeuille]
            .sort(
                (a,b)=>
                a.ordre-b.ordre
            );

        });

        localStorage.setItem(
            "CommandeHDLP",
            JSON.stringify(Commande)
        );

        currentTab =
        Object.keys(Commande)[0];

        currentIndex = 0;

        creerOnglets();

        afficherArticle();
if(modeOnglets){

    document.getElementById("tabs")
    .style.display = "flex";

    document.getElementById("contenu")
    .innerHTML = "";

    return;

}
        document.getElementById("tabs")
.style.display = "none";
        alert(
            Object.keys(Commande).length +
            " onglets importés"
        );

    };

    reader.readAsArrayBuffer(file);



}
function afficherOnglets(){

    modeOnglets = true;

    afficherArticle();

}

function afficherArticle(){
if(modeOnglets){

    document
    .getElementById("tabs")
    .style.display = "flex";

   document
.querySelector(".toolbar")
.style.display = "flex";

    document
    .getElementById("contenu")
    .innerHTML = "";

    return;

}
    document
.querySelector(".toolbar")
.style.display = "flex";

document
.getElementById("tabs")
.style.display = "none";

    const produit =
    Commande[currentTab][currentIndex];

    if(!produit) return;

    document
    .getElementById("contenu")
    .innerHTML = `

<div class="card">

<div style="
text-align:center;
margin-bottom:5px;
">

<div style="
font-size:15px;
font-weight:bold;
color:${
currentTab.includes("RCLP")
? "#fd7e14"
: "#0a66ff"
};
">

${currentTab}

</div>

<div style="
font-size:34px;
font-weight:bold;
margin-top:2px;
">

${produit.article}

</div>

</div>

<div style="
display:flex;
justify-content:center;
align-items:flex-start;
gap:25px;
margin-top:5px;
margin-bottom:5px;
">


<div style="
width:85px;
text-align:center;
">

<label style="
display:block;
font-weight:bold;
margin-bottom:8px;
">
Stock
</label>

<input
id="Stock"
type="number"
step="0.01"
inputmode="decimal"
enterkeyhint="next"
style="
width:80px;
height:40px;
font-size:22px;
text-align:center;
"
value="${produit.Stock || ''}"
onkeydown="if(event.key==='Enter'){
document.getElementById('Commande').focus();
}">
</div>

<div style="
width:85px;
text-align:center;
">

<label style="
display:block;
font-weight:bold;
margin-bottom:8px;
">
Commande
</label>

<input
id="Commande"
type="number"
step="0.01"
inputmode="decimal"
enterkeyhint="go"
style="
width:80px;
height:40px;
font-size:22px;
text-align:center;
"
value="${produit.Commande || ''}"
onkeydown="if(event.key==='Enter'){
valider();
}">
</div>

</div>

<div class="nav" style="
display:flex;
justify-content:center;
gap:10px;
margin-top:5px;
margin-bottom:0;
padding-bottom:0;
">

<button
style="height:40px;width:50px"
onclick="precedent()">
◀
</button>

<button
style="height:40px;width:60px"
onclick="valider()">
✅
</button>

<button
style="height:40px;width:50px"
onclick="suivant()">
▶
</button>

</div>


</div>
    `;

}

function valider(){

    let produit =
    Commande[currentTab][currentIndex];

  produit.Stock =
parseFloat(
    document
    .getElementById("Stock")
    .value
    .replace(",", ".")
) || 0;

produit.Commande =
parseFloat(
    document
    .getElementById("Commande")
    .value
    .replace(",", ".")
) || 0;

   localStorage.setItem(
    "CommandeHDLP",
    JSON.stringify(Commande)
);

if(indexAvantRecherche !== null){
 
currentIndex = indexAvantRecherche;
 
indexAvantRecherche = null;
 
afficherArticle();
 
return;
 
}
 
suivant();

}
function scannerCodeBarre(){

    document
    .getElementById("scannerZone")
    .style.display = "block";

    const scanner = new Html5Qrcode(
        "reader"
    );

    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        (code) => {

            scanner.stop();

            document
            .getElementById("scannerZone")
            .style.display = "none";

            rechercherCodeBarre(code);

        }

    );

}
function rechercherCodeBarre(codeBarre){

    let trouve = null;

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            if(
                produit.codesBarres &&
                produit.codesBarres.includes(
                    codeBarre
                )
            ){

                trouve = {
                    onglet,
                    produit
                };

            }

        });

    });

    if(trouve){

        currentTab =
        trouve.onglet;

        currentIndex =
        Commande[
            trouve.onglet
        ]
        .findIndex(
            p =>
            p.id ===
            trouve.produit.id
        );

        creerOnglets();

        afficherArticle();

        return;

    }

    associerCodeBarre(
        codeBarre
    );

}
function remiseAZero(){

    if(
        !confirm(
            "Remettre toutes les quantités à zéro ?"
        )
    ){
        return;
    }

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            produit.Stock = 0;
            produit.Commande = 0;

        });

    });

    localStorage.setItem(
        "CommandeHDLP",
        JSON.stringify(Commande)
    );

    afficherArticle();

    alert(
        "Commande remis à zéro"
    );

}
function associerCodeBarre(codeBarre){

    codeBarreAAssocier =
    codeBarre;

    document
    .getElementById("codeInconnu")
    .innerHTML =
    `
    <b>${codeBarre}</b>
    `;

    document
    .getElementById(
        "fenetreAssociation"
    )
    .style.display =
    "block";

    document
    .getElementById(
        "rechercheProduit"
    )
    .value = "";

    document
    .getElementById(
        "listeProduits"
    )
    .innerHTML = "";

}
function suivant(){

    if(
        currentIndex <
        Commande[currentTab].length - 1
    ){
        currentIndex++;
    }

    afficherArticle();

    setTimeout(() => {

        window.scrollTo({
            top:0,
            behavior:"instant"
        });

        const champCommande =
        document.getElementById("Commande");

        if(champCommande){

            champCommande.focus();
            champCommande.select();

        }

    }, 50);

}
function chercherProduitAssociation(){

    const texte =
    document
    .getElementById(
        "rechercheProduit"
    )
    .value
    .toLowerCase();

    let html = "";

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            if(

                produit.article
                .toLowerCase()
                .includes(texte)

            ){

                html += `
                <div
                style="
                padding:8px;
                border-bottom:1px solid #ddd;
                cursor:pointer;
                "
                onclick="
                selectionProduitAssociation(
                '${produit.id}'
                )">

                ${produit.code}
                -
                ${produit.article}

                </div>
                `;

            }

        });

    });

    document
    .getElementById(
        "listeProduits"
    )
    .innerHTML =
    html;

}
function precedent(){

    if(currentIndex > 0){

        currentIndex--;

    }

    afficherArticle();

}
function selectionProduitAssociation(id){

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            if(
                produit.id === id
            ){

                if(
                    !produit.codesBarres
                ){

                    produit.codesBarres = [];

                }

                produit.codesBarres
                .push(
                    codeBarreAAssocier
                );

                localStorage.setItem(
                    "CommandeHDLP",
                    JSON.stringify(
                        Commande
                    )
                );

                alert(
                    "Code-barres associé"
                );

            }

        });

    });

    document
    .getElementById(
        "fenetreAssociation"
    )
    .style.display =
    "none";

}
function rechercher(){

    const texte =
    document
    .getElementById("search")
    .value
    .toLowerCase();

    if(!texte){

        document
        .getElementById("resultatsRecherche")
        .innerHTML = "";

        return;

    }

    const resultats =
    Commande[currentTab]
    .filter(p =>

        p.article &&
        p.article
        .toLowerCase()
        .includes(texte)

        ||

        p.code &&
        p.code
        .toLowerCase()
        .includes(texte)

    );

    let html = "";

    resultats.forEach(produit => {

        html += `
        <div
        style="
        padding:10px;
        border-bottom:1px solid #ddd;
        cursor:pointer;
        "
        onclick="selectionProduit('${produit.id}')">

        ${produit.code}
        - ${produit.article}

        </div>
        `;

    });

    document
    .getElementById("resultatsRecherche")
    .innerHTML = html;

}
function selectionProduit(id){

    const index =
    Commande[currentTab]
    .findIndex(
        p => p.id === id
    );

    if(index < 0) return;
    
indexAvantRecherche = currentIndex;
    
    currentIndex = index;

    document
    .getElementById("search")
    .value = "";

    document
    .getElementById("resultatsRecherche")
    .innerHTML = "";

    afficherArticle();

}
function exportExcel(){

    const wb =
    XLSX.utils.book_new();

    Object.keys(Commande)
    .forEach(onglet => {

       const lignes =
Commande[onglet]
.map(produit => ({

    ORDRE:
    produit.ordre,

  NA:
isNaN(produit.code)
? produit.code
: Number(produit.code),

    ARTICLE:
    produit.article,

    STOCK:
    produit.Stock || 0,

    COMMANDE:
    produit.Commande || 0

}));

        const ws =
        XLSX.utils.json_to_sheet(
            lignes
        );

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            onglet.substring(0,31)
        );

    });

    const d =
    new Date();

    const fichier =
    "Commande-hdlp-" +
    d.getFullYear() +
    "-" +
    String(
        d.getMonth()+1
    ).padStart(2,"0") +
    "-" +
    String(
        d.getDate()
    ).padStart(2,"0") +
    ".xlsx";

    XLSX.writeFile(
        wb,
        fichier
    );

}
charger();
