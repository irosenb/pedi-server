var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

const bcrypt = require('bcrypt'); 
const saltRounds = 12;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email; 
  var first_name = req.body.first_name;
  var last_name = req.body.last_name; 
  const saltRounds = 10 

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) {
      res.status(500);
      return;
    }

    var password = hash;
    User.create(name, email, first_name, last_name, password, function(result, err) {
      if (result) {
        var data = {}

        data["first_name"] = result["first_name"]
        data["last_name"] = result["last_name"]
        data["email"] = result["email"]

        // jwtToken.sign

        res.send(200, data);
      }
    }) 
  })
})

module.exports = router;
