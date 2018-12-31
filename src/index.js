import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

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

let app = express();
// Now we import our routes
import Stores from './routes/stores';

// Begin assigning the routes
let storeRoutes = new Stores(app, jwtCheck);

// Start
let port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Server Started');
});