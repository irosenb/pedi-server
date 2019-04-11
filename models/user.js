const { Client } = require('pg'); 

var User = {} 

User.create = function(email, first_name, last_name, password, is_driver, callback) {
  const client = User.connection();

  var text = "INSERT INTO Users(email, first_name, last_name, password, is_driver) VALUES ($1, $2, $3, $4, $5)"
  var values = [email, first_name, last_name, password, is_driver];
  client.query(text, values, (err, results) => {
    if (err) {
      console.log(err); 
      callback(null, err);
    } else {
      callback(results.rows, null);
    }
  })
}

User.all = function(callback) {
  const client = User.connection(); 

  var text = "SELECT * FROM Users";
  client.query(text, function(err, results) {
    if (err) {
      callback(null, err); 
    } else {
      callback(results.rows, null);
    }
  }) 
}

User.connection = function() {
  const client = new Client(); 
  client.connect(); 

  return client
}

for (var k in User) {
  exports[k] = User[k];
}