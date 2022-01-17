const express = require('express');
const app = espress();
const pool = require('../db/database');

app.post('/', (req, res, next) => {
    const text = 'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2';
    const user_id = req.user_id;
    const product_id = req.user_id;
});






module.exports = app;


