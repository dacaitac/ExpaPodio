let fs        = require('fs');
let pdf       = require('dynamic-html-pdf');
let html      = fs.readFileSync('./src/acuerdo.html', 'utf8');
let html2     = fs.readFileSync('./src/agreement.html', 'utf8');
let finish    = fs.readFileSync('./src/finish.html', 'utf8');
let final     = fs.readFileSync('./src/final.html', 'utf8');
let mailHtml  = fs.readFileSync('./src/Correo.html', 'utf8');
let nodemailer = require('nodemailer');
const config   = JSON.parse(fs.readFileSync('./config.json'))

let options = {
    format: "A3",
    orientation: "portrait",
    border: "50mm",
    border: {
      "top": "30mm",            // default is 0, units: mm, cm, in, px
      "right": "20mm",
      "bottom": "20mm",
      "left": "30mm"
    },
};

exports.createAg = async function createAg( json ){
  let str = json.linkOp
  let arr = str.split("/")
  let code = arr[arr.length - 1]
  let filename = `Acuerdo ${json.nombre}.pdf`
  let filename2 = `Agreement ${json.nombre}.pdf`

  let date = new Date()
  let document = {
      template: html,
      context: {
          options: {
              dia: date.getDate(),
              mes: date.getMonth() + 1,
              anio: date.getFullYear(),
              nombre: json.nombre,
              pasaporte: json.pasaporte,
              pais: json.pais,
              empresa: json.empresa,
              opcode: code
          },
      },
      path: `./${filename}`
  }

  let document2 = {
      template: html2,
      context: {
          options: {
              dia: date.getDate(),
              mes: date.getMonth(),
              anio: date.getFullYear(),
              nombre: json.nombre,
              pasaporte: json.pasaporte,
              pais: json.pais,
              empresa: json.empresa,
              opcode: code
          },
      },
      path: `./${filename2}`
  }

  await pdf.create(document, options)
      .then(res => {
          console.log(res)
      })
      .catch(error => {
          console.error(error)
      });

  await pdf.create(document2, options)
      .then(res => {
          console.log(res)
      })
      .catch(error => {
          console.error(error)
      });



  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.password
    }
  })

  let mailOptions = {
    from: config.gmail.user,
    to: json.correo,
    subject: 'Proceso de Legalización',
    text: 'We have received your information.Thank you! The next document is the agreement of understanding that you signed.',
    html: mailHtml,
    attachments: [
      {filename:`${filename}`, path: `./${filename}`},
      {filename:`${filename2}`, path: `./${filename2}`}
    ]
  }

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}

//Themis 3
exports.createTerms = async function createTerms( json ){
  let filename = `Finish ${json.name}.pdf`
  let filename2 = `Final ${json.name}.pdf`

  let date = new Date()
  let document = {
      template: finish,
      context: {
          options: {
              dia: date.getDate(),
              mes: date.getMonth() + 1,
              anio: date.getFullYear(),
              name: json.name,
              passport: json.passport
          },
      },
      path: `./${filename}`
  }

  let document2 = {
      template: final,
      context: {
          options: {
              dia: date.getDate(),
              mes: date.getMonth() + 1,
              anio: date.getFullYear(),
              name: json.name,
              passport: json.passport
          },
      },
      path: `./${filename2}`
  }

  await pdf.create(document, options)
      .then(res => {
          console.log(res)
      })
      .catch(error => {
          console.error(error)
      });

  await pdf.create(document2, options)
      .then(res => {
          console.log(res)
      })
      .catch(error => {
          console.error(error)
      });



  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.password
    }
  })

  let mailOptions = {
    from: config.gmail.user,
    to: json.correo,
    subject: 'Final de la expeiencia',
    text: 'We have received your information.Thank you! The next document is the agreement of understanding that you signed.',
    html: mailHtml,
    attachments: [
      {filename:`${filename}`, path: `./${filename}`},
      {filename:`${filename2}`, path: `./${filename2}`}
    ]
  }

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}


let query = {
    nombre: 'NOMBRE',
    pasaporte: 'PASAPORTE',
    pais: 'PAIS',
    empresa: 'EMPRESA',
    linkOp: 'https://expa.aiesec.org/opportunities/1047227',
    correo: 'i7.danielcc@gmail.com'
}
