'use strict'

const fs      = require('fs')
let   config  = JSON.parse(fs.readFileSync('./config.json'))
const podio   = require('./podioHandler')
var   expa    = require('node-gis-wrapper')(config.expa.username, config.expa.password);
const MC_ID   = config.expa.mc_id

// config.podio.appId    = 21719955
// config.podio.appToken = 'a52b64b9d5b1452885d97dafc69c6cf8'
//
// let strConfig = JSON.stringify(config, null, 2)
// fs.writeFile("config.json", strConfig,
//               err => { if (err) console.log(err) })

let committees    = {}
let universities  = {}
let lcs           = []
let colleges      = []

// Carga los comités desde EXPA y los guarda en el archivo universities.JSON
// TODO: La idea es que se utilice este mismo programa para sincronizar
// las universidades de EXPA con Podio
async function updateUniversitiesField(){
  await expa.get(`/committees/${MC_ID}/lc_alignments`)
  .then( response => {
    console.log(response)
    response.map( university => {
      universities[university.keywords] = university.lc.full_name
      committees[university.lc.full_name] = university.lc.id
    })

    let str = JSON.stringify(universities, null, 2)
    fs.writeFile("universities.json", str,
                  err => { if (err) console.log(err) })

    str = JSON.stringify(committees, null, 2)
    fs.writeFile("committees.json", str,
                  err => { if (err) console.log(err) })
  }).catch(console.log)

  lcs        = Object.keys(committees)
  colleges   = Object.keys(universities)
  let objUs  = []
  let objLcs = []

  colleges.map( (uni, index) => {
    let obj  = {
      'status': 'active',
      'text'  : uni,
      'id'    : index+1,
      'color' : 'DCEBD8'
    }
    objUs.push(obj)
  })
  lcs.map( (lc, index) => {
    let obj  = {
      'status': 'active',
      'text'  : lc,
      'id'    : index+1,
      'color' : 'DCEBD8'
    }
    objLcs.push(obj)
  })

  let data = {
    "label"       : 'Universidad',
    "description" : null,
    "delta"       : 5,
    "settings"    : {
          multiple : false,
          options  : objUs,
          display  : 'inline'
        },
    "mapping"     : null,
    "required"    : true,
    "hidden_create_view_edit": false
  }

  let dataLC = {
    "label"       : 'Comité',
    "description" : null,
    "delta"       : 6,
    "settings"    : {
            multiple : false,
            options  : objLcs,
            display  : 'inline'
          },
    "mapping"     : null,
    "required"    : true,
    "hidden_create_view_edit": false
  }

  console.log(objLcs);
  podio.updateField(config.podio.appId, 178889977, data )
  podio.updateField(config.podio.appId, 179564844, dataLC )
}
updateUniversitiesField()
