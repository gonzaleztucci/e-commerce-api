const { query } = require('express');
const express = require('express');
const app = express(); 

const pool = require('../db/database');


app.post('/', (req, res, next) => {
    // CHECK WHAT IS THE PREVIOUS USER's ID - NO SEQUENCE IN DB
    pool.query('SELECT MAX(id) FROM users;', (err, result) => {
        console.log(req.body);
        if(err){
            next(err);
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
                    next(err);
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
            const {userId, userName, password, addressId, roleId, firstName, lastName, email, telephoneNumber} = req.body;
            if(userName && password && firstName && lastName && email) {
                pool.query(text, [userId, userName, password, addressId, roleId, firstName, lastName, email, telephoneNumber], (err, result) => {
                    if (err){
                        next(err);
                        
                    } else {
                        res.json(result.rows);
                    }
                })

            } else {
                console.log('Please fill the required fields')
                res.status(500).send('Please fill the required fields')
            }

        }
    }, (err, req, res, next) => {
        console.error(`Error: ${err}`);
        res.status(500).send('Something broke!');
    })
    
    

module.exports = app;
