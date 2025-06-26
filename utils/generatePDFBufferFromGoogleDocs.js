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

export const generatePDFAndSaveToFolder = async (formData) => {
  const TEMPLATE_ID = process.env.GOOGLE_DOCS_TEMPLATE_ID;
  const PARENT_FOLDER_ID = process.env.DRIVE_PARENT_FOLDER_ID;

  // Step 1: Create applicant folder
  const folderName = `${formData.firstName} ${formData.lastName} - ${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}`;
  console.log("📁 Creating folder...");  
const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [PARENT_FOLDER_ID],
    },
    fields: "id, name, webViewLink",
  });
  const folderId = folder.data.id;
  console.log("📁 Creating folder...");

  // Step 2: Copy the template into applicant folder
console.log("📄 Copying template...");  
const copy = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: {
      name: `Application Summary - ${formData.firstName} ${formData.lastName}`,
      parents: [folderId],
    },
  });
  const copyId = copy.data.id;

  // Step 3: Replace placeholders
  const replacements = Object.keys(formData).map((key) => ({
    replaceAllText: {
      containsText: { text: `{{${key}}}`, matchCase: true },
      replaceText: formData[key] || "",
    },
  }));
  console.log("🔁 Replacing placeholders...");
  await docs.documents.batchUpdate({
    documentId: copyId,
    requestBody: { requests: replacements },
  });

  // Step 4: Export the updated doc as PDF
  console.log("📄 Exporting as PDF...");
  const exportResponse = await drive.files.export(
    { fileId: copyId, mimeType: "application/pdf" },
    { responseType: "stream" }
  );

  const bufferStream = new stream.PassThrough();
  return new Promise((resolve, reject) => {
    exportResponse.data
      .on("end", async () => {
        
        const pdfBuffer = bufferStream.read();

        // Step 5: Upload the PDF into the same folder
        console.log("📤 Uploading PDF to Drive...");
        const uploadResponse = await drive.files.create({
          requestBody: {
            name: "Application Summary.pdf",
            mimeType: "application/pdf",
            parents: [folderId],
          },
          media: {
            mimeType: "application/pdf",
            body: stream.Readable.from(pdfBuffer),
          },
          fields: "id, name, webViewLink",
        });

        // ✅ Optional: Delete the doc copy after export
        // await drive.files.delete({ fileId: copyId });

        resolve({
          pdfBuffer,
          folderId,
          folderLink: folder.data.webViewLink,
          pdfFileLink: uploadResponse.data.webViewLink,
        });
      })
        .on("error", (err) => {
    console.error("❌ PDF stream error:", err);
    reject(err);
  });
};
