// app.js or server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const contextResolver = require("./context-resolver");

const isProduction = contextResolver();
console.log("Running in production context? ", isProduction);

require("dotenv").config(
  isProduction ? {} : { path: path.join(__dirname, "..", ".env") }
);

const UserRepository = require("./repositories/user");
const PokemonBattleRepository = require("./repositories/battle");

console.log("db: ", {
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokemon Battle API",
      version: "1.0.0",
      description: "API para manejar usuarios, Pokemon y batallas",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de desarrollo",
      },
    ],
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const userRepo = new UserRepository(pool);
const pokemonBattleRepo = new PokemonBattleRepository(pool);

app.get("/health", async (req, res) => {
  res.json({ status: "OK" });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - dateOfBirth
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         password:
 *           type: string
 *     Pokemon:
 *       type: object
 *       required:
 *         - userId
 *         - pokemonId
 *         - nickname
 *       properties:
 *         userId:
 *           type: integer
 *         pokemonId:
 *           type: integer
 *         nickname:
 *           type: string
 *     Battle:
 *       type: object
 *       required:
 *         - userId
 *         - enemyPokemonId
 *         - enemyPokemonName
 *         - userWon
 *         - date
 *       properties:
 *         userId:
 *           type: integer
 *         enemyPokemonId:
 *           type: integer
 *         enemyPokemonName:
 *           type: string
 *         userWon:
 *           type: boolean
 *         date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userId:
 *                   type: integer
 */
app.post("/register", async (req, res) => {
  const { email, name, dateOfBirth, password } = req.body;
  const result = await userRepo.createAccount(
    email,
    name,
    dateOfBirth,
    password
  );
  res.json(result);
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 pokemons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       pokemon_id:
 *                         type: integer
 *                       nickname:
 *                         type: string
 *                       pokemon_name:
 *                         type: string
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await userRepo.login(email, password);
  res.json(result);
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Buscar un usuario por email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario a buscar
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
app.get("/user", async (req, res) => {
  const { email } = req.query;
  const result = await userRepo.findEmail(email);
  res.json(result);
});

/**
 * @swagger
 * /user/pokemon:
 *   post:
 *     summary: Agregar un Pokémon a un usuario
 *     tags: [Pokemon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pokemon'
 *     responses:
 *       200:
 *         description: Pokémon agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userPokemonId:
 *                   type: integer
 */
app.post("/user/pokemon", async (req, res) => {
  console.log("Pokemon to user: ", req.body);
  const { userId, pokemonId, nickname } = req.body;
  const result = await pokemonBattleRepo.addPokemonToUser(
    userId,
    pokemonId,
    nickname
  );
  res.json(result);
});

/**
 * @swagger
 * /user/{userId}/pokemons:
 *   get:
 *     summary: Obtener los Pokémon de un usuario
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Pokémon del usuario obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pokemons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       pokemon_id:
 *                         type: integer
 *                       nickname:
 *                         type: string
 *                       pokemon_name:
 *                         type: string
 *                       pokemon_image:
 *                         type: string
 */
app.get("/user/:userId/pokemons", async (req, res) => {
  const { userId } = req.params;
  const result = await userRepo.getUserPokemons(userId);
  res.json(result);
});

/**
 * @swagger
 * /battle:
 *   post:
 *     summary: Registrar una batalla
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Battle'
 *     responses:
 *       200:
 *         description: Batalla registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 battleId:
 *                   type: integer
 */
app.post("/battle", async (req, res) => {
  const {
    userId,
    pokemonId,
    remainHp,
    experienceGained,
    enemyPokemonId,
    enemyPokemonName,
    userWon,
  } = req.body;

  console.log("Body: ", req.body);

  const result = await pokemonBattleRepo.addBattleToHistory(
    userId,
    pokemonId,
    remainHp,
    experienceGained,
    enemyPokemonId,
    enemyPokemonName,
    userWon
  );

  res.json(result);
});

/**
 * @swagger
 * /battle/history/{userId}:
 *   get:
 *     summary: Obtener el historial de batallas de un usuario
 *     tags: [Battles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Historial de batallas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 battles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Battle'
 */
app.get("/battle/history/:userId", async (req, res) => {
  console.log("Get battle history api: ", req.params);
  const { userId } = req.params;
  const result = await pokemonBattleRepo.getUserBattleHistory(userId);
  res.json(result);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
