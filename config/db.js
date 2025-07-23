const mysql = require("mysql");

const bdd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fws'
});

bdd.connect(err => {
  if (err) throw err;
  console.log("✅ Connecté à la base de données.");
});

module.exports = bdd;
