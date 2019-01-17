import AWS from 'aws-sdk';
import ids from 'shortid';

AWS.config.update({
  region: process.env.AWS_REGION || "us-west-2",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:8000"
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
        input[this.key] = key;
      }
      
      Object.keys(data).forEach(key => {
        input[key] = data[key];
      });
      
      return input;
    }
  }

  create(data, key) {
    return new Promise((resolve, reject) => {
      let id = ids.generate();
      let key = key || ids.generate();
      
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
            res[this.key] = key
          }
          resolve(res);
        }
      });

    });
  }

  read(ID, KEY) {
    return new Promise((resolve, reject) => {

      client.get({
        TableName: this.table,
        Key: this.gen(ID, KEY)
      }, function(err, data) {
        if (err) {
          reject(err);
        } else {
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