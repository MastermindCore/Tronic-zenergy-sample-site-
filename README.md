# Tronic Zenergy

Electronics learning platform and project portfolio. Static multi-file site
(no build step) with a Firebase backend (Auth, Realtime Database, Storage,
Cloud Functions, Hosting) and Flutterwave for payments.

## Try it right now, no setup

`js/firebase-config.js` has your real Firebase config in it, but
`DEMO_MODE = true` at the top of that file. In demo mode the whole site runs
on `localStorage` fixtures: sign up, enroll in a module (payment
auto-confirms), watch lessons, mark them complete, take the exam, see your
certificate state, request a Q&A session, post to the community wall.
Just open `index.html`, or serve the folder with any static server.

Going live means flipping `DEMO_MODE` to `false` after the steps below.

## What is built, mapped to the specification

| Spec section | Status |
| --- | --- |
| Homepage: hero, about, latest video, "currently building" bar | Built. Fill in your history and your latest YouTube ID (comments in `index.html`). |
| Menu on every page, plus site search | Built. |
| Projects: categories, grid, search, YouTube thumbnails | Built. Content comes from `/projects` in the database. |
| Classes: 7 modules, enroll, gated lessons, progress, exams (70% pass), retake, certificate PDF | Built. |
| Payments | Built around Flutterwave (cards and M-Pesa/mobile money). See "Payments". |
| 1-on-1 Q&A | Partly built: students send a preferred day and time, you confirm. No live calendar and no auto-generated Meet link yet. |
| News and Articles | Built. You edit articles in the database (see "Editing content"). |
| Fun Zone: facts and "did you know" generator | Built. |
| Accounts: sign up, log in, reset password, dashboard | Built. |
| Social links | Built. YouTube and TikTok are real; Instagram, Threads, Facebook are placeholders until you send the URLs. |
| Community wall with moderation | Built. Posts start as `pending`; set `status` to `approved` in the database to publish. |
| Badges | Not built. |
| Admin panel | Not built. Content is edited through `seed.js` or the Firebase console. |

The homepage line "Join thousands learning electronics the right way" from
the spec is deliberately left out: it would be a made-up number. Add it once
it is true.

## Go-live checklist

1. **Realtime Database rules.** Firebase console, Realtime Database, Rules,
   paste `firebase/database.rules.json` (or `firebase deploy --only database`).
   Until you publish them, the database runs on whatever rules are set now, and Firebase's default test-mode rules let anyone read and write it.
2. **Enable Email/Password sign-in.** Authentication, Sign-in method.
3. **Blaze plan.** Cloud Functions require the pay-as-you-go plan.
4. **Install the CLI.** `npm install -g firebase-tools`, `firebase login`,
   copy `.firebaserc.example` to `.firebaserc`.
5. **Seed the content.** Download a service account key (Project settings,
   Service accounts), save as `functions/serviceAccountKey.json` (gitignored),
   then `cd functions && npm install && node seed.js`. Edit the lessons, exam
   questions, and project list in `seed.js` first.
6. **Make yourself admin.** Sign up on the site, copy your uid from
   Authentication, then `node make-admin.js <uid>`.
7. **Add lesson videos.** Upload each lesson to YouTube as Unlisted, paste the
   video ID into `lessonVideos` in `seed.js`, and run it again.
8. **Payments** (below), then deploy:
   `firebase deploy --only hosting,functions,database,storage`.
9. **Flip `DEMO_MODE` to `false`** in `js/firebase-config.js`, redeploy hosting.
10. **Fill the legal placeholders** in `privacy.html` and `terms.html`
    (`[DATE]`, `[SUPPORT EMAIL]`, refund window, jurisdiction) and replace
    `hello@tronic-zenergy.com` in the footer. Have both pages reviewed.

About the API key: a Firebase web `apiKey` is not a secret. It identifies the
project and ships in every page. What protects your data is
`firebase/database.rules.json`, so step 1 is the one that matters.

## Payments

`functions/index.js` uses Flutterwave's hosted checkout, which shows cards and
mobile money (including M-Pesa) on one page, so a single integration covers
the global and Kenyan requirements.

1. Create a Flutterwave account and enable the payment methods you want.
2. Copy `functions/.env.example` to `functions/.env`, fill in the secret key and
   a webhook secret hash of your choosing.
3. In the Flutterwave dashboard, set the webhook URL to the deployed
   `flutterwaveWebhook` function URL and the same secret hash.
4. Test in Flutterwave's test mode before switching to live keys.

The server decides prices and prerequisites (`CATALOG` in `index.js`), not the
browser, and re-verifies every payment with Flutterwave before unlocking a
module. Prices are placeholders ($15 to $40): change them in `CATALOG`,
`seed.js`, and `js/demo-data.js` together.

PayPal and Stripe are not wired in. The spec lists them, but Flutterwave's
checkout does not provide PayPal, so adding either means a second processor
and a second webhook. Worth doing only if card payments from outside Africa
turn out to need it.

## Video hosting, honestly

Lessons are embedded from YouTube Unlisted, as the spec asks. The site only
reveals a lesson's video ID after a server check that the student has paid,
and the IDs are not in the public catalog. But an unlisted link, once a paying
student has it, can be shared, and YouTube cannot stop screen recording.
If lesson piracy becomes a real problem, Vimeo's domain-restricted embeds are
the next step up, and a DRM video service (Mux, Cloudflare Stream) after that.

## Editing content

Everything lives in the Realtime Database: `/modules`, `/exams` (answer keys,
unreadable from the browser), `/lessonVideos`, `/projects`, `/projectCategories`,
`/news`, `/funFacts`, `/communityPosts`, `/qaRequests`. Edit in the Firebase
console, or change `functions/seed.js` and re-run it (this overwrites those
paths).

Exam questions shown to students in production come from an `examQuestions`
field on each module (options only, no answers). Add that when you write your
real exams; grading itself happens in the `gradeExam` function.

## Project layout

```
index, projects, classes, news, fun-zone, community, social    public pages
signup, login, dashboard, module                               student area
privacy, terms                                                 legal
css/styles.css                                                 design system
js/                                                            page scripts
firebase/database.rules.json, storage.rules                    security rules
functions/index.js                                             payments, video access, grading, certificates
functions/seed.js, make-admin.js                               one-time setup scripts
```
