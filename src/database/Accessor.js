import AWS from 'aws-sdk';
import ids from 'shortid';
import { dynoSani } from '../utils/Utils';

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

    this.item = (id, data) => {
      let input = {};
      input[this.id] = id;
      
      Object.keys(data).forEach(key => {
        input[key.toString()] = data[key];
      });

      return input;
    }
  }

  create(data) {
    data = dynoSani(data);
    return new Promise((resolve, reject) => {
      let id = ids.generate();

      client.put({
        TableName: this.table,
        Item: this.item(id, data)
      }, function(err) {
        if (err) {
          reject(JSON.stringify(err, null, 2));
        } else {
          resolve(id);
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
          reject(JSON.stringify(err, null, 2));
        } else {
          resolve(data['Item']);
        }
      });

    });
  }

  update(ID, KEY, mods) {
    return new Promise((resolve, reject) => {
      let alpha = [":a", ":b", ":c", ":d", ":e", ":f", ":g", ":h", ":i", ":j", ":k", ":l", ":m", ":n", ":o", ":p",
      ":q", ":r", ":s", ":t", ":u", ":v", ":w", ":x", ":y", ":z"];
      let index = 0;
      let updateStr = 'set '; // Ahh, the query language for the non query language database
      let updateObj = {};
  
      let addItem = (key, value) => {
        let dbKey = alpha[index];
        index++;
  
        updateStr = updateStr + key + '=' + dbKey + ','
        updateObj[dbKey] = value;
      }

      Object.keys(mods).forEach((levelOne) => {
        
        if (Object.prototype.toString.call(mods[levelOne]) == '[object Object]') {

          Object.keys(mods[levelOne]).forEach((levelTwo) => {
            console.log(levelOne, levelTwo, mods[levelOne], mods[levelOne][levelTwo]);
            if (Object.prototype.toString.call(mods[levelOne][levelTwo]) == '[object Object]') {
              
            } else {
              addItem(levelOne + '.' + levelTwo, mods[levelOne][levelTwo]);
            }

          });
        } else {
          addItem(levelOne, mods[levelOne]);
        }
      });

      updateStr = updateStr.slice(0, -1);
      let params = {
        TableName: this.table,
        Key: this.gen(ID, KEY),
        UpdateExpression: updateStr,
        ExpressionAttributeValues: updateObj
      };

      console.log(params);
      client.update(params, function(err) {
        if (err) {
          reject(JSON.stringify(err, null, 2));
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
          reject(JSON.stringify(err, null, 2));
        } else {
          resolve(data);
        }
      });

    });
  }
}