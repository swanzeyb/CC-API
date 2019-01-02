import Accessor from '../database/Accessor';

let UserDB = new Accessor('users', 'userID');

export default class User {
  constructor(data) {
    this.que = {};

    return new Promise((resolve, reject) => {
      data.userID = data.userID || reject('No User ID');
      this.userID = data.userID;
      
      UserDB.read(this.userID).then(res => {
        this.data = res;

        if (this.data.setup) {
          resolve();
        } else {
          // DB cannot have null values
          data.first = data.first || reject('No Store Name');
          data.last = data.last | reject('No Last Name');

          data.orders = {};
          data.setup = true;

          UserDB.create(data).then(() => {
            this.data = data;
          
            resolve();
          }).catch(err => {
            reject(err);
          });
        }

      }).catch(err => {
        reject(err);
      });
    });
  }

  commitQue() {
    return new Promise((resolve, reject) => {
      let changes = this.que || {};

      UserDB.update(this.storeID, false, changes).then(() => {
        
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

  set first(first) {
    this.que['first'] = first;
  }

  get first() {
    return this.data.first;
  }

  set last(last) {
    this.que['last'] = last;
  }

  get last() {
    return this.data.last;
  }
}