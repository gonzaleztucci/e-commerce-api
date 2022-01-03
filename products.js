const express = require('express');
const app = express();

const pool = require('./db/database');

app.get('/', (req, res, next) => {
    const text = 'SELECT * FROM product;'
  
    pool.query(text, (err, result) => {
      if (err){
        return next(err)
      }
      res.send(result.rows);
    })
    })

app.post('/', (req, res, next) => {

    const text = 'INSERT INTO product (name, description, image_link, deleted) VALUES ($1, $2, $3, $4) RETURNING *;';
    const {name, description, image_link, deleted} = req.body;
    
    pool.query(text, [name, description, image_link, deleted], (err, result) => {
        if (err){
        next(err);
        } else {
        res.json(result.rows);
        }
    })
    })

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

app.put('/:id', (req, res, next) => {
    const text = 'UPDATE product SET name = $1, description = $2, image_link = $3, deleted = $4 WHERE id = $5 RETURNING *;'
    const {name, description, image_link, deleted} = req.body;
    const id = parseInt(req.params.id);

    pool.query(text, [name, description, image_link, deleted, id], (err, result) => {
        if (err){
            throw err
        } else {
            res.json(result.rows)
        }
    })
})

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




