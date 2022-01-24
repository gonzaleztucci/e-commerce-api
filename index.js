const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');



//Swagger configuration options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "e-commerce API",
      version:"1.0.0",
      description: "A simple e-commerce Express API"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsDoc(options);


const app = express();

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

const pool = require('./db/database');
const PORT = process.env.PORT || 3000;
const apiRouter = require('./routes/api');

app.use(express.json());
app.use(passport.initialize());
// app.use(passport.session());
app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
  

module.exports = app;