import Store from './Store';
import Accessor from '../database/Accessor';
let ModelDB = new Accessor('models', 'storeID', 'modelID');

/*
  5 input types;

  Row: One for modifications with 1 option, but can vary in quantity (Espresso Shots)
  Column: One for modifications with more than 1 option, but can only be one quantity (Size)
  Table: One for modifications than can support more than one option, and each option can have an indenpendent quantity (Syrups)
  Enum: One for modifications that specify indirect quantities of an inclusion (Extra Onions, No Nutmeg); [No, Light, Regular, Extra]
  Toggle: Can toggle the option (long shot)
*/

export default class Model {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (data.modelID && data.storeID) {
        this.modelID = data.modelID;
        this.storeID = data.storeID;
    
        ModelDB.read(this.storeID, this.modelID).then(res => {
          this.data = res;
          console.log('IM HERE DAWG', this.storeID, this.modelID);
          resolve(this);
        }).catch(err => {
          reject(err);
        });
      } else {
        
        // DB cannot have null values
        let insert = {};
        insert.storeID = data.storeID || reject('No Store');
        insert.name = data.name || reject('No Name');
        insert.parent = data.parent || reject('No Parent'); // EX: Size

        insert.row = data.row || {};
        insert.column = data.column || {};
        insert.table = data.table || {};
        insert.enums = data.enums || {};
        insert.toggle = data.toggle || {};
        
        ModelDB.create(insert).then(res => {
          this.data = insert;
          
          new Store({
            storeID: res.storeID
          }).then(store => {

            store.addModel(res.modelID).then(() => {
              resolve(res.modelID);
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

      ModelDB.update(this.storeID, this.modelID, changes).then(() => {
        
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

  get row() {
    return this.data.row;
  }

  set column(column) {
    this.que['column'] = column;
  }

  get column() {
    return this.data.column;
  }

  set table(table) {
    this.que['table'] = table;
  }

  get table() {
    return this.data.table;
  }

  set enums(enums) {
    this.que['enum'] = enums;
  }

  get enums() {
    return this.data.enum;
  }

  set toggle(toggle) {
    this.que['toggle'] = toggle;
  }

  get toggle() {
    return this.data.toggle;
  }
}