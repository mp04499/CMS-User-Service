const admin = require('firebase-admin');
// eslint-disable-next-line new-cap
const buff = new Buffer.from(
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  'base64',
);
const sa = buff.toString();
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(sa)),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const { uid, type } = req.query;

    const querySnapshot = await db
      .collection('users')
      .doc(uid)
      .get();

    const { following } = querySnapshot.data();

    if (type === 'count') res.status(200).send({ following: following.length });
    else if (type === 'list') {
      const list = await Promise.all(following.map(async (followId) => {
        const follow = await auth.getUser(followId);
        const followInfo = {
          uid: follow.uid,
          displayName: follow.displayName,
        };
        return followInfo;
      }));

      res.status(200).send({ following: list });
    } else res.status(400).send('Invalid Type Provided');
  }
};
