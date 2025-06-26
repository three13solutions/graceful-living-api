import { google } from "googleapis";
import stream from "stream";

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/drive"]
);

const drive = google.drive({ version: "v3", auth });

// 🔧 Helper: Upload any buffer to a folder
const uploadToFolder = async (buffer, fileName, folderId, mimeType = "application/pdf") => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferStream,
    },
    fields: "id, name, webViewLink, webContentLink",
  });

  return file.data;
};

export const uploadPDFAndFiles = async (formData, files, pdfBuffer) => {
  const parentFolderId = process.env.GLF_PARENT_FOLDER_ID; // <-- Set in Render

  const folderName = `${formData.firstName} ${formData.lastName} - ${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}`;

  // Step 1: Create applicant folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, name, webViewLink",
  });

  const folderId = folder.data.id;

  // Step 2: Upload PDF
  await uploadToFolder(pdfBuffer, "Application Summary.pdf", folderId);

  // Step 3: Upload supporting documents
  const allUploads = [];

  if (files.applicantPhoto?.[0]) {
    allUploads.push(
      uploadToFolder(files.applicantPhoto[0].buffer, files.applicantPhoto[0].originalname, folderId, files.applicantPhoto[0].mimetype)
    );
  }

  if (files.uploadedDocuments?.length) {
    for (const file of files.uploadedDocuments) {
      allUploads.push(
        uploadToFolder(file.buffer, file.originalname, folderId, file.mimetype)
      );
    }
  }

  await Promise.all(allUploads);

  return folder.data; // includes `webViewLink`
};
