import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;
  console.log("Received application:", data);

  // TODO: Generate PDF
  // TODO: Upload files to Google Drive
  // TODO: Send email to applicant & admin

  res.status(200).json({ message: "Application received successfully!" });
});

export default router;
