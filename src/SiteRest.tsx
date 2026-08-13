export function SiteRest() {
  return (
    <main className="after-dive">
      <section className="ticker" aria-label="Career achievements">
        <div className="ticker-track">
          <span>Zero high severity security incidents for 4+ years</span>
          <span>95% of Year 1 IT/OT roadmap delivered</span>
          <span>90% onboarding and offboarding time saved</span>
          <span>30% cloud operations cost savings achieved</span>
          <span>Energy One private cloud maintained at 99.9% uptime</span>
          <span>Meraki SDN transformation</span>
          <span>AESCSF audit and SOCI-aware cyber uplift</span>
        </div>
      </section>

      <section className="projects section-pad" id="projects">
        <div className="section-intro">
          <p className="eyebrow">Expedition logs</p>
          <h2>Missions that moved the business.</h2>
        </div>
        <div className="project-grid">
          <article className="project-card">
            <div className="project-face project-front">
              <span>01</span>
              <h3>Hybrid cloud AI foundation</h3>
              <p>Designed cloud architecture and data streaming into Azure Data Factory for AI-driven asset performance modelling.</p>
            </div>
          </article>
          <article className="project-card">
            <div className="project-face project-front">
              <span>02</span>
              <h3>IT/OT cyber uplift</h3>
              <p>Advanced Essential Eight initiatives, SOCI planning, AESCSF audit participation, and Dragos evaluation for SCADA-integrated sites.</p>
            </div>
          </article>
          <article className="project-card">
            <div className="project-face project-front">
              <span>03</span>
              <h3>FinOps optimisation</h3>
              <p>Achieved 30% cloud operations savings through reserved instances, workload tuning, and license consolidation.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="spearfishing section-pad" id="spearfishing">
        <div className="spearfishing-copy">
          <p className="eyebrow">Spearfishing</p>
          <h2>Depth, patience, precision.</h2>
          <p>
            Spearfishing brings a personal layer to the site: calm under pressure, respect for conditions,
            and the discipline to read what is happening beneath the surface.
          </p>
        </div>
        <div className="depth-card">
          <img src={`${import.meta.env.BASE_URL}assets/cv-spearfishing-focused.png`} alt="Underwater spearfisher silhouette" />
          <span>23m</span>
          <p>Focus below the surface. Leadership above it.</p>
        </div>
      </section>

      <section className="contact section-pad" id="contact">
        <div className="section-intro">
          <p className="eyebrow">Surface</p>
          <h2>Let&apos;s connect.</h2>
          <p>
            Open to senior IT leadership conversations across IT/OT transformation, cybersecurity, cloud
            architecture, and AI-ready digital foundations.
          </p>
        </div>
        <div className="contact-actions">
          <a href="https://www.linkedin.com/in/runtian-huang-58751455/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:timllz83@gmail.com">Email</a>
          <a href="cv.html">Online CV</a>
          <a href="assets/tim-huang-head-of-it-updated-cv.docx" download>Head of IT CV</a>
        </div>
      </section>
    </main>
  );
}
