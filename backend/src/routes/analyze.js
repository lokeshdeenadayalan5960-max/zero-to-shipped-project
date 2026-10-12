// POST /api/analyze — multipart/form-data with:
//   resume          (file, PDF)
//   jobDescription  (text)
// Stores the comparison in MongoDB and returns the full report.

import { Router } from 'express'
import multer from 'multer'
import { extractTextFromBuffer } from '../lib/pdf.js'
import { scoreResumeAgainstJD } from '../lib/skills.js'
import Analysis from '../models/Analysis.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    cb(
      null,
      file.mimetype === 'application/pdf' ||
        (file.originalname || '').toLowerCase().endsWith('.pdf'),
    ),
})

const router = Router()

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No PDF uploaded. Send multipart/form-data with a "resume" file field.' })
    }

    const jd = (req.body.jobDescription || '').trim()
    if (!jd) {
      return res
        .status(400)
        .json({ error: 'Missing job description. Send a "jobDescription" text field.' })
    }
    if (jd.length < 30) {
      return res.status(400).json({ error: 'Job description too short to extract skills from.' })
    }

    const { text, resumeNumPages, pagesRead } = await extractTextFromBuffer(req.file.buffer)
    if (text.length < 30) {
      return res.status(422).json({
        error: "Couldn't find selectable text — this PDF might be a scan. Try a text-based PDF.",
      })
    }

    const result = scoreResumeAgainstJD(text, jd)

    const doc = await Analysis.create({
      fileName: req.file.originalname,
      resumeText: text.slice(0, 5000),
      jobDescription: jd.slice(0, 5000),
      jdSkills: result.jdSkills,
      matchedSkills: result.matched,
      missingSkills: result.missing,
      extraSkills: result.extra,
      score: result.score,
      band: result.band.label,
    })

    res.status(201).json({
      id: doc._id,
      fileName: doc.fileName,
      createdAt: doc.createdAt,
      score: result.score,
      band: result.band, // { label, color, cls } — ready for the frontend to render
      jdSkills: result.jdSkills,
      matched: result.matched,
      missing: result.missing,
      extra: result.extra,
      resumeNumPages,
      pagesRead,
    })
  } catch (err) {
    // 422: the uploaded file itself was unreadable. 500: our side failed.
    if (err.userMessage) return res.status(422).json({ error: err.userMessage })
    console.error(err)
    res.status(500).json({ error: 'Something went wrong while analyzing the resume.' })
  }
})

export default router
