const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { get } = require("../db/database");
const { jwtSecret } = require("../config");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, city: user.city, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

