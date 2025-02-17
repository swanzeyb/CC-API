import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

let app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json()); // read json post data

/* a method of error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// If our application encounters an error, we'll display the error and stack trace accordingly.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});
*/

import moment from 'moment';
app.use((req, res, next) => {
  let time = moment().toISOString();
  console.log(req.method+' '+req.path);
  next();
});

// Authentication Middleware https://auth0.com/docs/quickstart/backend/nodejs?framed=1
let jwtCheck = jwt({ // Our authentication middleware, only users who have passed a valid bearer token will pass this middleware
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://corefinder.auth0.com/.well-known/jwks.json"
  }),
  audience: 'https://coffeeconnect/',
  issuer: "https://corefinder.auth0.com/",
  algorithms: ['RS256']
});

// Now we import our routes
import Stores from './routes/Stores';
import Items from './routes/Items';
import Models from './routes/Models';
import Orders from './routes/Orders';
import Users from './routes/Users';

// Begin assigning the routes
app.use('/stores', new Stores(jwtCheck));
app.use('/items', new Items(jwtCheck));
app.use('/models', new Models(jwtCheck));
app.use('/orders', new Orders(jwtCheck));
app.use('/users', new Users(jwtCheck));

app.get('/test', (req, res) => {
  res.json({
    "body": "Hello World"
  });
});

// Start   "DEV_AWS_ENDPOINT": "http://localhost:8000",
//export default app;
module.exports = app;