let user = {
  "user":{
    "first_name": "Michael",
    "last_name": "Victor",
    "email": "i7.danielcc+test6@gmail.com",
    "country_code": "+91",
    "phone": "9845286710",
    "password": "Aiesec123",
    "lc": 1395
  }
}

var request = require('request');

var options = {
  uri: 'https://auth.aiesec.org/users.json',
  method: 'POST',
  form: user,
  json: true
};

request(options, function (error, response, body) {
  console.log(response.statusCode);
  if (!error && response.statusCode == 200) {
    console.log(body.id) // Print the shortened url.
  }
});
