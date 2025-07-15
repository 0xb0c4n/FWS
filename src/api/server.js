const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql");

const app = express();
const bdd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fws'
});
bdd.connect(function (err) {
  if (err) {
      console.log('Error connecting to Db');
      return;
  }
  console.log('Connection established');
});

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  const { name, lastName, email, password, birthdate } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    
    res.json({ message: "Utilisateur créé avec succès !" });
  } catch (err) {
    res.status(400).json({ message: "Email déjà utilisé ou erreur serveur." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
