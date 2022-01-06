const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express(); 

app.get('/', (req, res) => {
    res.send('LOGIN');
})

app.post('/password', passport.authenticate('local'), (req, res) => {
    console.log('ENTRO AL POST');
    const { user } = req;
    console.log(`req object: ${Object.keys(req)}`);
    console.log(req.session);
    console.log(req.isAuthenticated);
    res.json(user);
    
})


module.exports = app;