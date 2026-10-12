import { forwardRef, useId, useRef, useState } from 'react'

// Handles picking a file: click-to-browse and drag & drop. All state about
// the file itself lives in App (single source of truth); this component only
// reports events upward.
const Uploader = forwardRef(function Uploader(
  { file, jd, busy, status, onPick, onRemove, onJDChange, onAnalyze },
  ref,
) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const inputId = useId()
  const jdId = useId()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) onPick(e.dataTransfer.files[0])
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <section id="analyze" className="container uploader" ref={ref}>
      <div className="card">
        <h2>Check your resume</h2>

        <button
          type="button"
          className={`dropzone${dragging ? ' dragover' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDragEnd={() => setDragging(false)}
          onDrop={handleDrop}
          aria-label="Choose a PDF resume to analyze"
        >
          <span className="dz-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          </span>
          <span className="dz-text">
            Drag &amp; drop your PDF here, or{' '}
            <span className="dz-browse">browse files</span>
          </span>
          <span className="dz-note">PDF only · parsed locally, nothing is uploaded</span>
        </button>

        {/* Hidden input drives the actual file picker; label links it for a11y */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          onChange={(e) => e.target.files.length > 0 && onPick(e.target.files[0])}
        />
        <label htmlFor={inputId} hidden>
          Choose a PDF resume
        </label>

        {file && (
          <div className="file-row">
            <span className="file-icon" aria-hidden="true">
              📄
            </span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatSize(file.size)}</span>
            <button type="button" className="file-remove" onClick={onRemove} aria-label="Remove selected file">
              ×
            </button>
          </div>
        )}

        <div className="jd-section">
          <label htmlFor={jdId}>Job Description</label>
          <textarea
            id={jdId}
            className="jd-input"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => onJDChange(e.target.value)}
            rows={6}
          />
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary btn-analyze"
            disabled={!file || busy}
            onClick={onAnalyze}
          >
            {busy ? 'Analyzing…' : 'Analyze resume'}
          </button>
        </div>

        <p className={`status${status.error ? ' error' : ''}`} aria-live="polite">
          {status.text}
        </p>
        <p className="hint">No account. No upload. Your file never leaves this page.</p>
      </div>
    </section>
  )
})

export default Uploader
