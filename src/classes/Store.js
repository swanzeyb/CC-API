import Accessor from '../database/Accessor';
import { validateAddress } from '../utils/Utils';
import moment from 'moment';

let StoreDB = new Accessor('stores', 'storeID');

export default class Store {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {

      if (data.storeID) {
        this.storeID = data.storeID;
      
        StoreDB.read(this.storeID).then(res => {
          this.data = res;
          
          resolve(this);
        }).catch(err => {
          reject(err);
        });
  
      } else {
        
        // DB cannot have null values
        let insert = {};
        insert.name = insert.name || reject('No Store Name');
        insert.desc = insert.desc || reject('No Desc');
        insert.owner = insert.owner || reject('No Owner');
        insert.address = insert.address || reject('No Address');
        insert.address.address1 = insert.address.address1 || reject('No Address Field 1');
        insert.address.address2 = insert.address.address2 || '';
        insert.address.city = insert.address.city || reject('No City');
        insert.address.state = insert.address.state || reject('No State');
        insert.address.zip = insert.address.zip || reject('No ZIP');
        insert.hours = insert.hours || reject('No Hours');
        insert.hours.monday = insert.hours.monday || reject('No Hours monday');
        insert.hours.tuesday = insert.hours.tuesday || reject('No Hours tuesday');
        insert.hours.wednesday = insert.hours.wednesday || reject('No Hours wednesday');
        insert.hours.thursday = insert.hours.thursday || reject('No Hours thursday');
        insert.hours.friday = insert.hours.friday || reject('No Hours friday');
        insert.hours.saturday = insert.hours.saturday || reject('No Hours saturday');
        insert.hours.sunday = insert.hours.sunday || reject('No Hours sunday');
        insert.items = insert.items || [];

        validateAddress(data.address).then(res => { // fix me
          insert.lat = res.lat;
          insert.lng = res.lng;

          delete res.lat; // fix me, shouldn't need to delete keys..
          delete res.lng;
          insert.address = res;

          // Add the store to the database
          StoreDB.create(insert).then(id => {
            this.storeID = id;
            this.data = insert;
          
            resolve(id);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });;
  
      }

    });
  }

  sales(start, end) {
    return new Promise((resolve, reject) => {
      let OrderDB = new Accessor('orders', 'storeID', 'orderID');
      start = start || moment.utc().startOf('day');
      end = end || moment.utc().endOf('day');
      start = moment(start).toISOString();
      end = moment(end).toISOString();

      OrderDB.query({
        IndexName: "TimeStampIndex",
        ProjectionExpression: "sales, tips, fines, profit",
        KeyConditionExpression: "storeID = :storeid AND tStamp BETWEEN :frt AND :lst",
        ExpressionAttributeValues: {
          ":storeid": this.storeID,
          ":frt": start,
          ":lst": end
        }
      }).then(orders => {
        
        let figures = {
          sales: 0,
          fines: 0,
          tips: 0,
          profit: 0
        }
        orders.forEach(order => {
          figures.sales = figures.sales + Number(order.sales);
          figures.fines = figures.fines + Number(order.fines);
          figures.tips = figures.tips + Number(order.tips);
          figures.profit = figures.profit + Number(order.profit);
        });
  
        resolve(figures);
      }).catch(err => {
        reject(err);
      });
    });
  }

  addItem(id) {
    this.data.items.push(id)
    this.items = this.data.items;
    return this.commitQue();
  }

  removeItem(id) {
    let anew = []; // delete operator leaves holes in objects / arrays
    this.data.items.forEach(itemID => {
      if (itemID !== id) {
        anew.push(itemID);
      }
    });
    this.items = anew;
    return this.commitQue();
  }

  getItems() {
    return new Promise((resolve, reject) => {
      let getit = [];

      this.data.items.forEach(id => {
        getit.push({
          "storeID": this.storeID,
          "itemID": id
        });
      });

      if (getit.length > 0) {
        let params = {
          RequestItems: {
            "items": {
              Keys: getit,
              ProjectionExpression: "storeID, itemID, #nam, #des, mods, price",
              ExpressionAttributeNames: {
                "#nam": "name",
                "#des": "desc",
              }
            }
          }
        }
        
        StoreDB.batchGet(params).then(items => {
          resolve(items['Responses']['items']);
        }).catch(err => {
          reject(err);
        });
      } else {
        resolve({});
      }

    });
  }

  commitQue() {
    return new Promise((resolve, reject) => {
      let changes = this.que || {};

      StoreDB.update(this.storeID, false, changes).then(() => {
        
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

  set name(name) {
    this.que['name'] = name;
  }

  get name() {
    return this.data.sname;
  }

  set desc(desc) {
    this.que['desc'] = desc;
  }

  get desc() {
    return this.data.desc;
  }

  set owner(owner) {
    this.que['owner'] = owner;
  }

  get owner() {
    return this.data.owner;
  }

  set address(address) {
    this.que['address'] = address;
  }

  get address() {
    return this.data.address;
  }

  set hours(hours) {
    this.que['hours'] = hours;
  }

  get hours() {
    return this.data.hours;
  }

  set items(items) {
    this.que['items'] = items;
  }

  get items() {
    return this.data.items;
  }
}