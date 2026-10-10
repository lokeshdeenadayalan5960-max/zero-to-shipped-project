export default function Hero() {
  return (
    <section className="hero container">
      <h1>
        Turn your resume into a <span className="grad">score</span>.
      </h1>
      <p>
        Upload a PDF and instantly see the skills recruiters' keyword scans
        catch — what you show, what you're missing, and an overall score.
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#analyze">
          Upload a resume
        </a>
        <a className="btn btn-ghost" href="#how">
          See how it works
        </a>
      </div>
    </section>
  )
}
