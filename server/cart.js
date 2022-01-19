const express = require('express');
const res = require('express/lib/response');
const { parse } = require('pg-protocol');
const app = express();
const pool = require('../db/database');


app.get('/:user_id', (req, res, next) => {
    const text = 'SELECT product.id, product.name, cart.quantity FROM cart JOIN product ON cart.product_id = product.id WHERE cart.user_id = $1;'
    pool.query(text, [parseInt(req.params.user_id, 10)], (err, result) => {
        if (err){
            throw err;
        } else {
            if(result.rows.length === 0){
                res.sendStatus(404);
            } else {
                res.send(result.rows);
            }
            
        }
    })
})

app.post('/', (req, res, next) => {
    const text = 'SELECT * FROM users WHERE id = $1;';
    pool.query(text, [req.body.user_id], (err, result) => {
        if (err) {
            next(err);
        } else {
            if (result.rows.length > 0){
                next();
            } else {
                res.status(500).send('User not fund');
            }
        }
    })

}, (req, res, next) => {
    const text = 'SELECT id FROM product WHERE id = $1;';
    pool.query(text, [req.body.product_id], (err, result) => {
        if (err) {
            next(err);
        } else {
            if (result.rows.length > 0){
                next();
            } else {
                res.status(500).send('Product not fund');
            }
        }
    } );
} ,(req, res, next) => {
    const text = 'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2';
    const user_id = req.body.user_id;
    const product_id = req.body.product_id;

    pool.query(text, [user_id, product_id], (err, result) => {
        if (err){
            next(err);
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
                next(err);
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
            next(err);
        } else {
            res.send(result.rows);
        }
        });
    }
}, (err, req, res, next) => {
    console.error(`Error: ${err}`);
    res.status(500).send('Something broke!')
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


app.post('/checkout', (req, res, next) => {
    // SELECT THE ITEMS FROM THE CART IN ORDER TO PROCESS CHECKOUT
    const text = 'SELECT product.id, product.name, cart.quantity, product.price FROM cart JOIN product ON cart.product_id = product.id WHERE cart.user_id = $1;';
    pool.query(text, [req.body.user_id], (err, result) => {
        if(err) throw err;
        if (result.rows.length === 0) {
            res.send('Cart is empty');
        } else {
            req.body.cart = result.rows;
            next();
        }
    })
}, (req, res, next) => {
    const subtotals = req.body.cart.map(item => {
        const {price} = item;
        console.log(price);
        return parseInt(price,10); 
    });
    const total = subtotals.reduce((a, b) => a + b, 0);
    req.body.total = total;
    next();
}, (req, res, next) => {
    let payment = true;
    // IF PAYMENT WENT TRHOUGH WE SHOULD CREATE AN ORDER
    if(payment){
        console.log('PAYMENT OK');
        next();
    } else {
        res.status(500).send('PAYMENT REJECTED');
    }
}, (req, res, next) => {
    const text = 'INSERT INTO orders (id, user_id, address_id, order_status_id, total ,date) VALUES (nextval(\'order_id_sequence\'),$1, $2, $3, $4, $5) RETURNING id;';
    const timestamp = new Date().toLocaleDateString();
    pool.query(text, [req.body.user_id, req.body.address_id, req.body.order_status_id, req.body.total ,timestamp], (err, result) => {
        if (err) {
            throw err;
        } else {
            req.body.order_id = result.rows[0].id;
            next();
        } 
    } )
}, (req, res, next) => {
     req.body.cart.forEach(item => {
         pool.query('INSERT INTO orders_products (order_id, product_id, quantity) VALUES ($1, $2, $3);', [req.body.order_id, item.id, item.quantity], (err, result) => {
            if (err) {
                throw err;
            }
         } )
    })

    res.send(req.body);

})




module.exports = app;


