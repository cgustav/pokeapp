import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import {
  Sword,
  Shield,
  RotateCcw,
  Loader2,
  X,
  VolumeX,
  Volume2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import sound from "../assets/pokemon_battle.mp3";
import { useParams } from "react-router-dom";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const MaleIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="8" r="3.5" strokeWidth="2" stroke="#2563EB" />
    <line
      x1="6.35355"
      y1="5.64645"
      x2="11.3536"
      y2="0.646447"
      strokeWidth="2"
      stroke="#2563EB"
    />
    <line
      x1="8.5"
      y1="0.5"
      x2="11.5"
      y2="0.5"
      strokeWidth="2"
      stroke="#2563EB"
    />
    <line
      x1="11.5"
      y1="3.5"
      x2="11.5"
      y2="0.5"
      strokeWidth="2"
      stroke="#2563EB"
    />
  </svg>
);

const FemaleIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="5" r="4.5" strokeWidth="2" stroke="#DB2777" />
    <line x1="5" y1="9" x2="5" y2="14" strokeWidth="2" stroke="#DB2777" />
    <line
      x1="2.5"
      y1="11.5"
      x2="7.5"
      y2="11.5"
      strokeWidth="2"
      stroke="#DB2777"
    />
  </svg>
);

const PokemonBattle = () => {
  const navigate = useNavigate();
  const { playerPokemonId } = useParams();

  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [messages, setMessages] = useState([]);
  const [playerPokemon, setPlayerPokemon] = useState(null);
  const [enemyPokemon, setEnemyPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerAnimation, setPlayerAnimation] = useState("");
  const [enemyAnimation, setEnemyAnimation] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [battleResult, setBattleResult] = useState("");

  const [isMuted, setIsMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(new Audio(sound)); // Asegúrate de tener el archivo de música en la carpeta pública

  const [battleAlreadySaved, setBattleAlreadySaved] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    console.log("Audio: ", audio);
    audio.loop = true;
    audio.volume = 0.4;

    const handleInteraction = () => {
      setAudioReady(true);
      document.removeEventListener("click", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audioReady && !isMuted) {
      audio
        .play()
        .catch((error) => console.log("Error al reproducir audio:", error));
    } else {
      audio.pause();
    }
  }, [audioReady, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleBackToPokedex = () => {
    navigate("/select-pokemon");
  };

  const fetchRandomPokemon = async () => {
    const id = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    // Determinar el género aleatoriamente (ya que la API no proporciona esta información directamente)
    const gender = Math.random() > 0.5 ? "male" : "female";

    // De momento todos los pokemons comenzarán con nivel 10
    const level = 10;

    return {
      pokedexId: id,
      name: data.name,
      image: data.sprites.other["official-artwork"].front_default,
      gender,
      level,
    };
  };

  const loadPokemon = async () => {
    setIsLoading(true);

    console.log("Load pokemon (check player pokemon id): ", playerPokemonId);

    try {
      // const player = await fetchRandomPokemon();
      const player = playerPokemonId?.length
        ? await api.searchPokemon(playerPokemonId)
        : await fetchRandomPokemon();

      console.log("Player: ", player);

      const enemy = await fetchRandomPokemon();
      console.log("Enemy: ", enemy);

      setPlayerPokemon(player);
      setEnemyPokemon(enemy);
      setMessages([
        `¡Una batalla entre ${player.name} y ${enemy.name} ha comenzado!`,
      ]);
    } catch (error) {
      console.error("Error al cargar los Pokémon:", error);
      setMessages([
        "Error al cargar los Pokémon. Por favor, intenta de nuevo.",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPokemon();
  }, [playerPokemonId]);

  useEffect(() => {
    console.log("showModal changed:", showModal);
  }, [showModal]);

  useEffect(() => {
    // console.log("showModal changed:", showModal);
    console.log("(Effect) Checking on playerHP: ", playerHP);
    console.log("(Effect) Checking on enemyHP: ", enemyHP);

    checkBattleEnd();
  }, [playerHP, enemyHP]);

  const saveBattleResult = async ({
    userId,
    pokemonId,
    remainHp,
    experienceGained,
    enemyPokemonId,
    enemyPokemonName,
    userWon,
  }) => {
    console.log("Guardando batalla: ", {
      userId,
      pokemonId,
      remainHp,
      experienceGained,
      enemyPokemonId,
      enemyPokemonName,
      userWon,
    });
    if (!battleAlreadySaved) {
      const battleResponse = await api.addBattleToUserHistory(
        userId,
        pokemonId,
        remainHp,
        experienceGained,
        enemyPokemonId,
        enemyPokemonName,
        userWon
      );

      console.log("Batalla guardada: ", battleResponse);
    }

    setBattleAlreadySaved(true);
  };

  const checkBattleEnd = async () => {
    console.log("Triggering check battle end!");
    console.log("Checking on playerHP: ", playerHP);
    console.log("Checking on enemyHP: ", enemyHP);
    console.log("Checking on battle end enemy: ", enemyPokemon);
    const battleRecord = {
      userId: localStorage.getItem("userId"),
      pokemonId: playerPokemonId,
      remainHp: playerHP,
      experienceGained: Math.floor(Math.random() * 200) + 120,
      enemyPokemonId: enemyPokemon?.pokedexId || 0,
      enemyPokemonName: enemyPokemon?.name || "",
    };

    console.log("Check battle record: ", battleRecord);

    if (playerHP <= 0) {
      setBattleResult(`¡Has perdido la batalla contra ${enemyPokemon.name}!`);
      setIsLoading(true);
      await saveBattleResult({
        ...battleRecord,
        userWon: false,
      });
      setIsLoading(false);

      setShowModal(true);
      return true;
    } else if (enemyHP <= 0) {
      setBattleResult(`¡Has ganado la batalla contra ${enemyPokemon.name}!`);

      setIsLoading(true);
      await saveBattleResult({
        ...battleRecord,
        userWon: true,
      });
      setIsLoading(false);

      setShowModal(true);
      return true;
    }

    return false;
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message].slice(-3));
  };

  const attack = () => {
    setPlayerAnimation("attack");
    setTimeout(() => setEnemyAnimation("damage"), 500);

    const damage = Math.floor(Math.random() * 20) + 10;
    setTimeout(() => {
      setEnemyHP(Math.max(enemyHP - damage, 0));
      const effectiveness = Math.random();
      let effectivenessMessage = "¡Es efectivo!";
      if (effectiveness > 0.9) effectivenessMessage = "¡Es super efectivo!";
      if (effectiveness < 0.2) effectivenessMessage = "No es muy efectivo...";
      addMessage(
        `${playerPokemon.name} ataca. ${effectivenessMessage} Daño: ${damage}`
      );

      // if (checkBattleEnd()) return; // Verificar si la batalla ha terminado

      // checkBattleEnd();
    }, 1000);

    setTimeout(() => {
      setPlayerAnimation("");
      setEnemyAnimation("");
    }, 1500);

    if (enemyHP - damage > 0) {
      setTimeout(() => {
        setEnemyAnimation("attack");
        setTimeout(() => setPlayerAnimation("damage"), 500);
        const enemyDamage = Math.floor(Math.random() * 20) + 10;
        setPlayerHP(Math.max(playerHP - enemyDamage, 0));
        addMessage(
          `${enemyPokemon.name} contraataca. Daño recibido: ${enemyDamage}`
        );
        setTimeout(() => {
          setPlayerAnimation("");
          setEnemyAnimation("");
          // checkBattleEnd();
        }, 1000);

        // checkBattleEnd()
      }, 2000);
    } else {
      setTimeout(() => {
        addMessage(`¡Has derrotado a ${enemyPokemon.name}!`);
        // checkBattleEnd();
      }, 1500);
    }
  };

  const defend = () => {
    setPlayerAnimation("defend");
    const heal = Math.floor(Math.random() * 10) + 5;
    setTimeout(() => {
      setPlayerHP(Math.min(playerHP + heal, 100));
      addMessage(`${playerPokemon.name} se defiende. Recupera ${heal} HP`);
    }, 1000);

    setTimeout(() => {
      setPlayerAnimation("");
      setEnemyAnimation("attack");
      setTimeout(() => setPlayerAnimation("damage"), 500);
      const enemyDamage = Math.floor(Math.random() * 10);
      setPlayerHP((prev) => Math.max(prev - enemyDamage, 0));
      addMessage(`${enemyPokemon.name} ataca. Daño reducido: ${enemyDamage}`);
      setTimeout(() => {
        setPlayerAnimation("");
        setEnemyAnimation("");
        // checkBattleEnd();
      }, 1000);
    }, 2000);
  };

  const resetBattle = () => {
    setPlayerHP(100);
    setEnemyHP(100);
    setPlayerAnimation("");
    setEnemyAnimation("");
    setBattleAlreadySaved(false);
    loadPokemon();
    setShowModal(false);
  };

  const ProgressBar = ({ value }) => {
    let color = "bg-green-500";
    if (value <= 50) color = "bg-yellow-500";
    if (value <= 20) color = "bg-red-500";

    return (
      <div>
        <div className="flex w-full text-center content-center align-center items-center">
          <span className="legend-font pokemon-hp mr-1 sm:mr-2 text-xs sm:text-sm">
            HP
          </span>
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 dark:bg-gray-700">
            <div
              className={`${color} h-3 sm:h-4 rounded-full transition-all duration-300 ease-in-out`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>

        <div className="flex w-full justify-end mt-1">
          <span className="legend-font pokemon-hp-numbers text-xs sm:text-sm">
            {value}/100
          </span>
        </div>
      </div>
    );
  };

  const Pokemon = ({ pokemon, hp, isEnemy, animation }) => (
    <div
      className={`flex flex-col items-center ${
        isEnemy
          ? "self-end pr-2 sm:pr-4 md:pr-8 lg:pr-16 mt-1"
          : "self-start pl-2 sm:pl-4 md:pl-8 lg:pl-16 mb-2 sm:mb-4 md:mb-6"
      }`}
    >
      {pokemon && (
        <>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-80 lg:h-80">
            <img
              src={pokemon.image}
              alt={pokemon.name}
              className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-300
                ${isEnemy ? "transform scale-x-[-1]" : ""}

                ${
                  animation === "attack"
                    ? "translate-x-4 sm:translate-x-6 md:translate-x-8 scale-110"
                    : ""
                }
                ${animation === "defend" ? "scale-90 opacity-75" : ""}
              `}
            />
            {animation === "damage" && (
              <div
                className="absolute top-0 left-0 w-full h-full bg-red-500 mix-blend-multiply animate-flash"
                style={{
                  maskImage: `url(${pokemon.image})`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskImage: `url(${pokemon.image})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  transform: `${isEnemy ? "scaleX(-1)" : "none"}`,
                }}
              ></div>
            )}
          </div>
          <div className="w-full max-w-[200px] sm:max-w-xs md:max-w-sm bg-white rounded-lg p-2 mt-2">
            <div className="flex justify-between mb-1">
              <span className="legend-font pokemon-title capitalize mb-3">
                {pokemon.name}
              </span>
              <div className="flex mt-2">
                {pokemon.gender === "male" ? (
                  <MaleIcon size={15} />
                ) : (
                  <FemaleIcon size={15} />
                )}

                <span className="legend-font ml-2" style={{ fontSize: "14px" }}>
                  Lv. {pokemon.level}
                </span>
              </div>
            </div>
            <ProgressBar value={hp} />
          </div>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-blue-100 sm:p-6 md:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg font-semibold text-blue-700">
          Cargando Pokémon...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-400 to-green-400 p-4 sm:p-6 md:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <Button
          onClick={handleBackToPokedex}
          className="bg-white text-blue-600 hover:bg-blue-100 text-xs sm:text-sm md:text-base"
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Volver a
          Pokédex
        </Button>
        <Button
          onClick={toggleMute}
          className="bg-white text-blue-600 hover:bg-blue-100"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </Button>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <Pokemon
          pokemon={enemyPokemon}
          hp={enemyHP}
          isEnemy={true}
          animation={enemyAnimation}
        />
        <Pokemon
          pokemon={playerPokemon}
          hp={playerHP}
          isEnemy={false}
          animation={playerAnimation}
        />
      </div>
      <Card className="w-full bg-yellow-100 border-4 border-yellow-300 mt-2 sm:mt-4">
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="legend-font pokemon-head text-center mb-2 text-base sm:text-lg md:text-xl font-bold text-blue-600">
            ¡Batalla Pokémon!
          </div>
          <div className="bg-white rounded-lg p-2 mb-2 sm:mb-4 h-16 sm:h-20 md:h-24 overflow-y-auto">
            {messages.map((msg, index) => (
              <p
                key={index}
                className="text-xs sm:text-sm md:text-base text-gray-700 mb-1"
              >
                {msg}
              </p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-2 p-2 sm:p-3 md:p-4">
          <Button
            onClick={attack}
            disabled={
              playerHP === 0 ||
              enemyHP === 0 ||
              playerAnimation ||
              enemyAnimation
            }
            className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm md:text-base"
          >
            <Sword className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Atacar
          </Button>
          <Button
            onClick={defend}
            disabled={
              playerHP === 0 ||
              enemyHP === 0 ||
              playerAnimation ||
              enemyAnimation
            }
            className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm md:text-base"
          >
            <Shield className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Defender
          </Button>
          <Button
            onClick={resetBattle}
            className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm md:text-base"
          >
            <RotateCcw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Nueva
            Batalla
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="legend-font">
              Fin de la Batalla!
            </DialogTitle>
            <DialogDescription className="text-lg">
              {battleResult || "La batalla ha terminado!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                <X className="mr-2 h-5 w-5" /> Cancelar
              </Button>
            </DialogClose>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={resetBattle}
            >
              <Sword className="mr-2 h-5 w-5" /> Nueva Batalla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PokemonBattle;
