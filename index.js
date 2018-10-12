const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))
var expa = require('node-gis-wrapper')(config.expa.username, config.expa.password);
expa.get('current_person.json').then(console.log).catch(console.log);