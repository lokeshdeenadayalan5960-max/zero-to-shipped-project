// All parsing logic lives here, deliberately apart from the UI. When a real
// backend replaces the local scan, only this file changes — the components
// keep working off the same { score, band, matched, missing } shape.

import * as pdfjsLib from 'pdfjs-dist'
// Vite's ?url import gives us a served URL for the worker file, in dev and
// in the production build. pdf.js needs this to run its parser off the
// main thread.
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { SKILLS, BANDS, MAX_PAGES } from './skills.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

export async function extractTextFromPdf(file, onProgress) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  const pages = Math.min(pdf.numPages, MAX_PAGES)
  let text = ''
  for (let i = 1; i <= pages; i++) {
    onProgress?.(i, pages)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + ' '
  }

  if (text.trim().length < 30) {
    const err = new Error('no-text')
    err.userMessage =
      "Couldn't find selectable text — this PDF might be a scan. Try a text-based PDF."
    throw err
  }

  return text
}

export function scoreResume(text) {
  const matched = SKILLS.filter((skill) => skill.re.test(text))
  const missing = SKILLS.filter((skill) => !skill.re.test(text))
  const score = Math.round((matched.length / SKILLS.length) * 100)
  const band = BANDS.find((b) => score >= b.min)
  return { score, band, matched, missing, tracked: SKILLS.length }
}
