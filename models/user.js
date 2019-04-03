const { Client } = require('pg'); 

var User = {} 

User.create = function(name, email, first_name, last_name, password, callback) {
  const client = User.connection();

  var text = "INSERT INTO User(name, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5)"
  var values = [name, email, first_name, last_name, password];
  client.query(text, values, (err, results) => {
    if (err) {
      callback(null, err)
    } else {
      callback(results.rows, null);
    }
  })
}

User.all = function(callback) {
  const client = User.connection(); 

  var text = "SELECT * FROM User";
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