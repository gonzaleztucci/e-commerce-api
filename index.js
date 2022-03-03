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
        url: "http://localhost:3000",
        description: "Development Server"
      }
    ],
    components: {
      responses: {
        ServerError: {
          description: "Internal Server Error"
        },
        NotFound: {
          description: "Entity not found"
        }
      },
      schemas: {
        order: {
          type: "object",
          properties: {
            id: {
              type: "integer"
            },
            product_id: {
              type: "integer"
            },
            name: {
              type: "string"
            },
            quantity: {
              type: "integer"
            },
            price: {
              type: "money"
            },
            subtotal: {
              type: "money"
            }
          } 
        }
      }

    }
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsDoc(options);


const app = express();

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-type', 'application/json');
  res.send(specs);
})

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