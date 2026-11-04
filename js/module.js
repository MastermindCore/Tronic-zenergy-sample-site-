let CURRENT_MODULE = null;
let CURRENT_USER = null;
let CURRENT_ENROLLMENT = null;

async function loadModule() {
  await window.TZ_FIREBASE.initFirebase();
  CURRENT_USER = await window.TZ_AUTH.tzCurrentUser();
  if (!CURRENT_USER) { window.location.href = "login.html"; return; }

  const params = new URLSearchParams(window.location.search);
  const moduleId = params.get("m");

  const modules = window.TZ_FIREBASE.DEMO_MODE
    ? window.TZ_DEMO.classes.modules
    : await fetchModules();
  CURRENT_MODULE = modules.find((m) => m.id === moduleId);

  if (!CURRENT_MODULE) {
    document.getElementById("module-root-inner").innerHTML = "<p>Module not found.</p>";
    return;
  }

  CURRENT_ENROLLMENT = window.TZ_FIREBASE.DEMO_MODE
    ? ((window.TZ_DEMO.getUser() || {}).enrollments || {})[moduleId]
    : await fetchEnrollment(CURRENT_USER.uid, moduleId);

  document.getElementById("module-title").textContent = CURRENT_MODULE.title;

  if (!CURRENT_ENROLLMENT || !CURRENT_ENROLLMENT.paid) {
    document.getElementById("module-locked").style.display = "block";
    document.getElementById("module-body").style.display = "none";
    return;
  }

  document.getElementById("module-body").style.display = "grid";
  renderLessonList();
  const firstIncomplete = CURRENT_MODULE.topics.find((t) => !((CURRENT_ENROLLMENT.progress || {})[t.id]));
  selectTopic((firstIncomplete || CURRENT_MODULE.topics[0]).id);
}

async function fetchModules() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "modules"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, v]) => ({ id, ...v, topics: Array.isArray(v.topics) ? v.topics : Object.entries(v.topics || {}).map(([tid, t]) => ({ id: tid, ...t })) }));
}

async function fetchEnrollment(uid, moduleId) {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, `users/${uid}/enrollments/${moduleId}`));
  return snap.exists() ? snap.val() : null;
}

function renderLessonList() {
  const list = document.getElementById("lesson-list");
  list.innerHTML = "";
  CURRENT_MODULE.topics.forEach((topic, i) => {
    const done = !!(CURRENT_ENROLLMENT.progress || {})[topic.id];
    const li = document.createElement("li");
    li.className = "row";
    li.style.cursor = "pointer";
    li.dataset.topic = topic.id;
    li.innerHTML = `
      <span>${i + 1}. ${topic.title}</span>
      <span class="tag ${done ? "tag-done" : ""}">${done ? "Done" : topic.minutes + " min"}</span>
    `;
    li.addEventListener("click", () => selectTopic(topic.id));
    list.appendChild(li);
  });

  const allDone = CURRENT_MODULE.topics.every((t) => (CURRENT_ENROLLMENT.progress || {})[t.id]);
  document.getElementById("exam-cta").style.display = allDone ? "block" : "none";
}

async function selectTopic(topicId) {
  const topic = CURRENT_MODULE.topics.find((t) => t.id === topicId);
  document.querySelectorAll("#lesson-list .row").forEach((row) => {
    row.style.background = row.dataset.topic === topicId ? "var(--panel-raised)" : "transparent";
  });

  document.getElementById("lesson-heading").textContent = topic.title;
  await loadVideo(topic);

  document.getElementById("mark-complete-btn").onclick = () => markComplete(topicId);
}

async function loadVideo(topic) {
  const embed = document.getElementById("video-embed");
  let youtubeId = topic.youtubeId;

  if (!window.TZ_FIREBASE.DEMO_MODE) {
    // Production: the client never gets a lesson's YouTube ID until this
    // call confirms the enrollment server-side. See functions/index.js:
    // getLessonVideo re-checks `paid` on every request.
    const { functions, fnMod } = window.__tz;
    const getVideo = fnMod.httpsCallable(functions, "getLessonVideo");
    try {
      const res = await getVideo({ moduleId: CURRENT_MODULE.id, topicId: topic.id });
      youtubeId = res.data.youtubeId;
    } catch (err) {
      embed.innerHTML = `<p style="padding:20px">Could not load this lesson: ${err.message}</p>`;
      return;
    }
  }

  embed.innerHTML = youtubeId
    ? `<iframe src="https://www.youtube.com/embed/${youtubeId}" title="${topic.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gray-dim);font-size:0.85rem;text-align:center;padding:20px">No video uploaded for this lesson yet.</div>`;
}

async function markComplete(topicId) {
  if (window.TZ_FIREBASE.DEMO_MODE) {
    const user = window.TZ_DEMO.markTopicComplete(CURRENT_MODULE.id, topicId);
    CURRENT_ENROLLMENT = user.enrollments[CURRENT_MODULE.id];
  } else {
    const { rtdb, dbMod } = window.__tz;
    await dbMod.update(dbMod.ref(rtdb, `users/${CURRENT_USER.uid}/enrollments/${CURRENT_MODULE.id}/progress`), { [topicId]: true });
    CURRENT_ENROLLMENT = await fetchEnrollment(CURRENT_USER.uid, CURRENT_MODULE.id);
  }
  renderLessonList();
}

function openExam() {
  document.getElementById("module-body").style.display = "none";
  document.getElementById("exam-shell").style.display = "block";

  // Demo mode keeps the answer key client-side for a working offline demo.
  // In production the answer key lives only inside the gradeExam Cloud
  // Function; the questions shown here come from CURRENT_MODULE.examQuestions
  // (options only, no correct answer) on the module record.
  const exam = window.TZ_FIREBASE.DEMO_MODE
    ? window.TZ_DEMO.classes.exams[CURRENT_MODULE.examId]
    : CURRENT_MODULE.examQuestions;

  const form = document.getElementById("exam-form");
  form.innerHTML = "";
  exam.questions.forEach((q, qi) => {
    const fieldset = document.createElement("fieldset");
    fieldset.style.cssText = "margin-bottom:20px;border:none;padding:0";
    fieldset.innerHTML = `<legend style="font-weight:600;margin-bottom:8px;color:var(--white)">${qi + 1}. ${q.q}</legend>`;
    q.options.forEach((opt, oi) => {
      const label = document.createElement("label");
      label.style.cssText = "display:block;margin-bottom:6px;font-weight:400;color:var(--gray)";
      label.innerHTML = `<input type="radio" name="q${qi}" value="${oi}"> <span>${opt}</span>`;
      fieldset.appendChild(label);
    });
    form.appendChild(fieldset);
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const answers = {};
    exam.questions.forEach((q, qi) => {
      const picked = form.querySelector(`input[name="q${qi}"]:checked`);
      answers[qi] = picked ? Number(picked.value) : -1;
    });

    if (window.TZ_FIREBASE.DEMO_MODE) {
      let correct = 0;
      exam.questions.forEach((q, qi) => { if (answers[qi] === q.correct) correct += 1; });
      const score = Math.round((correct / exam.questions.length) * 100);
      window.TZ_DEMO.submitExam(CURRENT_MODULE.id, score, exam.passScore);
      showExamResult(score, exam.passScore);
      return;
    }

    const { functions, fnMod } = window.__tz;
    const grade = fnMod.httpsCallable(functions, "gradeExam");
    const res = await grade({ moduleId: CURRENT_MODULE.id, answers });
    showExamResult(res.data.score, res.data.passScore);
  };
}

function showExamResult(score, passScore) {
  const passed = score >= passScore;
  document.getElementById("exam-form").style.display = "none";
  const result = document.getElementById("exam-result");
  result.style.display = "block";
  result.innerHTML = `
    <h2>${passed ? "Passed" : "Not yet"}: ${score}%</h2>
    <p>${passed
      ? "Your certificate has been issued and is available from your dashboard."
      : `You need ${passScore}% to pass. Review the lessons and retake the exam when you're ready.`}</p>
    <a class="btn btn-primary" href="dashboard.html">Back to dashboard</a>
    ${passed ? "" : '<button class="btn btn-ghost" id="retake-btn" style="margin-left:8px">Retake exam</button>'}
  `;
  if (!passed) {
    document.getElementById("retake-btn").addEventListener("click", () => {
      document.getElementById("exam-result").style.display = "none";
      document.getElementById("exam-form").style.display = "block";
      openExam();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadModule();
  document.getElementById("exam-cta")?.addEventListener("click", openExam);
});
