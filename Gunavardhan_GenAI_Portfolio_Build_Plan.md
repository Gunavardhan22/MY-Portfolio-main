# Portfolio Build Documentation Plan

## Gunavardhan Tigulla --- Generative AI Developer Portfolio

**Design target:** The existing clean white, light-grey, and blue
portfolio: restrained typography, generous whitespace, rounded cards,
soft shadows, code-editor hero illustration, project grid, skill cards,
journey timeline, and contact panel.

**Implementation target:** A responsive static website built with HTML5,
CSS3, and vanilla JavaScript. The portfolio should position Gunavardhan
for entry-level Generative AI Developer, AI Engineer, Python AI/Backend,
and ML Engineer opportunities without claiming skills or project
outcomes that have not been verified.

------------------------------------------------------------------------

## 1. Product goal

Build a professional portfolio that answers five recruiter questions
quickly:

1.  Who is the developer and what roles is the developer targeting?
2.  What GenAI, Python, backend, and machine-learning skills are
    relevant?
3.  Which projects demonstrate those skills?
4.  Can the developer explain system design, evaluation, and deployment
    choices?
5.  How can a recruiter view the résumé, GitHub repositories, and
    contact the developer?

### Primary audience

-   Recruiters screening entry-level GenAI / AI engineering candidates.
-   Technical interviewers assessing project depth.
-   Engineering teams looking for Python, API, RAG, LLM integration, or
    AI backend skills.

### Success criteria

-   A visitor understands the target role within the first screen.
-   Projects link to real repositories and explain the problem,
    architecture, and contribution.
-   Mobile navigation, contact links, and résumé download work.
-   No fake metrics, broken links, placeholder email, or unsupported
    skill claims remain at launch.
-   The site loads quickly, is keyboard accessible, and works on common
    mobile and desktop widths.

------------------------------------------------------------------------

## 2. Design system --- preserve the existing visual identity

### 2.1 Colour palette

Use CSS custom properties so the design can be tuned centrally.

  Token           Suggested value   Usage
  --------------- ----------------- ----------------------------------------
  `--bg`          `#F7F9FC`         Main page background
  `--white`       `#FFFFFF`         Cards, header, contact panel
  `--ink`         `#172033`         Primary text and dark CTA
  `--muted`       `#6D788C`         Body copy and supporting text
  `--line`        `#E4E9F1`         Borders and separators
  `--blue`        `#2868E8`         Links, key phrases, primary buttons
  `--blue-dark`   `#164FC2`         Hover state
  `--pale`        `#EDF4FF`         Skill icons, tags, decorative surfaces
  `--cyan`        `#42B8E8`         Small accent only

Keep most surfaces white or near-white. Use blue for hierarchy and
action, not as a large background everywhere. Avoid introducing a second
visual theme that makes the site inconsistent.

### 2.2 Typography

-   Primary font: Manrope, with a system sans-serif fallback.
-   Code/metadata font: DM Mono, with a monospace fallback.
-   Hero heading: bold, tight line-height, slightly negative letter
    spacing.
-   Section labels and project category labels: small uppercase mono
    text.
-   Body copy: muted grey with comfortable line-height.
-   Keep paragraph width limited for easy scanning.

### 2.3 Shape, spacing, and shadows

-   Cards: 10--14px corner radius.
-   Buttons and tags: 6--9px corner radius.
-   Borders: thin, light grey.
-   Shadows: soft and low contrast; avoid heavy glow effects.
-   Use a consistent spacing scale (8, 12, 16, 24, 32, 48, 64, 96px).
-   Main content width: approximately 1160px, centered.
-   Use a consistent vertical rhythm between sections.

### 2.4 Motion

-   Smooth anchor scrolling.
-   Small card lift and border-colour transition on hover.
-   Subtle cursor blink in the code illustration.
-   Mobile menu expands/collapses.
-   Respect `prefers-reduced-motion: reduce`.
-   Do not animate every element; motion should reinforce hierarchy
    rather than distract.

------------------------------------------------------------------------

## 3. Information architecture and page sections

Recommended order:

1.  Sticky header / navigation
2.  Hero and role positioning
3.  Technology ticker
4.  About
5.  GenAI-focused skills
6.  Featured projects
7.  How I build GenAI systems (optional but valuable)
8.  Education and learning journey
9.  Contact CTA
10. Footer

### 3.1 Header

**Purpose:** Make navigation and identity immediately clear.

**Elements** - Monogram logo: `G.` - Name: `GUNAVARDHAN` - Subtitle:
`GENERATIVE AI DEVELOPER` or `SOFTWARE • GENAI` - Anchors: About,
Skills, Projects, Journey, Contact - Primary Contact link

**Behaviour** - Sticky at the top. - Desktop links in one row. - Mobile
menu button with `aria-expanded` state. - Close mobile menu after a
navigation link is selected. - Visible keyboard focus on all interactive
controls.

### 3.2 Hero

**Purpose:** Establish the target role, technical direction, and next
actions in five seconds.

**Suggested copy** - Eyebrow:
`OPEN TO ENTRY-LEVEL GENAI / AI ROLES • HYDERABAD, INDIA` - Heading:
`Building useful AI experiences with code & curiosity.` - Supporting
text:
`I'm Gunavardhan Tigulla, a Computer Science and Engineering candidate focused on Python, machine learning, LLM-powered applications, and reliable APIs. I enjoy turning practical problems into useful software.` -
Primary CTA: `Explore projects` - Secondary CTA: `Download résumé`

Only use the "open to opportunities" claim while it is accurate. Do not
claim professional experience unless it exists.

**Visual** - Reuse the right-side code-editor card. - Update code
example to GenAI without implying a deployed production system: -
`focus: "Generative AI"` - `interests: ["RAG", "LLM apps", "AI APIs"]` -
`principle: "Evaluate before shipping"` - Add small floating tags such
as `Python`, `LLMs`, `RAG`; show only technologies the developer can
discuss in an interview. - On mobile, stack the illustration below the
text.

### 3.3 Technology ticker

Use a calm, horizontal list such as:
`PYTHON • GENERATIVE AI • LLM APPLICATIONS • RAG • REST APIs • MACHINE LEARNING`

Implementation note: a static strip is simplest and most accessible. If
animated, duplicate the ticker content only for seamless visual
continuity, hide decorative duplicates from screen readers, and disable
movement under reduced-motion settings.

### 3.4 About

**Purpose:** Present a concise professional story, not a generic
biography.

Include: - Current education and graduation status, stated accurately. -
Interest in GenAI, backend systems, and ML. - Preferred work: building,
testing, evaluating, and deploying useful AI-enabled applications. - One
or two real examples of learning through projects.

Avoid vague claims such as "expert in all AI technologies." Prefer
concrete, defensible wording.

### 3.5 Skills --- group by the work they enable

Use six cards to preserve the original grid style while emphasizing
GenAI.

1.  **Programming:** Python, SQL, JavaScript; Java if still relevant to
    target roles.
2.  **GenAI / LLM applications:** prompt design, LLM API integration,
    structured outputs, tool calling, conversation state --- mark as
    learning-level unless demonstrated in code.
3.  **RAG and retrieval:** embeddings, chunking, vector search,
    retrieval quality, citations, grounded generation --- list only
    tools and concepts actually studied or implemented.
4.  **AI / data:** ML, NLP, NumPy, Pandas, scikit-learn;
    TensorFlow/PyTorch only at the level that can be demonstrated.
5.  **Backend / data:** Flask or FastAPI, REST APIs, SQL, MongoDB;
    include Node.js/Express where relevant.
6.  **Engineering / delivery:** Git/GitHub, testing, Docker, cloud
    basics, CI/CD fundamentals.

**Skill integrity rule:** Make the difference between "used in a
project," "familiar with," and "currently learning" visible where
necessary. A skills card is a summary, not a substitute for evidence.

### 3.6 Projects

Keep the two-column project grid and custom preview illustrations. Each
card should contain: - Project title and category. - The problem being
solved. - What the developer personally implemented. - Architecture or
workflow in one or two sentences. - Main technologies. - Links: GitHub
repository, live demo (if available), and optional case study. - A small
status label only when meaningful, such as `Live`, `Prototype`, or
`In progress`.

#### Recommended project ordering

1.  **AI Resume Scorer / Resume Analyzer** --- strongest direct link to
    AI and NLP.
2.  **GenAI-powered Coffee House** --- use only if the GenAI component
    is implemented and can be demonstrated.
3.  **SmartRoad pothole detection** --- computer vision / ML evidence.
4.  **Multi-Channel Ad Budget Optimization** --- data analysis and
    optimization evidence.
5.  **Student Management System** --- optional supporting backend / SQL
    project.

Use four strong, well-documented projects rather than a long list of
unfinished ones.

#### Required project case-study format

For each project, document: - **Problem:** Who has the problem and why
it matters. - **Goal:** What the project should accomplish. - **My
contribution:** Exact work personally completed. - **Architecture:** UI
→ API/backend → model/LLM or ML pipeline → database/vector store →
response. - **Data:** Source, permissions, cleaning, and privacy
considerations. - **GenAI design (where applicable):** model/provider,
prompt strategy, retrieval flow, tool use, output schema, and fallback
behaviour. - **Evaluation:** Test cases, baseline, failure examples,
quality criteria, latency/cost checks if measured. - **Security:**
secret management, input validation, prompt-injection considerations,
and sensitive-data handling. - **Deployment:** local/demo/hosted status
and setup instructions. - **Lessons and next steps:** specific
improvements. - **Evidence:** repository, screenshots, demo, tests, and
architecture diagram.

Never invent accuracy, user counts, time savings, or performance
metrics. If a metric has not been measured, say so and define how it
should be measured next.

### 3.7 GenAI engineering process section

This section differentiates a GenAI portfolio from a general software
portfolio. Use a simple horizontal or vertical flow:

**User request → Input validation → Prompt / retrieval / tool selection
→ Model call → Output validation → Evaluation / logging → Response**

For a RAG example:

**Question → Embed query → Retrieve relevant chunks → Build grounded
prompt → Generate answer → Validate citations → Return answer**

Explain that this is a representative workflow, not a claim that every
project implements every step. Include one diagram and a concise
explanation of trade-offs: - RAG vs. sending the entire document to a
model. - Model quality vs. latency and cost. - Retrieval relevance
vs. context size. - Free-form text vs. schema-constrained output. -
Model confidence claims vs. actual evaluation evidence.

### 3.8 Journey / education timeline

Preserve the existing timeline card layout: - B.Tech in Computer Science
and Engineering, SRM Institute of Science and Technology, 2022--2026. -
Relevant coursework or academic work, if useful. - Verified
certifications, internships, hackathons, or milestones. - Current
learning focus, explicitly labelled as learning rather than work
experience.

Confirm the degree completion status before publishing. Do not imply
graduation has been completed if it has not.

### 3.9 Contact section

Include: - Short role-aligned invitation. - Real email. - GitHub
profile. - Real LinkedIn URL. - Résumé download. - Optional location and
work preference, if desired.

Test email copy behaviour and show a clear success or fallback message.
Do not ship `your.email@example.com` or a placeholder LinkedIn URL.

### 3.10 Footer

Include name, copyright year generated in JavaScript, and a back-to-top
link.

------------------------------------------------------------------------

## 4. Technical architecture and folder structure

For the current vanilla HTML/CSS/JS version:

``` text
gunavardhan-portfolio/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── resume.pdf
│   ├── profile-photo.webp       # optional
│   ├── projects/
│   │   ├── resume-scorer.webp
│   │   ├── smartroad.webp
│   │   └── coffee-house.webp
│   └── diagrams/
│       └── rag-architecture.svg
├── README.md
└── docs/
    ├── portfolio-plan.md
    ├── content-inventory.md
    └── testing-checklist.md
```

### HTML responsibilities

-   Semantic structure: `header`, `nav`, `main`, `section`, `article`,
    `footer`.
-   Unique IDs for anchor destinations.
-   Descriptive headings in a logical hierarchy.
-   Real links for navigation, repositories, résumé, and contact.
-   Alternative text for meaningful images; empty alt text for purely
    decorative images.

### CSS responsibilities

-   Design tokens in `:root`.
-   Shared layout utilities and consistent section spacing.
-   Reusable card, tag, button, and section-label styles.
-   Responsive breakpoints.
-   Hover, focus, and reduced-motion behaviour.
-   Avoid duplicated one-off styles where a component class can be
    reused.

### JavaScript responsibilities

-   Mobile navigation open/close.
-   Dynamic copyright year.
-   Copy-email interaction with a fallback.
-   Optional lightweight scroll reveal only if it adds value.
-   No API key or secret should ever be placed in browser JavaScript.

### When to add a GenAI backend

The portfolio itself does not need a backend. Keep it static unless
adding a real feature, such as a portfolio Q&A assistant, provides clear
value.

If adding a GenAI assistant, use a separate service: - Frontend:
existing HTML/CSS/JS. - Backend: Python with FastAPI or Flask. - Model:
an LLM provider called from the server. - Knowledge source: curated
portfolio, résumé, and project documentation. - Optional retrieval:
chunking, embeddings, vector search, source metadata. - Safety:
server-side secrets, rate limits, input validation, prompt-injection
handling, scoped retrieval, and safe error messages. - Evaluation: a
fixed question set with expected facts and refusal cases. - Deployment:
frontend static host plus separately deployed API.

A portfolio chatbot is optional, not a launch blocker. Never expose
provider API keys in `script.js`, HTML, source maps, or public
repository history.

------------------------------------------------------------------------

## 5. Responsive behaviour specification

  -----------------------------------------------------------------------
  Viewport                            Expected behaviour
  ----------------------------------- -----------------------------------
  Desktop, 1200px+                    Two-column hero, 3-column skills,
                                      2-column projects

  Tablet, 700--1000px                 Narrower hero columns, 2-column
                                      skills, preserved whitespace

  Mobile, below 700px                 Single-column hero, stacked code
                                      illustration, collapsible
                                      navigation, 2-column feature cards,
                                      1-column projects

  Small mobile, below 390px           Single-column skill cards, stacked
                                      buttons, no horizontal overflow
  -----------------------------------------------------------------------

Check: - Headings wrap naturally. - Cards never exceed the viewport. -
Navigation can be operated by keyboard and touch. - Buttons have
comfortable touch targets. - Code illustration remains readable without
forcing horizontal page scroll. - No critical information is conveyed by
colour alone.

------------------------------------------------------------------------

## 6. Accessibility, performance, and SEO

### Accessibility

-   Use visible focus indicators.
-   Ensure text/background contrast is sufficient.
-   Give icon-only buttons accessible labels.
-   Maintain logical tab order.
-   Set `aria-expanded` on the mobile menu.
-   Announce copy-email success through an `aria-live` region.
-   Respect reduced-motion settings.
-   Test with keyboard-only navigation.

### Performance

-   Prefer compressed WebP/AVIF project images.
-   Avoid large animation libraries for small effects.
-   Lazy-load below-the-fold images.
-   Keep JavaScript small and dependency-free unless there is a clear
    need.
-   Use local font fallbacks; if using web fonts, include sensible
    fallbacks.
-   Check browser console and network errors.

### SEO and social preview

-   Set a meaningful page title and meta description.
-   Add Open Graph title, description, and preview image when a
    canonical domain exists.
-   Use descriptive link text, not repeated "click here."
-   Add a favicon.
-   Add a canonical URL only after deployment to a stable domain.
-   Verify the page title and preview when sharing the URL.

------------------------------------------------------------------------

## 7. Build phases and deliverables

### Phase 1 --- Content audit

**Tasks** - Confirm preferred role title and one-sentence value
proposition. - Verify education status and dates. - Inventory projects
and repositories. - Replace all placeholder contact information. -
Decide which skills are implemented, familiar, or currently being
learned.

**Deliverable:** approved content sheet.

### Phase 2 --- Visual foundation

**Tasks** - Define CSS variables, fonts, spacing, borders, shadows, and
breakpoints. - Build header, buttons, section labels, cards, and tag
components. - Match the light white/grey/blue reference style.

**Deliverable:** reusable design system.

### Phase 3 --- Core page

**Tasks** - Implement header, hero, ticker, about, skills, projects,
journey, contact, and footer. - Keep semantic HTML and shared CSS
components. - Add responsive layouts.

**Deliverable:** complete static portfolio.

### Phase 4 --- Interaction

**Tasks** - Add mobile menu. - Add current year. - Add copy-email
interaction and fallback. - Add smooth scrolling and restrained hover
transitions. - Respect reduced motion.

**Deliverable:** functional responsive site.

### Phase 5 --- GenAI positioning

**Tasks** - Rewrite hero, about, and skills for entry-level GenAI
roles. - Add one architecture/process section. - Expand the strongest
AI/GenAI project into a case study. - Add real repository and demo
links. - Document evaluation, safety, and trade-offs honestly.

**Deliverable:** role-targeted GenAI portfolio.

### Phase 6 --- QA and launch

**Tasks** - Run the acceptance checklist below. - Verify all links and
downloads. - Test multiple viewport sizes. - Check console errors,
accessibility, and SEO metadata. - Publish to a static host and test the
public URL.

**Deliverable:** launch-ready portfolio and README.

------------------------------------------------------------------------

## 8. Acceptance checklist

### Content

-   [ ] Name and target role are correct.
-   [ ] Degree status and dates are accurate.
-   [ ] Every listed skill is defensible in an interview.
-   [ ] Every project description reflects real implemented work.
-   [ ] Every project repository points to the correct repository.
-   [ ] Contact information is real.
-   [ ] Résumé download works.

### Design

-   [ ] White/grey/blue palette is consistent.
-   [ ] Heading scale and section spacing are consistent.
-   [ ] Cards use the same radius, border, and shadow language.
-   [ ] Hover states are subtle and consistent.
-   [ ] No overflow at 320px width.
-   [ ] Layout is usable on tablet and desktop.

### Functionality

-   [ ] Header links scroll to the correct sections.
-   [ ] Mobile menu opens and closes.
-   [ ] Menu closes after selecting a link.
-   [ ] Email copy button works or provides a clear fallback.
-   [ ] External links use correct destinations.
-   [ ] No placeholder URLs remain.
-   [ ] No JavaScript console errors.

### GenAI credibility

-   [ ] At least one AI/GenAI project has a real repository or
    demonstrable artifact.
-   [ ] Project architecture is documented.
-   [ ] Model/provider and data source are stated where applicable.
-   [ ] Evaluation approach and known limitations are explained.
-   [ ] No fabricated metrics or unsupported production claims.
-   [ ] API keys and private data are not committed to the repository.

------------------------------------------------------------------------

## 9. GenAI project case-study template

Use this template for the strongest project on the portfolio.

### Project title

**One-line summary:** What it does and for whom.

**Problem:** What practical issue does it address?

**Solution:** What did you build?

**My contribution:** Which components did you personally implement?

**Architecture:** 1. Input and validation. 2. Data preparation or
retrieval. 3. Prompt / model / ML inference. 4. Output parsing and
validation. 5. User-facing response. 6. Logging and evaluation.

**Tech stack:** List only the technologies actually used.

**Evaluation:** Define test cases, expected behaviour, failure cases,
and any measured metrics.

**Safety and privacy:** Explain data handling, secret management, and
relevant risks.

**Limitations:** What does the system not handle well?

**Next steps:** The highest-value improvements.

**Links:** Repository, demo, architecture diagram, screenshots.

------------------------------------------------------------------------

## 10. Suggested final homepage copy

**Role label:** `ASPIRING GENERATIVE AI DEVELOPER`

**Headline:** `Building useful AI experiences with code & curiosity.`

**Summary:**
`I'm Gunavardhan Tigulla, a Computer Science and Engineering candidate interested in Python, machine learning, LLM-powered applications, and backend engineering. I build projects to learn how AI systems can solve practical problems, and I care about reliable APIs, evaluation, and clear user experiences.`

**Primary CTA:** `Explore projects`

**Secondary CTA:** `Download résumé`

Treat this as editable starter copy. Keep "Aspiring" if you are applying
for entry-level roles and do not yet have professional GenAI experience.

------------------------------------------------------------------------

## 11. Recommended launch scope

For the first release, prioritize: 1. Accurate profile and contact
details. 2. Four well-explained projects with working repository links.
3. GenAI-oriented skills and one architecture/case-study section. 4.
Mobile responsiveness and accessible interactions. 5. A résumé download
and clear GitHub/LinkedIn links.

Do not delay launch for a chatbot, elaborate animations, a database, or
a complex frontend framework. A clear, accurate, technically detailed
static portfolio is a strong first version; add a GenAI feature only
when it can be demonstrated and evaluated.
