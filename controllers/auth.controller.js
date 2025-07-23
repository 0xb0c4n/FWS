const bcrypt = require("bcrypt");
const User = require("../models/user.model");

exports.signup = async (req, res) => {
  const { name, lastName, email, password, birthdate } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  User.createUser({ name, lastName, email, password: hashedPassword, birthdate }, (err) => {
    if (err) return res.status(400).json({ message: "Email déjà utilisé ou erreur serveur." });
    res.json({ message: "Utilisateur créé avec succès !" });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByEmail(email, async (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.length === 0) return res.status(400).json({ message: "Email non trouvé." });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Mot de passe incorrect" });

    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ message: "Connexion réussie", user: req.session.user });
  });
};

exports.me = (req, res) => {
  if (req.session.user) return res.json({ user: req.session.user });
  res.status(401).json({ message: "Non connecté" });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Erreur de déconnexion" });
    res.clearCookie("connect.sid");
    res.json({ message: "Déconnexion réussie" });
  });
};
