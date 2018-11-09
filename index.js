'use strict'

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose")

let universities  = require('./universities.json'),
    committees    = require('./committees.json')

const podio       = require('./podioHandler'),
      colleges    = require('./universities'),
      newPerson   = require('./newPerson')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

app.get('/', (req, res) => {
  res.status(200).send( 'Hello, world!' );
});

app.get('/newItem', ( req, res ) => {
  console.log( req.query );
  let podioItem = req.query
  newPerson.setExpaPerson( podioItem.itemId )
  res.status( 200 ).send( 'Confirm' );
});

if ( module === require.main ) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 80, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
