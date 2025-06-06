const gallery = document.querySelector(".gallery")

async function recupererprojet () { 
    const url = "http://localhost:5678/api/works";
    try{
        const response = await fetch(url);
        if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json);
     } catch (error) {
    console.error(error.message);
  }
}

function actualisergallery () {
    array.forEach(element => {
        
    });
}


