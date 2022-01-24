const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express(); 

// app.use('/', (req, res, next) => {
//     const { user } = req;
//     if (user){
//         res.send(`LOGIN - ${user}`);
//     } else {
//         console.log(' no user, should redirect')
//         next();
//     }
// })

app.post('/', passport.authenticate('local'), (req, res) => {
    const { user } = req;
    console.log(JSON.stringify(req.user));
    res.json(user);

    //COULD REDIRECT TO USER PROFILE ONCE LOGIN OK
    // res.redirect('/~' + req.user.username);  
})



app.post('/password', passport.authenticate('local'), (req, res) => {
    const { user } = req;
    res.json(user);

    //COULD REDIRECT TO USER PROFILE ONCE LOGIN OK
    // res.redirect('/~' + req.user.username);  
    
})


module.exports = app;