const { Client } = require('pg');
const stripe = require('stripe')('sk_test_fCIxlgiUQ5VYLoWTkNk2EZ8P00dzllYiO0');

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
      const account = stripe.accounts.create({
        type: "custom",
        country: "US",
        email: email,
        business_type: "individual",
        individual: {
          first_name: first_name,
          last_name: last_name
        },
        business_profile: {
          product_description: "A pedicab driver"
        },
        requested_capabilities: ['platform_payments']
      }, function (err, account) {
        console.log(account);

        var user_id = results.rows[0]["id"]
        var query = "INSERT INTO Drivers(user_id, account_id) VALUES ($1, $2) RETURNING *"
        var val = [user_id, account['id']]

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
          client.end();
        });
      });
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
    client.end();
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
    client.end();
  })

}

Driver.set_stripe = function(driver_id, ssn, day, month, year, routing, account, remoteAddress, callback) {
  const client = Driver.connection();

  const query = {
    text: "SELECT * FROM Drivers WHERE id = $1",
    values: [driver_id]
  }
  client.query(query, function(err, res) {
    if (err) {
      console.log(err.stack);
      callback(null, err);
    } else {
      var driver = res.rows[0];
      const updated_account = stripe.accounts.update(driver.account_id, {
        individual: {
          ssn_last_4: ssn,
          dob: {
            day: day,
            month: month,
            year: year,
          }
        },
        external_account: {
          object: "bank_account",
          country: "US",
          currency: "usd",
          routing_number: routing,
          account_number: account
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: remoteAddress
        }
      }, function (err, account) {
        if (err) {
          console.log(err);
          callback(null, err);
          return;
        }

        console.log(account);
        callback(account, null);
        client.end();
      });
    }
  })
}

Driver.connection = function() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  client.connect();

  return client
}


for (var k in Driver) {
  exports[k] = Driver[k];
}
