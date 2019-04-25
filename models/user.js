const { Client } = require('pg');

var User = {}

User.create = function(email, first_name, last_name, password, is_driver, token, callback) {
  const client = User.connection();

  var text = "INSERT INTO Users(email, first_name, last_name, password, is_driver, auth_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
  var values = [email, first_name, last_name, password, is_driver, token];
  client.query(text, values, function(err, results) {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      callback(results.rows[0], null);
    }
  });
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

User.find_by_session_token = function(token, callback) {
  const client = User.connection();
  const query = {
    text: "SELECT * FROM Users WHERE auth_token = $1",
    values: [token]
  }
  client.query(query, function(err, res) {
    if (err) {
      console.log(err.stack);
      callback(null);
    } else {
      callback(res.rows[0]);
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
