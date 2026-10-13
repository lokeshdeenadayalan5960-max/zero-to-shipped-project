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
  const [jd, setJd] = useState('')
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
      setStatus({ text: 'Analyzing with AI…', error: false })
      
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jd', jd);

      // In production, we use the relative path /api/compare which Vercel routes.
      // Locally, vercel dev handles the binding.
      const response = await fetch('/api/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();
      
      // Adapt backend result to frontend report format
      setReport({
        score: parseFloat(result.matchScore),
        summary: result.message,
        details: result.parsedResume
      });
      
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
          jd={jd}
          busy={busy}
          status={status}
          onPick={handleFile}
          onRemove={clearFile}
          onJDChange={setJd}
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