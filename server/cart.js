const express = require('express');
const { parse } = require('pg-protocol');
const app = express();
const pool = require('../db/database');

app.post('/', (req, res, next) => {
    const text = 'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2';
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;

    pool.query(text, [user_id, product_id], (err, result) => {
        if (err){
            throw err;
        } else {
            if(result.rows.length > 0){
                const {quantity} = result.rows[0];
                req.body.cart_quantity = quantity;
            } else {
                req.body.cart_quantity = 0;
            }
                       
            next();
        }        
    })
}, (req, res, next) => {
    console.log(`CART QUANTITY: ${req.body.cart_quantity}`);
    if (req.body.cart_quantity === 0) {
        const text = 'INSERT INTO cart (user_id, product_id, quantity, date_added) VALUES ($1, $2, $3, $4) RETURNING *;';
        const timestamp = new Date().toLocaleDateString();
        console.log(timestamp);
        console.log(`user_id: ${req.body.user_id}  product_id: ${req.body.product_id}  quantity: ${req.body.quantity}`)
        pool.query(text, [parseInt(req.body.user_id, 10), parseInt(req.body.product_id, 10), parseInt(req.body.quantity, 10), timestamp], (err, result) => {
            if(err) {
                throw err;
            } else {
                res.send(result.rows);
            }
        });
    } else {
        
        const text = 'UPDATE cart SET quantity = $3, date_added = $4 WHERE user_id = $1 AND product_id = $2 RETURNING *;';
        const timestamp = new Date().toLocaleDateString();
        const quantity = req.body.cart_quantity + req.body.quantity;
        pool.query(text, [req.body.user_id, req.body.product_id, quantity , timestamp], (err, result) => {
        if(err) {
            throw err;
        } else {
            res.send(result.rows);
        }
        });
    }
});

app.put('/', (req, res) => {
    const timestamp = new Date().toLocaleDateString();
    const text = 'UPDATE cart SET quantity = $3, date_added = $4 WHERE user_id = $1 AND product_id = $2 RETURNING *;';
    pool.query(text, [req.body.user_id, req.body.product_id, req.body.quantity, timestamp], (err, result) => {
        if (err) {
            throw err;
        } else {
            res.send(result.rows);
        }
    });
});

app.delete('/:product_id', (req, res)=>{
    const productId = parseInt(req.params.product_id, 10);
    const text = 'DELETE from cart WHERE user_id = $1 AND product_id = $2;'
    pool.query(text, [req.body.user_id, productId], (err, result) => {
        if(err) {
            throw err;
        } else {
            res.status(204).send('Item deleted from cart');
        }
    })
})





module.exports = app;


