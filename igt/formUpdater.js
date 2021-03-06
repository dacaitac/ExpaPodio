const fs       = require('fs'),
      config   = JSON.parse(fs.readFileSync('./config.json')),
      podio    = require('../podioHandler'),
      typeform = require('../typeformHandler'),
      pdf      = require('./pdfHandler')

const copFormId = 'LFqikz' // ID del formulario en typeform
const audFormId = 'e5MPWx'
const epFormId  = 'GFtkZF'
const themis3   = 'urOY0q'

let copValues = {
  'COMPANY_NAME': {
    'typeform_id': 2,
    'podio_id' : 176573088,
    'data': []
  },
  'OPPORTUNITIES': {
    'typeform_id': 3,
    'podio_id' : 176573087,
    'data': []
  },
  'COPERATIONS': {
    'typeform_id': 5,
    'podio_id' : 176573089,
    'data': []
  }
}

let audValues = {
  'COMPANY_NAME': {
    'typeform_id': 4,
    'data': []
  }
}

let epValues = {
  'EP_NAME': {
    'typeform_id': 0,
    'data': []
  }
}

function filterMonths(from, to){
  let filter = {
    "filters": { "created_on": {'from': from, 'to': to} },
    "limit": 500
  }
  return filter
}

function resetValues(values){
  for(field in values)
    values[field].data = []
}

async function writeConfig( newConfig ){
  console.log('Writing new config');
  await fs.writeFileSync('config.json', JSON.stringify(newConfig, null, 2), function (err) {
    if (err) return console.log(err);
  });
  console.log("Config writted");
}

// Actualiza los dropdown del formulario de coperaciones según las categorias que se definen
// en el objeto copValues de la applicacion de podio Coperations aplicants
exports.setCopValues = async function setCopValues( ){
  config.podio.appToken = "ac254c52522c4e599e723312074005e8"
  config.podio.appId = 21460631
  await writeConfig( config )

  // resetValues(copValues)
  for(field in copValues){
    copValues[field].data = await podio.getCategoryField(21460631, copValues[field].podio_id)
    .catch((err) => {
      console.log(err)
    })
  }
  typeform.updateForm(copFormId, copValues)
}

// Carga las empresas de la aplicacion CRM Empresas de podio
// y las agrega en las empresas de la fase 1 de Themis
exports.setAudValues = async function setAudValues(){
  config.podio.appToken = "0980ba976500450cacfcef31848883e3"
  config.podio.appId = 14636882
  writeConfig( config )

  resetValues(audValues)
  for(field in audValues){
    // audValues[field].data = await podio.getAllItems(14636882)
    await podio.getAllItems(14636882).then( items =>{
      let titles = items.map(item => { return item.title })
      audValues.COMPANY_NAME.data = titles
    })
    .catch((err) => {
      console.log(err)
    })
  }
  typeform.updateForm(audFormId, audValues)
}

exports.setEPValues = async function setEPValues(){
  config.podio.appToken = "b61f7b326b874748b40858f47211374b"
  config.podio.appId = 21471912
  writeConfig( config )

  resetValues(epValues)
  for(field in epValues){
    // epValues[field].data = await podio.getAllItems(14636882)

    let filter = filterMonths("2018-07-01", "2019-07-01")
    await podio.getFilterItems( 21471912, filter )
    .then( items => {
      epValues.EP_NAME.data = items.map(item => { return item.title })
    })
    .catch((err) => {
      console.log(err)
    })
  }
  console.log(epValues);
  typeform.updateForm(epFormId, epValues)
  // Themis fase 3
  typeform.updateForm(themis3, epValues)
}

exports.themis3 = async function themis3(name){
  config.podio.appToken = "b61f7b326b874748b40858f47211374b"
  config.podio.appId = 21471912
  writeConfig( config )

  let data = {
    "app_id": 21471912,
    "query": name,
    "ref_type": "item"
  }

  let ep = await podio.searchItem(21471912, data)
  .then( found => {
    let item = {}
    item.id = found.results[0].id,
    item.name = found.results[0].title
    return item
  })

  let it = await podio.getItemValues(ep.id)
  ep.passport = it["numero-pasaporte"]
  ep.correo = it["email"]
  pdf.createTerms(ep)
}
