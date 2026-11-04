async function tzSignUp(name, email, password) {
  await window.TZ_FIREBASE.initFirebase();
  if (window.TZ_FIREBASE.DEMO_MODE) return window.TZ_DEMO.signUp(name, email);

  const { auth, rtdb, authMod, dbMod } = window.__tz;
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  await authMod.updateProfile(cred.user, { displayName: name });
  await dbMod.set(dbMod.ref(rtdb, `users/${cred.user.uid}`), {
    name, email, createdAt: dbMod.serverTimestamp(),
  });
  return cred.user;
}

async function tzLogIn(email, password) {
  await window.TZ_FIREBASE.initFirebase();
  if (window.TZ_FIREBASE.DEMO_MODE) {
    const existing = window.TZ_DEMO.getUser();
    if (!existing || existing.email !== email) {
      throw new Error("No demo account with that email. Sign up first, demo mode does not check the password.");
    }
    return existing;
  }
  const { auth, authMod } = window.__tz;
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function tzResetPassword(email) {
  await window.TZ_FIREBASE.initFirebase();
  if (window.TZ_FIREBASE.DEMO_MODE) {
    return "Demo mode has no real email delivery. In production this sends a reset link to " + email + ".";
  }
  const { auth, authMod } = window.__tz;
  await authMod.sendPasswordResetEmail(auth, email);
  return "Password reset email sent to " + email + ".";
}

async function tzLogOut() {
  await window.TZ_FIREBASE.initFirebase();
  if (window.TZ_FIREBASE.DEMO_MODE) {
    localStorage.removeItem("tz_demo_user");
    return;
  }
  const { auth, authMod } = window.__tz;
  await authMod.signOut(auth);
}

async function tzCurrentUser() {
  await window.TZ_FIREBASE.initFirebase();
  if (window.TZ_FIREBASE.DEMO_MODE) return window.TZ_DEMO.getUser();
  const { auth, authMod } = window.__tz;
  return new Promise((resolve) => authMod.onAuthStateChanged(auth, (u) => resolve(u)));
}

window.TZ_AUTH = { tzSignUp, tzLogIn, tzLogOut, tzCurrentUser, tzResetPassword };
