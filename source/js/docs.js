import { ymlData } from "./ymlData.js";

const contentEl = document.getElementById('content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sidebarEl = document.getElementById('sidebar-menu');

let sections = [];
let currentIdx = 0;

// 🔄 Chargement d'un document
export function loadDoc(docId) {
   const doc = sections.find(d => d.id === docId);

   if (doc) {
      // ✨ Transition douce
      contentEl.style.opacity = 0;

      // Charger le contenu avec un léger délai pour l'animation
      setTimeout(() => {
         contentEl.innerHTML = `
                <div class="px-4">
                    <h2 class="mb-4 has-text-weight-medium">${doc.title}</h2>
                    ${doc.content}
                    ${doc.video ? `
                        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin-bottom: 20px;">
                            <iframe src="${doc.video}"
                                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;"
                                    allowfullscreen 
                                    title="${doc.title}">
                            </iframe>
                        </div>` : ''}
                </div>
            `;
         contentEl.style.opacity = 1;
      }, 200);

      currentIdx = sections.indexOf(doc);
      updateButtons();
      updateSidebar(docId);
   }
}

document.addEventListener('DOMContentLoaded', () => {
   const doc = ymlData;

   // 🗂️ Chargement du fichier YAML
   if (doc) {
      sections = Object.values(doc.sections).flatMap(section => section.docs);
      generateSidebar(doc.sections);

      // Essayer de charger le docId depuis sessionStorage
      const storedDocId = sessionStorage.getItem('selectedDocId');

      if (storedDocId && sections.find(d => d.id === storedDocId)) {
          loadDoc(storedDocId);
          // Optionnel : on efface la valeur pour éviter un rechargement non voulu après
          sessionStorage.removeItem('selectedDocId');
      } else if (sections.length > 0) {
          loadDoc(sections[0].id);
      }
  }
});

// 🔄 Gestion des boutons
function updateButtons() {
   if (currentIdx > 0) {
      prevBtn.querySelector("span").textContent = sections[currentIdx - 1].title;
      prevBtn.disabled = false;
   } else {
      prevBtn.querySelector("span").textContent = "Aucun précédent";
      prevBtn.disabled = true;
   }

   if (currentIdx < sections.length - 1) {
      nextBtn.querySelector("span").textContent = sections[currentIdx + 1].title;
      nextBtn.disabled = false;
   } else {
      nextBtn.querySelector("span").textContent = "Aucun suivant";
      nextBtn.disabled = true;
   }
}

// 🔄 Écouteurs d'événements pour les boutons
prevBtn.addEventListener('click', () => {
   if (currentIdx > 0) loadDoc(sections[currentIdx - 1].id);
});

nextBtn.addEventListener('click', () => {
   if (currentIdx < sections.length - 1) loadDoc(sections[currentIdx + 1].id);
});

// 🔄 ➡️ ⬅️ Keyboard Navigation
document.addEventListener('keydown', (e) => {
   if (e.key === 'ArrowLeft' && currentIdx > 0) {
      loadDoc(sections[currentIdx - 1].id);
   } else if (e.key === 'ArrowRight' && currentIdx < sections.length - 1) {
      loadDoc(sections[currentIdx + 1].id);
   }
});


// 🔄 Mise à jour de la Sidebar
function updateSidebar(activeDocId) {
   sidebarEl.querySelectorAll('.sidelist').forEach(li => {
      li.classList.remove('active');
   });

   sidebarEl.querySelectorAll('ul').forEach(subList => {
      subList.style.display = 'none';
   });

   const activeLink = sidebarEl.querySelector(`a[data-doc="${activeDocId}"]`);
   if (activeLink) {
      const parentLi = activeLink.closest('li.sidelist');
      if (parentLi) {
         parentLi.classList.add('active');
      }

      const parentUl = activeLink.closest('ul');
      if (parentUl) parentUl.style.display = 'block';

      const parentSection = activeLink.closest('.parent');
      if (parentSection) {
         parentSection.querySelector('ul').style.display = 'block';
      }
   }
}

// 🔄 Génération de la Sidebar
function generateSidebar(sectionsData) {
   const sidebarMenu = document.getElementById('sidebar-menu');
   sidebarMenu.innerHTML = '';

   Object.entries(sectionsData).forEach(([key, section]) => {
      const parentItem = document.createElement('li');
      parentItem.classList.add('sidelist', 'parent');

      const sectionLink = document.createElement('a');
      sectionLink.textContent = section.title;
      sectionLink.href = "javascript:;";
      parentItem.appendChild(sectionLink);

      sectionLink.addEventListener('click', (e) => {
         e.preventDefault();
         const introLink = parentItem.querySelector(`a[data-doc="${section.docs[0].id}"]`);
         if (introLink) {
            loadDoc(section.docs[0].id);
            updateSidebar(section.docs[0].id);
         }
      });

      const subList = document.createElement('ul');
      subList.style.display = 'none';

      section.docs.forEach(doc => {
         const listItem = document.createElement('li');
         listItem.classList.add('sidelist');

         const link = document.createElement('a');
         link.textContent = doc.sidebar_title || doc.title;
         link.setAttribute('data-doc', doc.id);
         link.href = "javascript:;";

         link.addEventListener('click', (e) => {
            e.preventDefault();
            loadDoc(doc.id);
            updateSidebar(doc.id);
         });

         listItem.appendChild(link);
         subList.appendChild(listItem);
      });

      parentItem.appendChild(subList);
      sidebarMenu.appendChild(parentItem);
   });
}
