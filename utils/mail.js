const { Resend } = require('resend');
const resend = new Resend('re_rKv22XbX_EcZauZcoTA5L4JSfvheXb2Km');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: htmlContent
    });

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
};
module.exports = sendEmail;