import { google } from 'googleapis';

async function generateDocFromTemplate(formData) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents'
    ],
  });

  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  const TEMPLATE_DOC_ID = 'YOUR_TEMPLATE_ID_HERE'; // Replace this

  const copy = await drive.files.copy({
    fileId: TEMPLATE_DOC_ID,
    requestBody: { name: `Application - ${formData.fullName || 'Unknown'}` },
  });

  const newDocId = copy.data.id;

  const requests = Object.entries(formData).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: true,
      },
      replaceText: Array.isArray(value) ? value.join('\n') : value || '',
    },
  }));

  await docs.documents.batchUpdate({
    documentId: newDocId,
    requestBody: { requests },
  });

  return `https://docs.google.com/document/d/${newDocId}/edit`;
}

// ✅ Use ESM export
export { generateDocFromTemplate };
