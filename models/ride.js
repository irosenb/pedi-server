const { Client } = require('pg');

var Ride = {};

Ride.status = {
  REQUEST: 'request',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
}

Ride.connection = function() {
  const client = new Client();
  client.connect();

  return client
}

Ride.create = function(start, destination, created_at, user_id, eta, distance, callback) {
  const client = Ride.connection();

  var text = "INSERT INTO Rides(start, destination, created_at, user_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *"
  var values = [start, destination, created_at, user_id, Ride.status.REQUEST];
  client.query(text, values, (err, results) => {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(results.rows[0], null);
    }
    client.end();
  })

}

Ride.set_driver = function(id, driver_id, callback) {
  const client = Ride.connection();

  var text = "UPDATE Rides SET driver_id=($1), status=($2) WHERE id=($3) RETURNING *";
  var values = [driver_id, Ride.status.ACCEPTED, id];
  client.query(text, values, function(err, res) {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, res);
    }
    client.end();
  })
}

Ride.find_by_id = function(id, callback) {
  const client = Ride.connection();

  var text = "SELECT * FROM Rides WHERE id=($1)";
  var values = [id];
  client.query(text, values, function(err, res) {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, res.rows[0]);
    }
    client.end();
  })
}

Ride.update_status = function(id, status, callback) {
  const client = Ride.connection();
  var text = "UPDATE Rides SET status=($1) WHERE id=($2) RETURNING *"
  var values = [status, id];

  client.query(text, values, function (err, results) {
    if (err) {
      callback(err, null);
    }  else {
      callback(null, results.rows[0])
    }


    client.end();
  })
}

Ride.pickup = function (id, callback) {
  const client = Ride.connection();

  var text = "UPDATE Rides SET status=($1), start_time=($2) WHERE id=($3) RETURNING ST_AsGeoJSON(destination),*";
  var time = new Date();
  var values = [Ride.status.PICKUP, time, id];

  client.query(text, values, function (err, results) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.rows[0]);
    }
    client.end();
  })
}

for (var k in Ride) {
  exports[k] = Ride[k];
}
