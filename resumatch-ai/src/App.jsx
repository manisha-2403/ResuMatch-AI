import { useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'
const MAX_FILE_SIZE = 5 * 1024 * 1024

// --------------------------------------------------
// ICON COMPONENT
// --------------------------------------------------

function Icon({ type, size = 20 }) {
  const shapes = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m-5 5 5-5 5 5" />
        <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
      </>
    ),
    brain: (
      <>
        <path d="M12 5a3 3 0 0 0-6-1 4 4 0 0 0-2 6 4 4 0 0 0 2 6 3 3 0 0 0 6-1z" />
        <path d="M12 5a3 3 0 0 1 6-1 4 4 0 0 1 2 6 4 4 0 0 1-2 6 3 3 0 0 1-6-1zM12 5v14" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-1 .8-1 1.5-1 3H9c0-1.5 0-2.2-1-3Z" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2 6 6 3-6 2-2 6-2-6-6-2 6-3z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none" />,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[type] || shapes.spark}
    </svg>
  )
}

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function getImprovementText(item) {
  if (typeof item === 'string') return item

  if (!item || typeof item !== 'object') {
    return String(item ?? '')
  }

  return (
    item.message ||
    item.suggestion ||
    item.description ||
    item.recommendation ||
    item.improvement ||
    item.title ||
    item.text ||
    JSON.stringify(item)
  )
}

function getCheckLabel(check, index) {
  if (typeof check === 'string') return check

  if (!check || typeof check !== 'object') {
    return `ATS check ${index + 1}`
  }

  return (
    check.name ||
    check.label ||
    check.title ||
    check.description ||
    check.check ||
    `ATS check ${index + 1}`
  )
}

function getCheckStatus(check) {
  if (typeof check === 'boolean') return check
  if (!check || typeof check !== 'object') return false

  return (
    check.passed === true ||
    check.is_passed === true ||
    check.success === true
  )
}

function getCheckDetail(check) {
  if (!check || typeof check !== 'object') return ''

  return check.detail || check.message || check.reason || ''
}

// --------------------------------------------------
// MAIN APP
// --------------------------------------------------

export default function App() {
  const fileRef = useRef(null)

  // Resume analyzer state
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  // Career Assistant state
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I can help you understand your resume report, identify strengths, improve your resume honestly, and plan what to learn next.',
    },
  ])
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantError, setAssistantError] = useState('')

  // ------------------------------------------------
  // RESUME FILE HANDLING
  // ------------------------------------------------

  function chooseResume(file) {
    setError('')
    setResult(null)

    if (!file) return

    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setResume(null)
      setError('Please upload a PDF or DOCX file.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setResume(null)
      setError('Your resume must be 5 MB or smaller.')
      return
    }

    setResume(file)
  }

  // ------------------------------------------------
  // RESUME ANALYSIS
  // ------------------------------------------------

  async function analyzeResume(event) {
    event.preventDefault()

    setError('')
    setResult(null)

    if (!resume) {
      setError('Please upload your resume first.')
      return
    }

    if (jobDescription.trim().length < 50) {
      setError(
        'Please enter a job description containing at least 50 characters.'
      )
      return
    }

    const body = new FormData()
    body.append('resume', resume)
    body.append('job_description', jobDescription.trim())

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || 'Analysis failed. Please try again.'
        )
      }

      setResult(data)

      window.setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
        })
      }, 120)
    } catch (err) {
      setError(
        err.message?.includes('fetch')
          ? 'Could not connect to the Python backend. Make sure FastAPI is running at http://127.0.0.1:8000.'
          : err.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------
  // RESET ANALYSIS
  // ------------------------------------------------

  function resetAnalysis() {
    setResume(null)
    setJobDescription('')
    setResult(null)
    setError('')

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  // ------------------------------------------------
  // CAREER ASSISTANT - GROQ API
  // ------------------------------------------------

  async function sendAssistantMessage(event) {
    event.preventDefault()

    const question = assistantInput.trim()

    if (!question || assistantLoading) return

    const userMessage = {
      role: 'user',
      content: question,
    }

    const historyForRequest = [
      ...assistantMessages,
      userMessage,
    ]

    setAssistantMessages(historyForRequest)
    setAssistantInput('')
    setAssistantError('')
    setAssistantLoading(true)

    const analysisContext = result
      ? {
          filename: result.filename,
          match_score: result.match_score ?? result.score ?? null,
          matched_skills:
            result.matched_skills ||
            result.skills_matched ||
            [],
          missing_skills: result.missing_skills || [],
          semantic_candidates:
            result.semantic_candidates || [],
          suggestions: result.suggestions || [],
          ats_readiness: result.ats_readiness || null,
          resume_improvements:
            result.resume_improvements || [],
        }
      : null

    try {
      const response = await fetch(
        `${API_URL}/career-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            analysis_context: analysisContext,
            chat_history: historyForRequest
              .slice(-8)
              .map(({ role, content }) => ({
                role,
                content,
              })),
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Assistant request failed (${response.status}).`
        )
      }

      if (!data.answer) {
        throw new Error(
          'The assistant returned an empty response. Please try again.'
        )
      }

      setAssistantMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.answer,
        },
      ])
    } catch (err) {
      const message =
        err.message ||
        'The assistant could not respond. Please try again.'

      setAssistantError(
        message.includes('Failed to fetch') ||
          message.includes('NetworkError')
          ? 'Could not connect to the backend. Check that FastAPI is running at http://127.0.0.1:8000.'
          : message
      )
    } finally {
      setAssistantLoading(false)
    }
  }

  // ------------------------------------------------
  // MAIN PAGE
  // ------------------------------------------------

  return (
    <div className="app-shell" id="home">
      {/* NAVIGATION */}
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">R</span>
          <span className="brand-name">
            ResuMatch <b>AI</b>
          </span>
        </a>

        <nav className="nav-links">
          <a className="active" href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-cta" href="#analyzer">
          <Icon type="spark" size={15} />
          Analyze My Resume <span>→</span>
        </a>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow-pill">
              <Icon type="spark" size={15} />
              AI-POWERED RESUME ANALYZER
            </div>

            <h1>
              Your skills deserve
              <br />
              the <span>right match.</span>
            </h1>

            <p className="hero-description">
              Understand how your resume aligns with a job description.
              Discover skill gaps and make more informed improvements
              before you apply.
            </p>

            <div className="hero-actions">
              <a href="#analyzer" className="primary-button">
                Analyze My Resume <Icon type="arrow" />
              </a>

              <a href="#how-it-works" className="secondary-button">
                <Icon type="play" size={15} />
                See How It Works
              </a>
            </div>

            <div className="hero-trust">
              <span><Icon type="file" /> PDF &amp; DOCX</span>
              <i />
              <span><Icon type="brain" /> Skill comparison</span>
              <i />
              <span><Icon type="lock" /> No resume storage</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Resume analysis preview">
            <div className="art-glow" />
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <i className="orbit-dot dot-one" />
            <i className="orbit-dot dot-two" />

            <div className="resume-preview">
              <div className="preview-header">
                <div className="preview-file">
                  <Icon type="file" size={27} />
                </div>
                <div>
                  <strong>Resume Analysis</strong>
                  <span>AI-powered insights</span>
                </div>
                <Icon type="spark" size={22} />
              </div>

              <div className="preview-divider" />

              <div className="preview-summary">
                <div className="donut">
                  <div>
                    <strong>--</strong>
                    <span>Match Score</span>
                  </div>
                </div>

                <div className="preview-stats">
                  <div>
                    <i className="dot-cyan" />
                    <span>Matched Skills</span>
                    <b>—</b>
                  </div>
                  <div>
                    <i className="dot-pink" />
                    <span>Missing Skills</span>
                    <b>—</b>
                  </div>
                  <div>
                    <i className="dot-blue" />
                    <span>Semantic Matches</span>
                    <b>—</b>
                  </div>
                </div>
              </div>

              <div className="preview-divider" />
              <strong className="top-skills-label">Top Skills</strong>

              <div className="preview-pills">
                <span>Python</span>
                <span>LLM</span>
                <span>NLP</span>
                <span>Generative AI</span>
                <span>RAG</span>
              </div>

              <div className="preview-caption">
                <i />
                Upload a resume to reveal your insights
              </div>
            </div>

            <div className="floating-insight">
              <div className="floating-spark">
                <Icon type="spark" />
              </div>
              <strong>
                Find your strengths
                <br />
                and close the gaps.
              </strong>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="feature-strip" id="features">
          <article className="feature">
            <div className="feature-icon">
              <Icon type="upload" size={28} />
            </div>
            <div>
              <h3>Easy Upload</h3>
              <p>Drag and drop your PDF or DOCX resume in seconds.</p>
            </div>
          </article>

          <article className="feature">
            <div className="feature-icon">
              <Icon type="brain" size={28} />
            </div>
            <div>
              <h3>Smart Matching</h3>
              <p>Compare recognized skills with job requirements.</p>
            </div>
          </article>

          <article className="feature">
            <div className="feature-icon">
              <Icon type="chart" size={28} />
            </div>
            <div>
              <h3>Detailed Insights</h3>
              <p>See your match score, matched skills, and missing keywords.</p>
            </div>
          </article>

          <article className="feature">
            <div className="feature-icon">
              <Icon type="bulb" size={28} />
            </div>
            <div>
              <h3>Actionable Suggestions</h3>
              <p>Get practical tips to review your resume and stand out.</p>
            </div>
          </article>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <div className="eyebrow-pill small-pill">
              SIMPLE 3-STEP PROCESS
            </div>
            <h2>How It <span>Works</span></h2>
            <p>Get your personalized match report in just a few minutes.</p>
          </div>

          <div className="steps">
            <article className="step-card">
              <span className="step-count">1</span>
              <div className="step-icon">
                <Icon type="upload" size={26} />
              </div>
              <div>
                <h3>Upload Your Resume</h3>
                <p>Use PDF or DOCX format.</p>
              </div>
            </article>

            <span className="step-arrow">→</span>

            <article className="step-card">
              <span className="step-count">2</span>
              <div className="step-icon">
                <Icon type="file" size={26} />
              </div>
              <div>
                <h3>Add Job Description</h3>
                <p>Paste the role, responsibilities and skills.</p>
              </div>
            </article>

            <span className="step-arrow">→</span>

            <article className="step-card">
              <span className="step-count">3</span>
              <div className="step-icon">
                <Icon type="chart" size={26} />
              </div>
              <div>
                <h3>Get Your Results</h3>
                <p>Review your score, skill comparison and insights.</p>
              </div>
            </article>
          </div>

          <a href="#analyzer" className="primary-button how-cta">
            Analyze Your Resume <Icon type="arrow" />
          </a>
        </section>

        {/* RESUME ANALYZER */}
        <section className="analyzer-section" id="analyzer">
          <div className="section-heading">
            <div className="eyebrow-pill small-pill">
              YOUR NEXT STEP STARTS HERE
            </div>
            <h2>Find your <span>best match.</span></h2>
            <p>
              Upload your resume and paste the job description to get your report.
            </p>
          </div>

          <form className="analyzer-grid" onSubmit={analyzeResume}>
            <div className="form-panel">
              <div className="panel-heading">
                <span className="panel-step">01</span>
                <div>
                  <h3>Your resume</h3>
                  <p>Upload your latest resume to get started.</p>
                </div>
              </div>

              <div
                className={`upload-zone ${dragging ? 'dragging' : ''} ${resume ? 'has-file' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragging(false)
                  chooseResume(event.dataTransfer.files?.[0])
                }}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    fileRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    chooseResume(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />

                <span className="upload-icon">
                  <Icon type={resume ? 'check' : 'upload'} size={26} />
                </span>

                {resume ? (
                  <>
                    <strong className="file-name">{resume.name}</strong>
                    <span className="upload-hint">
                      {(resume.size / 1024).toFixed(0)} KB · Ready to analyze
                    </span>
                    <span className="change-file">Choose a different file</span>
                  </>
                ) : (
                  <>
                    <strong>Drop your resume here</strong>
                    <span className="upload-hint">
                      or click to browse your computer
                    </span>
                    <span className="file-format">
                      PDF or DOCX · Maximum 5 MB
                    </span>
                  </>
                )}
              </div>

              <div className="privacy-note">
                <Icon type="lock" size={15} />
                Your file is processed for this analysis and is not saved by this application.
              </div>
            </div>

            <div className="form-panel">
              <div className="panel-heading">
                <span className="panel-step">02</span>
                <div>
                  <h3>Target job description</h3>
                  <p>Paste the requirements for the role you want.</p>
                </div>
              </div>

              <label className="field-label" htmlFor="job-description">
                JOB DESCRIPTION
              </label>

              <textarea
                id="job-description"
                className="job-textarea"
                placeholder="Paste the job title, responsibilities, required skills and qualifications here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                minLength={50}
                required
              />

              <div className="textarea-footer">
                <span>Include skills and requirements from the listing.</span>
                <span>{jobDescription.length} characters</span>
              </div>

              <div className="analysis-note">
                <Icon type="spark" size={17} />
                <p>
                  Results use recognized skill matching and semantic text similarity.
                  They are guidance, not a guaranteed ATS score.
                </p>
              </div>
            </div>

            <div className="form-submit-row">
              {error && (
                <div className="error-message" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                className="primary-button analyze-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Analyzing your resume...
                  </>
                ) : (
                  <>
                    Analyze My Resume <Icon type="arrow" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ANALYSIS RESULTS */}
        {result && (
          <section className="results-section" id="results">
            <div className="results-header">
              <div>
                <div className="eyebrow-pill small-pill">YOUR ANALYSIS</div>
                <h2>Your resume <span>insights.</span></h2>
                <p className="results-filename">
                  {result.filename} · {result.resume_characters} characters extracted
                </p>
              </div>

              <button
                className="secondary-button reset-button"
                type="button"
                onClick={resetAnalysis}
              >
                Start a new analysis ↻
              </button>
            </div>

            {/* SKILL MATCH OVERVIEW */}
            <div className="results-overview">
              <div className="score-card">
                <div className="eyebrow">SKILL MATCH</div>
                <div className="score-number">
                  {Number(result.match_score ?? result.score ?? 0)}%
                </div>
                <div className="score-track">
                  <div
                    className="score-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(result.match_score ?? result.score) || 0)
                      )}%`,
                    }}
                  />
                </div>
                <p>
                  {result.matched_count ?? result.matched_skills?.length ?? 0} of{' '}
                  {result.required_count ?? 0} recognized job-description skills
                  were also found in your resume.
                </p>
              </div>

              <div className="metric-card">
                <span className="metric-icon matched-icon">
                  <Icon type="check" />
                </span>
                <div>
                  <span>Matched skills</span>
                  <strong>{result.matched_count ?? result.matched_skills?.length ?? 0}</strong>
                  <p>Found in both texts</p>
                </div>
              </div>

              <div className="metric-card">
                <span className="metric-icon missing-icon">＋</span>
                <div>
                  <span>Skills to review</span>
                  <strong>{result.missing_skills?.length || 0}</strong>
                  <p>In the job description only</p>
                </div>
              </div>
            </div>

            {Number(result.required_count) === 0 && (
              <div className="info-message">
                We couldn't identify supported skills in this job description.
                Try including more specific technical skills and requirements.
              </div>
            )}

            {/* MATCHED AND MISSING SKILLS */}
            <div className="skills-grid">
              <div className="skills-card">
                <div className="skills-card-heading">
                  <span className="skill-heading-icon matched-icon">
                    <Icon type="check" />
                  </span>
                  <div>
                    <h3>Matched skills</h3>
                    <p>Skills recognized in both texts</p>
                  </div>
                </div>

                <div className="skill-list">
                  {result.matched_skills?.length ? (
                    result.matched_skills.map((skill) => (
                      <span className="skill-tag matched" key={skill}>
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">
                      No matching skills were identified yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="skills-card">
                <div className="skills-card-heading">
                  <span className="skill-heading-icon missing-icon">＋</span>
                  <div>
                    <h3>Skills to review</h3>
                    <p>Recognized in the job description only</p>
                  </div>
                </div>

                <div className="skill-list">
                  {result.missing_skills?.length ? (
                    result.missing_skills.map((skill) => (
                      <span className="skill-tag missing" key={skill}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">
                      No recognized skill gaps were found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SEMANTIC MATCHES */}
            {result.semantic_candidates?.length > 0 && (
              <div className="suggestions-card result-card">
                <div className="suggestions-heading">
                  <span className="suggestions-icon">
                    <Icon type="spark" />
                  </span>
                  <div>
                    <h3>Semantic skill matches</h3>
                    <p>
                      Potentially related resume text. Similarity is not proof
                      of a qualification.
                    </p>
                  </div>
                </div>

                <div className="semantic-list">
                  {result.semantic_candidates.map((candidate) => (
                    <article className="semantic-item" key={candidate.skill}>
                      <div className="semantic-item-heading">
                        <h4>{candidate.skill}</h4>
                        <span className="semantic-score">
                          Similarity:{' '}
                          {(Number(candidate.similarity || 0) * 100).toFixed(1)}%
                        </span>
                      </div>

                      {candidate.evidence && (
                        <blockquote className="evidence-snippet">
                          {candidate.evidence}
                        </blockquote>
                      )}

                      {candidate.additional_evidence?.map((item, index) => (
                        <blockquote
                          className="evidence-snippet additional-evidence"
                          key={`${candidate.skill}-${index}`}
                        >
                          {item.evidence || item}
                        </blockquote>
                      ))}

                      <p className="semantic-note">
                        Potential semantic match — review the evidence before
                        treating this skill as relevant.
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* RESUME EVIDENCE */}
            {result.resume_skill_evidence &&
              Object.keys(result.resume_skill_evidence).length > 0 && (
                <div className="suggestions-card result-card">
                  <div className="suggestions-heading">
                    <span className="suggestions-icon">
                      <Icon type="file" />
                    </span>
                    <div>
                      <h3>Resume evidence</h3>
                      <p>Text snippets that triggered recognized skill matches.</p>
                    </div>
                  </div>

                  <div className="evidence-list">
                    {Object.entries(result.resume_skill_evidence).map(
                      ([skill, snippets]) => (
                        <div className="evidence-item" key={skill}>
                          <h4>{skill}</h4>
                          {snippets.map((snippet, index) => (
                            <blockquote
                              className="evidence-snippet"
                              key={`${skill}-${index}`}
                            >
                              {snippet}
                            </blockquote>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* SUGGESTED NEXT STEPS */}
            <div className="suggestions-card result-card">
              <div className="suggestions-heading">
                <span className="suggestions-icon">
                  <Icon type="bulb" />
                </span>
                <div>
                  <h3>Suggested next steps</h3>
                  <p>Practical ways to review your resume</p>
                </div>
              </div>

              {result.suggestions?.length ? (
                <ul className="suggestion-list">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={`${index}-${suggestion}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">
                  Review the job requirements and ensure relevant experience
                  is clearly demonstrated.
                </p>
              )}

              <p className="score-disclaimer">
                {result.score_method || ''}
                {' '}This is not an official or validated ATS score. A missing
                keyword does not necessarily mean you lack that skill.
              </p>
            </div>

            {/* ATS READINESS */}
            {result.ats_readiness && (
              <div className="ats-card result-card">
                <div className="ats-header">
                  <div className="suggestions-heading">
                    <span className="suggestions-icon">
                      <Icon type="chart" />
                    </span>
                    <div>
                      <h3>ATS Readiness</h3>
                      <p>
                        An estimate based on resume structure and content checks
                      </p>
                    </div>
                  </div>

                  <div className="ats-score">
                    <strong>
                      {Number(result.ats_readiness.score ?? 0)}
                      <span>/100</span>
                    </strong>
                    <span className="ats-label">
                      {result.ats_readiness.label || 'Estimated readiness'}
                    </span>
                  </div>
                </div>

                <div className="ats-progress-track">
                  <div
                    className="ats-progress-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          Number(result.ats_readiness.score) || 0
                        )
                      )}%`,
                    }}
                  />
                </div>

                <p className="ats-summary">
                  {result.ats_readiness.checks_passed ?? 0} of{' '}
                  {result.ats_readiness.checks_total ??
                    result.ats_readiness.total_checks ??
                    result.ats_readiness.checks?.length ??
                    0}{' '}
                  structural checks passed
                  {Number.isFinite(Number(result.ats_readiness.word_count))
                    ? ` · ${result.ats_readiness.word_count} words detected`
                    : ''}
                </p>

                {Array.isArray(result.ats_readiness.checks) &&
                  result.ats_readiness.checks.length > 0 && (
                    <div className="ats-checklist">
                      {result.ats_readiness.checks.map((check, index) => {
                        const passed = getCheckStatus(check)

                        return (
                          <article
                            className={`ats-check ${
                              passed ? 'check-passed' : 'check-review'
                            }`}
                            key={`${getCheckLabel(check, index)}-${index}`}
                          >
                            <span className="ats-check-icon" aria-hidden="true">
                              {passed ? '✓' : '•'}
                            </span>

                            <div>
                              <strong>{getCheckLabel(check, index)}</strong>
                              {getCheckDetail(check) && (
                                <p>{getCheckDetail(check)}</p>
                              )}
                            </div>

                            <span className="ats-check-status">
                              {passed ? 'Passed' : 'Review'}
                            </span>
                          </article>
                        )
                      })}
                    </div>
                  )}

                <p className="score-disclaimer">
                  {result.ats_readiness.disclaimer ||
                    'This is a transparent, rule-based checklist estimate. It is not an official ATS score and cannot predict hiring outcomes.'}
                </p>
              </div>
            )}

            {/* RESUME IMPROVEMENTS */}
            {Array.isArray(result.resume_improvements) &&
              result.resume_improvements.length > 0 && (
                <div
                  className="suggestions-card result-card improvements-card"
                  id="resume-improvements"
                >
                  <div className="suggestions-heading">
                    <span className="suggestions-icon">
                      <Icon type="bulb" />
                    </span>
                    <div>
                      <h3>Resume Improvements</h3>
                      <p>
                        Review these suggestions and make only changes that
                        accurately reflect your experience.
                      </p>
                    </div>
                  </div>

                  <div className="improvements-list">
                    {result.resume_improvements.map((item, index) => (
                      <article
                        className="improvement-item"
                        key={`improvement-${index}`}
                      >
                        <span className="improvement-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p>{getImprovementText(item)}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

            <button
              className="primary-button bottom-reset"
              type="button"
              onClick={resetAnalysis}
            >
              Analyze another resume <Icon type="arrow" />
            </button>
          </section>
        )}

        {/* CAREER ASSISTANT BANNER */}
        <section className="closing-banner career-banner" id="about">
          <div className="closing-orb">
            <Icon type="brain" size={27} />
          </div>

          <div className="career-banner-copy">
            <span className="eyebrow">MEET YOUR AI CAREER ASSISTANT</span>
            <h2>Your next career move starts here.</h2>
            <p>
              Understand your results, discover your strengths, improve your
              resume, and build a learning plan based on your target role.
            </p>

            <div className="career-example-questions">
              <span>Why did I get this match score?</span>
              <span>What should I improve first?</span>
              <span>Which skills should I learn?</span>
            </div>
          </div>

          <button
            type="button"
            className="primary-button career-launch-button"
            onClick={() => setAssistantOpen(true)}
          >
            Meet your assistant <span aria-hidden="true">→</span>
          </button>
        </section>

        {/* CAREER ASSISTANT CHAT WINDOW */}
        {assistantOpen && (
          <div className="assistant-overlay">
            <section
              className="assistant-panel"
              id="career-assistant"
              role="dialog"
              aria-modal="true"
              aria-labelledby="assistant-title"
            >
              <header className="assistant-header">
                <div>
                  <span className="eyebrow">RESUMATCH AI</span>
                  <h2 id="assistant-title">Career Assistant</h2>
                  <p>Your personal resume and learning guide</p>
                </div>

                <button
                  type="button"
                  className="assistant-close"
                  onClick={() => setAssistantOpen(false)}
                  aria-label="Close assistant"
                >
                  ×
                </button>
              </header>

              {!result && (
                <div className="assistant-notice">
                  Analyze your resume against a job description first to get
                  personalized answers based on your report.

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setAssistantOpen(false)
                      document.getElementById('analyzer')?.scrollIntoView({
                        behavior: 'smooth',
                      })
                    }}
                  >
                    Analyze my resume
                  </button>
                </div>
              )}

              <div className="assistant-quick-actions">
                <button
                  type="button"
                  disabled={!result || assistantLoading}
                  onClick={() =>
                    setAssistantInput(
                      'Explain my match score and main skill gaps.'
                    )
                  }
                >
                  Explain my match
                </button>

                <button
                  type="button"
                  disabled={!result || assistantLoading}
                  onClick={() =>
                    setAssistantInput(
                      'Identify my strengths using evidence from my resume report.'
                    )
                  }
                >
                  Find my strengths
                </button>

                <button
                  type="button"
                  disabled={!result || assistantLoading}
                  onClick={() =>
                    setAssistantInput(
                      'What should I improve in my resume first?'
                    )
                  }
                >
                  Improve my resume
                </button>

                <button
                  type="button"
                  disabled={!result || assistantLoading}
                  onClick={() =>
                    setAssistantInput(
                      'Create a beginner-friendly learning plan for this target job.'
                    )
                  }
                >
                  Plan my learning
                </button>
              </div>

              <div className="assistant-messages" aria-live="polite">
                {assistantMessages.map((message, index) => (
                  <article
                    className={`assistant-message ${
                      message.role === 'user'
                        ? 'user-message'
                        : 'bot-message'
                    }`}
                    key={`${message.role}-${index}`}
                  >
                    {message.content}
                  </article>
                ))}

                {assistantLoading && (
                  <article className="assistant-message bot-message">
                    Thinking about your question…
                  </article>
                )}
              </div>

              {assistantError && (
                <p className="assistant-error" role="alert">
                  {assistantError}
                </p>
              )}

              <form
                className="assistant-input-row"
                onSubmit={sendAssistantMessage}
              >
                <input
                  value={assistantInput}
                  onChange={(event) =>
                    setAssistantInput(event.target.value)
                  }
                  placeholder="Ask about your resume or career..."
                  aria-label="Your question"
                  disabled={!result || assistantLoading}
                />

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    !result ||
                    assistantLoading ||
                    !assistantInput.trim()
                  }
                >
                  {assistantLoading ? 'Thinking...' : 'Send'}
                </button>
              </form>

              <p className="assistant-disclaimer">
                Recommendations are guidance, not guarantees. Only include
                skills and experience you genuinely have.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}