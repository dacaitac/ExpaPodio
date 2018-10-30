const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))
var expa = require('node-gis-wrapper')(config.expa.username, config.expa.password);

let token
async function getToken(){
  await expa.getToken().then(expa_token => token = expa_token).catch(console.log)
  console.log(token);
}

getToken()
