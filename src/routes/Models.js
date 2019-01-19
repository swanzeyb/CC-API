import express from 'express';
import Model from '../classes/Model';
import Store from '../classes/Store';
import Accessor from '../database/Accessor';
import { error } from '../utils/Utils';
let ModelDB = new Accessor('models', 'storeID', 'modelID');

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Models {
  constructor(auth) {
    let router = express.Router();

    router.get('/:storeID/all', (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {
        
        store.getModels().then(items => {
          
          res.status(200).json(items);

        }).catch(err => {

          error(err, res);
        });

      }).catch(err => {

        error(err, res);
      });
    });

    router.get('/:storeID/:modelID', (req, res) => {
      new Model({
        modelID: req.params.modelID,
        storeID: req.params.storeID
      }).then(item => {

        res.status(200).json(item.data);

      }).catch(err => {

        error(err, res);
      });
    });

    router.post('/:storeID', auth, (req, res) => {
      req.body.storeID = req.params.storeID;
      new Model(req.body).then(modelID => {

        res.status(201).json({
          modelID: modelID
        });

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.put('/:storeID/:modelID', auth, (req, res) => {
      new Model({
        modelID: req.params.modelID,
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

    router.delete('/:storeID/:modelID', auth, (req, res) => {
      new Store({
        storeID: req.params.storeID
      }).then(store => {
        
        store.removeItem(req.params.modelID).then(() => {
          
          ModelDB.delete(req.params.storeID, req.params.modelID).then(() => {

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