'use strict'

const fs      = require('fs')
const config  = JSON.parse(fs.readFileSync('./config.json'))
var   expa    = require('node-gis-wrapper')(config.expa.username, config.expa.password);
const podio     = require("./podioHandler")

let token
async function getToken(){
  await expa.getToken()
    .then(expa_token => token = expa_token)
    .catch(console.log)
  console.log(token);
}
getToken()

let s = "s"

let rq = {
  "fields": [
    {
      "status": "active",
      "type": "text",
      "field_id": 180880007,
      "label": "Texto",
      "values": [
        {
          "value": s
        }
      ],
      "external_id": "texto"
    }
  ]
}

// podio.updateItem(989827985, rq)
