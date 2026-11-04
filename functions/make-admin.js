/**
 * One-time helper: marks a single user as an admin in the Realtime
 * Database, which is what the security rules (firebase/database.rules.json)
 * check before allowing catalog writes (modules, projects, news, facts)
 * or reads of payments/Q&A requests.
 *
 * Usage:
 *   1. Sign up for a normal account on the live site first, with the email
 *      you want to administer the site with.
 *   2. Find that account's uid: Firebase console -> Authentication -> Users.
 *   3. node make-admin.js <uid>
 *
 * Requires functions/serviceAccountKey.json (see seed.js for how to get one).
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node make-admin.js <uid>");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tronic-zenergy-default-rtdb.firebaseio.com",
});

admin.database().ref(`admins/${uid}`).set(true)
  .then(() => { console.log(`${uid} is now an admin.`); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
