const express = require('express');
const app = express();

const pool = require('./db/database');

app.get('/', (req, res, next) => {
    const text = 'SELECT * FROM product;'
  
    pool.query(text, (err, result) => {
      if (err){
        return next(err)
      }
      res.send(result.rows);
    }); 
    });

module.exports = app;




