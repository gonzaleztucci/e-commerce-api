const { query } = require('express');
const express = require('express');
const app = express(); 

const pool = require('../db/database');


app.post('/', (req, res, next) => {
    // CHECK WHAT IS THE PREVIOUS USER's ID - NO SEQUENCE IN DB
    pool.query('SELECT MAX(id) FROM users;', (err, result) => {
        console.log(req.body);
        if(err){
            throw err
        }
        else{
            const {max} = result.rows[0]; 
            console.log(max);
            req.body.userId = max + 1;
            next();
        }    
})
    }, 
    // IF THERE´S ADDRESS INFO IN THE BODY, A NEW ADDRESS SHOULD BE CREATED
    (req, res, next) => {
        const {streetName, streetNumber, zipcode, city, country, apartmentNumber} = req.body;
        
        if (streetName && streetNumber && zipcode && city && country) {
            console.log('TODO PARA CREAR ADDRESS')
            const text = 'INSERT INTO address (street_name, street_number, zipcode, city, country, apartment_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;'
            const values = [streetName, streetNumber, zipcode, city, country, apartmentNumber]
            pool.query(text, values, (err, results) => {
                if (err) {
                    throw(err)
                } else {
                    console.log(results.rows);
                }
            })
        } else {
            console.log('NO hay datos para crear address')
            console.log(streetName, streetNumber, zipcode, city, country, apartment)
        }
        next();
    },

    (req, res, next) => {
        if(!req.body.userId){
            res.send('NO HAY USUARIOS'); //REVISAR
        } else {
            const text = 'INSERT INTO users (id, username, password, address_id, role_id, first_name, last_name, email, telephone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;';
            console.log(req.body);
            // const userName = req.body.userName;
            // const password = req.body.password;
            // const addressId = req.body.addressId;
            // const roleId = req.body.roleId;
            // const firstName = req.body.firstName;
            // const last
            const {userId, userName, password, addressId, roleId, firstName, lastName, email, telephoneNumber} = req.body;
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
