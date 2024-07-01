import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Loader2, Play, SquarePen } from "lucide-react";
import api from "../api";

const PokemonInitialScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Simular comprobación de sesión
    setTimeout(() => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
      if (loggedIn) {
        navigate("/select-pokemon");
      }
    }, 1500);
  }, [navigate]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError("Por favor, introduce un correo electrónico válido.");
      return;
    }
    setEmailError("");

    // console.log("Iniciando sesión con:", email);
    // localStorage.setItem("isLoggedIn", "true");
    // navigate("/select-pokemon");

    setIsLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", result.token);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("pokemons", JSON.stringify(result.pokemons));
        navigate("/select-pokemon");
      } else {
        setLoginError(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setLoginError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLoginError("");
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
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 p-4">
      <Card className="w-full max-w-md bg-yellow-100 border-4 border-yellow-300">
        <CardContent className="p-6">
          <h1 className="legend-font text-2xl font-bold text-center text-blue-600 mb-6">
            Bienvenido a Pokémon Battle
          </h1>
          <p className="legend-font text-center text-gray-600 mb-6">
            ¿Ya tienes una cuenta? ingresa! o crea una nueva cuenta.
          </p>
          <Input
            type="email"
            placeholder="Correo electrónico"
            onChange={handleEmailChange}
            value={email}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            onChange={handlePasswordChange}
            value={password}
            className="mb-4"
          />
          {emailError && (
            <p className="text-red-500 text-sm mb-4">{emailError}</p>
          )}
          {loginError && (
            <p className="text-red-500 text-sm mb-4">{loginError}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            disabled={!email.trim() || !password.trim()}
            onClick={handleLogin}
            className="legend-font w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Play className="mr-2" /> Iniciar Sesión
          </Button>
          <Button
            onClick={handleCreateAccount}
            className="legend-font w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <SquarePen className="mr-2" /> Crear Cuenta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PokemonInitialScreen;
