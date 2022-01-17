const express = require('express');
const app = express();
const pool = require('../db/database');

app.post('/', (req, res, next) => {
    const text = 'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2';
    const user_id = req.user_id;
    const product_id = req.user_id;

    pool.query(text, [user_id, product_id], (err, result) => {
        if (err){
            throw err;
        } else {
            req.cart_quantity = result.rows;
            console.log(req.cart_quantity);
            console.log('PRIMER METHOD');
            next();
        }        
    })
}, (req, res, next) => {
    if (req.cart_quantity.length === 0) {
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
        const text = 'INSERT INTO cart (user_id, product_id, quantity, date_added) VALUES ($1, $2, $3, $4) RETURNING *;';
        const timestamp = new Date().toLocaleDateString();
        console.log(timestamp);
        const quantity = req.cart_quantity[0] + parseInt(req.quantity, 10);
        pool.query(text, [req.body.user_id, req.body.product_id, req.body.quantity, timestamp], (err, result) => {
            if(err) {
                throw err;
            } else {
                res.send(result.rows);
            }
        });
    }
});






module.exports = app;


