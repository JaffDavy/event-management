import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/config.js";
import registrationValidation from "../utils/registrationValidation.js";
import loginValidation from "../utils/loginValidation.js";

dotenv.config();

const router = express.Router();
router.use(bodyParser.json());

// Register a new user
router.post("/register", registrationValidation, async (req, res, next) => {
  console.log("Register route hit");
  const { full_name, password, email } = req.body;
  if (!full_name || !password || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const userCheckQuery = "SELECT * FROM users WHERE email = $1";
    const existingUsers = await pool.query(userCheckQuery, [email]);

    if (existingUsers.rows.length > 0) {
      return res.status(401).json({ error: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (full_name, password, email) VALUES ($1, $2, $3) RETURNING *",
      [full_name, hashedPassword, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Login a user
router.post("/login", loginValidation, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

export default router;