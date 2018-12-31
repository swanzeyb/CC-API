Math.radians = function(degrees) { // Converts from degrees to radians
  return degrees * Math.PI / 180;
};

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

/*
  Input coords is an array of stores structued as so
  [
    {
      lat: 10.0,
      lng: 10.0,
      storeID: asdaskdowikd9
    },
    {
      ETC
    }
  ]
*/
export default class Finder {
  getNearest(lat1, lng1, coords, maxDist, cap) {
    let res = [];
    cap--;
  
    for (let i = 0; i < coords.length; i++) {
      const { lat, lng } = coords[i];
      const dist = distance(lat1, lng1, lat, lng)
  
      if (res.length <= cap) {
  
        if (dist < maxDist) {
          res[sortedIndex(res, dist)] = {
            storeID: coords[i][storeID],
            dist: dist
          }
        }
        
      } else {
        return res;      
      }
    }
  
    return res;
  }
}