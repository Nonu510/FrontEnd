let modal = null

const openModal = function (e) {
    e.preventDefault()
    const target = document.querySelector(e.target.getAttribute('href'))
    modal = target;
    modal.style.display = null
    modal.removeAttribute('aria-hidden')
    modal.setAttribute('aria-modal', 'true')
    modal.querySelector('.modal-wrapper').addEventListener('click', stopPropagation)
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
}

const closeModal = function (e) {
    if (modal === null) return
    e.preventDefault()
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.modal-wrapper').removeEventListener('click', stopPropagation);

    modal = null
}

const stopPropagation = function (e) {
    e.stopPropagation()
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal)
})


// ========================
// Variables globales

// ========================
let currentModalPage = "gallery";
const token = localStorage.getItem("authToken");
document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', function (e) {
        openModal(e);
        afficherPageGalerie(allWorks); // <-- affiche la galerie automatiquement
    });
});
// ========================
// Affichage de la page galerie dans la modale
// ========================
function afficherPageGalerie(works) {
    currentModalPage = "gallery";
    const modalWrapper = document.querySelector('.modal-wrapper');
    
    modalWrapper.innerHTML = `
        <div class="modal-header">
            <div></div>
            <h1 id="titlemodal">Galerie photo</h1>
            <div class="modal-nav">
                <button class="js-modal-close" aria-label="Fermer la modale"></button>
            </div>
        </div>
        <div class="modal-body">
            <div class="modal-gallery"></div>
            <div class="form-separator"></div>
            <button class="modal-btn" id="open-upload-page">Ajouter une photo</button>
        </div>
    `;

    const galleryContainer = modalWrapper.querySelector(".modal-gallery");

    // Afficher chaque projet avec icône de suppression
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.dataset.id = work.id;

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "fa-solid fa-trash-can delete-icon";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            supprimerProjet(work.id);
        });

        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        galleryContainer.appendChild(figure);
    });

    // Event listeners
    modalWrapper.querySelector("#open-upload-page").addEventListener("click", afficherPageAjout);
    modalWrapper.querySelector(".js-modal-close").addEventListener("click", closeModal);
}

// ========================
// Affichage de la page d'ajout dans la modale
// ========================
function afficherPageAjout() {
    currentModalPage = "upload";
    const modalWrapper = document.querySelector('.modal-wrapper');
    
    modalWrapper.innerHTML = `
        <div class="modal-header">
            <div class="modal-nav">
                <button class="modal-back" id="return-to-gallery" aria-label="Retour à la galerie"></button>
            </div>
            <h1 id="titlemodal">Ajout photo</h1>
            <div class="modal-nav">
                <button class="js-modal-close" aria-label="Fermer la modale"></button>
            </div>
        </div>
        <div class="modal-body">
            <form id="upload-form">
                <div class="upload-container" id="upload-container">
                    <div class="upload-content">
                        <div class="upload-icon">🖼️</div>
                        <button type="button" class="file-select-btn" id="file-select-btn">+ Ajouter photo</button>
                        <p class="upload-text">jpg, png : 4mo max</p>
                    </div>
                    <img class="upload-preview" id="upload-preview" alt="Aperçu">
                    <input type="file" id="image-upload" name="image" class="file-input" accept="image/*" required>
                </div>
                
                <div class="form-group">
                    <label for="image-title">Titre</label>
                    <input type="text" id="image-title" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="image-category">Catégorie</label>
                    <select id="image-category" name="category" required>
                        <option value="">Sélectionner une catégorie</option>
                    </select>
                </div>
                
                <div class="form-separator"></div>
                <button type="submit" class="modal-btn" id="submit-btn" disabled>Valider</button>
            </form>
        </div>
    `;

    // Charger les catégories
    chargerCategoriesDansSelect();
    
    // Gestion de l'upload de fichier
    setupFileUpload();
    
    // Event listeners
    modalWrapper.querySelector(".js-modal-close").addEventListener("click", closeModal);
    modalWrapper.querySelector("#return-to-gallery").addEventListener("click", () => {
        afficherPageGalerie(allWorks);
    });

    // Gestion du formulaire
    const uploadForm = modalWrapper.querySelector("#upload-form");
    uploadForm.addEventListener("submit", handleFormSubmit);
    
    // Validation du formulaire
    setupFormValidation();
}

// ========================
// Gestion de l'upload de fichier
// ========================
function setupFileUpload() {
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('image-upload');
    const fileSelectBtn = document.getElementById('file-select-btn');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadContent = uploadContainer.querySelector('.upload-content');

    // Clic sur le bouton ou la zone
    fileSelectBtn.addEventListener('click', () => fileInput.click());
    uploadContainer.addEventListener('click', (e) => {
        if (e.target === uploadContainer || e.target.closest('.upload-content')) {
            fileInput.click();
        }
    });

    // Drag & Drop
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = '#1D6154';
        uploadContainer.style.background = '#f0f8f5';
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.style.borderColor = '#B9D6E8';
        uploadContainer.style.background = '#E8F1F6';
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    // Changement de fichier
    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            // Vérifications
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner un fichier image.');
                return;
            }
            
            if (file.size > 4 * 1024 * 1024) { // 4MB
                alert('Le fichier ne doit pas dépasser 4MB.');
                return;
            }

            // Afficher l'aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadPreview.src = e.target.result;
                uploadPreview.classList.add('show');
                uploadContent.style.display = 'none';
                uploadContainer.classList.add('has-image');
            };
            reader.readAsDataURL(file);
            
            // Valider le formulaire
            validateForm();
        }
    }
}

// ========================
// Validation du formulaire
// ========================
function setupFormValidation() {
    const form = document.getElementById('upload-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });
}

function validateForm() {
    const fileInput = document.getElementById('image-upload');
    const titleInput = document.getElementById('image-title');
    const categorySelect = document.getElementById('image-category');
    const submitBtn = document.getElementById('submit-btn');
    
    const isValid = fileInput.files.length > 0 && 
                   titleInput.value.trim() !== '' && 
                   categorySelect.value !== '';
    
    submitBtn.disabled = !isValid;
    submitBtn.style.opacity = isValid ? '1' : '0.5';
}

// ========================
// Gestion de la soumission du formulaire
// ========================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    
    // État de chargement
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    const formData = new FormData();
    const imageInput = document.getElementById('image-upload');
    const titleInput = document.getElementById('image-title');
    const categorySelect = document.getElementById('image-category');

    formData.append("image", imageInput.files[0]);
    formData.append("title", titleInput.value.trim());
    formData.append("category", categorySelect.value);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const newWork = await response.json();
        
        // Ajouter le nouveau projet à la liste
        allWorks.push(newWork);
        
        // Actualiser les galeries
        actualisergallery(allWorks);
        
        // Retourner à la page galerie
        afficherPageGalerie(allWorks);
        
        // Message de succès (optionnel)
        console.log("Projet ajouté avec succès !");

    } catch (error) {
        console.error("Erreur lors de l'ajout du projet:", error);
        alert("Erreur lors de l'ajout du projet. Veuillez réessayer.");
        
        // Restaurer le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ========================
// Chargement des catégories
// ========================
async function chargerCategoriesDansSelect() {
    const select = document.getElementById('image-category');
    if (!select) return;
    
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }
        
        const categories = await response.json();
        
        // Vider les options existantes (sauf la première)
        select.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
    }
}

// ========================
// Suppression d'un projet
// ========================
async function supprimerProjet(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        // Supprimer le projet de la liste
        allWorks = allWorks.filter(work => work.id !== id);
        
        // Actualiser les galeries
        actualisergallery(allWorks);
        afficherPageGalerie(allWorks);
        
        console.log("Projet supprimé avec succès");

    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du projet. Veuillez réessayer.");
    }
}