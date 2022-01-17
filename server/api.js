const express = require('express');
const products = require('./products');
const register = require('./register');
const login = require('./login')
const passport = require('../passport');  
const user = require('./user'); 

const apiRouter = express.Router();

apiRouter.use('/products', products);
apiRouter.use('/register', register);
apiRouter.use('/login', login);
apiRouter.use('/user', user);

module.exports = apiRouter;