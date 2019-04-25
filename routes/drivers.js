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

module.exports = router;
