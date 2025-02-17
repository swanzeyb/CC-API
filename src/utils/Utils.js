import fetch from 'node-fetch';

export function validateAddress(data) {
  return new Promise((resolve, reject) => {
    // We need to validate the address, so we need to convert the address to a query string
    let query = ''; 
    Object.keys(data).forEach(key => {
      query = query + data[key].split(' ').join('+') + '+';
    });
    query = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&key=' + process.env.MAPS_KEY;
        
    // Contact Google Maps API with the address
    fetch(query).then(res => {
      res.json().then(json => {
        if (json.status === 'OK') { // The address is valid
          let obj = {};
              
          // Add the formatted address to the object along with lat / lng
          let loc = json['results'][0]['geometry']['location'];
          obj.lat = loc['lat'];
          obj.lng = loc['lng'];
          obj.formatted = json['results'][0]['formatted_address'];
          
          resolve(obj);
        } else if (json.status === 'REQUEST_DENIED') {
          reject('Server Error: Bad Maps Key');
        } else {
          reject('Invalid Address');
        }

      }).catch(err => {
        reject(err);
      })
    }).catch(err => {
      reject(err);
    });
  });
}

// Check for char limit, profanity, XSS, ?
export function validateString(str) {

}

export function dynoSani(obj) {
  console.log('SOMEONE CALLED ME FUCK OFF');
  let res = {};
  let replace = {
    'name': 'nick',
    'desc': 'info'
  };

  Object.keys(obj).forEach(key => {
    let newKey = replace[key] || key;

    res[newKey] = obj[key];
  });

  return res;
}

export function error(err, res) {
  if (Object.prototype.toString.call(err) == '[object Error]') {
    console.error(err);
    res.status(500).send();
  } else {
    res.status(400).json({
      error: err
    }); 
  }
}