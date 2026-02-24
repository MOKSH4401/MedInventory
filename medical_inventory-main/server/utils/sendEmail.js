const nodemailer = require("nodemailer");

/**
 * Create reusable transporter with Gmail SMTP
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

/**
 * Send email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {object[]} [attachments] - Optional attachments [{ filename, content }]
 * @returns {Promise<object|null>} - Info object on success, null on failure
 */
const sendEmail = async (to, subject, text, attachments = []) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("Email: EMAIL_USER or EMAIL_PASS not configured. Skipping email.");
    return null;
  }

  if (!to || !to.includes("@")) {
    console.warn("Email: Invalid recipient address. Skipping email.");
    return null;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return null;
  }
};

/**
 * Send payment confirmation email with optional invoice attachment
 * @param {string} to - Customer email address
 * @param {object} params - { customerName, totalAmount, paymentId?, pdfBuffer?, pdfFilename? }
 */
const sendPaymentConfirmationEmail = async (
  to,
  { customerName, totalAmount, paymentId, pdfBuffer, pdfFilename }
) => {
  const pharmacyName = process.env.PHARMACY_NAME || "ABC Pharmacy";
  const subject = `Payment Confirmation - ${pharmacyName}`;

  let body = `Hello ${customerName || "Customer"},

Your payment was successful.

Amount: ₹${Number(totalAmount).toFixed(2)}`;

  if (paymentId) {
    body += `\nPayment ID: ${paymentId}`;
  }

  body += `

Thank you for visiting ${pharmacyName}.`;

  const attachments = [];
  if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
    attachments.push({
      filename: pdfFilename || `invoice-${Date.now()}.pdf`,
      content: pdfBuffer,
    });
  }

  return sendEmail(to, subject, body, attachments);
};

module.exports = {
  sendEmail,
  sendPaymentConfirmationEmail,
};
