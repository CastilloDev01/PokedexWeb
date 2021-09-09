const searchPokemon = document.getElementById("searchPokemon");
const loadMore = document.getElementById("loadMore");
const seePokedex = document.getElementById("seePokedex");
const loadingMessage = document.getElementById("loading-message");
const footer = document.querySelector("footer")

function showButton(show){
	if (show) {
		loadMore.style.visibility = "visible"
	} else {
		loadMore.style.visibility = "hidden"
	}
}

async function showLoadingMessage(show){
	if (show){
		loadingMessage.style.visibility = "visible";
		loadingMessage.style.display= "block";
	} else {
		loadingMessage.style.visibility = "hidden";
		loadingMessage.style.display= "none";
	}
}
async function errorAlert(txt, icon, ){
await showButton(false);
	const pokemonsContainer = document.getElementById("pokemons")
      let button = create("button");
      let img = create("img");
      let name = create("p");
      let id = create("p");
		let pokeball = create("img")

		button.classList.add("item");
		button.style.setProperty("background", "white");
		button.style.setProperty("position", "relative");
		
		id.innerHTML = "N.° "+icon;
		id.classList.add("id-display");
				
		pokeball.src = "assets/pokeball.png"
		pokeball.classList.add("pokeball-display")
		
		img.src = "assets/shape.png";
		img.classList.add("img-display");
		
		name.innerHTML = txt;
		name.classList.add("name-display");
		
		add(id, button);
		add(pokeball, button);
		add(img, button);
		add(name, button);
		add(button, pokemonsContainer);
	
		IdSaved = 0;
		await showLoadingMessage(false);
}

async function Error(reason){
		await showButton(false);
      if (reason === "noMore") {
            nowBreak = true;
				await showLoadingMessage(false);
				errorAlert("No existen más pokemones", "Finish");				
      } else if (reason === "noExist") {
				IdSaved = 0;
				await showLoadingMessage(false);
				errorAlert("Error en la búsqueda, verifica la sintaxis!", "?");
      } else {
				await showLoadingMessage(false);
				IdSaved = 0;
            loadPokemons(12, true);
            errorAlert("Se desató un error interno, reportar!", "!");
      }
}
function create(element){
     return document.createElement(element);
}
function add(Child, Parent){
    return Parent.appendChild(Child);
}   
async function getPokemon(key, loadingKeys){
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}/`)
      if(!res.ok){
			if (!loadingKeys) {
				await Error("noExist") 
			}
			return false
		}

      const data = await res.json();

      let pokemon = {
                  name: data.name,
                  id: data.id,
                  sprites: {},
                  type: {},
                  weight: (data.weight/10).toString() + " kg" ,
                  height: (7/10).toString() + " m",
                  descriptions: [],
                  capture_rate: null,
                  egg_groups: [],
                  generation: null,
                  growth_rate: null,
                  habitat: null,
                  is_legendary: null,
                  is_mythical: null,
                  stats: [],
                  abilities: [],
                  evolution_chains: []
            }
		async function setEvolutionChain(){
			const specieRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${key}/`)
			if(!specieRes.ok){return false}
			const specie = await specieRes.json()
			
			const foundChain = await fetch(specie.evolution_chain.url)
			const chainJson = await foundChain.json()
			const chain = chainJson.chain
			pokemon.evolution_chains.push(chain.species.name);			
			let parent = chain.evolves_to[0];
			
			while (parent) {
				pokemon.evolution_chains.push(parent.species.name);
				parent = parent.evolves_to[0]
			}	
		}
      function setAbilities(){
            for (let i=0; i < data.abilities.length; i++) {
                  let list = data.abilities[i]
                  pokemon.abilities.push(
                  {
                        ability: list.ability.name,
                        slot: list.slot
                  });
            }
      }
      function setPokemonStats(){
            for (let i=0; i < data.stats.length; i++) {
                  pokemon.stats.push(
                        {
                              base_stat: data.stats[i].base_stat,
                              name: data.stats[i].stat.name
                        }
                  )
            }
            return
      }
      let pokemonChain
      async function setDescriptions(lenguage){
            let response = await fetch(`${data.species.url}`); if(!response.ok){return pokemon.Descriptions = null}
            const descriptionsBase = await response.json();
      
            let index = 0;
            for (let i=0; i < descriptionsBase.flavor_text_entries.length; i++) {
                  let description = descriptionsBase.flavor_text_entries[i];
                  
                  if (description.language.name === lenguage) {
                        pokemon.descriptions[index] = {
                              description: description.flavor_text,
                              version: description.version.name.toUpperCase().replace(/-/g, " ")
                        }
                        index += 1
                  }
            }
            pokemonChain = descriptionsBase.evolution_chain["url"];

            pokemon.is_legendary = descriptionsBase.is_legendary;
            pokemon.is_mythical = descriptionsBase.is_mythical;

            let captureRate = descriptionsBase.capture_rate;
            pokemon.capture_rate = [captureRate+"/255", ((captureRate*100)/255).toFixed(2) + "%"];

            pokemon.generation = descriptionsBase.generation.name.toUpperCase();
            pokemon.generation = pokemon.generation.replace(/-/g, " ");

            pokemon.growth_rate = descriptionsBase.growth_rate.name.toUpperCase();
            pokemon.growth_rate = pokemon.growth_rate.replace(/-/g, " ");
				
				if (descriptionsBase.habitat !== null) {
					pokemon.habitat = descriptionsBase.habitat.name.toUpperCase();
				}

            for (let i=0; i < descriptionsBase.egg_groups.length; i++) {
                  pokemon.egg_groups.push(descriptionsBase.egg_groups[i].name.toUpperCase());
            }
      } 
      function name() {
           let firstChar = pokemon.name.toString().substring(0, 1).toUpperCase();
           let restChars = pokemon.name.toString().substring(1, pokemon.name.length);
           pokemon.name = firstChar + restChars 
      } 
      async function setSpritesAndType(){
            let spritesName = Object.keys(data.sprites);
            for (let i = 0; i < spritesName.length; i++){
                 let index = spritesName[i];
                 let value = data.sprites[index];
                 
                  if (value !== null && typeof value !== "object") {
								if (!index.includes("back")) {
                        	pokemon.sprites[index] = value;
								}
                  } else if(index === "other") {
                        // dream world
                        let dream_world = data.sprites.other["dream_world"]
                        let dreamSprites = Object.keys(dream_world);
                        
                        for (let i = 0; i < dreamSprites.length; i++) {
                              let subIndex = dreamSprites[i];
                              let subValue= dream_world[dreamSprites[i]];

                              if (subValue !== null) {
                                    pokemon.sprites[subIndex + "_dream_world"] = subValue;
                              }
                        }

                        // Official artwork
                        pokemon.sprites["official_artwork"] = data.sprites.other["official-artwork"].front_default;
                  }
            } 
				
				function setTypeInfo(types){
					const colors = {
						normal: "#858585",
						fighting: "#FF914D",
						flying: "#90EBFF",
						poison: "#DB41FF",
						ground: "#B55D00",
						rock: "#984500",
						bug: "#00C30D",
						ghost: "#B900FF",
						steel: "#C4C4C4",
						fire: "#FF7101",
						water: "#009CFF",
						grass: "#21EC2F",
						electric: "#FFD900",
						psychic: "#FF7AEB",
						ice: "#15D4FF",
						dragon: "#FFB401",
						dark: "#1B1A41",
						fairy: "#FF7AEB"
					};
					for (let i=0; i<types.length; i++) {
						const newType = types[i].type.name;
						pokemon.type[newType] = colors[newType];
					}
				}
				
             await setTypeInfo(data.types);
      }
      
      await setDescriptions("es")
      // Es necesario que se leea esto primero (getDescriptions), ya que devuelve la cadena de evolucion que es necesaria para otras funciones!
      await name()
      await setSpritesAndType()
      await setPokemonStats()
      await setAbilities()
		await setEvolutionChain()
      return pokemon;
}

function textColorCorrection(element, type){
      type = type.toString().toLowerCase()
      const whiteTypes = [
            "normal", "poison", "ground", "bug", "fire", "water", "fairy", "rock",
            "ghost","steel", "psychic", "dark", "fighting"
      ]

		if (whiteTypes.indexOf(type) !== -1) {
				element.style.setProperty("color", "white")
            return element
      } else {
            return element
      }
}
async function createPokemon(pokemonName, clear){
		await showButton(false);
		if (clear) {
			var content = document.getElementById("pokemons");
			while (content.firstChild) {
				content.removeChild(content.firstChild);
			} 
      }
		
		let pokemonData = await getPokemon(pokemonName) 
		if (!pokemonData) {return}
		
      const pokemonsContainer = document.getElementById("pokemons")
      let button = create("button");
      let img = create("img");
      let name = create("p");
      let id = create("p");
		let pokeball = create("img")

      let types_colors = Object.keys(pokemonData.type);  
      function getColors(){
         for (let i = 0; i < types_colors.length; i++){
					let type = types_colors[i];
					let first_color = pokemonData.type[type];
					return first_color
			 }
		}
		// AQUI //
		const background = await getColors()
		button.id = pokemonData.id;
		button.classList.add("item");
		button.style.setProperty("background", background);
		button.style.setProperty("position", "relative");
		
		id.innerHTML = "N.° "+pokemonData.id;
		id.classList.add("id-display");
		await textColorCorrection(id, types_colors[0]);
		
		pokeball.src = "assets/pokeball.png"
		pokeball.classList.add("pokeball-display")
		
		img.src = pokemonData.sprites.front_default;
		img.classList.add("img-display");
		
		name.innerHTML = pokemonData.name;
		name.classList.add("name-display");
		
		add(id, button);
		add(pokeball, button);
		add(img, button);
		add(name, button);
		add(button, pokemonsContainer);
		
		button.addEventListener("click", function(){
			 seePokemonInfo(button.id);
		})	
		// Termino de empaquetado
		IdSaved = pokemonData.id;
		await showLoadingMessage(false);

		if (clear) {await showButton(true)}
		return pokemonData;
}
var IdSaved = 0; 
var nowBreak = false;

async function loadPokemons(numToLoad, clean){
	await showLoadingMessage(true);
	await showButton(false);
	if (clean) {
		var content = document.getElementById("pokemons");
		while (content.firstChild) {
			content.removeChild(content.firstChild);
		}     
	}

	async function loadPokemon(index){
		let foundPokemon = await getPokemon(index, true)
		if (foundPokemon) {
			let pokemonLoaded = await createPokemon(index, false, true);
			return pokemonLoaded  
		} else {
			Error("noMore")
		}
	}
	let startIndex = (IdSaved + 1);
	let finishIndex = (numToLoad - 1)
	for (let i = 0; i <= finishIndex; i++){
		if (nowBreak) {break}
		await loadPokemon(i + startIndex);	
		await showLoadingMessage(true)
	}
	await showLoadingMessage(false);
	await showButton(true);
}
loadPokemons(12); // Load first 24 pokemons!

var seeNow = false
async function seePokemonInfo(key){
      const data = await getPokemon(key)
      const getColors = Object.keys(data.type)
		
		console.log(data); //pokemon elegido para mirar!
		
      function loadColors(rad, pokemon = null) {
				let pokemon_data = data;
				let colorsRegistred = getColors
				if (pokemon !== null) {
					colorsRegistred = Object.keys(pokemon.type)
					pokemon_data = pokemon
				}
				let colorCode
            if (colorsRegistred.length <= 1) {
                 colorCode = ""
            } else {
					  colorCode = `linear-gradient(${rad}deg, `
				}
				
            for (let i=0; i < colorsRegistred.length; i++){
                  let index = colorsRegistred[i];
                  let color = pokemon_data.type[index];

                  if (colorsRegistred.length > 1) {
                        colorCode += (color + " "+ (100/colorsRegistred.length+ "%" ))
                        if ((i+1) < colorsRegistred.length) {
                              colorCode += ", "
                        }
                  } else {
                        colorCode += color
                  }
            }
				
            if (colorsRegistred.length > 1) {
                 colorCode += ")"
            }
				return colorCode
      }
		let colorCode = await loadColors(0);
		seePokedex.setAttribute("style", "background:"+colorCode)
		
      if (!seeNow) {
            seeNow = true;
            seePokedex.classList.add("occupyScreen");
				
            seePokedex.innerHTML = `
            <button id="closebtn"> < </button>
            <div id="pokedex-body" >
                  <div id="pokedex">
						
                        <p class="center" id="poke-id">N° ${data.id}
									<img src="assets/pokeball.png" id="pokeball-superior">
								</p>
								
                        <div id="pokemon-data">
									<h1 id="pokemon-name" class="center">${data.name.toUpperCase()}</h1>
	
									<div style="display: flex" class="center">
										<button id="previous-sprite" class="change-sprite-button"> < </button>
										<p id="sprite-txt" style="width: 35%">Sprite Default</p>
										<button id="next-sprite" class="change-sprite-button"> > </button>
									</div>
									<h2 class="center title-pokedex">Datos Generales</h2>
									<div class="center" id="general-data">
											<p>Weight: <br/>${data.weight}</p>
											<p id="typesDiv">
													Type: <br/>
											</p>
											<p>Height: <br/>${data.height}</p>
											<p>Egg Group(s): <br/> 
												${data.egg_groups.map((index) => (index)).join(" / ")}
											</p>
											<p> ${data.generation} </p>
											<p>Habitat: <br/>${data.habitat} </p>
											<p>Growt Rate: <br/>${data.growth_rate} </p>
											<p>Capture Rate: <br/>${data.capture_rate[1]} </p>
											<p id="pokemon-rarity">Pokemon Rarity: <br/></p>
									</div>
									<h2 class="center title-pokedex">Descripción</h2>
									<div style="padding: 0px 20px 0px 20px">
											<p id="pokemon-desc"> ${data.descriptions[0].description} </p>

											<div class="center" style="display: flex">
												<button class="nextButton" id="less"> < </button>
												<i id="desc-version" class="center" style="width: 30%; margin: 0px 40px;">
													Versión del juego: <br/>"${data.descriptions[0].version}"
												</i>
												<button class="nextButton" id="plus"> > </button>
											</div>
									</div>
									<div>
										<h2 class="center title-pokedex">Estadísticas</h2>
										<div id="stats-content" style="padding: 20px">
											
										</div>
									</div>
									<div>
										<h2 class="center title-pokedex" style="margin-top: 0px;">Abilidades</h2>
										<div id="abilities" style="padding: 20px">
											
										</div>
									</div>
									
									<div>
										<h2 class="center title-pokedex" style="margin-top: 0px;">Cadena de Evolución</h2>
										<div id="evolution_chains" class="center" style="padding: 20px;display: flex;
    flex-wrap: wrap; align-items: flex-start; justify-content: center;">
											
										</div>
									</div>
                  </div>
						<img id="pokedex-img" src="${data.sprites.front_default}" alt="Pokemon not loaded!, report!"/>
            </div>`
				// todo esto se colocaron con funciones para que no se pause cuando algo no funcione
				
				async function setPokemonStats(id){
					function getColorFromStat(stat){
						stat = stat.replace(/-/g, "_")
						const colors = {
							hp: "#1FA4FF",
							attack: "#FF1F1F",
							defense: "#32FF22",
							special_attack: "#FFD100FF",
							special_defense : "#FF41F6",
							speed: "#B816FF"
						}
						return colors[stat]
					}
					let stats = data.stats
					let statsDiv = document.getElementById(id)
					
					function calculateWidth(base_stat){
						return ((base_stat * 100)/255).toFixed(2)
					}

					for (let i=0; i<stats.length; i++){
						let stat = stats[i].name;
						let base_stat = stats[i].base_stat;
						let background = await getColorFromStat(stat);
						let bar = await calculateWidth(base_stat)+"%";
                       
						statsDiv.innerHTML += `
							<div class="new-stat">
								<p>${stat.toUpperCase().replace(/-/g, " ")}</p>
								<div class="background-bar" 
								style="background:linear-gradient(90deg, ${background} ${bar}, #aaa ${bar});">
									<p>${base_stat}/255</p>
								</div>
							</div>
						`
					}
				}
				
				var descIndex = 0;
            function getButtons(Class, Desc, Version){
					let description = document.getElementById(Desc);
					let version = document.getElementById(Version);

					let Buttons = document.getElementsByClassName(Class);
					
					for (let i=0; i < Buttons.length; i++){
					let button = Buttons[i]
						button.addEventListener("click", function(event){
						let length = data.descriptions.length;
						
							if (button.id == "plus"){
								descIndex += 1
							} else {
								descIndex -= 1	
							}
							if (descIndex >= length) {
								descIndex = 0;
							} else if (descIndex < 0) {
									descIndex = (length - 1);
							}
							description.innerHTML = data.descriptions[descIndex].description;
							version.innerHTML = `Versión del juego: <br/>${data.descriptions[descIndex].version}"`;
						})
					}
				}
				
				function getSpritesButtons(Class){
					let spriteIndex = 0;
					let spritesKeys = Object.keys(data.sprites);
					let gotButtons = document.getElementsByClassName(Class);
					let spriteName = document.getElementById("sprite-txt");
					
					let Image = document.getElementById("pokedex-img")
					
					const texts_reserved = {
						front_default: "Sprite Default",
						front_female: "Sprite Femenino",
						front_shiny: "Sprite Shiny",
						front_shiny_female: "Sprite Femenino Shiny",
						front_default_dream_world: "Versión de Dream World",
						front_female_dream_world: "Versión Femenino de Dream World",
						official_artwork: "Arte oficial"
					}
					
					for (let i=0; i < gotButtons.length; i++){
						let button = gotButtons[i];
						button.addEventListener("click", function(event){
							if (button.id == "next-sprite") {
								spriteIndex += 1;
							} else if(button.id == "previous-sprite"){
								spriteIndex -= 1;
							}
							
							if (spriteIndex > (spritesKeys.length -1)) {
								spriteIndex = 0;							
							} else if (spriteIndex < 0) {
								spriteIndex = (spritesKeys.length - 1);
							}
							Image.src = data.sprites[spritesKeys[spriteIndex]];
							spriteName.innerHTML = "Loading ..."
							Image.addEventListener("load", function(evt){
								spriteName.innerHTML = texts_reserved[spritesKeys[spriteIndex]]
							});
						});
					}
				}
				
			  async function getTypeString(ID, titlesClass){
					  const typesDiv = document.getElementById(ID);
					  const gotType = data.type;
					  const type = getColors;

					  for (let i=0; i < type.length; i++){
							  const typeText = create("small")
							  typeText.setAttribute("style", "background:"+gotType[getColors[i]].toString());  
							  typeText.innerHTML = type[i].toUpperCase();
							  await textColorCorrection(typeText, type[i])
							  typesDiv.appendChild(typeText);
					  }
					
					  const tittles = document.getElementsByClassName(titlesClass);
					  const getEndColor = type[type.length - 1];
					  
					  for (let i=0; i < tittles.length; i++){
					  		let tittle = tittles[i]
							tittle.style.setProperty("background-color", gotType[getEndColor]); 
							tittle.style.setProperty("color", await textColorCorrection(tittle, getEndColor)); 
					  }
				}
				function setPokemonRarity(id){
					let rarity_txt = document.getElementById(id);
					if (data.is_legendary){
						rarity_txt.innerHTML += "LENGENDARY"
					} else if (data.is_mythical) {
						rarity_txt.innerHTML += "MYTHICAL"
					} else {
						rarity_txt.innerHTML += "COMMON"
					}
				}
				
				function setPokemonAbilities(id){
					const abilities = document.getElementById(id);
					const types_colors = Object.keys(data.type); 
					
					data.abilities.forEach((index) => abilities.innerHTML += `
						<div style="display: grid; grid-template-columns: 80% 20%; margin-bottom: 10px;border-radius: 10px;
						background: linear-gradient(135deg, black 65%, ${data.type[types_colors[0]]} 50%)">
							<p style="color:white;padding-left: 20px;">${index.ability.toUpperCase()}</p>
							<p>X ${index.slot}</p>
						</div> `
					)
				}
			async function setPokemonChain(id){
					const div = document.getElementById(id);
					const chain = data.evolution_chains;
					const background = await loadColors(0);
					
					for (let i = 0; i < chain.length; i++) {
						let p = `<p style="width:5%; heigth: 100%; font-size: 30px"> > </p>`
						
						if ((i+1) >= chain.length) {
							p = ``
						}
						
						let pokemon = await getPokemon(chain[i]);
						colorCode = await loadColors(180, pokemon);
						div.innerHTML += `
						<div id="${pokemon.id}" class="center" style=" width: 100px;">
							<img src="${pokemon.sprites.front_default}" style="border: 2px; border-radius: 50%;
						    background: ${colorCode};">
							<p>${pokemon.name}</p>
						</div>
						${p}
						`
					}
				}
				
				await setPokemonAbilities("abilities");
				await setPokemonRarity("pokemon-rarity");
				await setPokemonStats("stats-content");
				await getButtons("nextButton", "pokemon-desc", "desc-version");
            await getTypeString("typesDiv", "title-pokedex");
				await getSpritesButtons("change-sprite-button");
				await setPokemonChain("evolution_chains");
				
            let getCloseButton = document.getElementById("closebtn")
            getCloseButton.addEventListener("click", function(event){
                  seePokedex.classList.remove("occupyScreen");
                  seePokedex.classList.add("closeScreen");
                  seeNow = false;
                  while (seePokedex.firstChild) {
                      seePokedex.removeChild(seePokedex.firstChild);
                  }
            })
      }
}
loadMore.addEventListener("click", function(){
		nowBreak = false;
     loadPokemons(23);
	  console.log("cliked!")
})
searchPokemon.addEventListener("submit", async function(event){
      event.preventDefault();
      let pokemon = document.getElementById("search-pokemon").value.toLowerCase();
      pokemon = pokemon.replace(/\s+/g, "-")
		showLoadingMessage(true);
		nowBreak = true;
		
      if (pokemon === "") {
				nowBreak = false;	
            IdSaved = 0;
            loadPokemons(12, true);
      } else if (pokemon=="deoxys"){
			createPokemon(386, true)
		} else {
			createPokemon(pokemon, true);
		}
})