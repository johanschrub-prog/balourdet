alert("1")
let Commande = {};

let currentTab = "";
let currentIndex = 0;

let modeOnglets = true;

let fournisseurActif = null;

let statutFournisseurs =
JSON.parse(
localStorage.getItem(
"statutFournisseurs"
)
) || {};

function creerOnglets(){

    let html = "";

    Object.keys(Commande)
    .forEach(onglet => {

        html += `
        <button
        class="tab"
        style="
        background:${
            onglet===currentTab
            ? "#0a66ff"
            : "#ddd"
        };
        color:${
            onglet===currentTab
            ? "white"
            : "black"
        };
        "
        onclick="changerOnglet('${onglet}')">

        ${onglet}

        </button>
        `;

    });

    const fournisseurs =
    getFournisseurs();

    Object.keys(fournisseurs)
    .forEach(fournisseur => {

        const nb =
        Object.keys(
            fournisseurs[
                fournisseur
            ]
        ).length;

        html += `
        <button
        class="tab"
        style="
        background:${
        statutFournisseurs[fournisseur]?.livree
        ? "#dc3545"
        : statutFournisseurs[fournisseur]?.commandee
        ? "#fd7e14"
        : "#ffe0b2"
        };
        "
        onclick="ouvrirFournisseur('${fournisseur}')">

        📦 ${fournisseur} (${nb})

        </button>
        `;

    });

    document
    .getElementById("tabs")
    .innerHTML = html;

}

function changerOnglet(onglet){

    currentTab = onglet;

    currentIndex = 0;

    modeOnglets = false;

    afficherArticle();

}

function afficherOnglets(){

    modeOnglets = true;

    fournisseurActif = null;

    creerOnglets();

    document
    .getElementById("tabs")
    .style.display = "flex";

    document
    .getElementById("contenu")
    .innerHTML = "";

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
        margin-bottom:8px;
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
            font-size:30px;
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
        margin-top:8px;
        margin-bottom:8px;
        ">

            <div style="
            width:70px;
            text-align:center;
            ">

                <label style="
                display:block;
                font-weight:bold;
                margin-bottom:6px;
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
                width:60px;
                height:34px;
                font-size:18px;
                text-align:center;
                "
                value="${produit.Stock || ''}"
                onkeydown="
                if(event.key==='Enter'){
                    document
                    .getElementById('Commande')
                    .focus();
                }">

            </div>

            <div style="
            width:1px;
            height:65px;
            background:#dddddd;
            ">
            </div>

            <div style="
            width:70px;
            text-align:center;
            ">

                <label style="
                display:block;
                font-weight:bold;
                margin-bottom:6px;
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
                width:60px;
                height:34px;
                font-size:18px;
                text-align:center;
                "
                value="${produit.Commande || ''}"
                onkeydown="
                if(event.key==='Enter'){
                    valider();
                }">

            </div>

        </div>

        <div style="
        display:flex;
        justify-content:center;
        gap:10px;
        margin-top:5px;
        ">

            <button
            style="
            height:38px;
            width:48px;
            "
            onclick="precedent()">
            ◀
            </button>

            <button
            style="
            height:38px;
            width:58px;
            "
            onclick="valider()">
            ✅
            </button>

            <button
            style="
            height:38px;
            width:48px;
            "
            onclick="suivant()">
            ▶
            </button>

        </div>

    </div>

    `;

}
function precedent(){

    if(currentIndex > 0){

        currentIndex--;

    }

    afficherArticle();

}

function suivant(){

    if(
        currentIndex <
        Commande[currentTab].length-1
    ){

        currentIndex++;

    }

    afficherArticle();

}

function valider(){

    const produit =
    Commande[currentTab][currentIndex];

    produit.Stock =
    Number(
        document
        .getElementById("Stock")
        .value || 0
    );

  produit.Commande =
parseFloat(
    document
    .getElementById("Commande")
    .value
    .replace(",", ".")
) || 0;


    creerOnglets();

    suivant();

}

function getFournisseurs(){

    const fournisseurs = {};

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            const q =
            Number(
                produit.Commande || 0
            );

            if(q <= 0) return;

            const fournisseur =
            produit.fournisseur;

            if(
                !fournisseurs[
                    fournisseur
                ]
            ){

                fournisseurs[
                    fournisseur
                ] = {};

            }

            const cle =
            produit.code +
            "|" +
            produit.article;

            if(
                !fournisseurs[
                    fournisseur
                ][cle]
            ){

                fournisseurs[
                    fournisseur
                ][cle] = {

                    code:
                    produit.code,

                    article:
                    produit.article,

                    lignes: []

                };

            }

            fournisseurs[
                fournisseur
            ][cle]
            .lignes
            .push({

                onglet,
                commande:q

            });

        });

    });

    return fournisseurs;

}


function importerExcel(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"array"}
        );

        Commande = {};

        [
            "LISTE PRODUIT",
            "BALOURDET PDJ",
            "BALOURDET BAR"
        ]
        .forEach(feuille => {

            const sheet =
            workbook.Sheets[
                feuille
            ];

            if(!sheet) return;

            const rows =
const rows =
XLSX.utils.sheet_to_json(
    sheet,
    {
        defval:""
    }
);
        
console.log(
    feuille,
    Object.keys(rows[0])
);
           Commande[feuille] =
rows.map((r,i)=>({

    id:
    crypto.randomUUID(),

ordre:
Number(
    r.ORDRE ??
      r["ORDRE"] ??
  
    i + 1
),

    code:
    String(
        r.NA || ""
    ),

    article:
    String(
        r.ARTICLE || ""
    ),

    fournisseur:
    String(
        r.FOURNISSEUR || ""
    ),

    conditionnement:
    String(
        r.CONDITIONNEMENT || ""
    ),

    Stock:
    Number(
        r.STOCK || 0
    ),

    Commande:
    Number(
        r.COMMANDE || 0
    )

}))

.sort((a,b)=>

    a.ordre - b.ordre

);
});
        currentTab =
        Object.keys(Commande)[0];

        creerOnglets();

        afficherOnglets();

    };

    reader.readAsArrayBuffer(file);

}
function sauvegarderJSON(){

    const blob =
    new Blob(

        [
            JSON.stringify(
                Commande,
                null,
                2
            )
        ],

        {
            type:
            "application/json"
        }

    );

    const lien =
    document.createElement("a");

    lien.href =
    URL.createObjectURL(
        blob
    );

    lien.download =
    "CommandeHDLP.json";

    lien.click();

}
function restaurerJSON(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        Commande =
        JSON.parse(
            e.target.result
        );

        currentTab =
        Object.keys(Commande)[0];

        creerOnglets();

        afficherOnglets();

    };

    reader.readAsText(file);

}
function ouvrirFournisseur(fournisseur){

    fournisseurActif =
    fournisseur;
modeOnglets = false;
    afficherFournisseur();

}
function afficherFournisseur(){
document
.getElementById("tabs")
.style.display = "none";
    const fournisseurs =
    getFournisseurs();

    const liste =
    Object.values(
        fournisseurs[
            fournisseurActif
        ] || {}
    );

    let html = `

    <div class="card">

    <h2>
    📦 ${fournisseurActif}
    </h2>

    <label>
    <input
    type="checkbox"
    ${
        statutFournisseurs[
            fournisseurActif
        ]?.commandee
        ? "checked"
        : ""
    }
    onchange="toggleCommande()">

    Commandé

    </label>

    <br>

    <label>
    <input
    type="checkbox"
    ${
        statutFournisseurs[
            fournisseurActif
        ]?.livree
        ? "checked"
        : ""
    }
    onchange="toggleLivree()">

    Livré

    </label>

    <br><br>

    `;

    liste.forEach(
        produit => {

        html += `

        <div
        style="
        border-bottom:
        1px solid #ddd;
        padding:8px;
        ">

        <b>
        ${produit.code}
        -
        ${produit.article}
        </b>

        <br>

        ${produit.lignes
        .map(
            l =>

            `${l.onglet}
            :
            ${l.commande}`

        )
        .join("<br>")}

        </div>

        `;

    });

    html += `

    <br>

    <button
    onclick="
    viderCommandeFournisseur()
    ">

    🧹 Saisie

    </button>

    </div>

    `;

    document
    .getElementById("contenu")
    .innerHTML =
    html;

}
function toggleCommande(){

    if(
        !statutFournisseurs[
            fournisseurActif
        ]
    ){

        statutFournisseurs[
            fournisseurActif
        ] = {};

    }

    statutFournisseurs[
        fournisseurActif
    ].commandee =
    !statutFournisseurs[
        fournisseurActif
    ].commandee;

    localStorage.setItem(

        "statutFournisseurs",

        JSON.stringify(
            statutFournisseurs
        )

    );

    creerOnglets();

    afficherFournisseur();

}
function toggleLivree(){

    if(
        !statutFournisseurs[
            fournisseurActif
        ]
    ){

        statutFournisseurs[
            fournisseurActif
        ] = {};

    }

    statutFournisseurs[
        fournisseurActif
    ].livree =
    !statutFournisseurs[
        fournisseurActif
    ].livree;

    localStorage.setItem(

        "statutFournisseurs",

        JSON.stringify(
            statutFournisseurs
        )

    );

    creerOnglets();

    afficherFournisseur();

}
function viderCommandeFournisseur(){

    Object.keys(Commande)
    .forEach(onglet => {

        Commande[onglet]
        .forEach(produit => {

            if(
                produit.fournisseur ===
                fournisseurActif
            ){

                produit.Commande = 0;

            }

        });

    });

    fournisseurActif = null;

    creerOnglets();

    afficherOnglets();

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

    let liste = [];

    if(
        Commande[currentTab]
    ){

        liste =
        Commande[currentTab];

    }

    const resultats =
    liste.filter(p =>

        (p.article || "")
        .toLowerCase()
        .includes(texte)

        ||

        (p.code || "")
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
        onclick="
        selectionProduit(
        '${produit.id}'
        )">

        ${produit.code}
        -
        ${produit.article}

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

    currentIndex = index;

    modeOnglets = false;

    document
    .getElementById("search")
    .value = "";

    document
    .getElementById("resultatsRecherche")
    .innerHTML = "";

    afficherArticle();

}




