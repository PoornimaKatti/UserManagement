const sendEmail = require('./mail');

const sendOTP = async (userEmail, otp) => {
  const subject = 'Your One-Time Password (OTP) for ShortURL Service';
  const htmlContent = `
    Dear User,<br/><br/>
    Thank you for using our service. To login, please use the following One-Time Password (OTP):<br/><br/>
    <strong>${otp}</strong><br/>
    This OTP is valid for the next 5 minutes. Please do not share this OTP with anyone.<br/><br/>
    If you did not request this OTP, please ignore this email.<br/><br/>
    Best regards,<br/>
    VM Team
  `;

  try {
    await sendEmail(userEmail, subject, htmlContent);
    console.log(`OTP sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${userEmail}:`, error);
    throw new Error(`Failed to send OTP email to ${userEmail}: ${error.message}`);
  }
};

module.exports = sendOTP;
