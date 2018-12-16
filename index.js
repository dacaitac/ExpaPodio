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
      newPerson   = require('./newPerson'),
      igv         = require('./igvPodio');

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

app.get('/updateOpp', ( req, res ) => {
  // Recibe el id de una oportunidad y la actualiza en Podio
  console.log( req.query );
  igv.updateOpp( req.query.oppId )
  res.status( 200 ).send( 'Confirm' );
});

app.get('/fetchOpps', ( req, res ) => {
  // Recibe el id de una oportunidad y la actualiza en Podio
  igv.fetchOpps(  )
  res.status( 200 ).send( 'Confirm' );
});

app.get('/getEPs', ( req, res ) => {
  // Recibe el id de una oportunidad y la actualiza en Podio
  console.log( req.query );
  igv.getEPs( req.query.oppId )
  res.status( 200 ).send( 'Confirm' );
});

if ( module === require.main ) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 442, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
