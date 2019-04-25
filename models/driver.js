const { Client } = require('pg');

var Driver = {}

Driver.create = function(email, first_name, last_name, password, token, callback) {
  const client = Driver.connection();

  var text = "INSERT INTO Users(email, first_name, last_name, password, auth_token) VALUES ($1, $2, $3, $4, $5) RETURNING *"
  var values = [email, first_name, last_name, password, token];
  client.query(text, values, function(err, results) {
    if (err) {
      console.log(err);
      callback(null, err);
    } else {
      var user_id = results.rows[0]["id"]
      var query = "INSERT INTO Drivers(user_id) VALUES ($1) RETURNING *"
      var val = [user_id]

      client.query(query, val, function (err, res) {
        if (err) {
          console.error(err);
          callback(null, err);
        } else {
          var object = results.rows[0]

          object["driver_id"] = res.rows[0]["id"]
          object["is_driver"] = true

          callback(object, null);
        }
      })

    }
  });
}

Driver.all = function(callback) {
  const client = Driver.connection();

  var text = "SELECT * FROM Drivers";
  client.query(text, function(err, results) {
    if (err) {
      callback(null, err);
    } else {
      callback(results.rows, null);
    }
  })
}

Driver.find_by_session_token = function(token, callback) {
  const client = Driver.connection();
  const query = {
    text: "SELECT * FROM Drivers WHERE auth_token = $1",
    values: [token]
  }
  client.query(query, function(err, res) {
    if (err) {
      console.log(err.stack);
      callback(null, err);
    } else {
      callback(res.rows[0], null);
    }
  })

}

Driver.connection = function() {
  const client = new Client();
  client.connect();

  return client
}


for (var k in Driver) {
  exports[k] = Driver[k];
}
