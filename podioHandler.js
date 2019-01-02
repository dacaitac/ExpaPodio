'use strict'

const PodioJS   = require('podio-js').api
const fs        = require('fs')
const jsonpatch = require('json-patch')

// Simplifica los request que utilizan autenticacion por App
// method: HTTP method
// podioRequest: Podio API
// Devuelve una promesa con el response de Podio
function request (method, podioRequest, data) {
  let config        = JSON.parse(fs.readFileSync('./config.json'))
  let clientId      = config.podio.clientId
  let clientSecret  = config.podio.clientSecret
  // get the API id/secret

  // get the app ID and Token for appAuthentication
  let appId     = config.podio.appId
  let appToken  = config.podio.appToken

  // SDK de Podio con autenticacion por App
  const podio = new PodioJS({
    authType    : 'app',
    clientId    : clientId,
    clientSecret: clientSecret
  })

  return new Promise((resolve, reject) => {
    data = data || null
    podio.authenticateWithApp(appId, appToken, (err) => {
      if (err) reject(err)

      podio.isAuthenticated()
        .then(() => { // Ready to make API calls in here...
          podio.request(method, podioRequest, data)
            .then(response => {
              console.log('Podio request Complete')
              resolve(response)
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
  })
}

// Llama todos los atributos de un campo en Podio
// Para los solos valores es mejor usar la funcion getFieldValues
exports.getField = function getField( appId, fieldId ){
  return new Promise ( (resolve, reject) => {
    request( 'GET', `/app/${ appId }/field/${ fieldId }`, null )
    .then( response => { resolve( response ) })
    .catch(err => {
      reject(err)
      console.log(err)
    })
  })
}

exports.getItem = function getItem ( itemId ) {
  console.log("Calling Item from Podio")
  return new Promise ((resolve, reject) => {
    request('GET', `/item/${itemId}`, null)
    .then( ( response ) => {
      resolve( response )
    })
    .catch(err => {
      reject(err)
      console.log(err)
    })
  })
}

exports.updateField = async function updateField( appId, fieldId, data ){
  await request('PUT', `/app/${appId}/field/${fieldId}`, data)
  .then( response => console.log( response ) )
  .catch( error =>  console.log( error ) )
}

exports.updateItem =  function updateItem( itemId, data ){
  request('PUT', `/item/${itemId}`, data)
  .then( response => console.log( "Updating Item" ) )
  .catch( error =>  console.log(error) )
}

exports.newItem = async function newItem(appId, data){
  await request('POST', `/item/app/${appId}/`, data)
  .then( responseData => {
    console.log('Creating Item');
  })
  .catch( error => {
    console.log(error)
  })
}

//Ejecuta una accion sobre todos los items de una aplicacion
exports.toAllItems = function toAllItems ( appId ) {
  return new Promise ((resolve, reject) => {
    request('GET', `/item/app/${appId}/`, null)
    .then( response => {
      let itemList = response.items
      itemList.map( item => {
        console.log(item.item_id);
        resolve(item.item_id)
      })
    })
    .catch( err => console.log( err ) )
  })
}

//Devuelve un objeto JSON con los valores del item seleccionado
exports.getItemValues = function getItemValues( itemId ) {
  return new Promise (( resolve, reject ) => {
    request( 'GET', `/item/${ itemId }/value/v2`, null )
      .then( response => resolve( response ) )
      .catch( err => {
        reject( err )
        console.log( err )
      })
  })
}

exports.searchItem = function searchItem(appId, data){
  return new Promise (( resolve, reject ) => {
    request( 'GET', `/search/app/${appId}/v2`, data )
      .then( response => resolve( response ) )
      .catch( err => {
        reject( err )
        console.log( err )
      })
  })
}

exports.getAllItems = function getAllItems ( appId ) {
  return new Promise ((resolve, reject) => {
    request('GET', `/item/app/${appId}/`, {"limit": 100})
    .then( response => {
      console.log(response);
      let itemList = response.items
      resolve(itemList)
    })
    .catch( err => console.log( err ) )
  })
}

exports.getCategoryField = function getCategoryField(appId, fieldId){
  return new Promise((resolve, reject) => {
    request('GET', `/app/${appId}/field/${fieldId}`)
      .then((response) =>{
        let list = []
        let options = response.config.settings.options;
        options = options.filter(option => option.status == 'active')
        options.map((option) => {
          list.push(option.text)
        })
        resolve(list)
      })
      .catch(err => reject(err))
  })
}
