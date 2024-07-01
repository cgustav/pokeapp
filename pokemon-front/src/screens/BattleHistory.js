import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, ArrowLeft, Trophy, XCircle } from "lucide-react";
import api from "../api";
import { Container } from "postcss";

const BattleHistory = () => {
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBattleHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await api.getUserBattleHistory(userId);
        console.log("Response history: ", response);
        if (response.success) {
          const battlesWithImages = await Promise.all(
            response.battles.map(async (battle) => {
              const user_pokemon_image = await getPokemonImage(
                battle.pokemon_pokedex_id
              );
              const enemy_pokemon_image = await getPokemonImage(
                battle.enemy_pokemon_pokedex_id
              );
              return { ...battle, user_pokemon_image, enemy_pokemon_image };
            })
          );
          setBattles(battlesWithImages);
        } else {
          setError(response.error);
        }
      } catch (error) {
        console.error("Error fetching battle history:", error);
        setError("Error fetching battle history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleHistory();
  }, []);

  const getPokemonImage = async (pokedexId) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokedexId}`
      );
      const data = await response.json();
      console.log("get pokemon image: ", data.sprites.front_default);
      return data.sprites.front_default;
    } catch (error) {
      console.error("Error fetching Pokemon image:", error);
      return null;
    }
  };

  const getBattleResultColor = (userWon) => {
    return userWon
      ? "bg-green-100 border-green-500"
      : "bg-red-100 border-red-500";
  };

  const getPokemonName = (pokemonId) => {
    const my_pokemons = JSON.parse(localStorage.getItem("pokemons"));
    const selected = my_pokemons.find(
      (pokemon) => pokemon.pokemon_id === pokemonId
    );
    return selected.name;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400">
        <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
        <p className="text-lg font-semibold text-white">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gradient-to-b from-blue-400 to-green-400 p-4">
      <h1 className="legend-font text-3xl font-bold text-white mb-4">
        Historial de Batallas
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Card className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <CardContent className="flex-grow overflow-y-auto p-4">
          {battles.length === 0 ? (
            <p className="text-gray-600 text-center">
              No hay batallas registradas aún.
            </p>
          ) : (
            <ul className="space-y-4">
              {battles.map((battle, index) => (
                <li
                  key={index}
                  className={`border-2 rounded-lg p-4 ${getBattleResultColor(
                    battle.user_won
                  )}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="legend-font text-lg font-bold text-gray-800">
                      Batalla #{battle.id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {new Date(battle.battle_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <img
                        src={battle.user_pokemon_image}
                        alt={getPokemonName(battle.pokemon_id)}
                        className="w-16 h-16 mr-2"
                      />
                      <div>
                        <p className="font-semibold">Tu Pokémon:</p>
                        <p className="capitalize">
                          {getPokemonName(battle.pokemon_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-2">
                        <p className="font-semibold">Oponente:</p>
                        <p className="capitalize">
                          {battle.enemy_pokemon_name}
                        </p>
                      </div>
                      <img
                        src={battle.enemy_pokemon_image}
                        alt={battle.enemy_pokemon_name}
                        className="w-16 h-16"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-semibold flex items-center">
                      Resultado:
                      {battle.user_won ? (
                        <Trophy className="ml-2 text-yellow-500" />
                      ) : (
                        <XCircle className="ml-2 text-red-500" />
                      )}
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">
                      Experiencia ganada:{" "}
                      {battle.user_won ? battle.experience_gained : 0}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Button
        onClick={() => navigate("/select-pokemon")}
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Volver a la Pokédex
      </Button>
    </div>
  );
};

export default BattleHistory;
