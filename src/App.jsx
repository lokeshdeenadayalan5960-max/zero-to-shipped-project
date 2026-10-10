import { useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Uploader from './components/Uploader.jsx'
import Results from './components/Results.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import { extractTextFromPdf, scoreResume } from './lib/resume.js'

// App owns all the state; the components below are props-driven UI.
// One screen, four states: no file → file picked → analyzing → report.
export default function App() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState({ text: '', error: false })
  const [report, setReport] = useState(null)
  const uploaderRef = useRef(null)

  function handleFile(next) {
    const isPdf =
      next.type === 'application/pdf' ||
      next.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setStatus({
        text: "That doesn't look like a PDF. Please choose a .pdf file.",
        error: true,
      })
      return
    }
    setFile(next)
    setReport(null)
    setStatus({ text: '', error: false })
  }

  function clearFile() {
    setFile(null)
    setStatus({ text: '', error: false })
  }

  async function analyze() {
    if (!file || busy) return
    setBusy(true)
    setReport(null)
    try {
      setStatus({ text: 'Extracting text…', error: false })
      const text = await extractTextFromPdf(file, (page, total) =>
        setStatus({ text: `Reading page ${page} of ${total}…`, error: false }),
      )
      setStatus({ text: 'Matching skills…', error: false })
      // Give the browser a tick to paint the status before the fast scan.
      await new Promise((resolve) => setTimeout(resolve, 50))
      setReport(scoreResume(text))
      setStatus({ text: '', error: false })
    } catch (err) {
      setStatus({
        text:
          err.userMessage ||
          'Something went wrong while reading that PDF. Is it a valid file?',
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setReport(null)
    setFile(null)
    setStatus({ text: '', error: false })
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Uploader
          ref={uploaderRef}
          file={file}
          busy={busy}
          status={status}
          onPick={handleFile}
          onRemove={clearFile}
          onAnalyze={analyze}
        />
        {report && <Results report={report} onReset={reset} />}
        <HowItWorks />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>0 → Shipped Resume Parser · built with React</p>
        </div>
      </footer>
    </>
  )
}
