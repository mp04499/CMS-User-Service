import admin from "firebase-admin";
import { NowRequest, NowResponse } from "@now/node";

const buff = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, "base64");
const sa = buff.toString();
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(sa)),
  databaseURL: process.env.DATABASE_URL
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = async (
  req: NowRequest,
  res: NowResponse
): Promise<NowResponse> => {
  if (req.method === "POST") {
    const { email, password, displayName } = req.body;

    const user = await auth.createUser({
      email,
      password,
      displayName
    });

    await db
      .collection("users")
      .doc(user.uid)
      .set({ followers: [], following: [], displayName });

    await db
      .collection("users")
      .doc(user.uid)
      .collection("posts")
      .add({ message: "My first post!", timestamp: new Date() });

    return res.status(200).send("Registration Complete!");
  }

  return res.status(400).send("Method Not Supported");
};
