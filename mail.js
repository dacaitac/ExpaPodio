var swig        = require('swig'),
    nodemailer  = require('nodemailer'),
    fs          = require('fs')
const config    = JSON.parse(fs.readFileSync('./config.json'))

// Compile a file and store it, rendering it later
exports.sendNewPerson = function sendNewPerson( expaPerson ){
  console.log("Creating eMail")
  let template = swig.renderFile('./src/SIGNup.html',{
    FIRSTNAME : expaPerson.user.first_name,
    email     : expaPerson.user.email
  });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.password
    }
  });

  var mailOptions = {
    from    : config.gmail.user,
    to      : expaPerson.user.email,
    subject : 'Hoy empieza tu experiencia en AIESEC!',
    html    : template
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
