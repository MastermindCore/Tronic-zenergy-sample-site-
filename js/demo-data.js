/**
 * Demo fixtures — mirrors the shape of the real Realtime Database records
 * described in README.md, so flipping DEMO_MODE off doesn't change how the
 * rest of the app reads this data.
 */

const DEMO_CLASSES = {
  modules: [
    { id: "beginner-1", order: 1, level: "Beginner 1", title: "Electricity Basics", summary: "Voltage, current, resistance, and Ohm's law, the four ideas everything else builds on.", priceUsd: 15, examId: "exam-beginner-1",
      topics: [
        { id: "b1-1", title: "What voltage, current, and resistance actually are", minutes: 18, youtubeId: "" },
        { id: "b1-2", title: "Ohm's law, worked through real numbers", minutes: 22, youtubeId: "" },
        { id: "b1-3", title: "Series vs. parallel circuits", minutes: 20, youtubeId: "" },
      ] },
    { id: "beginner-2", order: 2, level: "Beginner 2", title: "Components", summary: "Resistors, LEDs, capacitors, and your first breadboard build.", priceUsd: 15, examId: "exam-beginner-2",
      topics: [
        { id: "b2-1", title: "Reading resistor color bands and datasheets", minutes: 16, youtubeId: "" },
        { id: "b2-2", title: "LEDs: polarity, forward voltage, current limiting", minutes: 19, youtubeId: "" },
        { id: "b2-3", title: "Capacitors: what they store and why", minutes: 21, youtubeId: "" },
        { id: "b2-4", title: "Breadboarding your first circuit", minutes: 25, youtubeId: "" },
      ] },
    { id: "intermediate-1", order: 3, level: "Intermediate 1", title: "Logic Gates", summary: "AND, OR, NOT, NAND, NOR, XOR, and how to combine them.", priceUsd: 20, examId: "exam-intermediate-1",
      topics: [
        { id: "i1-1", title: "AND, OR, and NOT from first principles", minutes: 20, youtubeId: "" },
        { id: "i1-2", title: "NAND, NOR, and XOR", minutes: 18, youtubeId: "" },
        { id: "i1-3", title: "Building a circuit from a truth table", minutes: 24, youtubeId: "" },
      ] },
    { id: "intermediate-2", order: 4, level: "Intermediate 2", title: "Flip-Flops & Latches", summary: "SR latches, D flip-flops, and JK flip-flops: how circuits remember.", priceUsd: 20, examId: "exam-intermediate-2",
      topics: [
        { id: "i2-1", title: "The SR latch", minutes: 19, youtubeId: "" },
        { id: "i2-2", title: "The D flip-flop and clocking", minutes: 23, youtubeId: "" },
        { id: "i2-3", title: "The JK flip-flop", minutes: 17, youtubeId: "" },
      ] },
    { id: "advanced-1", order: 5, level: "Advanced 1", title: "Counters & Timers", summary: "The 555 timer and binary counters, built from flip-flops.", priceUsd: 25, examId: "exam-advanced-1",
      topics: [
        { id: "a1-1", title: "The 555 timer in astable and monostable modes", minutes: 26, youtubeId: "" },
        { id: "a1-2", title: "Binary counters from JK flip-flops", minutes: 24, youtubeId: "" },
      ] },
    { id: "advanced-2", order: 6, level: "Advanced 2", title: "Adders & ALUs", summary: "Half adders, full adders, and a 4-bit ALU.", priceUsd: 25, examId: "exam-advanced-2",
      topics: [
        { id: "a2-1", title: "The half adder and full adder", minutes: 22, youtubeId: "" },
        { id: "a2-2", title: "Chaining adders into a 4-bit ALU", minutes: 29, youtubeId: "" },
      ] },
    { id: "expert", order: 7, level: "Expert", title: "Processors", summary: "Building a CPU from discrete logic: the 4-bit computer, start to finish.", priceUsd: 40, examId: "exam-expert",
      topics: [
        { id: "e-1", title: "Instruction sets and control logic", minutes: 31, youtubeId: "" },
        { id: "e-2", title: "Registers and the data bus", minutes: 28, youtubeId: "" },
        { id: "e-3", title: "Building the 4-bit computer, part 1", minutes: 34, youtubeId: "" },
        { id: "e-4", title: "Building the 4-bit computer, part 2", minutes: 37, youtubeId: "" },
      ] },
  ],
  exams: {
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
  },
};

const DEMO_PROJECTS = {
  categories: ["Timers", "Switches", "Logic gates", "Power supply", "Counters", "Latches", "Multiplexers", "Adders", "Subtractors", "Fun projects", "STEM for kids", "Complex projects"],
  items: [
    { id: "p1", title: "555 Astable LED Flasher", category: "Timers", description: "A classic 555 timer wired to flash two LEDs out of phase, with the math behind the timing worked out on screen.", youtubeId: "" },
    { id: "p2", title: "4-Bit Ripple Carry Adder", category: "Adders", description: "Four full adders chained on breadboard, adding two 4-bit numbers with the carry bit visibly rippling through.", youtubeId: "" },
    { id: "p3", title: "SR Latch From Two NAND Gates", category: "Latches", description: "The simplest possible memory circuit, built from parts you probably already have.", youtubeId: "" },
    { id: "p4", title: "8-to-1 Multiplexer", category: "Multiplexers", description: "Selecting one of eight inputs with three control lines, explained gate by gate.", youtubeId: "" },
    { id: "p5", title: "Discrete Logic 4-Bit Computer", category: "Complex projects", description: "The long-running build: a working 4-bit CPU made entirely from logic gates, no microcontroller involved.", youtubeId: "" },
    { id: "p6", title: "Light-Up Name Badge for Kids", category: "STEM for kids", description: "A beginner-friendly soldering project: a coin-cell badge that spells out a name in LEDs.", youtubeId: "" },
  ],
};

const DEMO_NEWS = [
  { id: "n1", title: "Where discrete-logic computing still shows up in 2026", date: "2026-09-02", summary: "A look at why hobbyists and educators keep building CPUs from logic gates even though microcontrollers are cheaper and faster.", sourceUrl: "" },
  { id: "n2", title: "What a new generation of open-source PCB tools means for hobbyists", date: "2026-08-18", summary: "KiCad's recent releases have closed most of the gap with paid EDA tools. Here's what changed and what it means for your next board.", sourceUrl: "" },
  { id: "n3", title: "Solar micro-inverters are getting small enough for hobby projects", date: "2026-07-30", summary: "A summary of recent efficiency gains in small-scale power electronics, and what they open up for DIY solar builds.", sourceUrl: "" },
];

const DEMO_FACTS = [
  "A standard AA battery can deliver around 2–3 amp-hours of charge, enough to light a typical LED continuously for weeks.",
  "Nikola Tesla and Thomas Edison's rivalry over AC vs. DC power, the 'War of Currents,' played out partly through public demonstrations in the 1880s and 90s.",
  "The first practical transistor was demonstrated at Bell Labs in December 1947, replacing bulky, fragile vacuum tubes.",
  "A 555 timer chip, designed in 1971, is still one of the best-selling integrated circuits in history, decades after newer alternatives arrived.",
  "Copper wire resistance increases with temperature. It's why a lamp's filament draws a large inrush current for a fraction of a second when you switch it on cold.",
  "The term 'bug' in engineering is often traced to a literal moth found jamming a relay in the Harvard Mark II computer in 1947.",
];

function demoUser() {
  const stored = localStorage.getItem("tz_demo_user");
  return stored ? JSON.parse(stored) : null;
}
function saveDemoUser(user) { localStorage.setItem("tz_demo_user", JSON.stringify(user)); }

function demoSignUp(name, email) {
  const user = { uid: "demo-" + Date.now(), name, email, enrollments: {} };
  saveDemoUser(user);
  return user;
}
function demoEnroll(moduleId) {
  const user = demoUser();
  if (!user) return null;
  user.enrollments[moduleId] = user.enrollments[moduleId] || { paid: false, progress: {}, examScore: null };
  user.enrollments[moduleId].paid = true;
  saveDemoUser(user);
  return user;
}
function demoMarkTopicComplete(moduleId, topicId) {
  const user = demoUser();
  if (!user || !user.enrollments[moduleId]) return null;
  user.enrollments[moduleId].progress[topicId] = true;
  saveDemoUser(user);
  return user;
}
function demoSubmitExam(moduleId, score, passScore) {
  const user = demoUser();
  if (!user || !user.enrollments[moduleId]) return null;
  user.enrollments[moduleId].examScore = score;
  user.enrollments[moduleId].passed = score >= passScore;
  if (score >= passScore) user.enrollments[moduleId].certificateIssuedAt = new Date().toISOString();
  saveDemoUser(user);
  return user;
}

window.TZ_DEMO = {
  classes: DEMO_CLASSES,
  projects: DEMO_PROJECTS,
  news: DEMO_NEWS,
  facts: DEMO_FACTS,
  getUser: demoUser,
  signUp: demoSignUp,
  enroll: demoEnroll,
  markTopicComplete: demoMarkTopicComplete,
  submitExam: demoSubmitExam,
};
