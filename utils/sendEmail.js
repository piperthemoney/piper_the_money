import nodemailer from "nodemailer";

const sendEmail = async (option) => {
  try {
    // Create the Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT, // or 465 for SSL
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    // Log transporter details for debugging
    //console.log(`Transporter created: ${JSON.stringify(transporter.options)}`);

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: option.email,
      subject: option.subject,
      text: option.message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log the result of the email sending
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    // Log any errors
    console.error(`Error sending email: ${error}`);
  }
};

export default sendEmail;
