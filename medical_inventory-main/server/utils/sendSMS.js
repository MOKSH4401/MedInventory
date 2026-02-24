const axios = require("axios");

/**
 * Send SMS using Fast2SMS API
 * @param {string} phone - Customer phone number (10 digits)
 * @param {string} message - SMS content
 * @returns {Promise<object>} - API response
 */
const sendSMS = async (phone, message) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.warn("Fast2SMS: FAST2SMS_API_KEY not configured. Skipping SMS.");
    return null;
  }

  // Ensure phone is a valid 10-digit Indian number
  const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    console.warn("Fast2SMS: Invalid phone number. Skipping SMS.");
    return null;
  }

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        numbers: cleanPhone,
      },
      {
        headers: {
          authorization: apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Fast2SMS error:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Send payment success SMS to customer
 * @param {string} phone - Customer phone number
 * @param {number} totalAmount - Total payment amount in INR
 */
const sendPaymentSuccessSMS = async (phone, totalAmount) => {
  const pharmacyName = process.env.PHARMACY_NAME || "Medical Pharmacy";
  const amount = Number(totalAmount).toFixed(2);
  const message = `${pharmacyName}: Payment of Rs.${amount} received successfully. Thank you for your purchase!`;
  return sendSMS(phone, message);
};

module.exports = { sendSMS, sendPaymentSuccessSMS };
