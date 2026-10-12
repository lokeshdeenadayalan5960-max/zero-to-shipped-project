// Generates a structurally valid one-page PDF with resume-like text.
// Used by the smoke check: node scripts/make-test-pdf.js
// Writes test-resume.pdf next to itself. Safe to run anytime.

import { PDFDocument, StandardFonts } from 'pdf-lib'
import { writeFileSync } from 'node:fs'

const RESUME_TEXT = `Lokesh Deenadayalan
Full-stack developer

Projects: built and shipped apps with JavaScript, React, Node.js,
Express and MongoDB. Styled with HTML and CSS.

Practices: unit tests with Jest, version control with Git,
deployed with Docker on Linux.

Comfortable with SQL and Python for small data tasks.
`

const doc = await PDFDocument.create()
const font = await doc.embedFont(StandardFonts.Helvetica)
const page = doc.addPage([612, 792])
page.drawText(RESUME_TEXT, { x: 50, y: 742, font, size: 12, lineHeight: 18 })

const bytes = await doc.save()
writeFileSync(new URL('./test-resume.pdf', import.meta.url), bytes)
console.log('Wrote scripts/test-resume.pdf (' + bytes.length + ' bytes)')
