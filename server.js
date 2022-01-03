const express = require('express');

const app = express();
const pool = require('./db/database');
const port = process.argv[2];


app.use(express.json())//Nos da acceso al req.body

app.get('/products', (req, res, next) => {
  const text = 'SELECT * FROM product;'

  pool.query(text, (err, result) => {
    if (err){
      return next(err)
    }
    res.send(result.rows);
  }); 
  });

app.post('/products', (req, res, next) => {

  const text = 'INSERT INTO product (name, description, image_link) VALUES ($1, $2, $3) RETURNING *;';
  const {name, description, image_link} = req.body;
  
  const newProduct = pool.query(text, [name, description, image_link], (err, result) => {
    if (err){
      next(err);
    } else {
      res.json(result.rows);
    }
  })
})

app.get('/products/:id', (req, res, next) => {

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

app.put('/products/:id', (req, res, next) => {
    const text = 'UPDATE product SET name = $1, description = $2, image_link = $3 WHERE id = $4 RETURNING *;'
    const {name, description, image_link} = req.body;
    console.log(`NAME: ${name}`);
    console.log(`DESCRIPTION: ${description}`);
    console.log(`IMG: ${image_link}`);
    const id = parseInt(req.params.id);

    pool.query(text, [name, description, image_link, id], (err, result) => {
        if (err){
            throw err
        } else {
            res.json(result.rows)
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
  

