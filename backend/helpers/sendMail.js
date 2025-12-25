// utils/sendMail.js
const SibApiV3Sdk = require('@sendinblue/client');

const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send an email using Brevo
 * @param {Object} options
 * @param {string} options.toEmail - recipient email
 * @param {string} options.toName - recipient name
 * @param {string} options.subject - email subject
 * @param {string} options.htmlContent - email HTML content
 * @param {string} [options.senderEmail] - sender email (default from env)
 * @param {string} [options.senderName] - sender name (default from env)
 * @returns {Promise<boolean>} - true if email sent successfully, false otherwise
 */
async function sendMail({ toEmail, toName, subject, htmlContent, senderEmail, senderName }) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      email: senderEmail || process.env.BREVO_SENDER_EMAIL,
      name: senderName || process.env.BREVO_SENDER_NAME
    };

    await client.sendTransacEmail(sendSmtpEmail);
    return true; // success
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // failed
  }
}

module.exports = sendMail;
