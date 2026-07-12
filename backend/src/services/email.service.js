/**
 * ============================================================
 * AssetFlow — Email Service (Nodemailer)
 * ============================================================
 * Sends password reset emails to users.
 * Supports:
 *   1. Custom SMTP (.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 *   2. Gmail (.env: GMAIL_USER, GMAIL_APP_PASSWORD)
 *   3. Ethereal Email (Auto-generated test SMTP for instant development/testing without real SMTP credentials)
 * ============================================================
 */

const nodemailer = require('nodemailer');

/**
 * Sends a password reset email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - Unique reset token
 * @param {string} userName - Name of the user
 * @returns {Promise<{sent: boolean, messageId?: string, previewUrl?: string|false, error?: string, resetLink: string}>}
 */
async function sendPasswordResetEmail(toEmail, resetToken, userName = 'User') {
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  let transporter;

  // Check if custom SMTP credentials are provided in environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587', 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Convenient Gmail App Password support
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
      },
    });
  } else {
    // If no SMTP configured, automatically create an Ethereal email test account dynamically
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[EmailService] Using auto-generated Ethereal test account:', testAccount.user);
    } catch (err) {
      console.warn('[EmailService] Could not create Ethereal account, returning reset link in response:', err.message);
      return { sent: false, error: 'SMTP not configured', resetLink };
    }
  }

  const fromAddress =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    '"AssetFlow Support" <support@assetflow.com>';

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: '🔒 Reset Your AssetFlow Password',
    text: `Hello ${userName},\n\nYou requested to reset your password for your AssetFlow account.\n\nClick or paste the following link into your browser to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe AssetFlow Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #16a34a; margin: 0; font-size: 24px;">AssetFlow</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Enterprise Asset & Resource Management</p>
        </div>
        
        <div style="padding: 24px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">We received a request to reset your AssetFlow password. Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.2);">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-bottom: 0;">If the button doesn't work, copy and paste this URL into your browser:<br/>
          <a href="${resetLink}" style="color: #16a34a; word-break: break-all;">${resetLink}</a></p>
        </div>
        
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);

    // If sent via Ethereal, log and return the preview URL so developers can inspect the email immediately
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EmailService] 📧 Ethereal Email Preview URL: ${previewUrl}`);
    }

    return { sent: true, messageId: info.messageId, previewUrl, resetLink };
  } catch (err) {
    console.error(`[EmailService] Error sending email to ${toEmail}:`, err.message);
    return { sent: false, error: err.message, resetLink };
  }
}

module.exports = { sendPasswordResetEmail };
