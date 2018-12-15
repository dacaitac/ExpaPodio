const fs      = require('fs')
const config  = JSON.parse(fs.readFileSync('./config.json'))
var   expa    = require('node-gis-wrapper')(config.expa.username, config.expa.password);
const podio     = require("./podioHandler")

let dicOpp = {}

const igvApp = 21925473

function saveOpps( arrOpps ){
  fs.writeFile("./opps.json", JSON.stringify(arrOpps, null, 4), (err) => {
  if (err) {
      console.error(err);
      return;
  };
    console.log("File has been writed");
  });
}

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
    .then( request => {
      return expa.get('/opportunities', request)
    })
    .then(async function( response ) {
      let pages = response.paging.total_pages
      console.log("Getting opportunities...");
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
    })
    .catch( err => reject(err))
  });
}

async function sendPodio( item, appId, action ){
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
        "type": "date",
        "field_id": 180879337,
        "label": "Fecha cierre Oportunidad",
        "values": [ { "start": item.closeDate + " 00:00:00" } ],
        "external_id": "fecha-cierre-oportunidad"
      },
      {
        "status": "active",
        "type": "date",
        "field_id": 180879336,
        "label": "Fecha del OPEN",
        "values": [ { "start": item.openDate + " 00:00:00" } ],
        "external_id": "fecha-del-open"
      },
      {
        "status": "active",
        "type": "date",
        "field_id": 180879339,
        "label": "Opportunity Start Date (RE DATE)",
        "values": [ { "start": item.startDate + " 00:00:00" } ],
        "external_id": "opportunity-start-date-re-date"
      },
      {
        "status": "active",
        "type": "date",
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
    ]
  }

  if(action === "new"){
    await podio.newItem(appId, request)
  }else if( action === "update"){
    let data = {
      "app_id": igvApp,
      "query": item.opId,
      "ref_type": "item"
    }

    podio.searchItem(igvApp, data)
    .then( found => {
      console.log(found.results[0].id)
      podio.updateItem(found.results[0].id, request)
    })
  }
}

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
  newPodio.opURL  = "https://aiesec.org/opportunity/" + op.id
  newPodio.LC     = "AIESEC in " + op.office.name
  newPodio.status = op.status
  newPodio.openDate   = openDate.getFullYear() + "-" + (openDate.getMonth()+1) + "-" + (openDate.getDay()+1)
  newPodio.closeDate  = closeDate.getFullYear() + "-" + (closeDate.getMonth()+1) + "-" + (closeDate.getDay()+1)
  newPodio.startDate  = startDate.getFullYear() + "-" + (startDate.getMonth()+1) + "-" + (startDate.getDay()+1)
  newPodio.finishDate = finishDate.getFullYear() + "-" + (finishDate.getMonth()+1) + "-" + (finishDate.getDay()+1)
  newPodio.project    = project

  return newPodio
}

// Trae todas las oportunidades creadas en expa desde una fecha a podio
// En esta funcion se arma el objeto que recibe la aplicacion
function expaToPodio( fromDate, appId ){
  getExpaOpps( fromDate )
  .then( opps => {
    for (var i = 0; i < opps.length; i++) {
      let op = opps[i]
      if( op.programmes.short_name == "GV"){
        dicOpp[newPodio.opId] = setPodioOpp( op )
        // sendPodio(newPodio, appId, "new")
      }
    }
    saveOpps(dicOpp)
  })
}

function fetchOpps( date ){
  let lastUpdate = JSON.parse(fs.readFileSync('./opps.json'))

  getExpaOpps( date )
  .then( opps => {
    for (var i = 0; i < opps.length; i++) {
      let op = opps[i]
      let opp = setPodioOpp(op)
      if( lastUpdate[ opp.opId ] != null ){
        // Revisa si hay nuevos aplicantes en las oportunidades, y las actualiza
        if( lastUpdate[ opp.opId ].numAps != opp.numAps ){
          console.log("New Applicants");
          console.log(opp);
          lastUpdate[ opp.opId ] = opp
          sendPodio(opp, igvApp, "update")
          saveOpps( lastUpdate )
        }
      }
      //Revisa si hay nuevas oportunidades y las envia a podio
      else if( op.programmes.short_name == "GV"){
        console.log("New Opportunity");
        console.log(opp);
        lastUpdate[ opp.opId ] = opp
        sendPodio(opp, igvApp, "new")
        saveOpps( lastUpdate )
      }
    }
  })
}



let date = new Date("2018-08-01T00:00:00.000Z")
// expaToPodio( date, igvApp )

fetchOpps(date)
// getExpaOpps(date).then(console.log)
