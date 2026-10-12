// PDF text extraction on the server, using the same pdf.js library the
// frontend used before the API existed. Capped at the first 5 pages so a
// huge file can't stall a request.

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { fileURLToPath } from 'node:url'
const STANDARD_FONTS = new URL('../../node_modules/pdfjs-dist/standard_fonts/', import.meta.url).href

const MAX_PAGES = 5
// pdf.js wants this only for rendering; extraction works without it but logs a warning on each request.

export async function extractTextFromBuffer(buffer) {
  let pdf
  try {
    pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer), standardFontDataUrl: STANDARD_FONTS }).promise
  } catch (err) {
    if (err.name === 'InvalidPDFException' || err.name === 'PasswordException') {
      err.userMessage =
        "That PDF couldn't be read — it may be malformed or password-protected."
      throw err
    }
    throw err
  }

  const pagesRead = Math.min(pdf.numPages, MAX_PAGES)
  let text = ''
  for (let i = 1; i <= pagesRead; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + ' '
  }

  return { text: text.trim(), resumeNumPages: pdf.numPages, pagesRead }
}
