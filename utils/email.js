const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    //Sendgrid
    if (process.env.NODE_ENV.trim() === 'production') {
      return nodemailer.createTransport({
        // service: 'BREVO',
        host: process.env.SENDINBLUE_HOST,
        port: process.env.SENDINBLUE_PORT,
        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_HOST_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render The HTML base on the template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2) Define Email Obtions
    const mailObtions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create transport and send email
    await this.newTransport().sendMail(mailObtions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your Password Reset Token (Valid for 10 min).'
    );
  }
};

// const sendEmail = async (obtions) => {
//   // 1) We need to create transporter
//   const transporter = nodemailer.createTransport({
//     // service: "Gmail", only when we use gmail
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_HOST_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // 2) Define the email obtions
//   const mailObtions = {
//     from: 'Natours <support@natours.com>',
//     to: obtions.email,
//     subject: obtions.subject,
//     // text: obtions.message,
//     html: `<h4>${obtions.message}</h4>`,
//   };

//   // 3) Accualy Send the email
//   await transporter.sendMail(mailObtions);
// };

// const nodemailer = require('nodemailer');

// (async () => {
//   const transport = nodemailer.createTransport({
//     service: 'Mailosaur',
//     auth: {
//       user: 'SERVER_ID@mailosaur.net',
//       pass: 'SMTP_PASSWORD',
//     },
//   });

//   await transport.sendMail({
//     subject: 'A test email',
//     from: 'Our Company <from@example.com>',
//     to: 'Test User <to@example.com>',
//     html: '<p>Hello world.</p>',
//     text: 'Hello world.',
//   });
// })();
