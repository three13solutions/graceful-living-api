import express from "express";
import multer from "multer";
import { generatePDFBuffer } from "../utils/pdfGenerator.js";
import { uploadPDFToDrive } from "../utils/googleDriveUploader.js";
import { sendPDFEmail } from "../utils/emailSender.js";
import { generatePDFBufferFromGoogleDocs } from "../utils/generatePDFBufferFromGoogleDocs.js";


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
      const pdfBuffer = await generatePDFBufferFromGoogleDocs(formData);

      const filename = `GLF-Application-${formData.firstName}-${Date.now()}.pdf`;

      // 📁 Upload to Google Drive
      await uploadPDFToDrive(pdfBuffer, filename);

      // 📧 Send Email
      await sendPDFEmail(formData.emailAddress || "admin@example.com", pdfBuffer, filename);

      res.status(200).json({ message: "Form + PDF received successfully!" });
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
