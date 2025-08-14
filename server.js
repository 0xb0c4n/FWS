const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

const bdd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fws'
});

bdd.connect(err => {
  if (err) {
    console.log("Error connecting to Db");
    console.log(err)
    return;
  }
  console.log("Connection established");
});

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "Qw9#sDp!kX8$3vTz1Lc0Mn@Y",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// 👉 Servir les fichiers statiques front
app.use(express.static(path.join(__dirname, "public")));

// --- API ---
app.post("/api/signup", async (req, res) => {
  const { name, lastName, email, password, birthdate } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (name, lastname, email, password, birthdate) VALUES (?, ?, ?, ?, ?)";

  bdd.query(sql, [name, lastName, email, hashedPassword, birthdate], (err, result) => {
    if (err) {
      return res.status(400).json({ message: "Email déjà utilisé ou erreur serveur." });
    }
    res.json({ message: "Utilisateur créé avec succès !" });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  bdd.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.length === 0) return res.status(400).json({ message: "Email non trouvé." });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.json({ message: "Connexion réussie", user: req.session.user });
  });
});

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Non connecté" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Erreur de déconnexion" });
    res.clearCookie("connect.sid");
    res.json({ message: "Déconnexion réussie" });
  });
});

app.listen(3000, () => {
  console.log("✅ Serveur opérationnel sur http://localhost:3000");
});
