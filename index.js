'use strict'

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose")

const podio       = require('./podioHandler'),
      newPerson   = require('./ogv/newPerson'),
      igv         = require('./igv/igvPodio'),
      formUpdater = require('./igt/formUpdater'),
      agreement   = require('./igt/agreement')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

app.get('/', (req, res) => {
  res.status(200).send( 'Hello, world!' );
});

// Recibe como parametro el ID del item de una persona en Podio, recoge los valores que
// esten dentro de la aplicacion y los utiliza para crearlo en expa
app.get('/newItem', ( req, res ) => {
  console.log( req.query );
  let podioItem = req.query
  newPerson.setExpaPerson( podioItem.itemId )
  res.status( 200 ).send( 'Confirm' );
});

// Recibe el id de una oportunidad y la actualiza sus datos en Podio
// // TODO: QUE ACTUALICE SUS EPS
app.get('/updateOpp', ( req, res ) => {
  console.log( req.query );
  igv.updateOpp( req.query.oppId )
  res.status( 200 ).send( 'Confirm' );
});

// Trae todas las oportunidades creadas desde la variable global DATE(en igvPodio)
// y por cada una verifica si tiene nuevos EPs
// si tiene nuevos EPs actualiza toda la oportunidad en podio, agregando
// los nuevos EPs
app.get('/fetchOpps', ( req, res ) => {
  igv.fetchOpps(  )
  res.status( 200 ).send( 'Confirm' );
});

// Recibe el id de una oportunidad y la actualiza en Podio
// trayendo tambien sus eps
app.get('/getEPs', ( req, res ) => {
  console.log( req.query );
  igv.importEPs( req.query.oppId )
  res.status( 200 ).send( 'Confirm' );
});

// Cuando a la categoria coperaciones se le agrega una nueva cooperacion
// actualiza el formulario de coperaciones de typeform
app.get('/coperations', (req, res) => {
  formUpdater.setCopValues( )
  res.status(200).send('Coperations form Updated');
});

// Actualiza las empresas de la fase 1 de Themis
app.get('/audit', (req, res) => {
  formUpdater.setAudValues()
  res.status(200).send('Audit form Updated');
});

//Se ejecuta cuando un nuevo Trainee de igt llena Themis
// actualiza la segunda fase de themis y recibe los datos que necesita
// para generar el acuerdo
app.get('/newEP', (req, res) => {
  formUpdater.setAudValues()
  formUpdater.setEPValues()
  if( Object.keys(req.query).length === 0 ){
    console.log('Ep Created');
  }else{
    console.log(req.query);
    agreement.createAg(req.query)
  }
  res.status(200).send('EP form Updated');
});

if ( module === require.main ) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 443, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
