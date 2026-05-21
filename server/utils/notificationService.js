const { BrevoClient, BrevoError } = require("@getbrevo/brevo");
require("dotenv").config();

const hasEmailConfig = Boolean(
  process.env.BREVO_API_KEY && process.env.SENDER_EMAIL,
);
let brevo = null;
if (hasEmailConfig) {
  brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
}

/**
 * Send a transactional email via Brevo
 * @param {string} toEmail     - Recipient email address
 * @param {string} subject     - Email subject line
 * @param {string} htmlContent - Full HTML body
 * @returns {Promise<object>}  Brevo API response
 */
const sendEmail = async (toEmail, subject, htmlContent) => {
  if (!toEmail || !subject || !htmlContent) {
    throw new Error(
      "sendEmail: toEmail, subject, and htmlContent are required",
    );
  }

  if (!hasEmailConfig) {
    console.warn(
      "Email service is not configured. Falling back to console logging the verification link.",
    );
    console.log("Email fallback:", {
      toEmail,
      subject,
      htmlContent,
    });
    return { fallback: true };
  }

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: process.env.SENDER_NAME || "LiverCare AI",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: toEmail }],
      replyTo: {
        email: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME || "LiverCare AI",
      },
    });

    console.log(
      `✅ Email sent to ${toEmail} | MessageId: ${response?.messageId}`,
    );
    return response;
  } catch (error) {
    const detail =
      error instanceof BrevoError
        ? `[${error.statusCode}] ${JSON.stringify(error.rawResponse)}`
        : error.message;

    console.error(`❌ Failed to send email to ${toEmail}:`, detail);
    throw new Error(`Email delivery failed: ${detail}`);
  }
};

/**
 * Add a subscriber to the Brevo blog/newsletter contact list
 * @param {string} email - Subscriber's email address
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
const addBlogSubscriber = async (email) => {
  if (!email) throw new Error("addBlogSubscriber: email is required");

  try {
    const response = await brevo.contacts.createContact({
      email,
      listIds: [2], // Update list ID to match your Brevo dashboard
    });

    console.log(`✅ ${email} added to newsletter list`);
    return { success: true, data: response };
  } catch (error) {
    // Gracefully handle already-subscribed case
    if (
      error instanceof BrevoError &&
      error.rawResponse?.includes("duplicate_parameter")
    ) {
      console.log(`ℹ️  ${email} is already subscribed`);
      return { success: true, message: "Already subscribed" };
    }

    const detail =
      error instanceof BrevoError ? error.rawResponse : error.message;
    console.error(`❌ Failed to add ${email} to newsletter:`, detail);
    return { success: false, error: detail };
  }
};

module.exports = { sendEmail, addBlogSubscriber };
