const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const pool = require('../db/database');

/**
 * @swagger
 * components:
 *  schemas:
 *      user:
 *          type: object
 *          required:
 *              -   username
 *              -   email
 *              -   password
 *              -   deleted
 *          properties:
 *              id:
 *                  type: integer
 *                  description: autogenerated id
 *              username:
 *                  type: varchar(50)
 *                  description: user name
 *              address_id:
 *                  type: integer
 *                  description: Foreign key to address table
 *              role_id:
 *                  type: integer
 *                  description: Foreign key to role table
 *              first_name:
 *                  type: varchar(50)
 *                  description: user first name
 *              last_name:
 *                  type: varchar(50)
 *                  description: user last name
 *              email: 
 *                  type: varchar(50)
 *                  description: user email address
 *              telephone_number:
 *                  type: varchar(50)
 *                  description: user telephone number
 *              password: 
 *                  type: varchar(200)
 *                  description: encrypted user password
 *              deleted:
 *                  type: boolean
 *                  description: user deletion indicator
 *          example:
 *              id: 3
 *              username: "exampleUser"
 *              address_id: 3
 *              role_id: 1
 *              first_name: "John"
 *              last_name: "Examples"
 *              email: "stopusingmeasanexample@example.com"
 *              telephone_number: "+1555666777"
 *              password: "$2b$10$6WUwFrq4cznTgSiB6VJSk.lBgoZmO7P8.7ORIByJuwLLhidMxStxG"
 *              deleted: false
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: User managing API
 */

/**
 * @swagger
 * /api/user:
 *  get:
 *      summary: Returns the list of all the users in the database
 *      tags: [Users]
 *      responses:
 *          200:
 *              description: The list of users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/user'
 * 
 */
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

/**
 * @swagger
 * /api/user/{id}:
 *  get:
 *      summary: Returns the user corresponding to the id given in the URL
 *      tags: [Users]
 *      parameters:
 *          -   name: id
 *              in: path
 *              description: user id
 *              type: integer
 *              required: true
 *      responses:
 *          200:    
 *              description: User requested
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/user'
 *          404:
 *              description: User not found
 *          500:
 *              description: Internal server error
 */

app.get('/:userid', (req, res, next) => {
    const userId = parseInt(req.params.userid, 10);
    const text = `SELECT * FROM users WHERE id = $1`;
    pool.query(text, [userId], (err, result) => {
        if (err) {
            res.status(500).send('Server error');
        } else {
            req.user = result.rows[0];
            next();
        }
    })
});

app.get('/:userid', (req, res) => {
    if(!req.user){
        res.status(404).send('User not found');
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
