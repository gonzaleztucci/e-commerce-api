const express = require('express');

const app = express();
const pool = require('../db/database');
const PORT = process.env.PORT || 3000;
const apiRouter = require('./api');

app.use(express.json())//Nos da acceso al req.body
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
  

module.exports = app;