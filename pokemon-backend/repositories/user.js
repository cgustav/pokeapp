const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async createAccount(email, name, dateOfBirth, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await this.pool.execute(
        "INSERT INTO users (email, name, date_of_birth, password) VALUES (?, ?, ?, ?)",
        [email, name, dateOfBirth, hashedPassword]
      );
      return { success: true, userId: result.insertId };
    } catch (error) {
      console.error("Error creating account:", error);
      return { success: false, error: "Error creating account" };
    }
  }

  async login(email, password) {
    try {
      const [rows] = await this.pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (rows.length === 0) {
        return { success: false, error: "Usuario/Contraseña incorrectos." };
      }
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, error: "Usuario/Contraseña incorrectos." };
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Get user's pokemons
      const pokemons = await this.getUserPokemons(user.id);

      return { success: true, token, userId: user.id, pokemons };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, error: "Error logging in" };
    }
  }

  async getUserPokemons(userId) {
    try {
      const [rows] = await this.pool.execute(
        "SELECT up.nickname, up.level, up.experience, up.pokemon_id AS pokemon_id, p.name AS pokemon_name, p.pokedex_id AS pokedex_id FROM user_pokemon up JOIN pokemon p ON up.pokemon_id = p.id WHERE up.user_id = ?",
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting user pokemons:", error);
      return [];
    }
  }

  async findEmail(email) {
    try {
      const [rows] = await this.pool.execute(
        "SELECT id, email, name FROM users WHERE email = ?",
        [email]
      );
      if (rows.length === 0) {
        return { success: false, error: "User not found" };
      }
      return { success: true, user: rows[0] };
    } catch (error) {
      console.error("Error finding user:", error);
      return { success: false, error: "Error finding user" };
    }
  }
}

module.exports = UserRepository;
