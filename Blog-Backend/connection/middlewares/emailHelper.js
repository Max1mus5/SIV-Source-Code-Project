const nodemailer = require("nodemailer");

/**
 * Send an email via Gmail
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content (fallback)
 * @param {string} [html] - HTML content (optional, preferred)
 */
const emailHelper = async (to, subject, text, html = null) => {
  const userGmail = process.env.SIV_EMAIL; // email who sends the emails
  const passAppGmail = process.env.SIV_APP_PASSWORD; // App password from Google

  if (!userGmail || !passAppGmail) {
    throw new Error('SIV_EMAIL and SIV_APP_PASSWORD must be set in .env');
  }

  // Create a transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userGmail,
      pass: passAppGmail,
    },
  });

  // Set up email options
  let mailOptions = {
    from: `"SIV Blog" <${userGmail}>`, // Use env variable for sender
    to: to,
    subject: subject,
    text: text, // Plain text fallback
  };

  // Add HTML if provided
  if (html) {
    mailOptions.html = html;
  }

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