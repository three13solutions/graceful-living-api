import { google } from "googleapis";
import stream from "stream";

export async function uploadPDFToDrive(buffer, filename) {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/drive.file"]
  );

  const drive = google.drive({ version: "v3", auth });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const fileMetadata = {
    name: filename,
    parents: ["1I0pyEehFcqsBS-KyLvutPIQfh3RGAC50"], // 🔁 Replace this with your actual Drive folder ID
  };

  const media = {
    mimeType: "application/pdf",
    body: bufferStream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name, webViewLink, webContentLink",
  });

  console.log("✅ File uploaded to Drive:", file.data);
  return file.data;
}
