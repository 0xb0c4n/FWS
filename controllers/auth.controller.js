const bcrypt = require("bcrypt");
const User = require("../models/user.model");

exports.get_users = async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "Non connecté" });
  }

  const userId = req.session.user.id;
  console.log("🔎 get_user with id =", userId, "typeof", typeof userId);

  User.getUserById({ userId }, (err, results) => {
    if (err) {
      console.error("❌ SQL error", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const user = results[0];
    console.log(results)
    res.json({ user });
  });
};

exports.searchUsers = (req, res) => {
  const { query } = req.body;
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "Non connecté" });
  }
  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Requête vide" });
  }

  User.searchUsersByName(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    const filtered = results.filter(u => u.id !== req.session.user.id); // exclure soi-même
    res.json(filtered);
  });
};


exports.sendMessage = (req, res) => {
  const senderId = req.session?.user?.id;
  const { receiverId, message } = req.body;

  if (!senderId || !receiverId || !message?.trim()) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }

  User.sendMessage(senderId, receiverId, message, (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de l'envoi" });
    res.json({ message: "Message envoyé" });
  });
};

exports.getConversation = (req, res) => {
  const userId = req.session?.user?.id;
  const { withUserId } = req.query;

  if (!userId || !withUserId) {
    return res.status(400).json({ message: "Paramètres manquants" });
  }

  User.getConversationBetweenUsers(userId, withUserId, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur de chargement" });
    res.json(results);
  });
};

exports.getContacts = (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Non connecté" });

  User.getConversationContacts(userId, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur lors du chargement des contacts" });
    res.json(results);
  });
};

exports.signup = async (req, res) => {
  const { name, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  User.createUser({ name, lastName, email, password: hashedPassword }, (err) => {
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

exports.updateProfile = (req, res) => {
  const userId = req.session?.user?.id;
  const { name, lastname, email, password } = req.body;

  if (!userId || !name || !lastname || !email) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  const updateFields = [name, lastname, email];
  let sql = "UPDATE users SET name = ?, lastname = ?, email = ?";
  if (password && password.trim()) {
    sql += ", password = ?";
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      updateFields.push(hashed);
      finalize();
    });
  } else {
    finalize();
  }

  function finalize() {
    sql += " WHERE id = ?";
    updateFields.push(userId);
    User.db.query(sql, updateFields, (err) => {
      if (err) return res.status(500).json({ message: "Erreur SQL" });
      res.json({ message: "Profil mis à jour" });
    });
  }
};

