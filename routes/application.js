import express from "express";
import multer from "multer";
import { generatePDFBuffer } from "../utils/pdfGenerator.js";

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
      const pdfBuffer = await generatePDFBuffer(formData);

      // You can now:
      // - Save to disk
      // - Attach to email
      // - Upload to Drive

      res.status(200).json({ message: "Form + PDF received successfully!" });
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
