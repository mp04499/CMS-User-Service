const admin = require('firebase-admin');
// eslint-disable-next-line new-cap
const buff = new Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'base64'
);
const sa = buff.toString();
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(sa)),
  databaseURL: 'https://mike-cms.firebaseio.com',
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const {email, password, displayName} = req.body;

    const user = await auth.createUser({
      email,
      password,
      displayName,
    });

    await db
        .collection('users')
        .doc(user.uid)
        .set({followers: [], following: [], displayName});

    await db
        .collection('users')
        .doc(user.uid)
        .collection('posts')
        .add({message: 'My first post!', timestamp: new Date()});

    res.status(200).send('Registration Complete!');
  }
};
