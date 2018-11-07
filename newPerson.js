'use strict'

var request         = require('request')
const committees    = require('./committees'),
      universities  = require('./universities.json'),
      podio         = require('./podioHandler'),
      mail          = require('./mail')

let expaPerson = {
  "user":{
      "first_name"  : "",
      "last_name"   : "test",
      "email"       : "",
      "country_code": "+507",
      "phone"       : "644566456",
      "password"    : "Aiesec123",
      "lc"          : 1582,   //MC Panama ID
      "allow_email_communication": true,
      "allow_phone_communication": true
    }
}

// Crea un perfil en EXPA dados los datos de una aplicacion en Podio
exports.setExpaPerson = async function setExpaPerson( itemId ) {
  await podio.getItem( itemId )
  .then( podioItem => {
    podioItem.fields.map( item => {
      switch ( item.field_id ) {
        case 178889966:
          expaPerson.user.first_name = item.values[ 0 ].value
          break
        case 178904386:
          expaPerson.user.last_name = item.values[ 0 ].value
          break
        case 178889968:
          expaPerson.user.email = item.values[ 0 ].value
          break
        case 178904387:
          expaPerson.user.phone = item.values[ 0 ].value
          break
        case 178889977:
          let committee = universities[ item.values[ 0 ].value.text ]
          let lcID = committees[ committee ]
          expaPerson.user.lc = lcID
          break
        // TODO: Comite y pais
        default:
      }
    })
    // Envía el eMail luego de haber creado el perfil en EXPA
    mail.sendMail( expaPerson )
    // console.log( expaPerson )
  })
  .catch( error =>  console.log( error ) )


  // var options = {
  //   uri   : 'https://auth.aiesec.org/users.json',
  //   method: 'POST',
  //   form  : expaPerson,
  //   json  : true
  // }
  //
  // let newPerson = {}
  // await request(options, function (error, response, body) {
  //   console.log(response.statusCode)
  //   if (!error && response.statusCode == 200) {
  //     console.log(body.id)
  //   }
  //   newPerson = body
  // })

  // console.log(newPerson)
  // return newPerson
}

// getTheItem(957745287)
