import express from 'express';
import Store from '../classes/Store';
import { dynoSani } from '../utils/Utils';

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Stores {
  constructor(auth) {
    let router = express.Router();

    router.get('/find/:lat:lng', (req, res) => {
      // stub
    });

    router.get('/:storeID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {

        res.status(200).json(store.data);

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.post('/', auth, (req, res) => {
      req.body.owner = "null" // This should be grabbed from the auth token, and then check if the user already has a store

      new Store(req.body).then(id => {

        res.status(201).json({
          storeID: id
        });

      }).catch(err => {

        console.error(err);
        res.status(400).json({
          error: err
        });

      });

    });

    router.put('/:storeID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {
        req.body = dynoSani(req.body);

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
              res.status(400).json({
                error: err
              });
            });
            
          }
        }
        
      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.delete('/:storeID', auth, (req, res) => {
      // stub
    });

    router.get('/sales/:storeID', auth, (req, res) => {

    });

    router.get('/fines/:storeID', auth, (req, res) => {

    });

    router.get('/tips/:storeID', auth, (req, res) => {

    });

    return router;
  }
}