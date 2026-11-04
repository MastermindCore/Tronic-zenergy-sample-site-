/**
 * One-time seed script — writes the module catalog, exam answer keys,
 * lesson video IDs, projects, news, and fun facts into the Realtime
 * Database. Run locally with the Admin SDK, never from the browser.
 *
 * Setup:
 *   1. Firebase console -> Project settings -> Service accounts ->
 *      Generate new private key. Save as functions/serviceAccountKey.json
 *      (already gitignored — never commit this file).
 *   2. cd functions && npm install
 *   3. node seed.js
 *
 * Edit the content below first — this is placeholder copy, not your real
 * lessons, exam questions, or projects.
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tronic-zenergy-default-rtdb.firebaseio.com",
});
const db = admin.database();

// Public catalog: titles, summaries, prices, topic titles/durations.
// Deliberately excludes youtubeId — see lessonVideos below.
const modules = {
  "beginner-1": { order: 1, level: "Beginner 1", title: "Electricity Basics", summary: "Voltage, current, resistance, and Ohm's law.", priceUsd: 15, examId: "exam-beginner-1",
    topics: { "b1-1": { title: "What voltage, current, and resistance actually are", minutes: 18 }, "b1-2": { title: "Ohm's law, worked through real numbers", minutes: 22 }, "b1-3": { title: "Series vs. parallel circuits", minutes: 20 } } },
  "beginner-2": { order: 2, level: "Beginner 2", title: "Components", summary: "Resistors, LEDs, capacitors, and your first breadboard build.", priceUsd: 15, examId: "exam-beginner-2",
    topics: { "b2-1": { title: "Reading resistor color bands and datasheets", minutes: 16 }, "b2-2": { title: "LEDs: polarity, forward voltage, current limiting", minutes: 19 }, "b2-3": { title: "Capacitors: what they store and why", minutes: 21 }, "b2-4": { title: "Breadboarding your first circuit", minutes: 25 } } },
  "intermediate-1": { order: 3, level: "Intermediate 1", title: "Logic Gates", summary: "AND, OR, NOT, NAND, NOR, XOR, and how to combine them.", priceUsd: 20, examId: "exam-intermediate-1",
    topics: { "i1-1": { title: "AND, OR, and NOT from first principles", minutes: 20 }, "i1-2": { title: "NAND, NOR, and XOR", minutes: 18 }, "i1-3": { title: "Building a circuit from a truth table", minutes: 24 } } },
  "intermediate-2": { order: 4, level: "Intermediate 2", title: "Flip-Flops & Latches", summary: "SR latches, D flip-flops, and JK flip-flops.", priceUsd: 20, examId: "exam-intermediate-2",
    topics: { "i2-1": { title: "The SR latch", minutes: 19 }, "i2-2": { title: "The D flip-flop and clocking", minutes: 23 }, "i2-3": { title: "The JK flip-flop", minutes: 17 } } },
  "advanced-1": { order: 5, level: "Advanced 1", title: "Counters & Timers", summary: "The 555 timer and binary counters.", priceUsd: 25, examId: "exam-advanced-1",
    topics: { "a1-1": { title: "The 555 timer in astable and monostable modes", minutes: 26 }, "a1-2": { title: "Binary counters from JK flip-flops", minutes: 24 } } },
  "advanced-2": { order: 6, level: "Advanced 2", title: "Adders & ALUs", summary: "Half adders, full adders, and a 4-bit ALU.", priceUsd: 25, examId: "exam-advanced-2",
    topics: { "a2-1": { title: "The half adder and full adder", minutes: 22 }, "a2-2": { title: "Chaining adders into a 4-bit ALU", minutes: 29 } } },
  expert: { order: 7, level: "Expert", title: "Processors", summary: "Building a CPU from discrete logic.", priceUsd: 40, examId: "exam-expert",
    topics: { "e-1": { title: "Instruction sets and control logic", minutes: 31 }, "e-2": { title: "Registers and the data bus", minutes: 28 }, "e-3": { title: "Building the 4-bit computer, part 1", minutes: 34 }, "e-4": { title: "Building the 4-bit computer, part 2", minutes: 37 } } },
};

// Private: YouTube video IDs per lesson. Upload each lesson as Unlisted on
// YouTube, then paste its ID here (the part after watch?v=).
const lessonVideos = {
  "beginner-1": { "b1-1": "", "b1-2": "", "b1-3": "" },
  "beginner-2": { "b2-1": "", "b2-2": "", "b2-3": "", "b2-4": "" },
  "intermediate-1": { "i1-1": "", "i1-2": "", "i1-3": "" },
  "intermediate-2": { "i2-1": "", "i2-2": "", "i2-3": "" },
  "advanced-1": { "a1-1": "", "a1-2": "" },
  "advanced-2": { "a2-1": "", "a2-2": "" },
  expert: { "e-1": "", "e-2": "", "e-3": "", "e-4": "" },
};

const exams = {
  "exam-beginner-1": { passScore: 70, questions: [
    { q: "Ohm's law states that voltage equals:", options: ["Current x Resistance", "Current / Resistance", "Resistance / Current", "Power x Time"], correct: 0 },
    { q: "In a series circuit, current is:", options: ["Different at every point", "The same at every point", "Zero at the midpoint", "Only present at the source"], correct: 1 },
  ] },
  "exam-beginner-2": { passScore: 70, questions: [
    { q: "An LED's forward voltage being exceeded without a limiting resistor usually:", options: ["Has no effect", "Destroys the LED", "Reverses its polarity", "Increases its lifespan"], correct: 1 },
    { q: "A capacitor stores energy in:", options: ["A magnetic field", "An electric field", "A chemical reaction", "Kinetic motion"], correct: 1 },
  ] },
  "exam-intermediate-1": { passScore: 70, questions: [
    { q: "A NAND gate outputs LOW only when:", options: ["Both inputs are LOW", "Both inputs are HIGH", "Either input is HIGH", "Inputs differ"], correct: 1 },
    { q: "XOR outputs HIGH when:", options: ["Both inputs match", "Inputs differ", "Both inputs are LOW", "Never"], correct: 1 },
  ] },
  "exam-intermediate-2": { passScore: 70, questions: [
    { q: "An SR latch with both S and R HIGH at once is usually:", options: ["A stable, defined state", "An invalid/undefined state", "The reset state", "Impossible to build"], correct: 1 },
    { q: "A D flip-flop changes output on:", options: ["Any input change", "A clock edge", "A fixed time delay", "Power-on only"], correct: 1 },
  ] },
  "exam-advanced-1": { passScore: 75, questions: [
    { q: "A 555 timer in astable mode produces:", options: ["A single pulse", "A continuous square wave", "A sine wave", "A fixed DC voltage"], correct: 1 },
  ] },
  "exam-advanced-2": { passScore: 75, questions: [
    { q: "A full adder differs from a half adder by also accepting:", options: ["A clock signal", "A carry-in bit", "A reset line", "A second clock"], correct: 1 },
  ] },
  "exam-expert": { passScore: 80, questions: [
    { q: "In a simple CPU, the component that holds the address of the next instruction is the:", options: ["Accumulator", "Program counter", "ALU", "Data bus"], correct: 1 },
  ] },
};

const projectCategories = ["Timers", "Switches", "Logic gates", "Power supply", "Counters", "Latches", "Multiplexers", "Adders", "Subtractors", "Fun projects", "STEM for kids", "Complex projects"];

const projects = {
  p1: { title: "555 Astable LED Flasher", category: "Timers", description: "A classic 555 timer wired to flash two LEDs out of phase.", youtubeId: "" },
  p2: { title: "4-Bit Ripple Carry Adder", category: "Adders", description: "Four full adders chained on breadboard, adding two 4-bit numbers.", youtubeId: "" },
  p3: { title: "SR Latch From Two NAND Gates", category: "Latches", description: "The simplest possible memory circuit.", youtubeId: "" },
};

const news = {
  n1: { title: "[Replace with a real headline]", date: "2026-09-02", summary: "[Replace with a 2-3 sentence summary]", sourceUrl: "" },
};

const funFacts = {
  f1: "A standard AA battery can deliver around 2 to 3 amp-hours of charge, enough to light a typical LED continuously for weeks.",
  f2: "The first practical transistor was demonstrated at Bell Labs in December 1947.",
};

async function seed() {
  await db.ref("modules").set(modules);
  await db.ref("lessonVideos").set(lessonVideos);
  await db.ref("exams").set(exams);
  await db.ref("projectCategories").set(projectCategories);
  await db.ref("projects").set(projects);
  await db.ref("news").set(news);
  await db.ref("funFacts").set(funFacts);
  console.log("Seed complete.");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
