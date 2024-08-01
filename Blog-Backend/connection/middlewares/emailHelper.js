const nodemailer = require("nodemailer");


const emailHelper = async (to, subject, text) => {
  const userGmail = process.env.SIV_EMAIL//email who sends the emails between ""
  const passAppGmail = process.env.SIV_APP_PASSWORD;// #enable double step verification security in your account and after go to: https://myaccount.google.com/apppasswords

  // Create a transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userGmail,
      pass: passAppGmail,
    },
  });

  console.log(userGmail, passAppGmail);

  // Set up email options
  let mailOptions = {
    from: "amateratsu421@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  // Send the email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = emailHelper;