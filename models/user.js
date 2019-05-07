const { Client } = require('pg');
const stripe = require("stripe")("sk_test_H1SU1ad9ZkwOVyfX1LRWSKEi");

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
    client.end();
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
    client.end();
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
    client.end();
  })

}

User.set_customer_and_credit_card = function (token, user, callback) {
  var full_name = user['first_name'] + " " + user['last_name']

  stripe.customers.create({
    name: full_name,
    email: user['email'],
    source: token
  }, function(err, customer) {
    if (err) {
      callback(null, err)
    }
    const client = User.connection();
    var text = "UPDATE Users SET customer_id=($1) WHERE id=($2) RETURNING *";
    var values = [customer.id, user['id']];

    client.query(text, values, function(err, res) {
      if (err) {
        console.log(err.stack);
        callback(null, err);
      } else {
        callback(null, res.rows[0]);
      }
      client.end();
    })
  });
}

User.connection = function() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  client.connect();

  return client
}


for (var k in User) {
  exports[k] = User[k];
}
