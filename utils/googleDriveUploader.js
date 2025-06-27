import { google } from "googleapis";
import stream from "stream";
import mime from "mime-types";

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/drive"]
);

const drive = google.drive({ version: "v3", auth });

export const uploadPDFToDrive = async (buffer, filename) => {
  const parentId = process.env.GLF_PARENT_FOLDER_ID;

  const fileMetadata = {
    name: filename,
    parents: [parentId],
  };

  const media = {
    mimeType: "application/pdf",
    body: stream.Readable.from(buffer),
  };

  await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, webViewLink",
  });
};
