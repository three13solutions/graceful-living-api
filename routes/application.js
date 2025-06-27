import express from 'express';
import multer from 'multer';
import { generateDocFromTemplate } from '../utils/googleDocsHelper.js';
import { validateFormData } from '../utils/formValidator.js';

const router = express.Router();

// Enhanced Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const validMimeTypes = {
      applicantPhoto: ['image/jpeg', 'image/png'],
      uploadedDocuments: ['application/pdf', 'image/jpeg', 'image/png']
    };

    if (!validMimeTypes[file.fieldname]?.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
    cb(null, true);
  }
});

router.post('/submit', 
  upload.fields([
    { name: 'applicantPhoto', maxCount: 1 },
    { name: 'uploadedDocuments', maxCount: 10 }
  ]),
  async (req, res, next) => {
    try {
      // Validate text fields
      await validateFormData(req.body);

      // Process files
      const files = req.files || {};
      console.log('Received submission with:', {
        fields: Object.keys(req.body),
        files: Object.keys(files)
      });

      // Generate document
      const docUrl = await generateDocFromTemplate(req.body);

      // Respond
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        documentUrl: docUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Submission Error:', error);
      next(error); // Pass to error handler
    }
  }
);

export default router;
