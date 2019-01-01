import Accessor from '../database/Accessor';
import { validateAddress } from '../utils/Utils';

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
        data.name = data.name || reject('No Store Name');
        data.desc = data.desc || reject('No Desc');
        data.owner = data.owner || reject('No Owner');
        data.address = data.address || reject('No Address');
        data.address.address1 = data.address.address1 || reject('No Address Field 1');
        data.address.address2 = data.address.address2 || '';
        data.address.city = data.address.city || reject('No City');
        data.address.state = data.address.state || reject('No State');
        data.address.zip = data.address.zip || reject('No ZIP');
        data.hours = data.hours || reject('No Hours');
        data.hours.monday = data.hours.monday || reject('No Hours monday');
        data.hours.tuesday = data.hours.tuesday || reject('No Hours tuesday');
        data.hours.wednesday = data.hours.wednesday || reject('No Hours wednesday');
        data.hours.thursday = data.hours.thursday || reject('No Hours thursday');
        data.hours.friday = data.hours.friday || reject('No Hours friday');
        data.hours.saturday = data.hours.saturday || reject('No Hours saturday');
        data.hours.sunday = data.hours.sunday || reject('No Hours sunday');
        data.items = data.items || [];

        validateAddress(data.address).then(res => {
          data.address = res;

          // Add the store to the database
          StoreDB.create(data).then(id => {
            this.storeID = id;
            this.data = data;
          
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