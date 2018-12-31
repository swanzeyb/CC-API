import AWS from 'aws-sdk';
import ids from 'shortid';

export class Store {
  create(data) {
    return new Promise((resolve, reject) => {
      let id = 'st' + ids.generate();

      client.put({
        TableName: 'stores',
        Item: {
          'storeid': id,
          'name': data.name,
          'address1': data.address1,
          'address2': data.address2,
          'city': data.city,
          'state': data.state,
          'zip': data.zip,
          'desc': data.desc,
          'hours': data.hours
        }
      }, function(err, data) {
        if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(id);
        }
      });

    });
  }
}