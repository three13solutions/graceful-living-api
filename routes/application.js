import express from 'express';
import multer from 'multer';
import { generateDocFromTemplate } from '../utils/googleDocsHelper.js';

const router = express.Router();

// Setup Multer
const storage = multer.memoryStorage(); // keeps files in memory
const upload = multer({ storage });

// Endpoint: /api/submit
router.post('/submit', upload.fields([
  { name: 'applicantPhoto', maxCount: 1 },
  { name: 'uploadedDocuments', maxCount: 10 }
]), async (req, res) => {
  try {
    // Text fields
    const formFields = req.body;

    // Uploaded files
    const files = req.files;
    console.log('Received fields:', formFields);
    console.log('Received files:', files);

    const docUrl = await generateDocFromTemplate(formFields);

    res.status(200).json({
      message: 'Form submitted successfully!',
      documentUrl: docUrl,
    });
  } catch (error) {
    console.error('❌ Error processing form:', error);
    res.status(500).json({ message: 'Form processing failed', error: error.message });
  }
});

export default router;
