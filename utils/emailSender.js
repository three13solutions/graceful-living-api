import nodemailer from "nodemailer";

export const sendPDFEmail = async (to, pdfBuffer, filename) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Graceful Living" <${process.env.SMTP_USER}>`,
    to,
    subject: "GLF Aid Application Received",
    text: "Your application has been received. PDF attached.",
    attachments: [
      {
        filename,
        content: pdfBuffer,
      },
    ],
  });
};
