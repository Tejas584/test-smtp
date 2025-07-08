const nodemailer = require('nodemailer');

async function sendMail({ host, port, user, password, to, from, subject, message, senderName, messageFormat }) {
  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: false,
    auth: {
      user,
      pass: password
    }
  });

  let fromField = from || user;
  if (senderName && fromField) {
    fromField = `${senderName} <${fromField}>`;
  }

  // Use html or text based on messageFormat
  const mailOptions = {
    from: fromField,
    to,
    subject: subject || 'Test Email',
  };
  if (messageFormat === 'html') {
    mailOptions.html = message || '<p>Hello from Email Marketing App!</p>';
  } else {
    mailOptions.text = message || 'Hello from Email Marketing App!';
  }

  await transporter.sendMail(mailOptions);
}

module.exports = { sendMail }; 