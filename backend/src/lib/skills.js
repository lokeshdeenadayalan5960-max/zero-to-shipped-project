// The tracked skills and the scoring logic. Same list the frontend used
// before the API existed; now this is the single source of truth on the
// server, and the frontend just renders whatever the API returns.

export const SKILLS = [
  { name: 'JavaScript', re: /\bjavascript\b|\bjs\b/i },
  { name: 'TypeScript', re: /\btypescript\b/i },
  { name: 'Python', re: /\bpython\b/i },
  { name: 'Java', re: /\bjava\b/i },
  { name: 'SQL', re: /\bsql\b/i },
  { name: 'HTML', re: /\bhtml\b/i },
  { name: 'CSS', re: /\bcss\b/i },
  { name: 'React', re: /\breact\b/i },
  { name: 'Node.js', re: /\bnode(?:\.js)?\b/i },
  { name: 'Express', re: /\bexpress(?:\.js)?\b/i },
  { name: 'MongoDB', re: /\bmongo(?:db)?\b/i },
  { name: 'PostgreSQL', re: /\bpostgres(?:ql)?\b/i },
  { name: 'Git', re: /\bgit\b|\bgithub\b/i },
  { name: 'Docker', re: /\bdocker\b/i },
  { name: 'Kubernetes', re: /\bkubernetes\b|\bk8s\b/i },
  { name: 'AWS', re: /\baws\b|\bamazon web services\b/i },
  { name: 'REST APIs', re: /\brest(?:ful)?\b|\bapis?\b/i },
  { name: 'CI/CD', re: /\bci\/cd\b|\bci\b/i },
  { name: 'Testing', re: /\bjest\b|\bunit tests?\b/i },
  { name: 'Linux', re: /\blinux\b|\bunix\b/i },
]

// Score bands: at or above the threshold → this label + color.
export const BANDS = [
  { min: 75, label: 'Strong match', color: '#34d399', cls: 'band-strong' },
  { min: 50, label: 'Good match', color: '#a5b4fc', cls: 'band-good' },
  { min: 30, label: 'Needs work', color: '#fbbf24', cls: 'band-mid' },
  { min: 0, label: 'Weak match', color: '#f87171', cls: 'band-weak' },
]

export function bandFor(score) {
  return BANDS.find((b) => score >= b.min)
}

// Compare a resume against a job description:
// - jdSkills: tracked skills the JD asks for
// - matched:  asked for AND present in the resume
// - missing:  asked for but absent from the resume
// - extra:    present in the resume but not asked for
// The score is the share of JD skills the resume shows.
export function scoreResumeAgainstJD(resumeText, jdText) {
  const jdSkills = SKILLS.filter((s) => s.re.test(jdText))
  const resumeSkills = SKILLS.filter((s) => s.re.test(resumeText))
  const resumeNames = new Set(resumeSkills.map((s) => s.name))

  const matched = jdSkills.filter((s) => resumeNames.has(s.name))
  const missing = jdSkills.filter((s) => !resumeNames.has(s.name))
  const jdNames = new Set(jdSkills.map((s) => s.name))
  const extra = resumeSkills.filter((s) => !jdNames.has(s.name))

  const score = jdSkills.length
    ? Math.round((matched.length / jdSkills.length) * 100)
    : 0

  return {
    score,
    band: bandFor(score),
    jdSkills: jdSkills.map((s) => s.name),
    matched: matched.map((s) => s.name),
    missing: missing.map((s) => s.name),
    extra: extra.map((s) => s.name),
  }
}
