/* ============================================================
   0 → Shipped Resume Parser
   All parsing happens in the browser — no backend needed.
   ============================================================ */

// pdf.js worker (required by the library)
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// The skills the "recruiter scan" tracks. Each has a display name
// and a regex that matches it in the resume text.
const SKILLS = [
  { name: "JavaScript",  re: /\bjavascript\b|\bjs\b/i },
  { name: "TypeScript",  re: /\btypescript\b/i },
  { name: "Python",      re: /\bpython\b/i },
  { name: "Java",        re: /\bjava\b/i },
  { name: "SQL",         re: /\bsql\b/i },
  { name: "HTML",        re: /\bhtml\b/i },
  { name: "CSS",         re: /\bcss\b/i },
  { name: "React",       re: /\breact\b/i },
  { name: "Node.js",     re: /\bnode(?:\.js)?\b/i },
  { name: "Express",     re: /\bexpress(?:\.js)?\b/i },
  { name: "MongoDB",     re: /\bmongo(?:db)?\b/i },
  { name: "PostgreSQL",  re: /\bpostgres(?:ql)?\b/i },
  { name: "Git",         re: /\bgit\b|\bgithub\b/i },
  { name: "Docker",      re: /\bdocker\b/i },
  { name: "Kubernetes",  re: /\bkubernetes\b|\bk8s\b/i },
  { name: "AWS",         re: /\baws\b|\bamazon web services\b/i },
  { name: "REST APIs",   re: /\brest(?:ful)?\b|\bapis?\b/i },
  { name: "CI/CD",       re: /\bci\/cd\b|\bci\b/i },
  { name: "Testing",     re: /\bjest\b|\bunit tests?\b/i },
  { name: "Linux",       re: /\blinux\b|\bunix\b/i },
];

const MAX_PAGES = 5; // analyze at most the first 5 pages

// Score bands: at or above the threshold → this label + color
const BANDS = [
  { min: 75, label: "Strong match", color: "#34d399", cls: "band-strong" },
  { min: 50, label: "Good match",   color: "#a5b4fc", cls: "band-good" },
  { min: 30, label: "Needs work",   color: "#fbbf24", cls: "band-mid" },
  { min: 0,  label: "Weak match",   color: "#f87171", cls: "band-weak" },
];

// ---------- Element references ----------
const dropzone    = document.getElementById("dropzone");
const fileInput   = document.getElementById("fileInput");
const fileRow     = document.getElementById("fileRow");
const fileName    = document.getElementById("fileName");
const fileSize    = document.getElementById("fileSize");
const fileRemove  = document.getElementById("fileRemove");
const analyzeBtn  = document.getElementById("analyzeBtn");
const statusEl    = document.getElementById("status");
const results     = document.getElementById("results");
const scoreRing   = document.getElementById("scoreRing");
const scoreNum    = document.getElementById("scoreNum");
const scoreBand   = document.getElementById("scoreBand");
const matchedCount= document.getElementById("matchedCount");
const statMatched = document.getElementById("statMatched");
const statMissing = document.getElementById("statMissing");
const presentPill = document.getElementById("presentPill");
const missingPill = document.getElementById("missingPill");
const presentList = document.getElementById("presentSkills");
const missingList = document.getElementById("missingSkills");
const resetBtn    = document.getElementById("resetBtn");

let selectedFile = null;

// ---------- File selection ----------
dropzone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) setFile(fileInput.files[0]);
});

["dragover", "dragenter"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "dragend"].forEach((evt) =>
  dropzone.addEventListener(evt, () => dropzone.classList.remove("dragover"))
);

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
});

fileRemove.addEventListener("click", clearFile);

function setFile(file) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    setStatus("That doesn't look like a PDF. Please choose a .pdf file.", true);
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatSize(file.size);
  fileRow.hidden = false;
  analyzeBtn.disabled = false;
  setStatus("");
}

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  fileRow.hidden = true;
  analyzeBtn.disabled = true;
  setStatus("");
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

// ---------- Analysis ----------
analyzeBtn.addEventListener("click", analyze);

async function analyze() {
  if (!selectedFile) return;

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing…";

  try {
    if (!window.pdfjsLib) {
      throw new Error("engine");
    }

    setStatus("Extracting text…");
    const buffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const pagesToRead = Math.min(pdf.numPages, MAX_PAGES);
    let text = "";
    for (let i = 1; i <= pagesToRead; i++) {
      setStatus(`Reading page ${i} of ${pagesToRead}…`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + " ";
    }

    if (text.trim().length < 30) {
      setStatus("Couldn't find selectable text — this PDF might be a scan. Try a text-based PDF.", true);
      return;
    }

    setStatus("Matching skills…");
    // Give the browser a tick to paint the status before the (fast) scan.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const matched  = SKILLS.filter((skill) => skill.re.test(text));
    const missing  = SKILLS.filter((skill) => !skill.re.test(text));
    const score    = Math.round((matched.length / SKILLS.length) * 100);

    renderResults(score, matched, missing);
    setStatus("");
  } catch (err) {
    if (err.message === "engine") {
      setStatus("The PDF engine didn't load — check your internet connection and reload.", true);
    } else {
      console.error(err);
      setStatus("Something went wrong while reading that PDF. Is it a valid file?", true);
    }
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze resume";
  }
}

// ---------- Rendering ----------
function renderResults(score, matched, missing) {
  const band = BANDS.find((b) => score >= b.min);

  // Donut ring: colored arc = score, rest = track
  scoreRing.style.background =
    `conic-gradient(${band.color} ${score * 3.6}deg, rgba(255,255,255,0.08) 0)`;
  scoreNum.textContent = score;

  scoreBand.textContent = band.label;
  scoreBand.className = `band ${band.cls}`;

  matchedCount.textContent = matched.length;
  statMatched.textContent = matched.length;
  statMissing.textContent = missing.length;
  presentPill.textContent = matched.length;
  missingPill.textContent = missing.length;

  presentList.innerHTML = matched.map((s) => chip(s, "hit")).join("");
  missingList.innerHTML = missing.map((s) => chip(s, "miss")).join("");

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function chip(skill, kind) {
  return `<span class="chip ${kind}">${skill.name}</span>`;
}

// ---------- Reset ----------
resetBtn.addEventListener("click", () => {
  results.hidden = true;
  clearFile();
  document.getElementById("analyze").scrollIntoView({ behavior: "smooth" });
});
