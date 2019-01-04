const fs      = require('fs')
const config  = JSON.parse(fs.readFileSync('./config.json'))
var   expa    = require('node-gis-wrapper')(config.expa.username, config.expa.password);
const podio   = require("../podioHandler")

let oppsDB  = JSON.parse(fs.readFileSync('./igv/opps.json'))
let epsDB   = JSON.parse(fs.readFileSync('./igv/eps.json'))
const DATE = new Date("2018-08-01T00:00:00.000Z")

let dicOpp = {}
let dicEps = {}
const oppApp = 21925473
const epApp  = 21915341

function saveFile( jsonDB, name ){
  if(name === "config"){
    fs.writeFileSync(`./${name}.json`, JSON.stringify(jsonDB, null, 4), (err) => {
      if (err) {
          console.error(err)
          return
      }
    })
  }
  else{
    fs.writeFileSync(`./igv/${name}.json`, JSON.stringify(jsonDB, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      };
      if(name == "opps") dicOpp = jsonDB
      if(name == "eps")  dicEps = jsonDB
    });
  }
  console.log(`File ${name}.json has been written`);
}

//Trae todas las oportunidades de expa y las envia a Podio
function expaToPodio( fromDate, appId ){
  getExpaOpps( fromDate )
  .then( opps => {
    for (var i = 0; i < opps.length; i++) {
      let op = opps[i]
      if( op.programmes.short_name == "GV"){
        dicOpp[newPodio.opId] = setPodioOpp( op )
        // sendPodioOpp(newPodio, appId, "new")
      }
    }
    saveFile(dicOpp, "opps")
  })
}

// Devuelve un arreglo con todas las oportunidades del comite 1582
async function getExpaOpps( fromDate ){
  let opps = []
  return new Promise(function(resolve, reject) {
    let token = ""
    expa.getToken()
    .then( expaToken => {
      console.log("Getting Token...");
      token = expaToken
      return {
        "access_token": token,
        "filters[committee]" : 1582,
        "filters[created][from]": fromDate
      }
    })
    .then(async function (request) {
      console.log("Getting opportunities...");
      let response = await expa.get('/opportunities', request)
      let pages = response.paging.total_pages
      if( pages == 1){
        for(let dat in response.data){
          opps.push(response.data[dat])
        }
        resolve(opps)
      }
      else{
        for (let i = 1; i <= pages; i++) {
          let req = {
            "access_token": token,
            "filters[created][from]": fromDate,
            "page": i
          }
          await expa.get('/opportunities', req)
          .then(res => {
            for (var dat in res.data) {
              opps.push(res.data[dat])
            }
          })
        }
        resolve(opps)
      }
    })
    .catch( err => reject(err))
  });
}

// Configura el objeto de expa para que sea manipulable en el programa
// y sea mas facil su configuracion para enviar a podio
function setPodioOpp( op ){
  let newPodio = {}

  let strArr = op.title.split(" ")
  strArr = strArr.map(str => { return str.toLowerCase() })

  let project = "-"
  if (strArr.includes('improve')){
    project = "Improve"
  }else if( strArr.includes('impulse') ){
    project = "Impulse"
  }

  let openDate    = new Date( op.created_at )
  let closeDate   = new Date( op.applications_close_date )
  let startDate   = new Date( op.earliest_start_date )
  let finishDate  = new Date( op.latest_end_date )

  newPodio.opName = op.title
  newPodio.numAps = op.applications_count
  newPodio.opId   = op.id.toString()
  newPodio.opURL  = "https://expa.aiesec.org/opportunities/" + op.id
  newPodio.LC     = op.office.full_name
  newPodio.status = op.status
  newPodio.openDate   = openDate.getFullYear() + "-" + (openDate.getMonth()+1) + "-" + (openDate.getDay()+1)
  newPodio.closeDate  = closeDate.getFullYear() + "-" + (closeDate.getMonth()+1) + "-" + (closeDate.getDay()+1)
  newPodio.startDate  = startDate.getFullYear() + "-" + (startDate.getMonth()+1) + "-" + (startDate.getDay()+1)
  newPodio.finishDate = finishDate.getFullYear() + "-" + (finishDate.getMonth()+1) + "-" + (finishDate.getDay()+1)
  newPodio.project    = project

  return newPodio
}

// Crea o actualiza una oportunidad de expa en podio
// Por parametro recibe una Oportunidad(item), previamente configurado en setPodioOp
// el Id de la aplicacion donde se va a enviar y la accion sea "new" o "update"
async function sendPodioOpp( item, appId, action ){
  config.podio.appId = oppApp
  config.podio.appToken = "3996d87d31b04b7f9f7fd59013ea4869"
  await saveFile(config, "config")

  let request = {
    "fields": [
      {
        "status": "active",
        "type": "text",
        "field_id": 181807918,
        "label": "Opportunity Name",
        "values": [ { "value": item.opName } ],
        "external_id": "titulo"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 180879330,
        "label": "Opportunity ID",
        "values": [ { "value": item.opId } ],
        "external_id": "opportunity-id"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 180879331,
        "label": "Opportunity URL",
        "values": [
          {
            "url" : item.opURL,
            "value": item.opURL
          }
        ],
        "external_id": "opportunity-url"
      },
      {
        "status": "active",
        "type": "number",
        "field_id": 181807476,
        "label": "Applicants",
        "values": [ { "value": item.numAps } ],
        "external_id": "applicants"
      },
      {
        "status": "active",
        "type": "DATE",
        "field_id": 180879337,
        "label": "Fecha cierre Oportunidad",
        "values": [ { "start": item.closeDate + " 00:00:00" } ],
        "external_id": "fecha-cierre-oportunidad"
      },
      {
        "status": "active",
        "type": "DATE",
        "field_id": 180879336,
        "label": "Fecha del OPEN",
        "values": [ { "start": item.openDate + " 00:00:00" } ],
        "external_id": "fecha-del-open"
      },
      {
        "status": "active",
        "type": "DATE",
        "field_id": 180879339,
        "label": "Opportunity Start Date (RE DATE)",
        "values": [ { "start": item.startDate + " 00:00:00" } ],
        "external_id": "opportunity-start-DATE-re-DATE"
      },
      {
        "status": "active",
        "type": "DATE",
        "field_id": 180879340,
        "label": "FINISH Day",
        "values": [ { "start": item.closeDate + " 00:00:00" } ],
        "external_id": "	finish-day"
      },
      {
        "status": "active",
        "type": "category",
        "field_id": 180879334,
        "label": "Status",
        "values": [ { "value": item.status } ],
        "external_id": "status"
      },
      {
        "status": "active",
        "type": "category",
        "field_id": 180879332,
        "label": "Entidad",
        "values": [ { "value": item.LC } ],
        "external_id": "entidad"
      },
      {
        "status": "active",
        "type": "category",
        "field_id": 180879338,
        "label": "Proyecto",
        "values": [ { "value": item.project } ],
        "external_id": "proyecto"
      }
      // {
      //  "status": "active",
      //  "type": "app",
      //  "field_id": 180879333,
      //  "label": "EP",
      //  "values": [{ "value": 1002270288 }]
      // }
    ]
  }

  if(action === "new"){
    await podio.newItem(appId, request)
  }else if( action === "update"){
    let data = {
      "app_id": oppApp,
      "query": item.opId,
      "ref_type": "item"
    }
    podio.searchItem(oppApp, data)
    .then( found => { podio.updateItem(found.results[0].id, request) })
  }
}

// Trae una oportunidad de Expa
async function getOpp(oppId){
  return new Promise(async function(resolve, reject) {
    let token = ""
    await expa.getToken()
    .then( function (expaToken) {
      console.log("Getting Token...");
      token = expaToken
      let req = {
        "access_token": token,
        "opportunity_id": oppId
      }
      expa.get(`/opportunities/${oppId}`, req)
      .then(op => {
        let newOp = setPodioOpp( op )
        resolve(newOp)
      })
    })
  });
}

// Trae todas las oportunidades creadas desde la variable global DATE
// y por cada una verifica si tiene nuevos EPs
// si tiene nuevos EPs actualiza toda la oportunidad en podio, agregando
// los nuevos EPs
exports.fetchOpps = async function fetchOpps(){
  console.log("Fetching opportunities...");
  oppsDB  = JSON.parse(fs.readFileSync('./igv/opps.json'))

  config.podio.appId = oppApp
  config.podio.appToken = "3996d87d31b04b7f9f7fd59013ea4869"
  await saveFile(config, "config")

  getExpaOpps( DATE )
  .then( async function(opps) {
    for (var i = 0; i < opps.length; i++) {
      let op = opps[i]
      let opp = setPodioOpp(op)
      // Revisa si las oportunidades existentes tienen nuevos aplicantes
      if( oppsDB[ opp.opId ] != null ){
        if( oppsDB[ opp.opId ].numAps != opp.numAps && opp.numAps != 0 ){
          console.log("New Applicants in Opp " + opp.opId);
          oppsDB[ opp.opId ] = opp
          sendPodioOpp(opp, oppApp, "update") //Actualiza la oportunidad en Podio
          getEPs(opp.opId)
        }
        console.log("Opportunity "+ opp.opId + " already updated.");
      }
      // Si hay nuevas oportunidades las envia a podio
      else if( op.programmes.short_name == "GV"){
        console.log( "New Opportunity: " + opp.opId );
        oppsDB[ opp.opId ] = opp
        sendPodioOpp(opp, oppApp, "new")

        getExpaEps( opp.opId, DATE )
        .then( async function(eps) {
          for (var i = 0; i < eps.length; i++) {
            let ep = await setPodioEP(eps[i], opp )
            sendPodioEp(ep, epApp)
          }
        })
      }
    }
    saveFile( oppsDB, "opps" )
  })
}

// Actualiza los datos de una oportunidad
// si tiene nuevos EPs los trae
exports.updateOpp = async function updateOpp( oppId ){
  config.podio.appId = oppApp
  config.podio.appToken = "3996d87d31b04b7f9f7fd59013ea4869"
  await saveFile(config, "config")

  oppsDB  = JSON.parse(fs.readFileSync('./igv/opps.json'))
  return new Promise(function(resolve, reject) {
    let token = ""
    expa.getToken()
    .then( async function (expaToken) {
      console.log("Getting Token...");
      token = expaToken
      let req = {
        "access_token": token,
        "opportunity_id": oppId
      }
      await expa.get(`/opportunities/${oppId}`, req)
      .then(op => {
        let oldOp = oppsDB[oppId]
        op.office = { full_name: op.host_lc.full_name }
        let newOp = setPodioOpp( op )
        oppsDB[newOp.opId] = newOp
        getNewEPs(newOp, oldOp)
        sendPodioOpp(newOp, oppApp, "update")
        saveFile(oppsDB, "opps")
      })
    })
  })
}

// Configura el objeto de expa para que sea manipulable en el programa
// y sea mas facil su configuracion para enviar a podio
async function setPodioEP( ep, opp ){
  config.podio.appId = oppApp
  config.podio.appToken = "3996d87d31b04b7f9f7fd59013ea4869"
  await saveFile(config, "config")
  let newEp = {}


  let data = {
    "app_id": oppApp,
    "query": opp.opId,
    "ref_type": "item"
  }

  let oppItemId = await podio.searchItem(oppApp, data)
  .then( found => {
    return found.results[0].id
  })

  let host_lc = await podio.getItemValues(oppItemId)
  .then( value => {
    return value.entidad.text
  })

  newEp.name = ep.person.first_name
  newEp.lastName = ep.person.last_name
  newEp.email = ep.person.email
  newEp.dob = ep.person.dob
  newEp.home_lc = ep.person.home_lc.name
  newEp.nationality = ep.person.nationalities[0].name
  newEp.id = ep.id.toString()
  newEp.expaAns = ep.gt_answer
  newEp.lc_host = host_lc
  newEp.status = ep.status
  newEp.oppId = oppItemId

  return newEp
}

// Envia un EP previamente configurado en setPodioEP a la aplicacion appId de podio
async function sendPodioEp( ep, appId ){
  config.podio.appId = 21915341
  config.podio.appToken = "443bc90fe89b4a54ada1946ddc02d706"
  await saveFile(config, "config")

  let request = {
    "fields": [
      {
        "status": "active",
        "type": "text",
        "field_id": 180787440,
        "label": "Nombre",
        "values": [ { "value": ep.name } ],
        "external_id": "titulo"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 181977093,
        "label": "Apellido",
        "values": [{ "value": ep.lastName }],
        "external_id": "apellido"
      },
      {
        "status": "active",
        "type": "email",
        "field_id": 181977098,
        "label": "Email",
        "values": [
          {
            "type": "work",
            "value": ep.email
          }
        ],
        "external_id": "email"
      },
      {
        "status": "active",
        "type": "DATE",
        "field_id": 181977094,
        "label": "Fecha de Nacimiento",
        "values": [{ "start": ep.dob+ " 00:00:00" }],
        "external_id": "fecha-de-nacimiento"
      },
      {
        "status": "active",
        "type": "category",
        "field_id": 181977349,
        "label": "LC Host",
        "values": [{ "value": ep.lc_host }],
        "external_id": "lc-host"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 181977095,
        "label": "Home LC",
        "values": [{ "value": ep.home_lc }],
        "external_id": "home-lc"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 181977096,
        "label": "Nacionalidad",
        "values": [{ "value": ep.nationality } ],
        "external_id": "nacionalidad"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 181977092,
        "label": "Application ID",
        "values": [{ "value": ep.id }],
        "external_id": "application-id"
      },
      {
        "status": "active",
        "type": "text",
        "field_id": 181977097,
        "label": "EXPA Answer",
        "values": [{ "value": ep.expaAns }],
        "external_id": "expa-answer"
      },
      {
        "status": "active",
        "type": "category",
        "field_id": 181977348,
        "label": "Status",
        "values": [{ "value": ep.status }],
        "external_id": "status"
      },
      {
        "status": "active",
        "type": "app",
        "field_id": 181998532,
        "label": "Opportunity",
        "values": [{ "value": ep.oppId }]
      }
    ]
  }

  console.log("Sending...");
  await podio.newItem(epApp, request).catch(console.log)
}

// Devuelve un arreglo con todos los EPs de una oportunidad creados desde la fecha agregada en el segundo parametro
// Los devuleve sin configurar
function getExpaEps( opp, createdFrom ){
  let eps = []
  return new Promise(async function(resolve, reject) {
    let token = ""
    await expa.getToken()
    .then( expaToken => {
      console.log("Getting Token...");
      token = expaToken
      return {
        "access_token": token,
        "opportunity_id": opp,
        "filters[created_at][from]": createdFrom
      }
    })
    .then( async function(request){
      let response = await expa.get(`/opportunities/${opp}/applications`, request)
                               .catch(console.log)

      let pages = response.paging.total_pages
      if( pages == 1){
        for(let dat in response.data){
          eps.push(response.data[dat])
        }
        resolve(eps)
      }
      else {
        for (let i = 1; i <= pages; i++) {
          console.log("Getting EPs from page "+i);
          let req = {
            "access_token": token,
            "opportunity_id": opp,
            "filters[created_at][from]": createdFrom,
            "page": i
          }
          await expa.get(`/opportunities/${opp}/applications`, req)
          .then(res => {
            for (var dat in res.data) {
              eps.push(res.data[dat])
            }
            resolve(eps)
          })
        }
      }
    })
    .catch( err => reject(err))
  });
}

// Lleva todos los aplicantes de una oportunidad a Podio
// Si ya existe uno no hace nada
async function getEPs( opp ){
  epsDB   = JSON.parse(fs.readFileSync('./igv/eps.json'))
  let eps = await getExpaEps(opp, DATE)
  console.log(`EPs from ${opp} Loaded`)

  for (var i = 0; i < eps.length; i++) {
    let newEp = await setPodioEP( eps[i], opp )
    // Si es un EP nuevo lo envia a Podio
    if(epsDB[newEp.id] == null){
      epsDB[newEp.id] = newEp
      await sendPodioEp(newEp, epApp)
      newEp = {}
    }
  }
  saveFile(epsDB, "eps")
}
exports.importEPs = oppId => getEPs( oppId)

// Compara los EPs de una oportunidad, si la oportunidad oldOp, tiene mas
// EPs que la que hay en la base de EPs los crea
async function getNewEPs(newOp, oldOp){
  epsDB   = JSON.parse(fs.readFileSync('./igv/eps.json'))
  if(newOp.numAps == oldOp.numAps){
    console.log("No new EPs were found");
    return
  }
  else{
    console.log("Creating New EPs");
  }

  let newEps = await getExpaEps(newOp.opId, DATE)
  for (var i = 0; i < newEps.length; i++) {
    let newEP = await setPodioEP(newEps[i], newOp)
    if(epsDB[newEP.id] == null){
      epsDB[newEP.id] = newEP
      sendPodioEp(newEP, newOp)
    }
  }
  saveFile(epsDB, "eps")
}
