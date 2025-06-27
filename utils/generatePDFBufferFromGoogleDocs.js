import { google } from "googleapis";
import stream from "stream";

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/documents", "https://www.googleapis.com/auth/drive"]
);

const drive = google.drive({ version: "v3", auth });
const docs = google.docs({ version: "v1", auth });

export const generatePDFBufferFromGoogleDocs = async (formData) => {
  const TEMPLATE_ID = process.env.GOOGLE_DOCS_TEMPLATE_ID;

  // Step 1: Copy the template
  const copy = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: {
      name: `Application Summary - ${formData.firstName} ${formData.lastName}`,
    },
  });

  const copyId = copy.data.id;

  // Step 2: Prepare replacements
// Define fields that need to be shown as multiline
const multilineKeys = [
  "RequiredIdentityProof",
  "RequiredAddressProof",
  "AidSupportDocuments",
  "BankVerification",
  "AidUtilizationProof",
  "DeclarationConsent",
];

// Build replacement array
const replacements = Object.keys(formData).map((key) => {
  let value = formData[key];

  // If the field is a checklist (array), join each item on a new line
  if (multilineKeys.includes(key) && Array.isArray(value)) {
    value = value.join("\n");
  }

  return {
    replaceAllText: {
      containsText: { text: `{{${key}}}`, matchCase: true },
      replaceText: value || "",
    },
  };
});

  // Step 3: Apply replacements
  await docs.documents.batchUpdate({
    documentId: copyId,
    requestBody: { requests: replacements },
  });

  // Step 4: Export as PDF
  const response = await drive.files.export(
    { fileId: copyId, mimeType: "application/pdf" },
    { responseType: "stream" }
  );

  const bufferStream = new stream.PassThrough();
  return new Promise((resolve, reject) => {
    response.data
      .on("end", () => resolve(bufferStream.read()))
      .on("error", reject)
      .pipe(bufferStream);
  });
};
