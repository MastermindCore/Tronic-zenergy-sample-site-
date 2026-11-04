/**
 * Firebase bootstrap for Tronic Zenergy.
 *
 * Your real project config is already filled in below. The site still runs
 * on the Realtime Database you created (tronic-zenergy-default-rtdb).
 *
 * DEMO_MODE starts `true` on purpose: it lets the whole site (signup,
 * purchase, progress, exam, certificate) run on localStorage fixtures with
 * zero setup, so you can review the design and flows before touching
 * Firebase at all. Flip it to `false` once you've:
 *   1. Deployed firebase/database.rules.json
 *   2. Deployed the Cloud Functions in functions/
 *   3. Seeded the catalog with functions/seed.js
 * See README.md for the full walkthrough.
 */

const DEMO_MODE = true;

const firebaseConfig = {
  apiKey: "AIzaSyAgypuOlV6KcGA0eGHFnkU3P3YpLNWi_Ic",
  authDomain: "tronic-zenergy.firebaseapp.com",
  databaseURL: "https://tronic-zenergy-default-rtdb.firebaseio.com",
  projectId: "tronic-zenergy",
  storageBucket: "tronic-zenergy.firebasestorage.app",
  messagingSenderId: "806364603148",
  appId: "1:806364603148:web:d1d98b6b0e91c2d79b9f29",
  measurementId: "G-41S66QSXXP",
};

let app = null;
let auth = null;
let rtdb = null;
let functions = null;

async function initFirebase() {
  if (DEMO_MODE || app) return;
  const [{ initializeApp }, authMod, dbMod, fnMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js"),
    import("https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js"),
  ]);

  app = initializeApp(firebaseConfig);
  auth = authMod.getAuth(app);
  rtdb = dbMod.getDatabase(app);
  functions = fnMod.getFunctions(app, "us-central1");

  window.__tz = { authMod, dbMod, fnMod, auth, rtdb, functions };
}

window.TZ_FIREBASE = { DEMO_MODE, initFirebase, get: () => window.__tz };
