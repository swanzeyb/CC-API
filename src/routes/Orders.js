import express from 'express';
import Order from '../classes/Order';
import Accessor from '../database/Accessor';
let OrderDB = new Accessor('orders', 'orderID', 'storeID');

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Orders {
  constructor(auth) {
    let router = express.Router();

    router.get('/:storeID/:orderID', (req, res) => {
      new Order({
        itemID: req.params.itemID,
        storeID: req.params.storeID
      }).then(item => {

        res.status(200).json(item.data);

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.get('/:storeID/:orderID/range', auth, (req, res) => {

    });

    router.get('/:storeID/:orderID/status', auth, (req, res) => {

    });

    router.patch('/:storeID/:orderID/:status', auth, (req, res) => {

    });

    router.post('/:storeID', auth, (req, res) => {
      req.body.storeID = req.params.storeID;
      new Order(req.body).then(id => {

        res.status(201).json({
          itemID: id
        });

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    return router;
  }
}