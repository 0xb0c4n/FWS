const db = require('../config/db');

const createUser = (user, callback) => {
  const sql = "INSERT INTO users (name, lastname, email, password, birthdate) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [user.name, user.lastName, user.email, user.password, user.birthdate], callback);
};

const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

module.exports = { createUser, findUserByEmail };
