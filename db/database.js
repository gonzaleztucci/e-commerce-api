const {Pool} = require('pg');


const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "rootUser",
  database: "e-commerce"
});

// pool.query('SELECT * FROM users', (err, res) => {
//     console.log(err, res.rows)
//     pool.end()
//   })

  module.exports = {
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    },
  }

  // module.exports = pool;
