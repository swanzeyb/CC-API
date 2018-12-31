import express from 'express';
import { Store } from '../utils/DB';

export default class Stores {
  constructor(app, auth) {
    let router = express.Router();

    router.get('/', auth, (req, res) => {
      res.json({message: 'Hi from stores router!'});
    });

    router.get('/find/:lat,:lng', (req, res) => {
      let stores = getNearest(req.params.lat, req.params.lng, [], 30, 10);
      res.send(stores);
    });

    router.get('/:storeID', auth, (req, res) => {

    });

    app.use('/stores', router);
  }
}