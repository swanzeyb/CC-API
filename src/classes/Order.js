import Accessor from '../database/Accessor';
let OrderDB = new Accessor('orders', 'orderID', 'storeID');
import moment from 'moment';

import stripe from 'stripe';
stripe(process.env.STRIPE_PRIVATE_KEY || 'sk_test_MujoO9HakRoKCqEF9YEGoeDv'); // because it won't load the .env file

export default class Order {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (data.orderID && data.storeID) {
        this.orderID = data.orderID;
        this.storeID = data.storeID;
    
        OrderDB.read(this.orderID, this.storeID).then(res => {
          this.data = res;

          resolve(this);
        }).catch(err => {
          reject(err);
        });
      } else {
  
        // Anything in the data object will be serialized, so we don't want to put the source token here
        // DB cannot have null values
        data.storeID = data.storeID || reject('No Store');
        data.src = data.src || reject('No Payment Source');
        data.items = data.items || reject('No Items Specified');

        // We need to get the amount to charge, and create data like the timestamp on succesful charge

        data.tstamp = moment().toISOString();

        OrderDB.create(data).then(id => {
          this.data = data;

          resolve(id);
        }).catch(err => {
          reject(err);
        });
      }

    });

  }

  refund() { // stub
    return false;
  }

  commitQue() {
    return new Promise((resolve, reject) => {
      let changes = this.que || {};

      OrderDB.update(this.orderID, this.storeID, changes).then(() => {
        
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