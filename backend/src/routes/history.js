// Past analyses stored in MongoDB:
//   GET /api/history      — latest 25 (metadata only, no resume text)
//   GET /api/history/:id  — one analysis (text fields excluded)
//   DELETE /api/history/:id — remove one

import { Router } from 'express'
import Analysis from '../models/Analysis.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const items = await Analysis.find({})
      .sort({ createdAt: -1 })
      .limit(25)
      .select('fileName score band matchedSkills missingSkills createdAt')
    res.json({ count: items.length, items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not load history.' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const doc = await Analysis.findById(req.id || req.params.id).select(
      '-resumeText -__v',
    )
    if (!doc) return res.status(404).json({ error: 'Analysis not found.' })
    res.json(doc)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not load that analysis.' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Analysis.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Analysis not found.' })
    res.json({ ok: true, id: doc._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not delete that analysis.' })
  }
})

export default router
