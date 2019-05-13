var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Ride = require('../models/ride.js');
var Driver = require('../models/driver.js')
const bcrypt = require('bcrypt');
const saltRounds = 12;

router.post('/', function (req, res, next) {
  var email = req.body.email;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;

  const saltRounds = 10
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) {
      res.status(500);
      return;
    }

    var token = crypto.randomBytes(20).toString('hex');

    console.log(token);
    var password = hash;

    Driver.create(email, first_name, last_name, password, token, function(result, err) {
      if (result) {
        var data = {}

        data["first_name"] = result["first_name"];
        data["last_name"] = result["last_name"];
        data["email"] = result["email"];
        data["auth_token"] = token;
        data["driver_id"] = result['driver_id'];
        data['is_driver'] = true
        data['user_id'] = result["id"]
        res.send(200, data);
        return;
      }

      res.send(500);
    })
  })
})

router.put('/toggle', function (req, res, next) {
  res.send({});
})

router.put('/stripe', function (req, res, next) {
  var session_token = req.headers['x-session-token'];

  if (!session_token) {
    console.log("no session token");
    res.status(401).send("Unauthorized");
    return;
  }

  User.find_by_session_token(session_token, function(user) {
    var day = req.body.day;
    var month = req.body.month;
    var year = req.body.year;
    var ssn = req.body.ssn;
    var routing_number = req.body.routing_number;
    var account_number = req.body.account_number;

    Driver.set_stripe(req.body.driver_id, ssn, day, month, year, routing_number, account_number, req.connection.remoteAddress, function(err, result) {
      if (result) {
        res.status(200).send(result)
      }
    })
  })
})

module.exports = router;
