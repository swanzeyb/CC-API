import Store from './Store';
import Accessor from '../database/Accessor';
let ItemDB = new Accessor('items', 'storeID', 'itemID');

/*
  5 input types;

  Row: One for modifications with 1 option, but can vary in quantity (Espresso Shots)
  Column: One for modifications with more than 1 option, but can only be one quantity (Size)
  Table: One for modifications than can support more than one option, and each option can have an indenpendent quantity (Syrups)
  Enum: One for modifications that specify indirect quantities of an inclusion (Extra Onions, No Nutmeg); [No, Light, Regular, Extra]
  Toggle: Can toggle the option (long shot)
*/

export default class Model {
  constructor(data, read) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (read) {
        this.itemID = data.itemID;
        this.storeID = data.storeID;
    
        ItemDB.read(this.storeID, this.itemID).then(res => {
          this.data = res;

          resolve(this);
        }).catch(err => {
          reject(err);
        });
      } else {
        
        // DB cannot have null values
        let insert = {};
        insert.storeID = data.storeID || reject('No Store');
        insert.itemID = data.itemID || reject('No Model ID');
        insert.name = data.name || reject('No Model Display Name');
        insert.parent = data.parent || reject('No Parent'); // EX: Size
        insert.row = data.row || {};
        insert.column = data.column || {};
        insert.table = data.table || {};
        insert.enum = data.enum || {};
        insert.toggle = data.toggle || {};
        
        ItemDB.create(insert).then(res => {
          this.data = insert;
          console.log('made', res);
          new Store({
            storeID: res.storeID
          }).then(store => {

            store.addModel(res.itemID).then(() => {
              resolve();
            }).catch(err => {
              reject(err);
            });

          }).catch(err => {
            reject(err);
          });

        }).catch(err => {
          reject(err);
        });
      }

    });

  }

  commitQue() {
    return new Promise((resolve, reject) => {
      let changes = this.que || {};

      ItemDB.update(this.storeID, this.itemID, changes).then(() => {
        
        Object.keys(changes).forEach(key => {
          this.data[key] = changes[key];
        });
        this.que = {};

        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }

  flushQue() {
    this.que = {};
  };

  // Setters so we can perform data validation
  set row(row) {
    this.que['row'] = row;
  }

  get name() {
    return this.data.row;
  }
}