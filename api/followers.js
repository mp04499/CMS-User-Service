const admin = require('firebase-admin');
// eslint-disable-next-line new-cap
const buff = new Buffer.from(
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  'base64',
);
const sa = buff.toString();
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(sa)),
  databaseURL: 'https://mike-cms.firebaseio.com',
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

    const { followers } = querySnapshot.data();

    if (type === 'count') res.status(200).send({ followers: followers.length });
    else if (type === 'list') {
      const list = await Promise.all(followers.map(async (followerId) => {
        const follower = await auth.getUser(followerId);
        const followerInfo = {
          uid: follower.uid,
          displayName: follower.displayName,
        };
        return followerInfo;
      }));
      res.status(200).send({ followers: list });
    } else res.status(400).send('Invalid Type Provided');
  }
};
