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

const auth = admin.auth();

module.exports = async (req, res) => {
  if (req.method === 'PUT') {
    const { uid, ...rest } = req.body;

    await auth.updateUser(uid, { ...rest });

    res.status(200).send('Account Updated');
  }
};
