import express from 'express';
import User from '../classes/User';
import Accessor from '../database/Accessor';
let UserDB = new Accessor('users', 'userID');

/*
  NO INPUT SANITATION HAS BEEN IMPLEMENTED YET!
*/

export default class Users {
  constructor(auth) {
    let router = express.Router();

    router.get('/:userID', auth, (req, res) => {
      new User({
        userID: req.params.userID
      }).then(user => {

        res.status(200).json(user.data);

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.post('/:userID', auth, (req, res) => {
      req.body.userID = req.params.userID;
      new User(req.body).then(() => {

        res.status(201).send();

      }).catch(err => {

        res.status(400).json({
          error: err
        });

      });
    });

    router.put('/:userID', auth, (req, res) => {
      new User({
        userID: req.params.userID
      }).then(user => {

        let keys = Object.keys(req.body);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          
          if (user.data[key]) {

            user.que[key] = req.body[key];

          } else {
            res.status(400).json({
              error: 'Bad Modification'
            });
            user.flushQue();

            break;
          }

          if (i == (keys.length - 1)) {

            user.commitQue().then(() => {
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

    return router;
  }
}