const express = require('express');
const products = require('./products');

const apiRouter = express.Router();

apiRouter.use('/products', products);


module.exports = apiRouter;