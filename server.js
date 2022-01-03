const express = require('express');

const app = express();
const pool = require('./db/database');
const port = process.argv[2];
const apiRouter = require('./api');

app.use(express.json())//Nos da acceso al req.body
app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
  

module.exports = app;