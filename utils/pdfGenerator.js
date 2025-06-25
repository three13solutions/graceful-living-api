import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

export const generatePDFBuffer = async (formData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Title
    doc.fontSize(18).text("Graceful Living Aid Application", { align: "center" });
    doc.moveDown();

    // Example Fields
    doc.fontSize(12).text(`Application Form No: ${formData.applicationFormNo}`);
    doc.text(`Name: ${formData.salutation || ""} ${formData.firstName} ${formData.middleName || ""} ${formData.lastName}`);
    doc.text(`Date of Birth: ${formData.dateOfBirth}`);
    doc.text(`Gender: ${formData.gender}`);
    doc.text(`Phone Number: ${formData.phoneNumber}`);
    doc.text(`Email: ${formData.emailAddress}`);
    doc.moveDown();

    doc.text(`Type of Aid Requested: ${formData.typeOfAidRequired}`);
    doc.text(`Amount Required: ₹${formData.totalAmountRequired}`);
    doc.text(`Purpose: ${formData.purposeOfFinancialAid || formData.purposeOfMedicalAid || "N/A"}`);
    doc.text(`Other Aid Received: ${formData.otherAidDetails || "None"}`);

    // Declaration or Summary
    doc.moveDown();
    doc.fontSize(10).text("Submitted via Graceful Living Foundation Web App", { align: "center" });

    doc.end();
  });
};
