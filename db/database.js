const {Pool} = require('pg');
require('dotenv').config();


const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  port: process.env.PGPORT,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});


  module.exports = {
    query: (text, params, callback) => {
      return pool.query(text, params, callback)
    },
  }

