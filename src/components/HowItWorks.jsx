export default function HowItWorks() {
  return (
    <section id="how" className="container how">
      <h2 className="section-title">How it works</h2>
      <div className="steps">
        <div className="step card">
          <span className="step-num">01</span>
          <h3>Drop your PDF</h3>
          <p>The text is extracted right in your browser with pdf.js. The file is never sent to a server.</p>
        </div>
        <div className="step card">
          <span className="step-num">02</span>
          <h3>Keyword scan</h3>
          <p>Your resume is matched against a curated list of 20 skills recruiters commonly track.</p>
        </div>
        <div className="step card">
          <span className="step-num">03</span>
          <h3>Score &amp; gaps</h3>
          <p>The score is the share of tracked skills you show, and the missing list tells you exactly what to add.</p>
        </div>
      </div>
    </section>
  )
}
