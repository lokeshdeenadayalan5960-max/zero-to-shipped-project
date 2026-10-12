import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import analyzeRouter from './routes/analyze.js'
import historyRouter from './routes/history.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/analyze', analyzeRouter)
app.use('/api/history', historyRouter)

// 404 for anything the routes above didn't claim
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Central error handler — multer's size-limit error lands here
app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'PDF too large (max 10 MB).' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API ready at http://localhost:${PORT}`)
  })
})
