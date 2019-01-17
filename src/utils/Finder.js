import Accessor from '../database/Accessor';
let StoreDB = new Accessor('stores', 'storeID');

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

export default function getNearest(lat1, lng1, maxDist, cap) {
  return new Promise((resolve, reject) => {
    let bounds = pointBounds(lat1, lng1, maxDist/2);
    
    StoreDB.scan({
      ProjectionExpression: "lat, lng, storeID, #nam, #des, hours, address",
      FilterExpression: "lat BETWEEN :latMin AND :latMax AND lng BETWEEN :lngMin AND :lngMax",
      ExpressionAttributeNames: {
        "#nam": "name",
        "#des": "desc"
      },
      ExpressionAttributeValues: {
        ":latMax": bounds.latMax,
        ":latMin": bounds.latMin,
        ":lngMax": bounds.lonMax,
        ":lngMin": bounds.lonMin
      }
    }).then(stores => {
      let res = [];

      stores.forEach(store => {
        let dist = distance(lat1, lng1, stores.lat, store.lng);
        res.splice(sortedIndex(res, dist), 0, {
          storeID: store.storeID,
          name: store.name,
          desc: store.desc,
          hours: store.hours,
          address: store.address
        });
      });
      res = res.slice(0, cap);
      
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
}