import { google } from 'googleapis';
import { validateFormData } from './formValidator.js';

async function generateDocFromTemplate(formData) {
  // Validate input
  try {
    await validateFormData(formData);
  } catch (error) {
    console.error('Validation failed:', error);
    throw new Error(`Invalid form data: ${error.message}`);
  }

  // Auth setup
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  if (!serviceAccount) throw new Error('Google service account not configured');

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents'
    ],
  });

  try {
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create document copy
    const copy = await drive.files.copy({
      fileId: process.env.GOOGLE_DOCS_TEMPLATE_ID,
      requestBody: { 
        name: `Application - ${formData.fullName || 'Unknown'} - ${new Date().toISOString().split('T')[0]}`,
        writersCanShare: false // Security setting
      },
      fields: 'id,name'
    });

    const newDocId = copy.data.id;

    // Prepare replacement requests
    const requests = Object.entries(formData)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        replaceAllText: {
          containsText: { text: `{{${key}}}`, matchCase: true },
          replaceText: Array.isArray(value) ? value.join('\n') : String(value),
        },
      }));

    // Execute updates
    await docs.documents.batchUpdate({
      documentId: newDocId,
      requestBody: { requests },
    });

    // Set document permissions
    await drive.permissions.create({
      fileId: newDocId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return `https://docs.google.com/document/d/${newDocId}/edit?usp=sharing`;
  } catch (error) {
    console.error('Google API Error:', error);
    throw new Error(`Failed to generate document: ${error.message}`);
  }
}

export { generateDocFromTemplate };
