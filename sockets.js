var sockets = {}
var Ride = require('./models/ride.js');
var User = require('./models/user.js');
var Driver = require('./models/driver.js');

sockets.init = function(server) {
  var io = require('socket.io').listen(server);

  io.use(function(socket, next) {
    var session_token = socket.request.headers['x-access-token'];
    console.log(session_token);

    User.find_by_session_token(session_token, function(user) {
      if (!user) {
        console.log('no user');
        return next(new Error("Authentication Error"));
      }
      console.log('user');
      return next();
    })
  })

  io.on('connect', function(socket) {
    console.log("socket connected");
    socket.on('rideRequest', function(data) {
      console.log(data);

      var start = "POINT(" + data['start_latitude'] + " " + data['start_longitude'] + ")";
      var destination = "POINT(" + data['destination_latitude'] + " " + data['destination_longitude'] + ")";
      var created_at = new Date();
      var user_id = data['user_id'];
      var eta = data['estimated_time'];
      var distance = data['distance'];
      var price = data['price'];
      var destination_address = data['destination_address'];
      var pickup_address = data['pickup_address'];
      Ride.create(start, destination, created_at, user_id, eta, distance, price, destination_address, pickup_address, function (result, err) {
        if (result) {
          var request = {};

          request['start_latitude'] = data['start_latitude'];
          request['start_longitude'] = data['start_longitude'];
          request['destination_latitude'] = data['destination_latitude'];
          request['destination_longitude'] = data['destination_longitude'];
          request['ride_id'] = result['id'];
          request['pickup_address'] = pickup_address;
          request['destination_address'] = destination_address;

          io.emit('rideRequest', request);
        }
      });

    });

    socket.on('acceptRide', function (data) {
      var ride_id = data['ride_id'];
      var driver_id = data['driver_id'];

      Ride.find_by_id(ride_id, function (err, result) {
        if (err) {
          console.error(err);
          return;
        }

        if (result['driver_id'] !== null) {
          return;
        }

        Ride.set_driver(ride_id, driver_id, function (err, results) {
          console.log(results);
          if (result) {
            io.emit('acceptRide', results.rows[0])
          }
        });
      });

    });

    socket.on('rideLocation', function (data) {
      io.emit('rideLocation', data);
    });

    socket.on('arrived', function (data) {
      console.log(data)
      Ride.update_status(data['ride_id'], Ride.status.ARRIVED, function (err, results) {
        io.emit('arrived', data);
      });
    });

    socket.on('pickUp', function (data) {
      Ride.pickup(data['ride_id'], function (err, result) {
        console.log(result);
        result["destination"] = JSON.parse(result['st_asgeojson'])['coordinates']
        io.emit('pickUp', result);
      })
    })

    socket.on('dropOff', function (data) {
      Ride.update_status(data['ride_id'], Ride.status.DROPOFF, function (err, result) {
        var driver_id = result['driver_id'];
        var user_id = result['user_id'];

        User.find(user_id, function (user, err) {
          Driver.find(driver_id, function (driver, err) {
            Ride.charge(result['price'] * 100, user['customer_id'], driver['account_id'], function (err, charge) {
              console.log(charge);
              io.emit('dropOff', data);
            })
          })
        })

      });
    });
  });

}

module.exports = sockets;
