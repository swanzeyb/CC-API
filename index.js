const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let jwt = require('express-jwt');
let jwks = require('jwks-rsa');

let jwtCheck = jwt({
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

// Routes
let router = express.Router();
router.get('/', jwtCheck, (req, res) => {
    res.json({message: 'Hai ;)'});
});

// Register Routes
app.use('/api', router);

// Start
let port = process.env.port || 8080;
app.listen(port, () => {
  console.log('Server Started');
});