const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //// May not work in AOL, also this is no good for a production app

  // 2) Define the email options
  const mailOptions = {
    from: "Paul Harris <paul172v@aol.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

//// emails currently sent to mailtrap.io
