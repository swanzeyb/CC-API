import express from 'express';
import Order from '../classes/Order';
import Store from '../classes/Store';
import { error } from '../utils/Utils';

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Orders {
  constructor(auth) {
    let router = express.Router();

    router.get('/:storeID/range', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {

        store.orders(req.body.start, req.body.end).then(items => {

          res.status(200).json(items);

        }).catch(err => {

          error(err, res);
        });

      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID/:orderID', (req, res) => {
      new Order({
        itemID: req.params.itemID,
        storeID: req.params.storeID
      }).then(item => {

        res.status(200).json(item.data);

      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID/:orderID/status', auth, (req, res) => {
      new Order({
        storeID: req.params.storeID,
        orderID: req.params.orderID
      }).then(order => {
        let ops = {}; // no sneaky db insertion
        ops[true] = true;
        ops[false] = false;

        res.status(200).json({
          status: order.status
        });

      }).catch(err => {

        error(err, res);
      });
    });

    router.patch('/:storeID/:orderID/:status', auth, (req, res) => {
      new Order({
        storeID: req.params.storeID,
        orderID: req.params.orderID
      }).then(order => {
        let ops = {}; // no sneaky db insertion
        ops['true'] = true;
        ops['false'] = false;
        
        if (ops[req.params.status] !== null) {
          order.status = ops[req.params.status];
          
          order.commitQue().then(() => {
            
            res.status(200).send();
          }).catch(err => {
  
            error(err, res);
          });
        } else {

          error('Bad Input; must be a bool', res);
        }

      }).catch(err => {

        error(err, res);
      });
    });

    router.post('/:storeID', auth, (req, res) => {
      req.body.storeID = req.params.storeID;
      new Order(req.body).then(id => {

        res.status(201).json({
          orderID: id
        });

      }).catch(err => {

        error(err, res);
      });
    });

    return router;
  }
}