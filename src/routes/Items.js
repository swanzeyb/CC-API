import express from 'express';
import Item from '../classes/Item';
import Store from '../classes/Store';
import Accessor from '../database/Accessor';
import { error } from '../utils/Utils';
let ItemDB = new Accessor('items', 'itemID', 'storeID');

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Items {
  constructor(auth) {
    let router = express.Router();

    router.get('/:storeID/all', (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {
        
        store.getItems().then(items => {
          
          res.status(200).json(items);

        }).catch(err => {

          error(err, res);
        });

      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID/:itemID', (req, res) => {
      new Item({
        itemID: req.params.itemID,
        storeID: req.params.storeID
      }).then(item => {

        res.status(200).json(item.data);

      }).catch(err => {

        error(err, res);
      });
    });

    router.post('/:storeID', auth, (req, res) => {
      req.body.storeID = req.params.storeID;
      new Item(req.body).then(id => {

        res.status(201).json({
          itemID: id
        });

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.patch('/:storeID/:itemID/mark', auth, (req, res) => {
      new Item({
        storeID: req.params.storeID,
        itemID: req.params.itemID
      }).then(item => {
        let ops = {}; // no sneaky db insertion
        ops[true] = true;
        ops[false] = false;
        ops['true'] = true;
        ops['false'] = true;

        item.mark(ops[req.body.state]).then(newState => {
          res.status(200).json({
            state: newState
          });
        }).catch(err => {

          error(err, res);
        });

      }).catch(err => {

        error(err, res);
      });
    });

    router.put('/:storeID/:itemID', auth, (req, res) => {
      new Item({
        itemID: req.params.itemID,
        storeID: req.params.storeID
      }).then(item => {

        let keys = Object.keys(req.body);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          
          if (item.data[key]) {

            item.que[key] = req.body[key];

          } else {
            res.status(400).json({
              error: 'Bad Modification'
            });
            item.flushQue();

            break;
          }

          if (i == (keys.length - 1)) {

            item.commitQue().then(() => {
              res.status(200).send();
            }).catch(err => {
              res.status(400).json({
                error: err
              });
            });
            
          }
        }
        
      }).catch((err) => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.delete('/:storeID/:itemID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {
        
        store.removeItem(req.params.itemID).then(() => {
          
          ItemDB.delete(req.params.itemID, req.params.storeID).then(() => {

            res.status(200).send();
    
          }).catch(err => {
    
            error(err, res);
          });

        }).catch(err => {

          error(err, res);
        });

      }).catch(err => {

        error(err, res);
      });
    });

    return router;
  }
}