const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const pool = require('./db/database');


passport.use(new LocalStrategy((username, password, callback) => {
    
    pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if(err){
            return callback(err);
        } 
        if(!result){
            console.log('Incorrect username or password');
            return callback(null, false, {message: 'Incorrect username or password.'});
        }

        if (result.rows.length > 0) {
            const user = result.rows[0];
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    callback(null, {id: user.id, username: user.username, role: user.role_id});
                } else {
                    console.log('Incorrect username or password');
                    callback(null, false, {message: 'Incorrect username or password.'});
                }
            })
        } else {
            callback(null, false);
        }
    })

}))


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, callback) => {
   pool.query('SELECT id, username, role_id FROM users WHERE id = $1', [parseInt(id,10)], (err, result) => {
        if(err){
            throw err;
        } else {
            callback(null, result.rows[0]);
        }
   }) 
});

module.exports = passport;