// api.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const findUserByEmail = async (email) => {
  try {
    const response = await api.get(`/user?email=${email}`);
    return response.data;
  } catch (error) {
    console.error("Error checking email:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error checking email",
    };
  }
};

export const createAccount = async (email, name, dateOfBirth, password) => {
  try {
    const response = await api.post("/register", {
      email,
      name,
      dateOfBirth,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error creating account",
    };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error logging in",
    };
  }
};

export const getUserPokemons = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}/pokemons`);
    return response.data;
  } catch (error) {
    console.error("Error getting user pokemons:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error getting user pokemons",
    };
  }
};

export const getRandomPokemon = async () => {
  const id = Math.floor(Math.random() * 898) + 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  // Determinar el género aleatoriamente (ya que la API no proporciona esta información directamente)
  const gender = Math.random() > 0.5 ? "male" : "female";

  // De momento todos los pokemons comenzarán con nivel 10
  const level = 10;

  return {
    id: id,
    name: data.name,
    image: data.sprites.other["official-artwork"].front_default,
    gender,
    level,
  };
};

export const searchPokemon = async (pokemonId) => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
  );
  const data = await response.json();

  // Determinar el género aleatoriamente (ya que la API no proporciona esta información directamente)
  const gender = Math.random() > 0.5 ? "male" : "female";

  // De momento todos los pokemons comenzarán con nivel 10
  const level = 10;

  const protoTypes = data.types.map((it) => it.type?.name);
  const types = protoTypes.length ? protoTypes.join(", ") : "";

  return {
    id: pokemonId,
    name: data.name,
    image: data.sprites.other["official-artwork"].front_default,
    gender,
    level,
    types,
  };
};

export const addPokemonToUser = async (userId, pokemon) => {
  try {
    const response = await api.post("/user/pokemon", {
      userId,
      pokemonId: pokemon.id,
      nickname: pokemon.name,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding Pokemon to user:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error adding Pokemon to user",
    };
  }
};

export const addBattleToUserHistory = async (
  userId,
  pokemonId,
  remainHp,
  experienceGained,
  enemyPokemonId,
  enemyPokemonName,
  userWon
) => {
  try {
    const response = await api.post("/battle", {
      userId,
      pokemonId,
      remainHp,
      experienceGained,
      enemyPokemonId,
      enemyPokemonName,
      userWon,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding Pokemon to user:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error adding Pokemon to user",
    };
  }
};

export const getUserBattleHistory = async (userId) => {
  try {
    const response = await api.get(`/battle/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching battle history:", error);
    return { success: false, error: "Error fetching battle history" };
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  findUserByEmail,
  createAccount,
  login,
  getRandomPokemon,
  searchPokemon,
  addPokemonToUser,
  addBattleToUserHistory,
  getUserBattleHistory,
};
