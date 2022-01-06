const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const app = express();
const pool = require('./db/database');
const PORT = process.env.PORT || 3000;
const apiRouter = require('./server/api');

app.use(express.json())//Nos da acceso al req.body
app.use(passport.initialize());
// app.use(passport.session());
app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
  

module.exports = app;