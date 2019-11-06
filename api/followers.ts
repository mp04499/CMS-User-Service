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

      const { followers } = querySnapshot.data();

      if (type === "count")
        return res.status(200).send({ followers: followers.length });

      if (type === "list") {
        const list = await Promise.all(
          followers.map(async (followerId: string) => {
            const follower = await auth.getUser(followerId);
            const followerInfo = {
              uid: follower.uid,
              displayName: follower.displayName
            };
            return followerInfo;
          })
        );
        return res.status(200).send({ followers: list });
      }
    }

    return res.status(400).send("Invalid Type Provided");
  }

  return res.status(400).send("Method Not Supported");
};
