// routes/application.js
import express from 'express';
import { generateDocFromTemplate } from '../utils/googleDocsHelper.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;

    const docUrl = await generateDocFromTemplate(formData);

    res.status(200).json({
      message: 'Application submitted successfully!',
      documentUrl: docUrl,
    });
  } catch (error) {
    console.error('❌ Error generating document:', error);
    res.status(500).json({ message: 'Failed to generate document', error: error.message });
  }
});

export default router;
