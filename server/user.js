const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const pool = require('../db/database');

app.get('/', (req, res) => {
    const text = 'SELECT * FROM users'
    pool.query(text, (err, result) => {
        if(err){
            return next(err);
        } else {
            res.send(result.rows);
        }        
    })
}); 

app.get('/:userid', (req, res, next) => {
    const userId = parseInt(req.params.userid, 10);
    const text = `SELECT * FROM users WHERE id = $1`;
    pool.query(text, [userId], (err, result) => {
        if (err) {
            throw err
        } else {
            req.user = result.rows[0];
            next();
        }
    })
});

app.get('/:userid', (req, res) => {
    if(!req.user){
        res.status(500).send('User not found');
    } else {
        res.send(req.user);
    }    
})

app.put('/:userid', async (req, res) => {
    const text = 'UPDATE users SET username = $1, address_id = $2, role_id = $3, first_name = $4, last_name = $5, email = $6, telephone_number = $7, password = $8 WHERE id = $9 RETURNING *';
    const {username, addressId, roleId, firstName, lastName, email, telephone, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)
    const id = parseInt(req.params.userid, 10);
    pool.query(text,[username, addressId, roleId, firstName, lastName, email, telephone, hashedPassword, id], (err, result) => {
        if (err) {
            throw err
        } else {
            res.send(result.rows);
        }        
    })
})

app.delete('/:userid', (req, res) => {
    const text = 'UPDATE users SET deleted = true WHERE id = $1;'
    const id = parseInt(req.params.userid, 10);
    pool.query(text, [id], (err, result) => {
        if (err){
            throw err;
        } else {
            res.status(204);
        }
    })
})








module.exports = app;
