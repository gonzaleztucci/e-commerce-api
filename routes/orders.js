const express = require('express');
const { get } = require('express/lib/response');
const { strategies } = require('passport/lib');
const app = express();

const pool = require('../db/database');

/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: Order managing API
 *      
 */


/**
 * @swagger
 * /api/orders/{id}:
 *  get:
 *      summary: Returns all orders for the user
 *      tags: [Orders]
 *      parameters:
 *          - $ref: '#/components/parameters/userId'
 *      responses: 
 *          200:
 *              description: All orders for the user
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                               $ref: '#components/schemas/order'                                                                      
 *          500:
 *              $ref: '#components/responses/ServerError'
 */
app.get('/:user_id', (req, res) => {
    const text = 'SELECT orders.id, op.product_id, product.name, op.quantity, product.price, (op.quantity * product.price) AS subtotal FROM orders JOIN orders_products op ON orders.id = op.order_id JOIN product ON op.product_id = product.id WHERE user_id = $1;'

    pool.query(text, [parseInt(req.params.user_id, 10)], (err, result) => {
        if (err){
            throw err;
        } else {
            res.json({
                status: 'success',
                results: result.rows.length,
                data: result.rows
             });
        }
    })
});

/**
 * @swagger
 * /api/orders/{id}/{order_id}:
 *  get:
 *      summary: returns an order detail
 *      tags: [Orders]
 *      parameters:
 *          -   $ref: '#/components/parameters/userId'
 *          -   name: order_id
 *              in: path
 *              required: true
 *              schema:
 *                  type: integer
 *      responses: 
 *          200:
 *              description: order details returned
 *              content:
 *                  application/json: 
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product_id:
 *                                  type: integer
 *                              name:
 *                                  type: varchar(200)
 *                              quantity:
 *                                  type: integer
 *                              price:
 *                                  type: money
 *                              subtotal:
 *                                  type: money
 *          404:
 *              $ref: '#components/responses/NotFound'
 *          500:
 *              $ref: '#components/responses/ServerError'
 */

app.get('/:user_id/:order_id', (req, res) => {
    const text = 'SELECT op.product_id, product.name, op.quantity, product.price, (op.quantity * product.price) AS subtotal FROM orders JOIN orders_products op ON orders.id = op.order_id JOIN product ON op.product_id = product.id WHERE order_id = $1;'
    pool.query(text, [parseInt(req.params.order_id, 10)], (err, result) => {
        if (err){
            throw err;
        } else if (result.rows.length > 0) {
            res.json({
                status: 'success',
                data: result.rows
            });
        } else {
            res.status(404).send('Order not found');
        }
    })
})


module.exports = app; 