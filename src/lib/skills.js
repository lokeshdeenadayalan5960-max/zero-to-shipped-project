// The skills the "recruiter scan" tracks. Each has a display name and a
// regex that matches it in the resume text. Word boundaries keep
// "JavaScript" from matching the "Java" rule; aliases like k8s are listed
// as alternatives on the same rule.

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

// Analyze at most the first N pages of a PDF.
export const MAX_PAGES = 5
