const dotenvJSON = require("dotenv-json");
dotenvJSON({ path: "./env.json"});
import app from './index';

let port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Server Started');
});