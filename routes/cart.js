const express = require('express');
const { send } = require('express/lib/response');
const res = require('express/lib/response');
const { parse } = require('pg-protocol');
const app = express();
const pool = require('../db/database');

/**
 * @swagger
 * components:
 *  schemas: 
 *      cartItem: # Can be referenced as '#/components/schemas/cartItem'
 *          type: object
 *          required:
 *              - user_id
 *              - product_id
 *              - quantity
 *          properties:
 *              user_id:
 *                  type: integer
 *                  description: user id
 *              product_id:
 *                  type: integer
 *                  description: product id
 *              quantity: 
 *                  type: integer
 *                  description: quantity to in the cart
 *          example:
 *              user_id: 3
 *              product_id: 7
 *              quantity: 10
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Cart
 *  description: Cart managing API
 */

/**
 * @swagger
 * /api/cart/{id}:
 *  get:
 *      summary: Returns all items in cart based on user id
 *      tags: [Cart]
 *      parameters:
 *          - $ref: '#/components/parameters/userId'
 *      responses:
 *          200:
 *              description: Returns user´s products in the cart
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                               status:
 *                                  type: string
 *                               results:
 *                                  type: integer
 *                               data:
 *                                  $ref: '#/components/schemas/cartItem'
 *          404:
 *              $ref: '#components/responses/NotFound'
 *          500: 
 *              $ref: '#components/responses/ServerError'
 */
app.get('/:user_id', (req, res, next) => {
    const text = 'SELECT product.id, product.name, cart.quantity FROM cart JOIN product ON cart.product_id = product.id WHERE cart.user_id = $1;'
    pool.query(text, [parseInt(req.params.user_id, 10)], (err, result) => {
        if (err){
            res.status(500).send('Something broke');
        } else {
            if(result.rows.length === 0){
                res.sendStatus(404);
            } else {
                res.json({
                    status: 'success',
                    results: result.rows.length,
                    data: result.rows});
            }
            
        }
    })
})

/**
 * @swagger
 * /api/cart:
 *  post:
 *      summary: Inserts products into the user cart
 *      tags: [Cart]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/cartItem'
 *      responses:
 *          200:
 *              description: item was added to cart
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                               status: 
 *                                  type: string
 *                               data:
 *                                  $ref: '#/components/schemas/cartItem'
 *          500: 
 *              $ref: '#components/responses/ServerError'
 *      
 */
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
            res.json({
                status: 'success',
                data: result.rows
            });
        }
        });
    }
}, (err, req, res, next) => {
    console.error(`Error: ${err}`);
    res.status(500).send('Something broke!')
});

/**
 * @swagger
 * /api/cart/:
 *  put:
 *      summary: updates a product in the cart
 *      tags: [Cart]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/cartItem'
 *      responses:
 *          200:
 *              description: cart updated succesfully
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: object
 *                         properties:
 *                             status: 
 *                                type: string
 *                             data:
 *                               $ref: '#/components/schemas/cartItem'
 *          500:
 *              $ref: '#components/responses/ServerError'
 *          404: 
 *              $ref: '#components/responses/NotFound'
 *      
 */

app.put('/', (req, res, next) => {
    const text = 'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2;';
    pool.query(text, [req.body.user_id, req.body.product_id], (err, result) => {
        if (err) res.status(500).send('Something broke!');
        if (result.rows.length > 0) {
            next();
        } else {
            res.status(404).send('Product not in user cart');
        }
    })

} ,(req, res) => {
    const timestamp = new Date().toLocaleDateString();
    const text = 'UPDATE cart SET quantity = $3, date_added = $4 WHERE user_id = $1 AND product_id = $2 RETURNING *;';
    pool.query(text, [req.body.user_id, req.body.product_id, req.body.quantity, timestamp], (err, result) => {
        if (err) {
            throw err;
        } else {
            res.json({
                status: 'success',
                data: result.rows
            });
        }
    });
});


/**
 * @swagger
 * /api/cart/{id}:
 *  delete:
 *      summary: deletes products from user´s cart
 *      tags: [Cart]
 *      parameters:
 *          -   in: path
 *              name: id
 *              description: product id
 *              required: true
 *              schema:
 *                  type: integer
 *      responses: 
 *          204:
 *              description: product deleted succesfully
 *          500:
 *              $ref: '#components/responses/ServerError'
 */
app.delete('/:product_id', (req, res)=>{
    const productId = parseInt(req.params.product_id, 10);
    const text = 'DELETE from cart WHERE user_id = $1 AND product_id = $2;'
    pool.query(text, [req.body.user_id, productId], (err, result) => {
        if(err) {
            send.status(500).send('Something broke');
        } else {
            res.status(204).send('Item deleted from cart');
        }
    })
})

/**
 * @swagger
 * /api/cart/checkout:
 *  post: 
 *      summary: Processes the cart items and creates a new order
 *      tags:
 *          - Checkout
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user_id:
 *                              type: integer
 *                          address_id:
 *                              type: integer
 *                          order_status_id:
 *                              type: integer
 *      responses: 
 *          200: 
 *              description: order placed successfully
 *              content:
 *                 application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                 type: string
 *                              order_id:
 *                                 type: integer
 *                              items: 
 *                                 type: array
 *                                 items: 
 *                                    $ref: '#/components/schemas/cartItem'
 *                      
 *          500:
 *              $ref: '#components/responses/ServerError'
 */
app.post('/checkout', (req, res, next) => {
    // SELECT THE ITEMS FROM THE CART IN ORDER TO PROCESS CHECKOUT
    const text = 'SELECT product.id, product.name, cart.quantity, product.price, (cart.quantity * product.price) AS subtotal FROM cart JOIN product ON cart.product_id = product.id WHERE cart.user_id = $1;';
    pool.query(text, [req.body.user_id], (err, result) => {
        if(err) res.status(500).send('Internal Server Error');
        if (result.rows.length === 0) {
            res.send('Cart is empty');
        } else {
            req.body.cart = result.rows;
            next();
        }
    })
}, (req, res, next) => {
    const subtotals = req.body.cart.map(item => {
        const {subtotal} = item;
        console.log(subtotal);
        return parseInt(subtotal,10); 
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
                res.status(500).send('Something broke');
            }
         } )

        pool.query('DELETE FROM cart WHERE user_id = $1 AND product_id = $2;', [req.body.user_id, item.id], (err, result) => {
            if(err){
                res.status(500).send('Something broke');
            } else {
                console.log(`${item.name} deleted from cart`);
            }
            });
        
    })

    res.json({
        status: 'success',
        order_id: req.body.order_id,
        items: req.body.cart
    })

})




module.exports = app;


