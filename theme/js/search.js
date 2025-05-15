import { ymlData } from "./ymlData.js";

// Sélecteurs HTML
const resultList = document.querySelector("#resultsList");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const searchIcon = document.getElementById("searchIcon");

clearBtn.style.display = 'none';

// 🔄 Toggle entre l'icône de recherche et le bouton clear
searchInput.addEventListener('input', () => {
    const hasText = searchInput.value.length > 0;
    clearBtn.style.display = hasText ? 'block' : 'none';
    searchIcon.style.display = hasText ? 'none' : 'block';
    updateResult(searchInput.value);
});

// 🔄 Clear de l'input et du résultat
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    clearBtn.style.display = 'none';
    searchIcon.style.display = 'block';
    resultList.innerHTML = "";
});

// 🔎 Fonction pour nettoyer le HTML et ne garder que le texte brut
function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// 🔎 Trouve la phrase contenant le terme recherché (insensible à la casse)
function findSentenceWithTerm(text, term) {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    term = term.toLowerCase();

    for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(term)) {
            return sentence.trim();
        }
    }
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
}

// ✨ Surligne toutes les occurrences du terme dans le texte
function highlightTerm(text, term) {
    if (!term) return text;
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, "gi");
    return text.replace(regex, `<span class="has-background-warning has-text-weight-bold">$1</span>`);
}

// 🔄 Met à jour les résultats de recherche
function updateResult(query) {
    resultList.innerHTML = "";

    if (query.length === 0) {
        return;
    }
    
    query = query.toLowerCase();
    // 🗂️ On récupère les docs de toutes les sections
    const docs = Object.values(ymlData.sections).flatMap(section => section.docs);

    const filtered = docs.filter(doc => {
        const title = doc.title.toLowerCase();
        const sidebar = doc.sidebar_title.toLowerCase();
        const contentText = stripHtml(doc.content).toLowerCase();

        return (
            title.includes(query) ||
            sidebar.includes(query) ||
            contentText.includes(query)
        );
    }).slice(0, 3); // 👈 Limite à 3 résultats

    if (filtered.length === 0) {
        resultList.innerHTML = `<article class="message is-warning"><div class="message-body">Aucun résultat trouvé.</div></article>`;
        return;
    }

    // ➡️ Ajout des résultats dans le DOM
    filtered.forEach(doc => {
        const contentText = stripHtml(doc.content);
        const sentence = findSentenceWithTerm(contentText, query);
        const highlighted = highlightTerm(sentence, query);

        resultList.innerHTML += `
            <div class="box search-result is-clickable" data-doc-id="${doc.id}">
                <h3 class="title is-5">${highlightTerm(doc.title, query)}</h3>
                <h4 class="subtitle is-6 has-text-grey">${highlightTerm(doc.sidebar_title, query)}</h4>
                <p class="content">${highlighted}</p>
            </div>
        `;
    });

    // 🔥 Ajout d'un écouteur de clic dynamique sur les résultats
    resultList.addEventListener('click', (e) => {
        const result = e.target.closest('.search-result');
        if (result) {
            const docId = result.getAttribute('data-doc-id');
            if (docId) {
                sessionStorage.setItem('selectedDocId', docId);
                window.location.href = 'documentation.html';
            }
        }
    });
    
}

// Initialise l'affichage
updateResult("");
