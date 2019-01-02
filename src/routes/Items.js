import express from 'express';
import Item from '../classes/Item';
import Accessor from '../database/Accessor';
let ItemDB = new Accessor('items', 'itemID', 'storeID');

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Items {
  constructor(auth) {
    let router = express.Router();

    router.get('/:storeID/:itemID', (req, res) => {
      new Item({
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

    router.get('/:storeID/all', (req, res) => {

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
      ItemDB.delete(req.params.itemID, req.params.storeID).then(() => {

        res.status(200).send();

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    return router;
  }
}