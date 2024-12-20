import nodemailer from "nodemailer";

const mailerUser = process.env.MAILER_USER;
const mailerPassword = process.env.MAILER_PASSWORD;

const sendEmail = (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailerUser,
      pass: mailerPassword,
    },
  });
  transporter.sendMail(
    {
      from: mailerUser,
      to: email,
      subject: subject,
      html: html,
    },
    (error, info) => {
      if (error) {
        console.log(error);
        return error;
      } else {
        return info;
      }
    }
  );
};

export { sendEmail };
