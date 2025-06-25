import nodemailer from "nodemailer";

export async function sendPDFEmail(toEmail, pdfBuffer, filename = "application.pdf") {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Graceful Living Foundation" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your Aid Application Receipt",
    text: "Thank you for submitting your application. Please find the PDF summary attached.",
    attachments: [
      {
        filename,
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
