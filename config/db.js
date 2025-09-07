const mysql = require("mysql2");

const bdd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fws'
});

bdd.connect(err => {
  if (err) throw err;
  console.log("✅ Connecté à la base de données.");
});

module.exports = bdd;
