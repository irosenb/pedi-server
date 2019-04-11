var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

const fs = require('fs');
var jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt'); 
const saltRounds = 12;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  var email = req.body.email; 
  var first_name = req.body.first_name;
  var last_name = req.body.last_name; 
  var is_driver = req.body.is_driver || false
  console.log("is driver: " + is_driver)
  const saltRounds = 10 

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) {
      res.status(500);
      return;
    }

    // var privateKey = fs.readFileSync('~/.ssh/id_rsa');
    var token = jwt.sign({email: email}, 'shhhhh');
    console.log(token);
    var password = hash;

    User.create(email, first_name, last_name, password, is_driver, function(result, err) {
      if (result) {
        var data = {}

        data["first_name"] = result["first_name"];
        data["last_name"] = result["last_name"];
        data["email"] = result["email"];
        data["auth_token"] = token; 

        res.send(200, data);
        return; 
      }

      res.send(500); 
    }) 
  })
})

module.exports = router;
