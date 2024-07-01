const fetch = require("node-fetch");

class PokemonBattleRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async addPokemonToUser(userId, pokemonId, nickname) {
    try {
      // Comprobar si el pokemonId ya existe
      const [existingPokemon] = await this.pool.execute(
        "SELECT * FROM pokemon WHERE pokedex_id = ?",
        [pokemonId]
      );

      if (existingPokemon.length === 0) {
        // return { success: false, error: "Pokemon ID does not exist" };

        const pokemonData = await this.getPokemonDataFromApi(pokemonId);
        if (!pokemonData) {
          return {
            success: false,
            error: "Error fetching Pokemon data from API",
          };
        }

        await this.pool.execute(
          "INSERT INTO pokemon (pokedex_id, name, type, base_experience) VALUES (?, ?, ?, ?)",
          [
            pokemonData.pokedex_id,
            pokemonData.name,
            pokemonData.type,
            pokemonData.base_experience,
          ]
        );
      }

      // Obtener el id del Pokémon recién insertado o existente
      const [pokemonRecord] = await this.pool.execute(
        "SELECT id FROM pokemon WHERE pokedex_id = ?",
        [pokemonId]
      );
      const pokemonDbId = pokemonRecord[0].id;

      // Insertar el Pokémon en la tabla user_pokemon
      const [result] = await this.pool.execute(
        "INSERT INTO user_pokemon (user_id, pokemon_id, nickname) VALUES (?, ?, ?)",
        [userId, pokemonDbId, nickname]
      );

      return { success: true, userPokemonId: result.insertId };
    } catch (error) {
      console.error("Error adding Pokemon to user:", error);
      return { success: false, error: "Error adding Pokemon to user" };
    }
  }

  async getPokemonDataFromApi(pokemonId) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
      );
      const data = await response.json();

      // Crear un objeto con la estructura de los datos del Pokémon
      return {
        pokedex_id: pokemonId,
        name: data.name,
        type: data.types.map((t) => t.type.name).join(", "), // Combinamos los tipos en una cadena
        base_experience: data.base_experience,
      };
    } catch (error) {
      console.error("Error fetching Pokemon data from API:", error);
      return null;
    }
  }

  async addBattleToHistory(
    userId,
    pokemonId,
    remainingHp,
    experienceGained,
    enemyPokemonId,
    enemyPokemonName,
    userWon
  ) {
    try {
      console.log("addBattleToHistory: ", {
        userId,
        pokemonId,
        remainingHp,
        experienceGained,
        enemyPokemonId,
        enemyPokemonName,
        userWon,
      });

      const [pokemonResult] = await this.pool.execute(
        "SELECT * FROM pokemon WHERE pokedex_id = ? ",
        [pokemonId]
      );

      console.log("Pokemon result is: ", pokemonResult);

      if (!pokemonResult) {
        return { success: false, error: "Pokemon is not registered yet" };
      }

      console.log("pokemonResult id ", pokemonResult[0].id);

      const [result] = await this.pool.execute(
        "INSERT INTO battle_history (user_id, pokemon_id, pokemon_pokedex_id, remaining_hp, experience_gained, enemy_pokemon_pokedex_id, enemy_pokemon_name, user_won) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          pokemonResult[0].id,
          pokemonId,
          remainingHp,
          experienceGained,
          enemyPokemonId,
          enemyPokemonName,
          userWon,
        ]
      );
      return { success: true, battleId: result.insertId };
    } catch (error) {
      console.error("Error adding battle to history:", error);
      return { success: false, error: "Error adding battle to history" };
    }
  }

  async getUserBattleHistory(userId) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT *
           FROM battle_history bh
           WHERE bh.user_id = ?
           ORDER BY bh.battle_date DESC`,
        [userId]
      );

      console.log("Rows: ", rows);
      return { success: true, battles: rows };
    } catch (error) {
      console.error("Error getting user battle history:", error);
      return { success: false, error: "Error getting user battle history" };
    }
  }
}

module.exports = PokemonBattleRepository;
