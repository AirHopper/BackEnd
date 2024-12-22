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

const sendReceiptPayment = (email, orderId, pdfUrl) => {
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
      subject: "[Air Hopper] Receipt Payment",
      text: `Receipt for order ${orderId} in Air Hopper`,
      attachments: [
        {
          filename: `order_${orderId}.pdf`,
          path: pdfUrl
        }
      ]
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

export { sendEmail, sendReceiptPayment };
