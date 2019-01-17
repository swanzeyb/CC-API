import Store from './Store';
import Accessor from '../database/Accessor';
let ItemDB = new Accessor('items', 'storeID', 'itemID');

export default class Item {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (data.itemID && data.storeID) {
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
        insert.name = data.name || reject('No Item Name');
        insert.desc = data.desc || reject('No Desc');
        insert.context = data.context || reject('No Context');
        insert.parent = data.parent || reject('No Parent');
        insert.child = data.child || reject('No Child');
        insert.marked = (data.marked !== null) || true;
        insert.base = data.base || reject('No Base');
        insert.options = data.options || reject('No Options');
        
        ItemDB.create(insert).then(res => {
          this.data = insert;
          
          new Store({
            storeID: res.storeID
          }).then(store => {

            store.addItem(res.itemID).then(() => {
              resolve(res.itemID);
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

      ItemDB.update(this.storeID, thise.itemID, changes).then(() => {
        
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

  mark(state) {
    state = state || !this.data.marked;
    return new Promise((resolve, reject) => {

      ItemDB.update(this.storeID, this.itemID, {
        marked: state
      }).then(() => {
        resolve(state);
      }).catch(err => {
        reject(err);
      });

    });
  }

  flushQue() {
    this.que = {};
  };

  // Setters so we can perform data validation
  set name(name) {
    this.que['name'] = name;
  }

  get name() {
    return this.data.iname;
  }

  set desc(desc) {
    this.que['desc'] = desc;
  }

  get desc() {
    return this.data.desc;
  }

  set price(price) {
    this.que['price'] = price;
  }

  get price() {
    return this.data.price;
  }

  set mods(mods) {
    this.que['mods'] = mods;
  }

  get mods() {
    return this.data.mods;
  }

  get marked() {
    return this.data.marked;
  }
}