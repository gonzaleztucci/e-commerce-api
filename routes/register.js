const { query } = require('express');
const express = require('express');
const app = express(); 
const bcrypt = require('bcrypt');

const pool = require('../db/database');


/**
 * @swagger
 * /api/register:
 *  post:
 *      summary: Creates a new user
 *      tags: [Users]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: varchar(50)
 *                              description: user name
 *                          first_name:
 *                              type: varchar(50)
 *                              description: user first name
 *                          last_name:
 *                              type: varchar(50)
 *                              description: user last name
 *                          password: 
 *                              type: varchar(200)
 *                              description: user encrypted password
 *                          email:
 *                              type: varchar(50)
 *                              description: user email number
 *                          street_name: 
 *                              type: varchar(50)
 *                              description: User´s street name
 *                          telephone_number:
 *                              type: varchar(50)
 *                              description: User´s telephone number
 *                          street_number: 
 *                              type: varchar(5)
 *                              description: User´s street number
 *                          zipcode:
 *                              type: varchar(5)
 *                              description: User´s zipcode
 *                          city:
 *                              type: varchar(20)
 *                              description: User´s city
 *                          country:
 *                              type: varchar(20)
 *                              description: User´s country
 *                          apartment_number:
 *                              type: varchar(20)
 *                              description: User´s apartment number or further info
 *                          role_id:
 *                              type: integer
 *                              description: User role id
 *                      example:
 *                          username: "exampleUser"
 *                          first_name: "John"
 *                          last_name: "Examples"
 *                          password: "verysafepassword"
 *                          email: "stopusingmeasanexample@example.com"
 *                          telephone_number: "+1555666777"
 *                          street_name: "example st."
 *                          street_number: "84"
 *                          zipcode: "90210"
 *                          city: "Beverly Hills"
 *                          country: "United States"
 *                          appartment_number: "N/A"
 *                          role_id: 1
 *                          
 *      responses:
 *          200:
 *              description: User created successfully
 *              content:
 *                  application/json:
 *                      schema: 
 *                          $ref: '#/components/schemas/user'
 *          500: 
 *              $ref: '#components/responses/ServerError'
 */



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
            req.body.user_id = max + 1;
            next();
        }    
})
    }, 
    // IF THERE´S ADDRESS INFO IN THE BODY, A NEW ADDRESS SHOULD BE CREATED
    (req, res, next) => {
        const {street_name, street_number, zipcode, city, country, apartment_number} = req.body;

        if (street_name && street_number && zipcode && city && country) {
            console.log('TODO PARA CREAR ADDRESS')
            const text = 'INSERT INTO address (street_name, street_number, zipcode, city, country, apartment_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;'
            const values = [street_name, street_number, zipcode, city, country, apartment_number]
            pool.query(text, values, (err, results) => {
                if (err) {
                    next(err);
                } else {
                    const {id} = results.rows[0];
                    req.body.address_id = id;
                    next();
                }
            })
        } else {
            next();
        }        
    },
    async (req, res, next) => {
        if(!req.body.user_id){
            next(err);
        } else {
            const text = 'INSERT INTO users (id, username, password, address_id, role_id, first_name, last_name, email, telephone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;';
            const {user_id, username, password, address_id, role_id, first_name, last_name, email, telephone_number} = req.body;
            const hashed_password = await bcrypt.hash(password, 10);
            console.log(hashed_password);
            if(username && password && first_name && last_name && email) {
                pool.query(text, [user_id, username, hashed_password, address_id, role_id, first_name, last_name, email, telephone_number], (err, result) => {
                    if (err){
                        next(err);
                    } else {
                        res.json({
                            status: 'success',
                            data: result.rows
                        });
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
