// Self-check for the scoring logic, no server or MongoDB needed:
//   npm run smoke
// Full round trip against a running API with a real PDF:
//   npm run smoke -- path\to\resume.pdf

import { scoreResumeAgainstJD } from '../src/lib/skills.js'

const RESUME = `
Built and shipped projects with JavaScript, React, Node.js, Express and MongoDB.
Wrote unit tests with Jest and tracked work in Git. Comfortable with HTML and CSS.
`
const JD = `
We are looking for a full-stack developer with strong JavaScript, React,
Node.js and Docker experience. Familiarity with SQL is a plus.
`

// Part 1 — scoring logic
const result = scoreResumeAgainstJD(RESUME, JD)
console.log('Scoring self-check:')
console.log(`  score: ${result.score} (${result.band.label})`)
console.log(`  jd skills: ${result.jdSkills.join(', ')}`)
console.log(`  matched:   ${result.matched.join(', ')}`)
console.log(`  missing:   ${result.missing.join(', ')}`)
console.log(`  extra:     ${result.extra.join(', ')}`)

// 3 of the 5 JD skills (JavaScript, React, Node.js) are in the resume.
const expected = { score: 60, missing: ['Docker', 'SQL'] }
const ok =
  result.score === expected.score &&
  expected.missing.every((s) => result.missing.includes(s))
console.log(ok ? '  ✓ logic check passed' : '  ✗ logic check FAILED')

// Part 2 — optional round trip with a real PDF
const pdfPath = process.argv[2]
if (!pdfPath) {
  console.log('\nNo PDF given — skipping the API round trip.')
  console.log('With the server running: npm run smoke -- path\\to\\resume.pdf')
  process.exit(ok ? 0 : 1)
}

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const form = new FormData()
form.append('resume', new Blob([readFileSync(pdfPath)], { type: 'application/pdf' }), basename(pdfPath))
form.append('jobDescription', JD)

const res = await fetch('http://localhost:5000/api/analyze', { method: 'POST', body: form })
const body = await res.json()
console.log(`\nAPI round trip (HTTP ${res.status}):`)
console.log(JSON.stringify(body, null, 2))
process.exit(res.ok ? 0 : 1)
