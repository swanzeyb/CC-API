import express from 'express';
import Store from '../classes/Store';
import getNearest from '../utils/Finder';
import { error } from '../utils/Utils';

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Stores {
  constructor(auth) {
    let router = express.Router();
    
    router.get('/find/:lat,:lng', (req, res) => {
      getNearest(req.params.lat, req.params.lng, 20, 10).then(data => {

        res.status(200).json(data);

      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {

        res.status(200).json(store.data);

      }).catch(err => {

        error(err, res);
      });
    });

    router.post('/', auth, (req, res) => {
      req.body.owner = "null" // This should be grabbed from the auth token, and then check if the user already has a store

      new Store(req.body).then(id => {

        res.status(201).json({
          storeID: id
        });

      }).catch(err => {

        error(err, res);
      });

    });

    router.put('/:storeID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {

        let keys = Object.keys(req.body);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          
          if (store.data[key]) {

            store.que[key] = req.body[key];

          } else {
            res.status(400).json({
              error: 'Bad Modification'
            });
            store.flushQue();

            break;
          }

          if (i == (keys.length - 1)) {

            store.commitQue().then(() => {
              res.status(200).send();
            }).catch(err => {

              error(err, res);
            });
            
          }
        }
        
      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID/sales', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {

        store.sales(req.body.start, req.body.end).then(figs => {

          res.status(200).json(figs);

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