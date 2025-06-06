// Récuperation des projets depuis l'API
const gallery = document.querySelector(".gallery")

async function recupererprojet () { 
    const url = "http://localhost:5678/api/works";
    try{
        const response = await fetch(url);
        const works = await response.json();
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

    recupererprojet ();



