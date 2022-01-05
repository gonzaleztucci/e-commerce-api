const express = require('express');
const app = express();

const pool = require('../db/database');

//CREATE A NEW PRODUCT
// Data fields:
//  - Name: NOT NULL 
//  - Description: ALLOW NULL 
//  - Image_link: ALLOW NULL 
//  - DELETED: NOT NULL, should be set to FALSE when created
app.post('/', (req, res, next) => {

    const text = 'INSERT INTO product (name, description, image_link, category, deleted) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
    const {name, description, image_link, category, deleted} = req.body;
    
    pool.query(text, [name, description, image_link, category, deleted], (err, result) => {
        if (err){
        next(err);
        } else {
        res.json(result.rows);
        }
    })
})

// GET ALL PRODUCTS FROM DB
app.get('/', (req, res, next) => {
    const text = 'SELECT * FROM product;'
  
    pool.query(text, (err, result) => {
      if (err){
        return next(err)
      }
      res.send(result.rows);
    })
    })


// GET product by ID
app.get('/:id', (req, res, next) => {

    const text = 'SELECT * FROM product WHERE id = $1';
    const id = parseInt(req.params.id, 10);


    pool.query(text, [id], (err, result) => {
        if(err){
        throw err
        } else {
        res.json(result.rows);
        }
    })
})

//UPDATE PRODUCT
app.put('/:id', (req, res, next) => {
    const text = 'UPDATE product SET name = $1, description = $2, image_link = $3, category =$4, deleted = $5 WHERE id = $6 RETURNING *;'
    const {name, description, image_link, category, deleted} = req.body;
    const id = parseInt(req.params.id);

    pool.query(text, [name, description, image_link, category, deleted, id], (err, result) => {
        if (err){
            throw err
        } else {
            res.json(result.rows)
        }
    })
})

//DELETE PRODUCT
app.delete('/:id', (req, res, next) => {
    const text = 'UPDATE product SET deleted = true WHERE id = $1;'
    const id = parseInt(req.params.id);

    pool.query(text, [id], (err, result) => {
        if (err){
            throw err
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = app;




