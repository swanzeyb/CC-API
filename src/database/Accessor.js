import AWS from 'aws-sdk';
import ids from 'shortid';

const dotenvJSON = require("dotenv-json");
dotenvJSON({ path: "./env.json"});

console.log({
  region: process.env.DEV_AWS_REGION || process.env.AWS_REGION,
  endpoint: process.env.DEV_AWS_ENDPOINT || process.env.AWS_ENDPOINT
});

AWS.config.update({
  region: process.env.DEV_AWS_REGION || process.env.AWS_REGION,
  endpoint: process.env.DEV_AWS_ENDPOINT || process.env.AWS_ENDPOINT
});

let client = new AWS.DynamoDB.DocumentClient();

export default class Accessor {
  constructor(table, id, key) {
    this.table = table;
    this.id = id;
    this.key = key || false;

    this.gen = (id, key) => {
      let Key = {};
      Key[this.id] = id;
      if (this.key) {
        Key[this.key] = key;
      }
      return Key;
    }

    this.item = (id, key, data) => {
      let input = {};
      if (data[this.id]) {
        input[this.id] = data[this.id];
      } else {
        input[this.id] = id;
      }
      if (this.key) {
        if (data[this.key]) {
          input[this.key] = data[this.key];
        } else {
          input[this.key] = key;
        }
      }
      
      Object.keys(data).forEach(key => {

        input[key] = data[key];
      });

      return input;
    }
  }

  create(data) {
    return new Promise((resolve, reject) => {
      let id = ids.generate();
      let key = ids.generate();

      client.put({
        TableName: this.table,
        Item: this.item(id, key, data)
      }, err => {
        if (err) {
          reject(err);
        } else {
          let res = {};
          res[this.id] = data[this.id] || id;
          if (this.key) {
            res[this.key] = data[this.key] || key
          }
          resolve(res);
        }
      });

    });
  }

  read(ID, KEY) {
    return new Promise((resolve, reject) => {
      console.log('hey', ID, KEY);
      console.log(this.gen(ID, KEY));

      client.get({
        TableName: this.table,
        Key: this.gen(ID, KEY)
      }, function(err, data) {
        if (err) {
          reject(err);
          console.log('bad', err);
        } else {
          console.log('good');
          resolve(data['Item']);
        }
      });

    });
  }

  update(ID, KEY, data) {
    return new Promise((resolve, reject) => {
      let alpha = [":a", ":b", ":c", ":d", ":e", ":f", ":g", ":h", ":i", ":j", ":k", ":l", ":m", ":n", ":o", ":p",
      ":q", ":r", ":s", ":t", ":u", ":v", ":w", ":x", ":y", ":z"];
      let index = 0;
      let updateStr = 'set '; // Ahh, the query language for the non query language database
      let updateObj = {};
      let attrNames = {};

      let sudoName = (key) => {
        let sudo = key.slice(0, 3);
        sudo = '#' + sudo;

        attrNames[sudo] = key;
        return sudo;
      }
  
      let addItem = (key, value) => {
        let dbKey = alpha[index];
        index++;
  
        updateStr = updateStr + key + '=' + dbKey + ','
        updateObj[dbKey] = value;
      }

      Object.keys(data).forEach((levelOne) => { // Javascript breaks trying to use recursive functions, I tried for like 3 hours
        
        if (Object.prototype.toString.call(data[levelOne]) == '[object Object]') {

          Object.keys(data[levelOne]).forEach((levelTwo) => {
            if (Object.prototype.toString.call(data[levelOne][levelTwo]) == '[object Object]') {
              
              Object.keys(data[levelOne][levelTwo]).forEach((levelThree) => {
                if (Object.prototype.toString.call(data[levelOne][levelTwo][levelThree]) == '[object Object]') {
                  console.error('Attempted to update entry with an object that contains more than a 3rd deep nested object', ID, KEY, data);
                  reject('Object nested past more than 3 layers');
                } else {
                  addItem(sudoName(levelOne) + '.' + sudoName(levelTwo) + '.' + sudoName(levelThree), data[levelOne][levelTwo][levelThree]);
                }
    
              });

            } else {
              addItem(sudoName(levelOne) + '.' + sudoName(levelTwo), data[levelOne][levelTwo]);
            }

          });
        } else {
          addItem(sudoName(levelOne), data[levelOne]);
        }
      });

      updateStr = updateStr.slice(0, -1);
      let params = {
        TableName: this.table,
        Key: this.gen(ID, KEY),
        UpdateExpression: updateStr,
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: updateObj
      };
      
      client.update(params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

    });
  }

  delete(ID, KEY) {
    return new Promise((resolve, reject) => {
      
      client.delete({
        TableName: this.table,
        Key: this.gen(ID, KEY)
      }, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });

    });
  }

  query(params) {
    return new Promise((resolve, reject) => {
      params.TableName = this.table;

      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data['Items']);
        }
      });
      
    });
  }

  scan(params) {
    return new Promise((resolve, reject) => {
      params.TableName = this.table;

      client.scan(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data['Items']);
        }
      });
      
    });
  }

  batchGet(params) {
    return new Promise((resolve, reject) => {

      client.batchGet(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
      
    });
  }
}