var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Ride = require('../models/ride.js');

router.post('/request', function (req, res, next) {
  var session_token = req.headers['x-session-token'];

  if (!session_token) {
    console.log("no session token");
    res.send(401, "Unauthorized");
    return;
  }

  User.find_by_session_token(session_token, function(user) {
    var start_latitude = req.body.start_latitude;
    var start_longitude = req.body.start_longitude;
    var destination_latitude = req.body.destination_latitude;
    var destination_longitude = req.body.destination_longitude;
    var created_at = new Date()


    var start = "POINT(" + start_latitude + " " + start_longitude + ")"
    var destination = "POINT(" + destination_latitude + " " + destination_longitude + ")"

    console.log(start)
    console.log(destination)

    Ride.create(start, destination, created_at, user.id, function(result) {
      if (!result) {
        res.send(500);
        return;
      }

      res.send(result);
    })
  });
})

module.exports = router;
