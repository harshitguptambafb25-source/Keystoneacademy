# Keystone Academy: website prototype (front-end)

Open `index.html` in a browser. No server, login or payment is needed.

## What is included
- Homepage: hero, value proposition, learning philosophy, course explorer, career domains, projects, AI-enabled learning, learning journey, certification pathway, career relevance, FAQ, final CTA.
- Explore courses: search across skills, tools, module titles, glossary terms and interview questions; domain filter; regulated-topics filter; sorting.
- Course detail (20 pages, generated from one template): overview, audience, outcomes, module roadmap, tools, AI applications, case studies, projects and capstone, interview preparation, scenario bank, glossary, career relevance, certification pathway.
- Learning interface: module reader with left navigation (Completed / Current / Upcoming), callouts and tables, "Mark module complete" (stored only in this browser).
- Certification request form: client-side validation and an example reference (KA-2026-XXXXXX). It does not send or store anything.

## Content source
- `data/courses.js` (and `data/courses.json`) are generated from the 20 handbook DOCX files by `extract_courses.py`.
- Regenerate after editing a handbook: `python3 extract_courses.py`, then rebuild `courses.js` (see the script header and the JSON-to-JS step in the build notes).

## Not in this prototype (needs a backend)
- Accounts, login, student dashboard, progress sync across devices.
- Exam engine and scheduling, certificate issue and public verification.
- Admin dashboard, payments and fee configuration (no fee is shown anywhere).
- Case-study full text and exercise datasets (only case titles are shown; full text is in the handbooks).

## Rules followed
- Logo used unmodified (`assets/logo.png`), aspect ratio preserved.
- No accreditation, regulator approval, placement or salary claims. Certificates are described as Certificates of Professional Completion.
- Regulated-topic courses (08, 13, 20) are labelled educational only.
- Copyright notice shown in the footer.

© Keystone Academy. All Rights Reserved. This educational material is proprietary to Keystone Academy. Unauthorized reproduction, distribution, modification or commercial use is prohibited.
