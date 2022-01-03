const express = require('express');
const products = require('./products');
const register = require('./register');

const apiRouter = express.Router();

apiRouter.use('/products', products);
apiRouter.use('/register', register);


module.exports = apiRouter;