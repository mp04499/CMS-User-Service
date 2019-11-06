import admin from "firebase-admin";
import { NowRequest, NowResponse } from "@now/node";

const buff = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, "base64");
const sa = buff.toString();
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(sa)),
  databaseURL: process.env.DATABASE_URL
});

const auth = admin.auth();

module.exports = async (
  req: NowRequest,
  res: NowResponse
): Promise<NowResponse> => {
  if (req.method === "PUT") {
    const { uid, ...rest } = req.body;

    await auth.updateUser(uid, rest);

    return res.status(200).send("User Update Complete");
  }

  if (req.method === "OPTIONS") return res.status(200).send("Complete");

  return res.status(400).send("Method Not Supported");
};
