const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express(); 

app.get('/', (req, res) => {
    res.send('LOGIN');
})

app.post('/password', passport.authenticate('local'), (req, res) => {
    const { user } = req;
    res.json(user);

    //COULD REDIRECT TO USER PROFILE ONCE LOGIN OK
    // res.redirect('/~' + req.user.username);  
    
})


module.exports = app;