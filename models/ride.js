const { Client } = require('pg');
const stripe = require('stripe')('sk_test_fCIxlgiUQ5VYLoWTkNk2EZ8P00dzllYiO0');

var Ride = {};

Ride.status = {
  REQUEST: 'request',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
}

// Prices are in USD
Ride.perMileCost = 5.0;
Ride.perMinuteCost = 1.5;

Ride.connection = function() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  client.connect();

  return client
}

Ride.create = function(start, destination, created_at, user_id, eta, distance, price, destination_address, pickup_address, callback) {
  const client = Ride.connection();

  var text = "INSERT INTO Rides(start, destination, created_at, user_id, status, estimated_time, distance, price, destination_address, pickup_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
  var values = [start, destination, created_at, user_id, Ride.status.REQUEST, eta, distance, price, destination_address, pickup_address];
  client.query(text, values, function(err, results) {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(results.rows[0], null);
    }
    client.end();
  })
}

Ride.charge = function(price, customer_id, account_id, callback) {
  stripe.charges.create({
    amount: price,
    currency: "usd",
    customer: customer_id,
    transfer_data: {
      destination: account_id
    }
  }, function(err, charge) {
    callback(err, charge);
  })
}

Ride.set_pricing = function (eta, distance) {
  // convert meters into miles
  var miles = distance * 0.000621371192;

  // convert seconds into minutes
  var minutes = eta / 60.0;

  var price = (minutes * Ride.perMinuteCost) + (miles * Ride.perMileCost);

  // round to nearest 2 decimals
  price = Math.round(price * 100) / 100

  return price
}

Ride.set_driver = function(id, driver_id, callback) {
  const client = Ride.connection();

  var text = "UPDATE Rides SET driver_id=($1), status=($2), start_time=($3) WHERE id=($4) RETURNING *";
  var time = new Date();
  var values = [driver_id, Ride.status.ACCEPTED, time, id];
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

  if (status === Ride.status.DROPOFF) {
    text = "UPDATE Rides SET status=($1), end_time=($2) WHERE id=($3) RETURNING *"
    values = [status, new Date(), id]
  }

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
