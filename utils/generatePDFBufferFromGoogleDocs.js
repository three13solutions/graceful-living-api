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

  const copy = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: {
      name: `Application Summary - ${formData.firstName} ${formData.lastName}`,
    },
  });

  const copyId = copy.data.id;

  const multilineKeys = [
    "identityProofDocs",
    "addressProofDocs",
    "aidSupportDocs",
    "bankVerificationDocs",
    "aidUtilizationDocs"
  ];

  const replacements = Object.keys(formData).map((key) => {
    let value = formData[key];

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

  await docs.documents.batchUpdate({
    documentId: copyId,
    requestBody: { requests: replacements },
  });

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
