const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=809"
    );
    const responseDetail = await Promise.all(
      response.data.results.map(async (pokemon) => {
        const pokeDetails = await axios.get(pokemon.url);
        return {
          name: pokemon.name,
          sprite:
            pokeDetails.data.sprites.other["official-artwork"]?.front_default,
        };
      })
    );

    res.render("index", { pokemons: responseDetail });
  } catch (error) {
    console.error("Error fetching Pokémon data:", error.message);
    console.error(error.response ? error.response.data : error);
    res.status(500).send("Error fetching Pokémon data");
  }
});

app.get("/pokemon/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    );
    const descriptionResponse = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${name}`
    );
    const description =
      descriptionResponse.data.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      )?.flavor_text || "No description available.";

    res.render("pokemon", {
      pokemon: response.data,
      description: description,
    });
  } catch (error) {
    res.status(500).send("Error fetching Pokémon data");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
