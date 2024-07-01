-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS pokemon_game;
USE pokemon_game;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Crear tabla de Pokémon
CREATE TABLE IF NOT EXISTS pokemon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pokedex_id INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  base_experience INT NOT NULL
);

-- Crear tabla de relación entre usuarios y Pokémon
CREATE TABLE IF NOT EXISTS user_pokemon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pokemon_id INT NOT NULL,
  nickname VARCHAR(255),
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
);

-- Crear tabla de historial de batallas (modificada)
CREATE TABLE IF NOT EXISTS battle_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pokemon_id INT NOT NULL,
  pokemon_pokedex_id INT NOT NULL,
  experience_gained INT NOT NULL,
  remaining_hp INT NOT NULL,
  enemy_pokemon_pokedex_id INT NOT NULL,
  enemy_pokemon_name VARCHAR(255) NOT NULL,
  user_won BOOLEAN NOT NULL,
  battle_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_user_pokemon ON user_pokemon(user_id, pokemon_id);
CREATE INDEX idx_battle_user ON battle_history(user_id);
CREATE INDEX idx_battle_enemy ON battle_history(enemy_pokemon_pokedex_id);
CREATE INDEX idx_battle_date ON battle_history(battle_date);