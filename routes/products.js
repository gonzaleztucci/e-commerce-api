const express = require('express');
// const { get } = require('express/lib/response');
const app = express();

const pool = require('../db/database');

//CREATE A NEW PRODUCT
// Data fields:
//  - Name: NOT NULL 
//  - Description: ALLOW NULL 
//  - Image_link: ALLOW NULL 
//  - DELETED: NOT NULL, should be set to FALSE when created

/**
 * @swagger
 * components: 
 *  schemas:
 *      product: # Can be referenced as '#/components/schemas/product'
 *          type: object 
 *          required: 
 *              - name
 *              - deleted
 *              - category
 *              - price
 *          properties:
 *              id:
 *                  type: integer
 *                  description: Auto generated product id.
 *              name:
 *                  type: varchar(200)
 *                  description: Name of the product
 *              description:
 *                  type: text
 *                  description: Product description
 *              image_link: 
 *                  type: text
 *                  description: Link to product image
 *              deleted:
 *                  type: boolean
 *                  description: True if product is deleted from catalog
 *              category: 
 *                  type: varchar(200)
 *                  description: Indicates the product category
 *              price: 
 *                  type: money
 *                  description: Product's selling price
 *          example: 
 *              id: 8
 *              name: "Vans Sk8-Hi"
 *              description: "Just plain Vans shoes"
 *              image_link: ""
 *              deleted: false
 *              category: shoes
 *              price: 65
 *  parameters:
 *      productId: # Can be referenced via '#/components/parameters/productId'
 *          name: id
 *          in: path
 *          description: Product id
 *          schema:
 *              type: integer
 *          required: true
 *  
 */

/**
 * @swagger
 * tags:
 *  name: Products 
 *  description: Products managing API
 */


/**
 * @swagger
 * /api/products:
 *  post:
 *      Summary: Creates a new product
 *      tags: [Products]
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/product'
 *      responses: 
 *          200:
 *              description: Product created successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/product' 
 *          500: 
 *              $ref: '#components/responses/ServerError'   
 *          
 */
app.post('/', (req, res, next) => {

    console.log(req.body.name);
    const text = 'INSERT INTO product (name, description, price ,image_link, category, deleted) VALUES ($1, $2, $6, $3, $4, $5) RETURNING *;';
    const {name, description, image_link, category, deleted, price} = req.body;
    
    pool.query(text, [name, description, image_link, category, deleted, price], (err, result) => {
        if (err){
            res.status(500).json({
                status: 'error',
                error: err});
        } else {
        res.json({
            status: 'success',
            results: result.rows.length,
            data: result.rows
        });
        }
    })
})

/**
 * @swagger
 * /api/products:
 *  get:
 *      summary: Returns the list of all the products in the database
 *      tags: [Products]
 *      responses:
 *          200:
 *              description: The list of products
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/product'
 *          
 *  */
app.get('/', (req, res, next) => {
    const query = req.query;
        // Filter by category if given in the request
    if (Object.keys(query).length > 0) {
        const {category} = query;
        const text = 'SELECT * FROM product WHERE category = $1;';
        pool.query(text, [category], (err, result) => {
            if(err){
                return next(err);
            } else {
                res.send(result.rows);
            }
        })
    } else {
        //Return all products if no category is given
        const text = 'SELECT * FROM product;'
        pool.query(text, (err, result) => {
            if (err){
              return next(err)
            }
            res.json({
                status: 'success',
                results: result.rows.length,
                data: result.rows
            });
          })
    }
    })

/**
 * @swagger
 * /api/products/{id}:
 *  get:
 *      summary: Returns the product corresponding to the id given in the URL
 *      parameters:
 *          -   $ref: '#/components/parameters/productId'
 *      tags: [Products]
 *      responses:
 *          200:
 *              description: The product requested
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/product' 
 *          404:
 *              description: Product not found             
 */

app.get('/:id', (req, res, next) => {
    const text = 'SELECT * FROM product WHERE id = $1';
    const id = parseInt(req.params.id, 10);

    pool.query(text, [id], (err, result) => {
        if(err){
        throw err;
        } else {
            if(result.rows.length > 0){
                res.json({
                    status: 'sucess',
                    data: result.rows
                });
            } else {
                res.status(404).send('Don\'t know what you\'re looking for... :\'\(');
            }    
        }
    });
});

/**
 * @swagger
 * /api/products/{id}:
 *  put:
 *      summary: Updates a product in the database
 *      parameters:
 *          -   $ref: '#/components/parameters/productId'
 *      tags: [Products]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/product'
 *      responses:
 *          200:
 *              description: Product updated successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/product'
 *          500:
 *              description: Internal server error
 *          404:
 *              description: Product not found
 */
app.put('/:id', (req, res, next) => {
    const text = 'SELECT * from product WHERE id = $1;';
    pool.query(text, [parseInt(req.params.id, 10)], (err, result) => {
        if(err){
            res.status(500).send('Something broke.');
        } else {
            if(result.rows.length > 0){
                next();
            } else {
                res.status(404).send('Product not found');
            }
        }
    })  
}, (req, res, next) => {
    const text = 'UPDATE product SET name = $1, description = $2, price = $7 , image_link = $3, category =$4, deleted = $5 WHERE id = $6 RETURNING *;'
    const {name, description, image_link, category, deleted, price} = req.body;
    const id = parseInt(req.params.id, 10);

    pool.query(text, [name, description, image_link, category, deleted, id, price], (err, result) => {
        if (err){
            console.log(err);
            res.status(500).send('Something broke.');
        } else {
            res.json({
                status: 'success',
                data: result.rows
            });
        }
    })
})

/**
 * @swagger
 * /api/products/{id}:
 *  delete:
 *      summary: Deletes a product from catalog by setting property Deleted = true
 *      parameters:
 *          -   $ref: '#/components/parameters/productId'
 *              schema:
 *                  type: integer
 *              required: true
 *      tags: [Products]
 *      responses:
 *          404: 
 *              description: Product not found
 *          204:
 *              description: Product deleted succesfully
 */
//DELETE PRODUCT
app.delete('/:id', (req, res, next) => {
    const text = 'SELECT * from product WHERE id = $1;';
    pool.query(text, [parseInt(req.params.id, 10)], (err, result) => {
        if(err){
            res.status(500).send('Something broke.');
        } else {
            if(result.rows.length > 0){
                next();
            } else {
                res.status(404).send('Product not found');
            }
        }
    })  
} ,(req, res, next) => {
    const text = 'UPDATE product SET deleted = true WHERE id = $1;'
    const id = parseInt(req.params.id);

    pool.query(text, [id], (err, result) => {
        if (err){
            res.status(500).send('Something broke.');
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = app;




