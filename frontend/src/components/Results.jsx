import { useEffect, useState } from 'react'

// Renders the report from a scoreResume() result. The count animates from 0
// up to the score with a tiny easing; the ring is a conic-gradient donut.
export default function Results({ report, onReset }) {
  const { score, band, matched, missing, tracked } = report
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf
    function tick(now) {
      const t = Math.min((now - start) / 800, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(eased * score))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <section id="results" className="container results">
      <h2 className="section-title">Your report</h2>

      <div className="score-card card">
        <div
          className="score-ring"
          style={{
            background: `conic-gradient(${band.color} ${score * 3.6}deg, rgba(255,255,255,0.08) 0)`,
          }}
        >
          <div className="ring-inner">
            <span className="score-num">{shown}</span>
            <span className="score-suffix">%</span>
          </div>
        </div>
        <div className="score-meta">
          <span className={`band ${band.cls}`}>{band.label}</span>
          <p className="score-line">
            <strong>{matched.length}</strong> of <strong>{tracked}</strong> tracked skills found in your resume.
          </p>
          <div className="stats">
            <div className="stat">
              <span className="stat-num hit">{matched.length}</span>
              <span className="stat-label">matched</span>
            </div>
            <div className="stat">
              <span className="stat-num miss">{missing.length}</span>
              <span className="stat-label">missing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="skills-grid">
        <div className="panel card">
          <h3>
            Skills present <span className="count-pill hit">{matched.length}</span>
          </h3>
          <div className="chips">
            {matched.map((skill) => (
              <span key={skill.name} className="chip hit">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div className="panel card">
          <h3>
            Skills missing <span className="count-pill miss">{missing.length}</span>
          </h3>
          <div className="chips">
            {missing.map((skill) => (
              <span key={skill.name} className="chip miss">
                {skill.name}
              </span>
            ))}
          </div>
          <p className="panel-note">Add these — backed by real projects — to close the gap.</p>
        </div>
      </div>

      <div className="results-actions">
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Analyze another resume
        </button>
      </div>
    </section>
  )
}
