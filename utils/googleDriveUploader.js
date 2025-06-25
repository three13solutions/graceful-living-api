import { google } from "googleapis";
import stream from "stream";

export async function uploadPDFToDrive(buffer, filename) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uris: ["https://developers.google.com/oauthplayground"],
      type: "authorized_user",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "application/pdf",
    },
    media: {
      mimeType: "application/pdf",
      body: bufferStream,
    },
  });

  return response.data;
}
