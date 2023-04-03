//lots of variables
const searchForm = document.querySelector("#search");
const difSearch = document.querySelector("#difficulty-filter");
const champList = document.querySelector(".champion-main");
const hoverInfo = document.querySelector(".hover-info");
const allyArticle = document.querySelector(".ally-tips");
const enemyArticle = document.querySelector(".enemy-tips");
const leagueHelper = document.querySelector(".league-helper");

//checks for submission on the "find a champion" form
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let input = event.target["search-input"].value;
  let name = "";
  //  THE ULTIMATE EDGE CASE DESTROYER(I'm actually so proud of this mess)
  if (input.includes(".")) {
    //remove any spaces from the querey
    input = input.replaceAll(" ", "");
    //transform the dot into a space
    name = input.replace(/[^a-zA-Z0-9 ]/g, " ");
    //split the name accross the space and capitalize the first letter of each seperate piece
    const nameArray = name.split(" ");
    let fname = nameArray[0];
    const upperF = fname.charAt(0).toUpperCase();
    const restF = fname.slice(1).toLowerCase();
    fname = upperF + restF;
    let lname = nameArray[1];
    const upperL = lname.charAt(0).toUpperCase();
    const restL = lname.slice(1).toLowerCase();
    lname = upperL + restL;
    //recombine the pieces
    name = fname + lname;
    //all of that was for a single champion btw haha so funny :')
  } else if (input.includes("'")) {
    name = input.replace(/[^a-zA-Z0-9 ]/g, "");
    const upper = name.charAt(0).toUpperCase();
    const rest = name.slice(1).toLowerCase();
    name = upper + rest;
  } else {
    const upper = input.charAt(0).toUpperCase();
    const rest = input.slice(1);
    name = upper + rest;
  }
  name = name.replaceAll(" ", "");
  //get the data
  fetch(
    `https://ddragon.leagueoflegends.com/cdn/13.6.1/data/en_US/champion/${name}.json`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        //check for error then add dismiss button
        const error = document.createElement("div");
        error.classList.add("error-message");
        error.innerHTML = `An error occurred while searching for "${name}": ${response.statusText}.`;

        const dismiss = document.createElement("button");
        dismiss.classList.add("dismiss-button");
        dismiss.innerHTML = "Dismiss";
        dismiss.addEventListener("click", () => {
          error.remove();
        });
        leagueHelper.append(error);
        error.appendChild(dismiss);
      }
    })
    //send parsed data to function, with name of champion for ease of use
    .then((champion) => {
      champSearcher(champion, name);
    })
    .catch((error) => console.log(error));

  searchForm.reset();
});

//function to print the neccessary data
function champSearcher(champion, input) {
  hoverInfo.innerHTML = "";
  hoverInfo.style.display = "none";
  const lore = champion.data[input].lore;
  const title = champion.data[input].title;
  const image = `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${input}_0.jpg`;
  const difficulty = champion.data[input].info.difficulty;
  const name = champion.data[input].name;
  const championInfo = document.querySelector(".champion-main");

  //EDGE CASE DESTROYER 2: MORE EDGE(creates the official url)
  let urlName = "";
  if (name.includes("'") || name.includes(".")) {
    urlName = name.replace(/[^a-zA-Z0-9 ]/g, "-");
    urlName = urlName.replace(" ", "");
  } else if (urlName.includes(" ")) {
    urlName = urlName.replace(" ", "-");
  }
  console.log(urlName);
  const officalUrl = `https://www.leagueoflegends.com/en-us/champions/${urlName}/`;

  //reads out the data
  championInfo.innerHTML = `
  <p><img class ="champion-image" src ="${image}" alt ="${input}"></p>
  <h2>${name}: ${title}</h2>
  <p><strong>Difficulty:</strong> ${difficulty}</p>
  <h4 class ="lore-heading">Lore</h4>
  <p>${lore}</p>
  <p>For more information on ${input}, you can head over to their official League of Legends champion page <a href="${officalUrl}" target="_blank">here!</a></p>
  `;

  //creates ally and enemy tips
  const allyTips = champion.data[input].allytips[0];

  allyArticle.innerHTML = `<h3 class = "ally-heading">Ally Tips</h3> <p>${allyTips}</p>`;
  allyArticle.style.display = "block";

  const enemyTips = champion.data[input].enemytips[0];

  enemyArticle.innerHTML = `<h3 class = "enemy-heading">Enemy Tips</h3> <p>${enemyTips}</p>`;
  enemyArticle.style.display = "block";
  //if i ever figure out a good way to add spells that isn't just redundant because of the official link, I might come back here
  // <p><strong>Spells:</strong> ${spells}</p>
}

//listener for the "search by difficulty" form
difSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  //gets the number submitted
  const difficulty = parseInt(document.querySelector("#dif-number").value);
  //collects data of ALL champions
  fetch(
    `https://ddragon.leagueoflegends.com/cdn/13.6.1/data/en_US/champion.json`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log("ERROR: CHAMPION NOT FOUND");
      }
    })
    //creates an array with arrays of the champ's id and the champ's data in object form, then filters champs equal to difficulty level
    .then((champions) => {
      const champEntries = Object.entries(champions.data);
      console.log(champEntries);
      const filteredChamps = champEntries.filter(
        ([id, champ]) => champ.info.difficulty === difficulty
      );
      champLister(filteredChamps);
    })
    .catch((error) => console.log(error));

  difSearch.reset();
});

//function to print interactable images of all champs matching dif level
function champLister(champs) {
  //even more variables
  champList.innerHTML = "";
  allyArticle.innerHTML = "";
  enemyArticle.innerHTML = "";
  allyArticle.style.display = "none";
  enemyArticle.style.display = "none";
  //iterates through each champ in the array created and creates an image using the relevant data
  champs.forEach(([id, champ]) => {
    console.log(id);
    const champDiv = document.createElement("div");
    champDiv.classList.add("champion");
    const champImg = document.createElement("img");
    champImg.className = "champion-image";
    champImg.setAttribute(
      "src",
      `https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/${champ.image.full}`
    );
    champImg.setAttribute("alt", `${id}`);
    champDiv.appendChild(champImg);
    //adds an even listener so as you hover a champion's image, a small blurb will appear with their name and title
    champImg.addEventListener("mouseover", (event) => {
      const extraInfo = document.createElement("article");
      extraInfo.classList.add("extra-info");
      extraInfo.innerHTML = `
        <h2>${champ.name}</h2>
        <p>${champ.title}</p>
      `;
      hoverInfo.appendChild(extraInfo);
      hoverInfo.style.display = "block";
    });
    //removes the blurb once you are no longer hovering that champion's image
    champImg.addEventListener("mouseout", (event) => {
      const extraInfo = document.querySelector(".extra-info");
      hoverInfo.removeChild(extraInfo);
    });
    //adds an event listener so if u click on a champ's image, that champs data will be collected and sent to the "champSearcher" function
    champImg.addEventListener("click", () => {
      fetch(
        `https://ddragon.leagueoflegends.com/cdn/13.6.1/data/en_US/champion/${id}.json`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.log("ERROR: CHAMPION NOT FOUND");
          }
        })
        .then((champion) => {
          champSearcher(champion, id);
        })
        .catch((error) => console.log(error));
    });
    champList.appendChild(champDiv);
  });
}
