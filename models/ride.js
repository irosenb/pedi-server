const { Client } = require('pg');

var Ride = {};

Ride.connection = function() {
  const client = new Client();
  client.connect();

  return client
}

Ride.create = function(start, destination, created_at, user_id, callback) {
  const client = Ride.connection();

  var text = "INSERT INTO Rides(start, destination, created_at, user_id) VALUES ($1, $2, $3, $4)"
  var values = [start, destination, created_at, user_id];
  client.query(text, values, (err, results) => {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(results, null);
    }
  })

}

Ride.update = function(fields) {

}

for (var k in Ride) {
  exports[k] = Ride[k];
}
