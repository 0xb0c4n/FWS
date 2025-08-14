const db = require('../config/db');

const createUser = (user, callback) => {
  const sql = "INSERT INTO users (name, lastname, email, password, birthdate, avatar) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [user.name, user.lastName, user.email, user.password, user.birthdate, ""], callback);
};

const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

const getUserById = ({ userId }, callback) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, [parseInt(userId, 10)], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const sendMessage = (senderId, receiverId, message, callback) => {
  const sql = "INSERT INTO messages (id_sender, id_receiver, message, sent_at) VALUES (?, ?, ?, NOW())";
  db.query(sql, [senderId, receiverId, message], callback);
};

const searchUsersByName = (query, callback) => {
  const sql = "SELECT id, name, lastname FROM users WHERE name LIKE ? OR lastname LIKE ?";
  const likeQuery = `%${query}%`;
  db.query(sql, [likeQuery, likeQuery], callback);
};

const getConversationBetweenUsers = (userId1, userId2, callback) => {
  const sql = `
    SELECT id_sender, id_receiver, message, sent_at FROM messages
    WHERE (id_sender = ? AND id_receiver = ?)
    OR (id_sender = ? AND id_receiver = ?)
    ORDER BY sent_at ASC
  `;
  db.query(sql, [userId1, userId2, userId2, userId1], callback);
};

const getConversationContacts = (userId, callback) => {
  const sql = `
    SELECT DISTINCT u.id, u.name, u.lastname
    FROM users u
    JOIN messages m ON (u.id = m.id_sender OR u.id = m.id_receiver)
    WHERE (m.id_sender = ? OR m.id_receiver = ?) AND u.id != ?
  `;
  db.query(sql, [userId, userId, userId], callback);
};


module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  searchUsersByName,
  getConversationBetweenUsers,
  sendMessage,
  getConversationContacts
};