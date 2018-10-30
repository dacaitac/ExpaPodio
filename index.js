var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require('mongoose');
const podio = require('./podioHandler')
const colleges = require('./universities')
const newPerson = require('./newPerson')

let universities = require('./universities.json')
let committees = require('./committees.json')


async function toApp( appId ){
  await podio.toAllItems( appId )
    .then( itemId => {
      let person = newPerson.setExpaPerson( itemId )
      .catch( err => console.log( err ) )
    })
    .catch(err => console.log(err))
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride());

var router = express.Router();

app.get('/', (req, res) => {
  // setValues(values)
  res.status(200).send('Hello, world!');
});

app.post('/newItem', (req, res) => {
  // setValues(values)
  console.log(req.query);
  let podioItem = req.query
  // podio.getItemValues(podioItem.itemId)
  // .then(item => console.log(item))
  newPerson.setExpaPerson( podioItem.itemId )
  res.status(200).send('Confirm');
});
// [END hello_world]

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 80, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
// ............................................................................


// colleges.updateFields()
// toApp( 21719955 )
