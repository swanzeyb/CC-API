import Accessor from '../database/Accessor';
let OrderDB = new Accessor('orders', 'orderID', 'storeID');

export default class Store {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (data.itemID && data.storeID) {
        this.itemID = data.itemID;
        this.storeID = data.storeID;
    
        ItemDB.read(this.itemID, this.storeID).then(res => {
          this.data = res;

          resolve(this);
        }).catch(err => {
          reject(err);
        });
      } else {
  
        // DB cannot have null values
        data.storeID = data.storeID || reject('No Store');
        data.name = data.name || reject('No Item Name');
        data.desc = data.desc || reject('No Desc');
        data.price = data.price || reject('No Price');
        data.mods = data.mods || {};

        ItemDB.create(data).then(id => {
          this.data = data;

          resolve(id);
        }).catch(err => {
          reject(err);
        });
      }

    });

  }

  commitQue() {
    return new Promise((resolve, reject) => {
      let changes = this.que || {};

      ItemDB.update(this.itemID, this.storeID, changes).then(() => {
        
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
}