const { google } = require('googleapis');

async function generateDocFromTemplate(formData) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

  // AUTH SETUP
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/documents']
  });

  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  const TEMPLATE_DOC_ID = '1gho54qzLVY6og3Vqv43-dHijH9fUgqatv9VYR-ncczQ'; // ← Replace this

  // 1. Copy Template
  const copyRes = await drive.files.copy({
    fileId: TEMPLATE_DOC_ID,
    requestBody: {
      name: `Application - ${formData.fullName || 'New'}`
    }
  });

  const newDocId = copyRes.data.id;

  // 2. Prepare replacements
  const replacements = Object.entries(formData).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: true,
      },
      replaceText: Array.isArray(value) ? value.join('\n') : value || '',
    },
  }));

  // 3. Apply the replacements
  await docs.documents.batchUpdate({
    documentId: newDocId,
    requestBody: {
      requests: replacements
    }
  });

  // 4. Return the document URL
  return `https://docs.google.com/document/d/${newDocId}/edit`;
}

module.exports = { generateDocFromTemplate };
