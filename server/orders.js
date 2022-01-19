const express = require('express');
const { get } = require('express/lib/response');
const app = express();

const pool = require('../db/database');

app.get('/', (req, res) => {
    const text = 'SELECT orders.id as "Order number", op.product_id, product.name, op.quantity, product.price, (op.quantity * product.price) AS subtotal FROM orders JOIN orders_products op ON orders.id = op.order_id JOIN product ON op.product_id = product.id WHERE user_id = $1;'
    pool.query(text, [req.body.user_id], (err, result) => {
        if (err){
            throw err;
        } else {
            res.send(result.rows);
        }
    })
});

app.get('/:order_id', (req, res) => {
    const text = 'SELECT op.product_id, product.name, op.quantity, product.price, (op.quantity * product.price) AS subtotal FROM orders JOIN orders_products op ON orders.id = op.order_id JOIN product ON op.product_id = product.id WHERE order_id = $1;'
    pool.query(text, [parseInt(req.params.order_id, 10)], (err, result) => {
        if (err){
            throw err;
        } else {
            res.send(result.rows);
        }
    })
})


module.exports = app; 