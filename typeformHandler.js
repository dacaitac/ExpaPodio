const request = require('request')
const querystring = require('querystring')
const url = require('url').Url
const http = require('https')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))

const options = {  //Opciones de configuracion para el formulario
    url: `https://api.typeform.com/forms/`,
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': `Bearer ${config.typeform.accessToken}`
    },
    json: {}
};

//Actualiza un formulario de typeform donde form es un
//objeto JSON con sus respectivos atributos
async function putForm(form, formId){
  options.json = form
  options.url = `https://api.typeform.com/forms/${formId}`
  //send request
  request(options, (err, res) =>{
    // console.log(res);
    if(err){console.log(err);}
    console.log(`Form ${formId} updated.`)
  })
  form = await getTypeformForm(formId)
  .catch((err) => {
    console.log(err)
  })
}

// returns a JSON Form
function getTypeformForm(formId){
  let url = `https://api.typeform.com/forms/${formId}`
  return new Promise((resolve, reject) => {
    request(url, (err, res) => {
      if (err){reject(err)}
      console.log(`Typeform ${formId} loaded succesfully.`);
      resolve(JSON.parse(res.body)) //response.body = formulario
    })
  })
}

async function updateDropdown(formId, fieldId, data){
  let form = await getTypeformForm(formId).catch(console.log)
  let newChoices = []

  for (let i = 0; i < data.length; i++) {
    let choice = { label: 'text' }
    choice.label = data[i]
    newChoices.push(choice)
  }
  form.fields[fieldId].properties.choices = newChoices
  return form
}

exports.updateForm = async function(formId, values){
  let form = await getTypeformForm(formId).catch(console.log)
  .catch((err) => {
    console.log(err)
  })
  for(field in values){
    // console.log(values[field].data);
    if(Array.isArray(values[field].data)){ //TODO: Actualizar cuando no es array
      form = await updateDropdown(formId, values[field].typeform_id, values[field].data)
                  .catch(console.log)
    }else{
      console.log("Data is not an array")
    }
  }
  putForm(form, formId)
}
