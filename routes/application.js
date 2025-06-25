import express from "express";
import multer from "multer";
import { generatePDFBuffer } from "../utils/pdfGenerator.js";

const router = express.Router();

// Configure multer to store files in memory (or use disk if preferred)
const storage = multer.memoryStorage(); // or use diskStorage({ ... })
const upload = multer({ storage: storage });

// Handle POST request with file uploads
router.post("/", upload.fields([
  { name: "applicantPhoto", maxCount: 1 },
  { name: "uploadedDocuments", maxCount: 10 }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    console.log("Received form data:", formData);
    console.log("Received files:", Object.keys(files));

    // TODO: Process PDF, upload to Drive, email, etc.

    res.status(200).json({ message: "Application received successfully!" });
  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
