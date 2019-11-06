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
  if (req.method === "GET") {
    const { uid, type } = req.query;

    if (typeof uid === "string" && typeof type === "string") {
      const querySnapshot = await db
        .collection("users")
        .doc(uid)
        .get();

      const { following } = querySnapshot.data();

      if (type === "count")
        return res.status(200).send({ following: following.length });
      if (type === "list") {
        const list = await Promise.all(
          following.map(async (followId: string) => {
            const follow = await auth.getUser(followId);
            const followInfo = {
              uid: follow.uid,
              displayName: follow.displayName
            };
            return followInfo;
          })
        );

        return res.status(200).send({ following: list });
      }
    }
    return res.status(400).send("Invalid Type Provided");
  }
  return res.status(400).send("Method Not Supported");
};
