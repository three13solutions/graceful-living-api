import express from "express";
const router = express.Router();

// Accept form submissions from frontend
router.post("/", async (req, res) => {
  try {
    const formData = req.body;
    console.log("Received application:", formData);

    // TODO: Save to DB
    // TODO: Upload files to Google Drive
    // TODO: Generate PDF
    // TODO: Send email / WhatsApp alerts

    res.status(200).json({ message: "Application received successfully!" });
  } catch (error) {
    console.error("Error handling application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
