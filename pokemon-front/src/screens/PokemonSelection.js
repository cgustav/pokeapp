import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { History } from "lucide-react";
import api from "../api";

const PokemonSelection = () => {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPokemonImages = async (storedPokemons) => {
      try {
        const updatedPokemons = await Promise.all(
          storedPokemons.map(async (pokemon) => {
            const response = await api.searchPokemon(pokemon.pokedex_id);
            console.log("Response types: ", response.types);
            return {
              ...pokemon,
              image: response.image,
              name: response.name,
              type: response.types,
            };
          })
        );
        setPokemons(updatedPokemons);
        localStorage.setItem("pokemons", JSON.stringify(updatedPokemons));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Pokemon images:", error);
        setError("Error fetching Pokemon images");
        setIsLoading(false);
      }
    };

    const storedPokemons = JSON.parse(localStorage.getItem("pokemons"));
    if (storedPokemons) {
      //   setPokemons(storedPokemons);
      // //   storedPokemons.forEach
      //   setIsLoading(false);
      fetchPokemonImages(storedPokemons);
    } else {
      const userId = localStorage.getItem("userId");
      if (userId) {
        api
          .getUserPokemons(userId)
          .then((response) => {
            if (response.success) {
              setPokemons(response.pokemons);
              localStorage.setItem(
                "pokemons",
                JSON.stringify(response.pokemons)
              );
            } else {
              setError(response.error);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching pokemons:", error);
            setError("Error fetching pokemons");
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = () => {
    localStorage.setItem("isLoggedIn", false);
    navigate("/");
  };

  const getFirstPokemon = async () => {
    try {
      const newPokemon = await api.getRandomPokemon();

      console.log("NEW POKEMON: ", newPokemon);
      const userId = localStorage.getItem("userId");
      console.log("USER ID: ", newPokemon);

      const response = await api.addPokemonToUser(userId, newPokemon);

      console.log("Response (addPokemonToUser) ", response);

      if (response.success) {
        const responsePokemon = await api.searchPokemon(newPokemon.id);

        const storecompliantPokemon = {
          experience: 0,
          nickname: newPokemon.name,
          name: newPokemon.name,
          level: newPokemon.level,
          pokemon_id: response.userPokemonId,
          pokedex_id: newPokemon.id,
          pokemon_name: newPokemon.name,
          image: responsePokemon.image,
          type: responsePokemon.types,
        };

        const updatedPokemons = [storecompliantPokemon];
        setPokemons(updatedPokemons);
        localStorage.setItem("pokemons", JSON.stringify(updatedPokemons));
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error getting first pokemon:", error);
      setError("Error getting first pokemon");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400">
        <p className="text-lg font-semibold text-white">Cargando...</p>
      </div>
    );
  }

  //   return (
  //     <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400">
  //       <h1 className="text-2xl font-bold text-white mb-4">
  //         Selección de Pokémon
  //       </h1>
  //       {error && <p className="text-red-500 mb-4">{error}</p>}
  //       {pokemons.length === 0 ? (
  //         <Button
  //           onClick={getFirstPokemon}
  //           className="bg-yellow-500 hover:bg-yellow-600 text-white"
  //         >
  //           Obtener mi primer Pokémon!
  //         </Button>
  //       ) : (
  //         <div className="w-full max-w-lg">
  //           <ul className="grid grid-cols-2 gap-4">
  //             {pokemons.map((pokemon) => (
  //               <li
  //                 key={pokemon.id}
  //                 className="bg-white p-4 rounded-lg shadow-md"
  //               >
  //                 <img
  //                   src={pokemon.image}
  //                   alt={pokemon.name}
  //                   className="w-full h-32 object-contain"
  //                 />
  //                 <h2 className="text-lg font-bold text-gray-800 mt-2 capitalize">
  //                   {pokemon.name}
  //                 </h2>
  //                 <div className="flex justify-between mt-2">
  //                   <Button
  //                     className="bg-green-500 hover:bg-green-600 text-white"
  //                     onClick={() => navigate(`/battle/${pokemon.id}`)}
  //                   >
  //                     Luchar
  //                   </Button>
  //                   <Button
  //                     className="bg-blue-500 hover:bg-blue-600 text-white"
  //                     onClick={() => navigate(`/rest/${pokemon.id}`)}
  //                   >
  //                     Descansar
  //                   </Button>
  //                 </div>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //       )}
  //       <Button
  //         onClick={logout}
  //         className="mt-4 bg-red-500 hover:bg-red-600 text-white"
  //       >
  //         Salir
  //       </Button>
  //     </div>
  //   );

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-4">
      <h1 className="legend-font text-3xl font-bold text-white mb-4">
        Pokédex
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pokemons.length === 0 ? (
        <Button
          onClick={getFirstPokemon}
          className="bg-yellow-500 hover:bg-yellow-600 text-white mb-4"
        >
          Obtener mi primer Pokémon!
        </Button>
      ) : (
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pokemons.map((pokemon) => (
              <div
                key={pokemon.pokedex_id}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-full h-32 object-contain"
                />
                <h2 className="text-lg font-bold text-gray-800 mt-2 capitalize">
                  {pokemon.name}
                </h2>
                <p className="text-sm text-gray-600">
                  #{pokemon.pokedex_id.toString().padStart(3, "0")}
                </p>
                <div className="flex flex-wrap mt-2">
                  {pokemon.type.split(", ").map((type, index) => (
                    <span
                      key={index}
                      className="bg-green-200 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => navigate(`/battle/${pokemon.pokedex_id}`)}
                    // onClick={() => navigate(`/battle/${pokemon.id}`)}
                  >
                    Luchar
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate(`/rest/${pokemon.id}`)}
                    disabled
                  >
                    Descansar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={() => navigate("/battle-history")}
        className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
      >
        <History className="mr-2 h-5 w-5" /> Historial de Batallas
      </Button>
      <Button
        onClick={logout}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white"
      >
        Salir
      </Button>
    </div>
  );
};

export default PokemonSelection;
