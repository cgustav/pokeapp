import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2 } from "lucide-react";

import api from "../api";

const PokemonCreateAccountScreen = () => {
  const formInitialState = {
    email: "",
    name: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  };
  const [formData, setFormData] = useState(formInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "El correo electrónico es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Correo electrónico inválido";
    if (!formData.name) newErrors.name = "El nombre es requerido";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "La fecha de nacimiento es requerida";
    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.acceptTerms)
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    return newErrors;
  };

  const handleBack = () => {
    navigate(-1); // Navega hacia la pantalla anterior
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Primero, verificar si el correo ya existe
      const emailCheck = await api.findUserByEmail(formData.email);
      if (emailCheck.success) {
        setErrors({ email: "Este correo electrónico ya está registrado" });
        setInterval(() => {
          setIsSubmitting(false);
        }, 5000);
        return;
      }

      setIsSubmitting(true);
      // Si el correo no existe, proceder con la creación de la cuenta
      const result = await api.createAccount(
        formData.email,
        formData.name,
        formData.dateOfBirth,
        formData.password
      );
      setIsSubmitting(false);

      if (result.success) {
        setFormData(formInitialState);
        console.log("Cuenta creada exitosamente");
        navigate("/");
      } else {
        setErrors({
          submit: "Error al crear la cuenta. Por favor, intenta de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error en la creación de cuenta:", error);
      setIsSubmitting(false);
      setErrors({
        submit: "Error en el servidor. Por favor, intenta más tarde.",
      });
    }
  };

  if (isSubmitting) {
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
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <h1 className="legend-font text-2xl font-bold text-center text-blue-600 mb-6">
              Crear Cuenta Pokémon
            </h1>
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  //   style={{color:''}}
                  //   className="legend-font"
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: "acceptTerms",
                        type: "checkbox",
                        checked,
                      },
                    })
                  }
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  Acepto los términos y condiciones
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.acceptTerms}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-y-3">
            <Button
              type="submit"
              className="legend-font w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Crear Cuenta
            </Button>
            <Button
              type="button"
              onClick={handleBack}
              className="legend-font w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Regresar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PokemonCreateAccountScreen;
