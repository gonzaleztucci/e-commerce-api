const { query } = require('express');
const express = require('express');
const app = express(); 

const pool = require('../db/database');

// const maxId = function (req, res, next) {
//     id = pool.query('SELECT MAX(id) FROM users;', (err, result)=> {
//         if (err){
//             throw err
//         } else {
//             return result
//         }
//     })
// }

app.post('/', (req, res, next) => {
    pool.query('SELECT MAX(id) FROM users;', (err, result) => {
        console.log(req.body);
        if(err){
            throw err
        }
        else{
            const {max} = result.rows[0]; 
            console.log(max);
            req.body.maxId = max;
            next();
        }    
})
  

    }, (req, res, next) => {
        console.log('second');
        console.log(req.body.maxId);
        if(!req.body.maxId){
            res.send('NO HAY USUARIOS'); //REVISAR
        } else {
            const text = 'INSERT INTO users (id, username, password, address_id, role_id, first_name, last_name, email, telephone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;';
            const userId = req.body.maxId + 1;
            console.log(req.body);
            // const userName = req.body.userName;
            // const password = req.body.password;
            // const addressId = req.body.addressId;
            // const roleId = req.body.roleId;
            // const firstName = req.body.firstName;
            // const last
            const {userName, password, addressId, roleId, firstName, lastName, email, telephoneNumber} = req.body;
            pool.query(text, [userId, userName, password, addressId, roleId, firstName, lastName, email, telephoneNumber], (err, result) => {
                if (err){
                    throw err
                    res.sendStatus(404);
                } else {
                    res.json(result.rows);
                }
            })


        }

    })
    


module.exports = app;
