/**
 * Tronic Zenergy — Cloud Functions
 *
 * startCheckout         callable — creates a Flutterwave hosted payment link
 * flutterwaveWebhook    https    — Flutterwave posts the payment result here
 * getLessonVideo        callable — the ONLY way a client learns a lesson's YouTube ID
 * gradeExam             callable — grades server-side; the answer key never reaches the client
 * (certificate generation runs inline inside gradeExam on a pass)
 *
 * Deploy: firebase deploy --only functions
 * Config: fill in functions/.env (see .env.example) before deploying.
 */

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

admin.initializeApp();
const db = admin.database();
const bucket = admin.storage().bucket();

const FLW_BASE = "https://api.flutterwave.com/v3";

/* ---------------------------------------------------------------------
 * Catalog — prices and prerequisites checked server-side; never trust
 * an amount or module id coming from the client.
 * ------------------------------------------------------------------- */
const CATALOG = {
  "beginner-1": { priceUsd: 15, requiresPrior: null },
  "beginner-2": { priceUsd: 15, requiresPrior: "beginner-1" },
  "intermediate-1": { priceUsd: 20, requiresPrior: "beginner-2" },
  "intermediate-2": { priceUsd: 20, requiresPrior: "intermediate-1" },
  "advanced-1": { priceUsd: 25, requiresPrior: "intermediate-2" },
  "advanced-2": { priceUsd: 25, requiresPrior: "advanced-1" },
  expert: { priceUsd: 40, requiresPrior: "advanced-2" },
};

/* ---------------------------------------------------------------------
 * Checkout
 * ------------------------------------------------------------------- */

exports.startCheckout = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Log in first.");
  const { moduleId } = request.data;
  const item = CATALOG[moduleId];
  if (!item) throw new HttpsError("invalid-argument", "Unknown module.");

  if (item.requiresPrior) {
    const priorSnap = await db.ref(`users/${request.auth.uid}/enrollments/${item.requiresPrior}`).get();
    if (!priorSnap.exists() || !priorSnap.val().passed) {
      throw new HttpsError("failed-precondition", `Pass ${item.requiresPrior} first.`);
    }
  }

  const userSnap = await db.ref(`users/${request.auth.uid}`).get();
  const user = userSnap.val() || {};
  const txRef = `TZ-${moduleId}-${request.auth.uid}-${Date.now()}`;

  const res = await axios.post(
    `${FLW_BASE}/payments`,
    {
      tx_ref: txRef,
      amount: item.priceUsd,
      currency: "USD",
      redirect_url: process.env.CHECKOUT_REDIRECT_URL,
      customer: { email: user.email, name: user.name },
      customizations: { title: "Tronic Zenergy", description: `Module: ${moduleId}` },
      // Flutterwave shows the customer every payment method enabled on the
      // account (cards, mobile money including M-Pesa) on one hosted
      // page, so this single call covers both the global-payments and
      // Mpesa requirements rather than needing a separate integration per method.
    },
    { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
  );

  await db.ref(`payments/${txRef}`).set({
    uid: request.auth.uid,
    moduleId,
    amountUsd: item.priceUsd,
    status: "pending",
    createdAt: admin.database.ServerValue.TIMESTAMP,
  });

  return { url: res.data.data.link };
});

/* ---------------------------------------------------------------------
 * Flutterwave webhook
 * ------------------------------------------------------------------- */

exports.flutterwaveWebhook = onRequest(async (req, res) => {
  const signature = req.headers["verif-hash"];
  if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH) {
    return res.status(401).send("Invalid signature");
  }

  const { tx_ref, status, id } = req.body?.data || {};
  if (!tx_ref) return res.status(400).send("Bad payload");

  const paymentRef = db.ref(`payments/${tx_ref}`);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists()) return res.status(404).send("Unknown payment");
  const payment = paymentSnap.val();

  if (status !== "successful") {
    await paymentRef.update({ status: "failed" });
    return res.status(200).send("OK");
  }

  // Re-verify server-to-server rather than trusting the webhook body alone.
  const verify = await axios.get(`${FLW_BASE}/transactions/${id}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  });
  const tx = verify.data.data;
  if (tx.status !== "successful" || tx.amount < payment.amountUsd || tx.currency !== "USD") {
    await paymentRef.update({ status: "verification_failed" });
    return res.status(200).send("OK");
  }

  await paymentRef.update({ status: "confirmed", flwTransactionId: id });
  await db.ref(`users/${payment.uid}/enrollments/${payment.moduleId}`).update({
    paid: true,
    progress: {},
    examScore: null,
    passed: false,
  });

  return res.status(200).send("OK");
});

/* ---------------------------------------------------------------------
 * Lesson video access — the only path a client has to a YouTube ID
 * ------------------------------------------------------------------- */

exports.getLessonVideo = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Log in first.");
  const { moduleId, topicId } = request.data;

  const enrollmentSnap = await db.ref(`users/${request.auth.uid}/enrollments/${moduleId}`).get();
  if (!enrollmentSnap.exists() || !enrollmentSnap.val().paid) {
    throw new HttpsError("permission-denied", "This module isn't unlocked on your account.");
  }

  const videoSnap = await db.ref(`lessonVideos/${moduleId}/${topicId}`).get();
  if (!videoSnap.exists()) throw new HttpsError("not-found", "No video uploaded for this lesson yet.");
  return { youtubeId: videoSnap.val() };
});

/* ---------------------------------------------------------------------
 * Exam grading — questions and the answer key live only in this function
 * ------------------------------------------------------------------- */

exports.gradeExam = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Log in first.");
  const { moduleId, answers } = request.data; // answers: { [questionIndex]: optionIndex }

  const enrollmentRef = db.ref(`users/${request.auth.uid}/enrollments/${moduleId}`);
  const enrollmentSnap = await enrollmentRef.get();
  if (!enrollmentSnap.exists() || !enrollmentSnap.val().paid) {
    throw new HttpsError("permission-denied", "This module isn't unlocked on your account.");
  }

  const moduleSnap = await db.ref(`modules/${moduleId}`).get();
  const moduleData = moduleSnap.val();
  const examSnap = await db.ref(`exams/${moduleData.examId}`).get();
  const exam = examSnap.val();

  let correct = 0;
  exam.questions.forEach((q, i) => { if (answers[i] === q.correct) correct += 1; });
  const score = Math.round((correct / exam.questions.length) * 100);
  const passed = score >= exam.passScore;

  await enrollmentRef.update({ examScore: score, passed, lastAttemptAt: admin.database.ServerValue.TIMESTAMP });

  let certificateUrl = null;
  if (passed) {
    const userSnap = await db.ref(`users/${request.auth.uid}`).get();
    certificateUrl = await issueCertificate({
      uid: request.auth.uid,
      name: (userSnap.val() || {}).name,
      moduleId,
      moduleTitle: moduleData.title,
    });
    await enrollmentRef.update({ certificateUrl, certificateIssuedAt: admin.database.ServerValue.TIMESTAMP });
  }

  return { score, passed, passScore: exam.passScore, certificateUrl };
});

async function issueCertificate({ uid, name, moduleId, moduleTitle }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(0.027, 0.043, 0.07) });
  page.drawText(process.env.CERT_ISSUER_NAME || "Tronic Zenergy", { x: 60, y: 500, size: 20, font, color: rgb(0.184, 0.561, 1) });
  page.drawText("Certificate of Completion", { x: 60, y: 440, size: 32, font, color: rgb(1, 1, 1) });
  page.drawText(name || "Student", { x: 60, y: 380, size: 26, font, color: rgb(1, 1, 1) });
  page.drawText(`has completed ${moduleTitle}`, { x: 60, y: 340, size: 16, font: bodyFont, color: rgb(0.78, 0.82, 0.88) });
  page.drawText(new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }), {
    x: 60, y: 300, size: 12, font: bodyFont, color: rgb(0.58, 0.63, 0.7),
  });

  const bytes = await pdf.save();
  const file = bucket.file(`certificates/${uid}/${moduleId}.pdf`);
  await file.save(Buffer.from(bytes), { contentType: "application/pdf" });
  const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });
  return url;
}
