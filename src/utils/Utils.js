import fetch from 'node-fetch';

Math.radians = function(degrees) { // Converts from degrees to radians
  return degrees * (Math.PI / 180);
};

Math.degrees = function(radians) {
  return radians * (180 / Math.PI)
};

function pointBounds(lat, lon, radMiles) { // Not reliable at large distances
  //let radKM = radMiles * 1.609344; This is the scientifically correct conversion
  let radKM = radMiles * 1.14263424; // But this generates better anwsers, ¯\_(ツ)_/¯
  let rLat = Math.radians(lat);
  let rLon = Math.radians(lon);

  let radius = 6371;
  let pRadius = radius * Math.cos(rLat);

  let bounds = {
    latMin: Math.degrees(rLat - radKM / radius),
    latMax: Math.degrees(rLat + radKM / radius),
    lonMin: Math.degrees(rLon - radKM / pRadius),
    lonMax: Math.degrees(rLon + radKM / pRadius)
  }

  return bounds;
}

function distance(lat1, lng1, lat2, lng2) {
  let x = Math.radians(lng1 - lng2) * Math.cos(Math.radians(lat1));
  let y = Math.radians(lat1 - lat2);
  return 3958.8 * Math.sqrt( (x*x) + (y*y) );
}

function sortedIndex(array, value) {
  let low = 0;
  let high = array.length;

  while (low < high) {
      let mid = (low + high) >>> 1;
      if (array[mid] < value) low = mid + 1;
      else high = mid;
  }
  return low;
}

export function validateAddress(data) {
  return new Promise((resolve, reject) => {
    // We need to validate the address, so we need to convert the address to a query string
    let query = ''; 
    Object.keys(data).forEach(key => {
      query = query + data[key].split(' ').join('+') + '+';
    });
    query = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&key=' + (process.env.MAPS_KEY || 'AIzaSyAzChoMdglfOkSHj1qVILLjTrspBUseZIw');
        
    // Contact Google Maps API with the address
    fetch(query).then(res => {
      res.json().then(json => {
        if (json.status === 'OK') { // The address is valid
              
          // Add the formatted address to the object along with lat / lng
          let loc = json['results'][0]['geometry']['location'];
          data.lat = loc['lat'];
          data.lng = loc['lng'];
          data.formated = json['results'][0]['formatted_address'];
          
          resolve(data);
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

export function getNearestStores(lat1, lng1, coords, maxDist, cap) {
  // stub
}