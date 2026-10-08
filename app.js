alert("2")
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

    creerOnglets();

    document
    .getElementById("contenu")
    .innerHTML = "";

}

function afficherArticle(){

    if(modeOnglets){

        document
        .getElementById("contenu")
        .innerHTML = "";

        return;

    }

    const produit =
    Commande[currentTab][currentIndex];

    if(!produit) return;

    document
    .getElementById("contenu")
    .innerHTML = `

    <div class="card">

    <div style="
    text-align:center;
    font-size:14px;
    color:#666;
    ">
    ${currentTab}
    </div>

    <div style="
    font-size:30px;
    font-weight:bold;
    text-align:center;
    ">
    ${produit.article}
    </div>

    <br>

    <div style="
    display:flex;
    justify-content:center;
    gap:20px;
    ">

        <div>

        Stock

        <br>

        <input
        id="Stock"
        type="number"
        value="${
            produit.Stock||''
        }">

        </div>

        <div>

        Commande

        <br>

        <input
        id="Commande"
        type="number"
        value="${
            produit.Commande||''
        }">

        </div>

    </div>

    <div class="nav">

        <button
        onclick="precedent()">
        ◀
        </button>

        <button
        onclick="valider()">
        ✅
        </button>

        <button
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
    Number(
        document
        .getElementById("Commande")
        .value || 0
    );

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

function ouvrirFournisseur(fournisseur){

    fournisseurActif =
    fournisseur;

    afficherFournisseur();

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
            XLSX.utils.sheet_to_json(
                sheet
            );

            Commande[feuille] =
            rows.map((r,i)=>({

                id:
                crypto.randomUUID(),

                ordre:
                Number(
                    r.ORDRE ||
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

            }));

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

    afficherFournisseur();

}
function afficherFournisseur(){

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




