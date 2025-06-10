// Récuperation des projets depuis l'API
const gallery = document.querySelector(".gallery")
let allWorks = []

async function recupererprojet () { 
    const url = "http://localhost:5678/api/works";
    try{
        const response = await fetch(url);
        const works = await response.json();
        allWorks = works;
        actualisergallery(works);
        if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
     } catch (error) {
    console.error(error.message);
  }
}

// Boucle sur pour chaque iteration crée une image avec son alt et titre 
function actualisergallery(works) {
    gallery.innerHTML = "";
    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const caption = document.createElement("figcaption");
      caption.innerText = work.title;

      figure.appendChild(img);
      figure.appendChild(caption);
      gallery.appendChild(figure);
    }
        
    };

async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    filtrecategories(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }
}


function filtrecategories(categories) {
    const filtres = document.querySelector(".filtres");
    const tous = document.createElement("button");
    tous.innerText = "Tous";
    tous.classList.add("btn");
    tous.classList.add("tous")
    tous.addEventListener("click", () => actualisergallery(allWorks));
    filtres.appendChild(tous);

for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    const button = document.createElement("button");
    button.innerText = category.name;
    button.classList.add("btn");
    button.addEventListener("click", () => {
      const filteredworks = allWorks.filter(work => work.categoryId === category.id);
      actualisergallery(filteredworks);
    });
    filtres.appendChild(button)
  }
}

fetchCategories()
recupererprojet ();
