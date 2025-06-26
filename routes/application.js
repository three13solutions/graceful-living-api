import express from "express";
import multer from "multer";
import { generatePDFBuffer } from "../utils/pdfGenerator.js";
import { sendPDFEmail } from "../utils/emailSender.js";
import { uploadPDFAndFiles } from "../utils/googleDriveUploader.js"; // updated
//import { generatePDFBufferFromGoogleDocs } from "../utils/generatePDFBufferFromGoogleDocs.js";
import { generatePDFAndSaveToFolder } from "../utils/generatePDFBufferFromGoogleDocs.js";


const router = express.Router();

// Configure multer to store files in memory (or use disk if preferred)
const storage = multer.memoryStorage(); // or use diskStorage({ ... })
const upload = multer({ storage: storage });

router.post(
  "/",
  upload.fields([
    { name: "applicantPhoto", maxCount: 1 },
    { name: "uploadedDocuments", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const formData = req.body;
      const files = req.files;

      console.log("✅ Received form data");
      console.log("📎 Files:", Object.keys(files));

      // ✅ Generate PDF
      //const pdfBuffer = await generatePDFBuffer(formData);
      // Instead of generatePDFBuffer(formData)
      const { pdfBuffer, folderLink, pdfFileLink } = await generatePDFAndSaveToFolder(formData);

      const filename = `GLF-Application-${formData.firstName}-${Date.now()}.pdf`;

      // Upload everything into applicant's folder
      const folderInfo = await uploadPDFAndFiles(formData, files, pdfBuffer);
      console.log("✅ All files uploaded to:", folderInfo.webViewLink);
      
      // 📧 Send Email
      await sendPDFEmail(formData.emailAddress || "admin@example.com", pdfBuffer, filename);

      res.status(200).json({
      message: "Form submitted successfully",
      driveFolder: folderInfo.webViewLink,
      });

    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
