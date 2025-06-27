import express from "express";
import multer from "multer";
import { generatePDFBufferFromGoogleDocs } from "../utils/generatePDFBufferFromGoogleDocs.js";
//import { uploadPDFToDrive } from "../utils/googleDriveUploader.js"; // Enable if needed
import { sendPDFEmail } from "../utils/emailSender.js";

const router = express.Router();

// Configure multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
      console.log("📦 Full formData received:", formData);

      console.log("✅ Received form submission");
      console.log("📎 Uploaded files:", Object.keys(files));
      console.log("📄 Submitted fields:", Object.keys(formData));

      // 🔧 Normalize checklist fields into arrays
      const checklistFields = [
        "identityProofDocs",
        "addressProofDocs",
        "aidSupportDocs",
        "bankVerificationDocs",
        "aidUtilizationDocs"
      ];

      checklistFields.forEach((key) => {
        if (formData[key] && typeof formData[key] === "string") {
          formData[key] = formData[key].split(",").map(item => item.trim());
        }
      });

      // ✅ 'prescription' is plain text — do NOT modify it
      console.log("💊 Prescription:", formData.prescription);

      // 📄 Generate filled PDF from Google Docs template
      const pdfBuffer = await generatePDFBufferFromGoogleDocs(formData);
      const filename = `GLF-Application-${formData.firstName}-${Date.now()}.pdf`;

      // 📁 Upload to Google Drive (toggle with flag)
      const uploadToDrive = true;
      if (uploadToDrive) {
        await uploadPDFToDrive(pdfBuffer, filename);
        console.log("📂 PDF uploaded to Drive");
      }

      // 📧 Send confirmation email with PDF attached
      await sendPDFEmail(formData.emailAddress || "admin@example.com", pdfBuffer, filename);

      res.status(200).json({ message: "Form + PDF received successfully!" });
    } catch (error) {
      console.error("❌ Error processing submission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
